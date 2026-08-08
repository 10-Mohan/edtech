import {
  AuthUser,
  ChatMessage,
  CohortMisconceptionAnalysis,
  ConceptNode,
  DifferentiatedWorksheet,
  ParentWeeklySummary,
  RecallCard,
  StudentClassroomMetric,
  StudentComprehensiveReport,
  UserProfile,
  UserRole
} from '../types';
import {
  generateParentSummaryForStudent,
  getComprehensiveReportForStudent,
  mockAuthUsers,
  mockClassroomMetrics,
  mockConceptNodes,
  mockRecallCards,
  mockStudentReport,
  mockStudentReportsMap,
  mockUserProfile,
  mockWorksheets,
  synthesizeReportFromMetric
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
  PROFILE: 'waypoint_user_profile',
  CHAT: 'waypoint_db_chat'
};

export type SyncEventType =
  | 'NODE_MASTERY_UPDATED'
  | 'CARD_REVIEWED'
  | 'WORKSHEET_CREATED'
  | 'TOPIC_CREATED'
  | 'USER_REGISTERED'
  | 'CHILD_SWITCHED'
  | 'STUDENT_METRIC_UPDATED'
  | 'COHORT_DATA_IMPORTED'
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
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure default accounts have passwords populated
          return parsed.map(u => {
            if (!u.password) {
              const defaultUser = mockAuthUsers.find(mu => mu.email.toLowerCase() === u.email.toLowerCase());
              return { ...u, password: defaultUser?.password || 'demo123' };
            }
            return u;
          });
        }
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
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const cleanPassword = (password || '').trim() || 'demo123';

    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error(`An account with email "${cleanEmail}" already exists. Please log in instead.`);
    }

    let cloudUserId: string | undefined;

    // 1. Real Supabase Auth Signup when cloud configured
    if (SupabaseService.isCloudConfigured()) {
      try {
        const signUpRes = await SupabaseService.signUp(cleanEmail, cleanPassword, {
          name: cleanName,
          role,
          linkedStudentId: studentInviteCode ? 'stu_maya_01' : undefined
        });
        if (signUpRes?.user) {
          cloudUserId = signUpRes.user.id;
        }
      } catch (authErr: any) {
        console.warn('Supabase Auth signup notice:', authErr.message);
        if (!authErr.message?.includes('fetch') && !authErr.message?.includes('Network')) {
          throw new Error(`Supabase Auth: ${authErr.message}`);
        }
      }
    }

    const newUser: AuthUser = {
      id: cloudUserId || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      name: cleanName,
      role,
      password: cleanPassword,
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

  // Synchronous signature for tests and quick registration
  public registerUser(
    email: string,
    name: string,
    role: UserRole,
    studentInviteCode?: string,
    password?: string
  ): AuthUser {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const cleanPassword = (password || '').trim() || 'demo123';

    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error(`An account with email "${cleanEmail}" already exists.`);
    }

    const newUser: AuthUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      name: cleanName,
      role,
      password: cleanPassword,
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

  public async authenticateWithPassword(
    email: string,
    password?: string,
    expectedRole?: UserRole
  ): Promise<AuthUser> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }
    if (!cleanPassword) {
      throw new Error('Please enter your password.');
    }

    // 1. Real Supabase Auth when cloud backend configured
    if (SupabaseService.isCloudConfigured()) {
      try {
        const { user } = await SupabaseService.signInWithPassword(cleanEmail, cleanPassword);
        if (user) {
          const remoteProfile = await SupabaseService.fetchUserProfile(user.id);
          if (remoteProfile) {
            if (expectedRole && remoteProfile.role !== expectedRole) {
              const roleName = remoteProfile.role === 'teacher' ? 'Faculty Member' : remoteProfile.role === 'student' ? 'Student' : 'Parent';
              throw new Error(`This account is registered as a ${roleName}. Please switch tabs to log in.`);
            }
            const currentUsers = this.getUsers().filter(u => u.email.toLowerCase() !== cleanEmail);
            this.saveUsers([remoteProfile, ...currentUsers]);
            return remoteProfile;
          }

          const matched = this.getUsers().find(u => u.email.toLowerCase() === cleanEmail);
          if (matched) return matched;

          const createdUser: AuthUser = {
            id: user.id,
            email: user.email || cleanEmail,
            name: user.user_metadata?.name || cleanEmail.split('@')[0],
            role: (user.user_metadata?.role as UserRole) || 'student',
            password: cleanPassword,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            title: 'Verified User'
          };
          this.saveUsers([createdUser, ...this.getUsers()]);
          return createdUser;
        }
      } catch (authErr: any) {
        console.warn('Supabase Auth sign-in error:', authErr.message);
        if (!authErr.message?.includes('fetch') && !authErr.message?.includes('Network')) {
          throw new Error(`Invalid credentials: ${authErr.message || 'Check email and password.'}`);
        }
      }
    }

    // 2. Strict verification against registered database accounts
    const users = this.getUsers();
    const matched = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matched) {
      throw new Error(`Invalid credentials. No account found with email "${cleanEmail}". Please check your email or click "Register New Account".`);
    }

    const expectedPassword = matched.password || 'demo123';
    if (cleanPassword !== expectedPassword) {
      throw new Error('Invalid credentials. Incorrect password entered for this account.');
    }

    if (expectedRole && matched.role !== expectedRole) {
      const roleName = matched.role === 'teacher' ? 'Faculty' : matched.role === 'student' ? 'Student' : 'Parent';
      const targetName = expectedRole === 'teacher' ? 'Faculty' : 'Student';
      throw new Error(`Access denied: "${cleanEmail}" is registered as a ${roleName} account. Please switch to the ${roleName} tab.`);
    }

    return matched;
  }

  public authenticate(email: string): AuthUser | null {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
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
    return this.addOrUpdateWorksheet(ws, senderRole);
  }

  public addOrUpdateWorksheet(ws: DifferentiatedWorksheet, senderRole: UserRole = 'teacher'): DifferentiatedWorksheet[] {
    const worksheets = this.getWorksheets();
    const existingIdx = worksheets.findIndex(w => w.id === ws.id);
    let updated: DifferentiatedWorksheet[];
    if (existingIdx >= 0) {
      updated = [...worksheets];
      updated[existingIdx] = ws;
    } else {
      updated = [ws, ...worksheets];
    }
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

  public deleteWorksheet(id: string, senderRole: UserRole = 'teacher'): DifferentiatedWorksheet[] {
    const worksheets = this.getWorksheets().filter(w => w.id !== id);
    this.saveWorksheets(worksheets);
    this.broadcast('WORKSHEET_CREATED', { deletedId: id }, senderRole);
    return worksheets;
  }

  // -------------------------------------------------------------
  // Classroom Metrics & Synchronized Cohort State
  // -------------------------------------------------------------
  public getClassroomMetrics(): StudentClassroomMetric[] {
    const raw = localStorage.getItem(STORAGE_KEYS.METRICS);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Ensure we don't hold outdated 5-student cache; must contain full cohort
        if (Array.isArray(parsed) && parsed.length >= mockClassroomMetrics.length) {
          return parsed;
        }
      } catch (e) {}
    }
    this.saveClassroomMetrics(mockClassroomMetrics);
    return mockClassroomMetrics;
  }

  public saveClassroomMetrics(metrics: StudentClassroomMetric[]): void {
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
  }

  public getStudentById(studentIdOrName: string): StudentClassroomMetric | undefined {
    const metrics = this.getClassroomMetrics();
    const clean = (studentIdOrName || '').toLowerCase().trim();
    return metrics.find(
      m => m.studentId.toLowerCase() === clean || m.studentName.toLowerCase() === clean
    );
  }

  public updateStudentClassroomMetric(
    studentId: string,
    updates: Partial<StudentClassroomMetric>,
    senderRole: UserRole = 'teacher'
  ): StudentClassroomMetric[] {
    const metrics = this.getClassroomMetrics();
    const idx = metrics.findIndex(m => m.studentId === studentId);
    if (idx >= 0) {
      metrics[idx] = { ...metrics[idx], ...updates };
      this.saveClassroomMetrics(metrics);

      // Also update comprehensive report in cache
      const updatedReport = synthesizeReportFromMetric(metrics[idx]);
      this.saveStudentReport(updatedReport);

      this.broadcast('STUDENT_METRIC_UPDATED', { studentId, metric: metrics[idx] }, senderRole);
    }
    return metrics;
  }

  public updateStudentTopicScore(
    studentId: string,
    topicId: string,
    score: number,
    senderRole: UserRole = 'student'
  ): StudentClassroomMetric[] {
    const metrics = this.getClassroomMetrics();
    const idx = metrics.findIndex(m => m.studentId === studentId);
    if (idx >= 0) {
      const currentScores = { ...metrics[idx].topicScores, [topicId]: score };
      const scoreValues = Object.values(currentScores);
      const overallMastery = Math.round(scoreValues.reduce((a, b) => a + b, 0) / (scoreValues.length || 1));
      
      let status: 'thriving' | 'on_track' | 'needs_support' | 'at_risk' = 'on_track';
      if (overallMastery >= 85) status = 'thriving';
      else if (overallMastery >= 70) status = 'on_track';
      else if (overallMastery >= 50) status = 'needs_support';
      else status = 'at_risk';

      metrics[idx] = {
        ...metrics[idx],
        topicScores: currentScores,
        overallMastery,
        status,
        lastActive: 'Just now'
      };
      this.saveClassroomMetrics(metrics);
      const updatedReport = synthesizeReportFromMetric(metrics[idx]);
      this.saveStudentReport(updatedReport);
      this.broadcast('STUDENT_METRIC_UPDATED', { studentId, metric: metrics[idx] }, senderRole);
    }
    return metrics;
  }

  // Dynamic Cohort Misconception Aggregation Engine
  public computeCohortMisconceptions(customMetrics?: StudentClassroomMetric[]): CohortMisconceptionAnalysis[] {
    const metrics = customMetrics || this.getClassroomMetrics();
    const totalStudents = metrics.length || 40;

    const topicDefinitions = [
      {
        id: 'misc_diff_01',
        topicId: 'diff_01',
        topicTitle: 'Composite Chain Rule Derivatives',
        subject: 'AP Calculus AB',
        threshold: 70,
        misconceptionDetails: 'Students repeatedly drop the inner derivative term g\'(x) when differentiating composite f(g(x)), confusing single-variable power rules with nested functions.',
        recommendedIntervention: 'Deploy 2-step "Onion Peeling" decomposition worksheet and interactive step-by-step Socratic practice.',
        suggestedTierWorksheet: 'ws_01'
      },
      {
        id: 'misc_trig_01',
        topicId: 'trig_01',
        topicTitle: 'Trigonometric Identities & Double Angles',
        subject: 'Trigonometry & Precalc',
        threshold: 70,
        misconceptionDetails: 'Students confuse double angle identity transformations sin(2x) = 2sin(x)cos(x) with simple scalar factoring 2sin(x).',
        recommendedIntervention: 'Conduct 10-minute geometric unit circle proof drill and assign spaced recall flashcard deck.',
        suggestedTierWorksheet: 'ws_02'
      },
      {
        id: 'misc_lim_01',
        topicId: 'lim_01',
        topicTitle: 'Limits & Asymptotic Continuity',
        subject: 'AP Calculus AB',
        threshold: 70,
        misconceptionDetails: 'Struggles distinguishing jump discontinuities from removable point holes during two-sided limit convergence tests.',
        recommendedIntervention: 'Assign piecewise curve tracing practice on graph visualization sandbox.'
      },
      {
        id: 'misc_func_01',
        topicId: 'func_01',
        topicTitle: 'Function Phase Shifts & Translations',
        subject: 'Algebra & Precalc',
        threshold: 70,
        misconceptionDetails: 'Reverses horizontal phase shifts f(x - c) versus f(x + c) and scaling factors inside nested arguments.',
        recommendedIntervention: 'Review inverse input transformation properties in Socratic Feynman Mode.'
      },
      {
        id: 'misc_vec_01',
        topicId: 'vec_01',
        topicTitle: 'Vector Dot vs Cross Products',
        subject: 'Physics & Vectors',
        threshold: 70,
        misconceptionDetails: 'Confuses scalar dot product work integrals with orthogonal vector cross product torque directions.',
        recommendedIntervention: 'Hands-on 3D right-hand rule interactive simulator demonstration.'
      }
    ];

    const results: CohortMisconceptionAnalysis[] = [];

    for (const def of topicDefinitions) {
      const affected: { id: string; name: string; score: number; avatar: string }[] = [];
      let totalScoreOfAffected = 0;

      for (const st of metrics) {
        const score = st.topicScores?.[def.topicId];
        if (score !== undefined && score < def.threshold) {
          affected.push({
            id: st.studentId,
            name: st.studentName,
            score: score,
            avatar: st.avatar
          });
          totalScoreOfAffected += score;
        }
      }

      if (affected.length > 0) {
        const affectedCount = affected.length;
        const affectedPercentage = Math.round((affectedCount / totalStudents) * 100);
        const averageScore = Math.round(totalScoreOfAffected / affectedCount);
        const severity: 'critical' | 'moderate' | 'mild' =
          affectedPercentage >= 25 ? 'critical' : affectedPercentage >= 15 ? 'moderate' : 'mild';

        results.push({
          id: def.id,
          topicId: def.topicId,
          topicTitle: def.topicTitle,
          subject: def.subject,
          severity,
          affectedCount,
          totalStudents,
          affectedPercentage,
          averageScore,
          misconceptionDetails: def.misconceptionDetails,
          affectedStudents: affected.sort((a, b) => a.score - b.score),
          recommendedIntervention: def.recommendedIntervention,
          suggestedTierWorksheet: def.suggestedTierWorksheet
        });
      }
    }

    // Sort by affected count descending (most critical first)
    return results.sort((a, b) => b.affectedCount - a.affectedCount);
  }

  public getStudentReport(studentId: string = 'st_01'): StudentComprehensiveReport {
    const raw = localStorage.getItem(`${STORAGE_KEYS.REPORTS}_${studentId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    const report = getComprehensiveReportForStudent(studentId);
    this.saveStudentReport(report);
    return report;
  }

  public getParentWeeklySummary(studentId: string = 'st_01'): ParentWeeklySummary {
    const report = this.getStudentReport(studentId);
    return generateParentSummaryForStudent(report);
  }

  public saveStudentReport(report: StudentComprehensiveReport): void {
    localStorage.setItem(`${STORAGE_KEYS.REPORTS}_${report.studentId}`, JSON.stringify(report));

    if (SupabaseService.isCloudConfigured()) {
      SupabaseService.upsertStudentReport(report).catch(err => {
        console.warn('Supabase upsert report error:', err);
      });
    }
  }

  // -------------------------------------------------------------
  // Parent Email Notification Dispatcher (Resend / SendGrid)
  // -------------------------------------------------------------
  public async sendParentWeeklyDigestEmail(params: {
    studentId: string;
    parentEmail?: string;
    senderRole?: UserRole;
  }): Promise<{ success: boolean; delivered: boolean; simulated?: boolean; previewHtml?: string; error?: string }> {
    const report = this.getStudentReport(params.studentId);
    const parentEmail = params.parentEmail || report.parentEmail || 'parent@example.com';

    try {
      const res = await fetch('/api/notifications/parent-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEmail,
          studentName: report.studentName,
          parentName: report.parentName,
          grade: report.grade,
          school: report.school,
          weeklyFocusHours: report.studyHabits?.weeklyFocusHours || 8.5,
          masteryGainPercent: 14,
          streakDays: report.studyHabits?.activeRecallStreakDays || 12,
          masteredCardsCount: report.studyHabits?.masteredCardsCount || 38,
          headlineSummary: `${report.studentName} demonstrated strong conceptual mastery in STEM units this week, maintaining an active recall streak and advancing problem differentiation tiers.`,
          celebrations: ['Mastered Chain Rule Multi-variable Derivatives', `${report.studyHabits?.activeRecallStreakDays || 12}-Day Active Recall Streak`],
          dinnerPrompts: [
            {
              prompt: 'How does the Chain Rule relate to gears turning inside a mechanical watch?',
              whyItMatters: 'Deepens intuition for compounding rates of change.'
            }
          ],
          weakAreas: report.weakAreasRadar?.map(w => ({
            topic: w.topic,
            recommendedHomeAction: w.recommendedHomeAction
          })) || []
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      } else {
        const errText = await res.text();
        return { success: false, delivered: false, error: errText };
      }
    } catch (e: any) {
      // Fallback if API proxy is unreachable
      return {
        success: true,
        delivered: false,
        simulated: true,
        previewHtml: `<p>Weekly digest for ${report.studentName} compiled successfully.</p>`
      };
    }
  }

  // -------------------------------------------------------------
  // Student Tutoring Chat History (Local Cache + Supabase Write-Through)
  // -------------------------------------------------------------
  public getChatHistory(studentId: string = 'stu_maya_01', topicTitle?: string): ChatMessage[] {
    const key = topicTitle ? `${STORAGE_KEYS.CHAT}_${studentId}_${topicTitle}` : `${STORAGE_KEYS.CHAT}_${studentId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return [];
  }

  public saveChatMessage(msg: ChatMessage, studentId: string = 'stu_maya_01', topicTitle?: string): void {
    const key = topicTitle ? `${STORAGE_KEYS.CHAT}_${studentId}_${topicTitle}` : `${STORAGE_KEYS.CHAT}_${studentId}`;
    const existing = this.getChatHistory(studentId, topicTitle);
    const updated = [...existing, msg];
    localStorage.setItem(key, JSON.stringify(updated));

    // Cloud write-through
    if (SupabaseService.isCloudConfigured()) {
      SupabaseService.saveChatMessage(msg, studentId, topicTitle).catch(err => {
        console.warn('Supabase saveChatMessage error:', err);
      });
    }
  }

  public clearChatHistory(studentId: string = 'stu_maya_01', topicTitle?: string): void {
    const key = topicTitle ? `${STORAGE_KEYS.CHAT}_${studentId}_${topicTitle}` : `${STORAGE_KEYS.CHAT}_${studentId}`;
    localStorage.removeItem(key);

    if (SupabaseService.isCloudConfigured()) {
      SupabaseService.clearChatHistory(studentId, topicTitle).catch(err => {
        console.warn('Supabase clearChatHistory error:', err);
      });
    }
  }
}

export const BackendService = new BackendServiceManager();
