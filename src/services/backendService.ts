import {
  AuthUser,
  ConceptNode,
  DifferentiatedWorksheet,
  RecallCard,
  StudentClassroomMetric,
  StudentComprehensiveReport,
  UserProfile,
  UserRole
} from '../types';
import {
  mockAuthUsers,
  mockClassroomMetrics,
  mockConceptNodes,
  mockRecallCards,
  mockStudentReport,
  mockUserProfile,
  mockWorksheets
} from '../data/mockData';
import { SupabaseService } from './supabaseClient';

const SYNC_CHANNEL_NAME = 'waypoint_realtime_sync';

// Local repository keys
const STORAGE_KEYS = {
  USERS: 'waypoint_db_users',
  CURRENT_USER: 'waypoint_current_user',
  NODES: 'waypoint_db_nodes',
  CARDS: 'waypoint_db_cards',
  WORKSHEETS: 'waypoint_db_worksheets',
  METRICS: 'waypoint_db_metrics',
  REPORTS: 'waypoint_db_reports',
  PROFILE: 'waypoint_user_profile'
};

export type SyncEventType =
  | 'NODE_MASTERY_UPDATED'
  | 'CARD_REVIEWED'
  | 'WORKSHEET_CREATED'
  | 'TOPIC_CREATED'
  | 'USER_REGISTERED'
  | 'CHILD_SWITCHED'
  | 'REMOTE_DB_SYNC';

export interface SyncMessage {
  type: SyncEventType;
  payload: any;
  senderRole: UserRole;
  timestamp: string;
}

class BackendServiceManager {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: ((msg: SyncMessage) => void)[] = [];
  private unsubscribeRealtimeDb: (() => void) | null = null;

  constructor() {
    // 1. Same-browser tab synchronization via BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          this.notifyLocalListeners(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported in current environment');
      }
    }

    // 2. Cross-device Postgres Realtime synchronization via Supabase
    this.initSupabaseRealtime();
  }

  public initSupabaseRealtime() {
    if (this.unsubscribeRealtimeDb) {
      this.unsubscribeRealtimeDb();
      this.unsubscribeRealtimeDb = null;
    }

    if (SupabaseService.isCloudConfigured()) {
      this.unsubscribeRealtimeDb = SupabaseService.subscribeToDatabaseChanges((table, payload) => {
        console.log(`[Supabase Realtime] Change detected on ${table}:`, payload);
        this.broadcast('REMOTE_DB_SYNC', { table, payload }, 'teacher');
      });

      // Eagerly pull latest data from cloud
      this.syncAllFromCloud();
    }
  }

  // Pull remote cloud database state into cache
  public async syncAllFromCloud(): Promise<void> {
    try {
      const [remoteNodes, remoteCards, remoteWorksheets] = await Promise.all([
        SupabaseService.fetchConceptNodes(),
        SupabaseService.fetchRecallCards(),
        SupabaseService.fetchWorksheets()
      ]);

      if (remoteNodes && remoteNodes.length > 0) {
        this.saveConceptNodes(remoteNodes);
      }
      if (remoteCards && remoteCards.length > 0) {
        this.saveRecallCards(remoteCards);
      }
      if (remoteWorksheets && remoteWorksheets.length > 0) {
        this.saveWorksheets(remoteWorksheets);
      }
    } catch (err) {
      console.warn('Cloud sync in progress or partially unavailable:', err);
    }
  }

  // -------------------------------------------------------------
  // Real-time Event Bus (Combined Cross-Tab & Cross-Device)
  // -------------------------------------------------------------
  public subscribe(callback: (msg: SyncMessage) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyLocalListeners(msg: SyncMessage) {
    this.listeners.forEach(cb => cb(msg));
  }

  public broadcast(type: SyncEventType, payload: any, senderRole: UserRole = 'student') {
    const message: SyncMessage = {
      type,
      payload,
      senderRole,
      timestamp: new Date().toISOString()
    };
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    }
    this.notifyLocalListeners(message);
  }

  // -------------------------------------------------------------
  // Users & Real Auth Management
  // -------------------------------------------------------------
  public getUsers(): AuthUser[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    this.saveUsers(mockAuthUsers);
    return mockAuthUsers;
  }

  public saveUsers(users: AuthUser[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public async registerUserAccount(
    email: string,
    name: string,
    role: UserRole,
    studentInviteCode?: string,
    password?: string
  ): Promise<AuthUser> {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    let cloudUserId: string | undefined;

    // 1. Real Supabase Auth Signup when cloud configured
    if (SupabaseService.isCloudConfigured() && password) {
      try {
        const signUpRes = await SupabaseService.signUp(email, password, {
          name,
          role,
          linkedStudentId: studentInviteCode ? 'stu_maya_01' : undefined
        });
        if (signUpRes?.user) {
          cloudUserId = signUpRes.user.id;
        }
      } catch (authErr: any) {
        console.warn('Supabase Auth signup notice:', authErr.message);
        // If Supabase throws a hard error and user explicitly provided cloud credentials, propagate unless offline
        if (!authErr.message?.includes('fetch') && !authErr.message?.includes('Network')) {
          throw new Error(`Supabase Auth: ${authErr.message}`);
        }
      }
    }

    const newUser: AuthUser = {
      id: cloudUserId || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email,
      name,
      role,
      avatar:
        role === 'student'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : role === 'teacher'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      title:
        role === 'student'
          ? 'AP Scholar'
          : role === 'teacher'
          ? 'Faculty Lead'
          : 'Guardian / Parent',
      linkedStudentId: studentInviteCode ? 'stu_maya_01' : undefined,
      linkedStudentIds: studentInviteCode ? ['stu_maya_01', 'stu_leo_02'] : undefined
    };

    const updated = [newUser, ...users];
    this.saveUsers(updated);
    this.broadcast('USER_REGISTERED', newUser, role);
    return newUser;
  }

  // Synchronous signature for tests and quick offline login
  public registerUser(
    email: string,
    name: string,
    role: UserRole,
    studentInviteCode?: string
  ): AuthUser {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: AuthUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email,
      name,
      role,
      avatar:
        role === 'student'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : role === 'teacher'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      title:
        role === 'student'
          ? 'AP Scholar'
          : role === 'teacher'
          ? 'Faculty Lead'
          : 'Guardian / Parent',
      linkedStudentId: studentInviteCode ? 'stu_maya_01' : undefined,
      linkedStudentIds: studentInviteCode ? ['stu_maya_01', 'stu_leo_02'] : undefined
    };

    const updated = [newUser, ...users];
    this.saveUsers(updated);
    this.broadcast('USER_REGISTERED', newUser, role);
    return newUser;
  }

  public async authenticateWithPassword(email: string, password?: string): Promise<AuthUser | null> {
    // 1. Real Supabase Auth when cloud backend configured
    if (SupabaseService.isCloudConfigured() && password) {
      try {
        const { user } = await SupabaseService.signInWithPassword(email, password);
        if (user) {
          // Attempt to pull user's profile from Postgres
          const remoteProfile = await SupabaseService.fetchUserProfile(user.id);
          if (remoteProfile) {
            // Update local user list
            const currentUsers = this.getUsers().filter(u => u.email.toLowerCase() !== email.toLowerCase());
            this.saveUsers([remoteProfile, ...currentUsers]);
            return remoteProfile;
          }

          const matched = this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
          if (matched) return matched;

          const createdUser: AuthUser = {
            id: user.id,
            email: user.email || email,
            name: user.user_metadata?.name || email.split('@')[0],
            role: (user.user_metadata?.role as UserRole) || 'student',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            title: 'Verified User'
          };
          this.saveUsers([createdUser, ...this.getUsers()]);
          return createdUser;
        }
      } catch (authErr: any) {
        console.warn('Supabase Auth sign-in warning:', authErr.message);
        // If it's a known demo email, fall back to local store
        const isDemoEmail = mockAuthUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (!isDemoEmail) {
          throw new Error(authErr.message || 'Invalid credentials');
        }
      }
    }

    return this.authenticate(email);
  }

  public authenticate(email: string): AuthUser | null {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || null;
  }

  // -------------------------------------------------------------
  // Concept Graph Nodes Management (Postgres + Offline Cache)
  // -------------------------------------------------------------
  public getConceptNodes(): ConceptNode[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NODES);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    this.saveConceptNodes(mockConceptNodes);
    return mockConceptNodes;
  }

  public async fetchConceptNodesAsync(): Promise<ConceptNode[]> {
    if (SupabaseService.isCloudConfigured()) {
      const remote = await SupabaseService.fetchConceptNodes();
      if (remote && remote.length > 0) {
        this.saveConceptNodes(remote);
        return remote;
      }
    }
    return this.getConceptNodes();
  }

  public saveConceptNodes(nodes: ConceptNode[]): void {
    localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
  }

  public addOrUpdateConceptNode(node: ConceptNode, senderRole: UserRole = 'teacher'): ConceptNode[] {
    const nodes = this.getConceptNodes();
    const existingIdx = nodes.findIndex(n => n.id === node.id);
    let updated: ConceptNode[];
    if (existingIdx >= 0) {
      updated = [...nodes];
      updated[existingIdx] = node;
    } else {
      updated = [node, ...nodes];
    }
    this.saveConceptNodes(updated);

    // Asynchronously write through to Supabase if configured
    if (SupabaseService.isCloudConfigured()) {
      SupabaseService.upsertConceptNode(node).catch(err => {
        console.warn('Supabase upsert node error:', err);
      });
    }

    this.broadcast('TOPIC_CREATED', node, senderRole);
    return updated;
  }

  // -------------------------------------------------------------
  // Spaced Repetition Cards (Postgres + Offline Cache)
  // -------------------------------------------------------------
  public getRecallCards(): RecallCard[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CARDS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    this.saveRecallCards(mockRecallCards);
    return mockRecallCards;
  }

  public saveRecallCards(cards: RecallCard[]): void {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  }

  public addOrUpdateRecallCard(card: RecallCard, senderRole: UserRole = 'student'): RecallCard[] {
    const cards = this.getRecallCards();
    const existingIdx = cards.findIndex(c => c.id === card.id);
    let updated: RecallCard[];
    if (existingIdx >= 0) {
      updated = [...cards];
      updated[existingIdx] = card;
    } else {
      updated = [card, ...cards];
    }
    this.saveRecallCards(updated);

    // Asynchronously write through to Supabase
    if (SupabaseService.isCloudConfigured()) {
      SupabaseService.upsertRecallCard(card).catch(err => {
        console.warn('Supabase upsert recall card error:', err);
      });
    }

    this.broadcast('CARD_REVIEWED', card, senderRole);
    return updated;
  }

  // -------------------------------------------------------------
  // Differentiated Worksheets (Postgres + Offline Cache)
  // -------------------------------------------------------------
  public getWorksheets(): DifferentiatedWorksheet[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKSHEETS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    this.saveWorksheets(mockWorksheets);
    return mockWorksheets;
  }

  public saveWorksheets(worksheets: DifferentiatedWorksheet[]): void {
    localStorage.setItem(STORAGE_KEYS.WORKSHEETS, JSON.stringify(worksheets));
  }

  public addWorksheet(ws: DifferentiatedWorksheet, senderRole: UserRole = 'teacher'): DifferentiatedWorksheet[] {
    const current = this.getWorksheets();
    const updated = [ws, ...current];
    this.saveWorksheets(updated);

    // Write through to Supabase
    if (SupabaseService.isCloudConfigured()) {
      SupabaseService.upsertWorksheet(ws).catch(err => {
        console.warn('Supabase upsert worksheet error:', err);
      });
    }

    this.broadcast('WORKSHEET_CREATED', ws, senderRole);
    return updated;
  }

  // -------------------------------------------------------------
  // Classroom Metrics & Parent Reports
  // -------------------------------------------------------------
  public getClassroomMetrics(): StudentClassroomMetric[] {
    const raw = localStorage.getItem(STORAGE_KEYS.METRICS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    this.saveClassroomMetrics(mockClassroomMetrics);
    return mockClassroomMetrics;
  }

  public saveClassroomMetrics(metrics: StudentClassroomMetric[]): void {
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
  }

  public getStudentReport(studentId: string = 'stu_maya_01'): StudentComprehensiveReport {
    const raw = localStorage.getItem(`${STORAGE_KEYS.REPORTS}_${studentId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return mockStudentReport;
  }

  public saveStudentReport(report: StudentComprehensiveReport): void {
    localStorage.setItem(`${STORAGE_KEYS.REPORTS}_${report.studentId}`, JSON.stringify(report));

    if (SupabaseService.isCloudConfigured()) {
      SupabaseService.upsertStudentReport(report).catch(err => {
        console.warn('Supabase upsert report error:', err);
      });
    }
  }
}

export const BackendService = new BackendServiceManager();
