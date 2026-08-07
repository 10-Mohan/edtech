import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AuthUser,
  CloudBackendConfig,
  ConceptNode,
  DifferentiatedWorksheet,
  RecallCard,
  StudentClassroomMetric,
  StudentComprehensiveReport,
  UserRole
} from '../types';

const CLOUD_CONFIG_KEY = 'waypoint_cloud_backend_config';

export const DEFAULT_CLOUD_CONFIG: CloudBackendConfig = {
  provider: 'local',
  supabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL || '',
  supabaseAnonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
  firebaseProjectId: '',
  firebaseApiKey: '',
  isConnected: false,
  lastSyncedAt: undefined
};

/**
 * Complete SQL Migration Script for Supabase / PostgreSQL
 */
export const SUPABASE_SQL_SCHEMA = `-- =============================================================
-- WAYPOINT AI: Enterprise Multi-Tenant EdTech Schema (PostgreSQL)
-- =============================================================

-- 1. Profiles & Roles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'parent')),
  avatar TEXT,
  grade TEXT DEFAULT 'Grade 11 (AP STEM)',
  linked_student_id TEXT,
  linked_student_ids TEXT[] DEFAULT '{}',
  xp INTEGER DEFAULT 1420,
  level INTEGER DEFAULT 14,
  streak_days INTEGER DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Concept Knowledge Graph Nodes
CREATE TABLE IF NOT EXISTS public.concept_nodes (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'in_progress',
  mastery_score INTEGER DEFAULT 0,
  prerequisites TEXT[] DEFAULT '{}',
  pos_x NUMERIC DEFAULT 0,
  pos_y NUMERIC DEFAULT 0,
  estimated_mins INTEGER DEFAULT 15,
  common_misconception TEXT,
  key_takeaways TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Spaced Repetition Recall Cards (SM-2 Algorithm State)
CREATE TABLE IF NOT EXISTS public.recall_cards (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  topic_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  equation TEXT,
  hint TEXT,
  interval_days NUMERIC DEFAULT 1,
  ease_factor NUMERIC DEFAULT 2.5,
  repetitions INTEGER DEFAULT 0,
  next_review_date TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ,
  status TEXT DEFAULT 'learning',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Differentiated Worksheets
CREATE TABLE IF NOT EXISTS public.worksheets (
  id TEXT PRIMARY KEY,
  teacher_id TEXT,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic_title TEXT,
  tier1_foundational JSONB NOT NULL,
  tier2_intermediate JSONB NOT NULL,
  tier3_extension JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Student Comprehensive Reports
CREATE TABLE IF NOT EXISTS public.student_reports (
  student_id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  school TEXT DEFAULT 'St. Jude STEM Academy',
  academic_year TEXT DEFAULT '2025 - 2026',
  student_email TEXT,
  parent_email TEXT,
  parent_name TEXT,
  attendance JSONB NOT NULL,
  subject_breakdown JSONB NOT NULL,
  weak_areas_radar JSONB NOT NULL,
  study_habits JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Teacher Classroom Metrics
CREATE TABLE IF NOT EXISTS public.classroom_metrics (
  student_id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  avatar TEXT,
  grade TEXT DEFAULT '11th Grade',
  overall_mastery INTEGER DEFAULT 75,
  status TEXT NOT NULL,
  gap_topics_count INTEGER DEFAULT 2,
  last_active TEXT DEFAULT 'Today',
  topic_scores JSONB DEFAULT '{}'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recall_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_metrics ENABLE ROW LEVEL SECURITY;

-- Helper function to inspect current authenticated user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()::text LIMIT 1;
$$;

-- 1. Profiles Table Policies
-- Users can view their own profile; teachers can view student profiles; parents can view their linked students
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (
    auth.uid()::text = id 
    OR public.get_current_user_role() = 'teacher'
    OR (public.get_current_user_role() = 'parent' AND (id = ANY(ARRAY(SELECT unnest(linked_student_ids) FROM public.profiles WHERE id = auth.uid()::text)) OR id = (SELECT linked_student_id FROM public.profiles WHERE id = auth.uid()::text)))
  );

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid()::text = id);

-- 2. Concept Nodes (Knowledge Graph)
-- Authenticated users can read the curriculum
CREATE POLICY "Authenticated users can read concept nodes"
  ON public.concept_nodes FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Only teachers or service roles can modify concept nodes
CREATE POLICY "Teachers can modify concept nodes"
  ON public.concept_nodes FOR ALL
  USING (public.get_current_user_role() = 'teacher' OR auth.role() = 'service_role');

-- 3. Recall Cards (SRS Deck)
-- Students manage their own cards; teachers and parents of linked students can view
CREATE POLICY "Students can access own recall cards"
  ON public.recall_cards FOR ALL
  USING (
    student_id = auth.uid()::text 
    OR public.get_current_user_role() = 'teacher'
    OR (public.get_current_user_role() = 'parent' AND student_id = ANY(ARRAY(SELECT unnest(linked_student_ids) FROM public.profiles WHERE id = auth.uid()::text)))
  );

-- 4. Worksheets
-- Authenticated users can read worksheets
CREATE POLICY "Users can read worksheets"
  ON public.worksheets FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Teachers can create and manage worksheets
CREATE POLICY "Teachers can manage worksheets"
  ON public.worksheets FOR ALL
  USING (public.get_current_user_role() = 'teacher' OR teacher_id = auth.uid()::text);

-- 5. Student Comprehensive Reports
-- Students can read their own report; parents can read their children's report; teachers have full access
CREATE POLICY "Student and Parent report access"
  ON public.student_reports FOR SELECT
  USING (
    student_id = auth.uid()::text
    OR student_email = (auth.jwt()->>'email')
    OR parent_email = (auth.jwt()->>'email')
    OR public.get_current_user_role() = 'teacher'
    OR (public.get_current_user_role() = 'parent' AND student_id = ANY(ARRAY(SELECT unnest(linked_student_ids) FROM public.profiles WHERE id = auth.uid()::text)))
  );

CREATE POLICY "Teachers can manage student reports"
  ON public.student_reports FOR ALL
  USING (public.get_current_user_role() = 'teacher' OR auth.role() = 'service_role');

-- 6. Classroom Metrics
-- Teachers can view and update classroom metrics
CREATE POLICY "Teachers manage classroom metrics"
  ON public.classroom_metrics FOR ALL
  USING (public.get_current_user_role() = 'teacher' OR auth.role() = 'service_role');

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.concept_nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recall_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.worksheets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_metrics;
`;

let clientInstance: SupabaseClient | null = null;
let currentConfigKey = '';

export const SupabaseService = {
  getConfig(): CloudBackendConfig {
    const data = localStorage.getItem(CLOUD_CONFIG_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_CLOUD_CONFIG,
          ...parsed,
          supabaseUrl: parsed.supabaseUrl || DEFAULT_CLOUD_CONFIG.supabaseUrl,
          supabaseAnonKey: parsed.supabaseAnonKey || DEFAULT_CLOUD_CONFIG.supabaseAnonKey
        };
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_CLOUD_CONFIG;
  },

  saveConfig(config: CloudBackendConfig): void {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
    clientInstance = null; // force re-initialization
  },

  getClient(): SupabaseClient | null {
    const config = this.getConfig();
    const url = config.supabaseUrl?.trim();
    const key = config.supabaseAnonKey?.trim();

    if (!url || !key) return null;

    const cacheKey = `${url}:${key}`;
    if (clientInstance && currentConfigKey === cacheKey) {
      return clientInstance;
    }

    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      currentConfigKey = cacheKey;
      return clientInstance;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  },

  isCloudConfigured(): boolean {
    const client = this.getClient();
    return !!client;
  },

  async testSupabaseConnection(url: string, anonKey: string): Promise<boolean> {
    try {
      const client = createClient(url.trim(), anonKey.trim());
      const { error } = await client.from('concept_nodes').select('id').limit(1);
      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        console.warn('Supabase test returned code:', error.code, error.message);
      }
      return true;
    } catch (e) {
      console.error('Supabase connection test failed:', e);
      return false;
    }
  },

  // -------------------------------------------------------------
  // Real Supabase Auth Layer
  // -------------------------------------------------------------
  async signUp(email: string, password: string, metadata: { name: string; role: UserRole; linkedStudentId?: string }) {
    const client = this.getClient();
    if (!client) throw new Error('Supabase client is not configured');

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: metadata.name,
          role: metadata.role,
          linkedStudentId: metadata.linkedStudentId
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      await client.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        name: metadata.name,
        role: metadata.role,
        linked_student_id: metadata.linkedStudentId || null,
        linked_student_ids: metadata.linkedStudentId ? [metadata.linkedStudentId] : [],
        updated_at: new Date().toISOString()
      });
    }

    return data;
  },

  async signInWithPassword(email: string, password: string) {
    const client = this.getClient();
    if (!client) throw new Error('Supabase client is not configured');

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const client = this.getClient();
    if (client) {
      await client.auth.signOut();
    }
  },

  async getSession() {
    const client = this.getClient();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session;
  },

  async fetchUserProfile(userId: string): Promise<AuthUser | null> {
    const client = this.getClient();
    if (!client) return null;

    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      avatar: data.avatar || (data.role === 'student'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : data.role === 'teacher'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'),
      title: data.role === 'student' ? 'AP Scholar' : data.role === 'teacher' ? 'Faculty Lead' : 'Guardian / Parent',
      linkedStudentId: data.linked_student_id,
      linkedStudentIds: data.linked_student_ids
    };
  },

  async upsertProfile(profile: Partial<AuthUser> & { id: string; email: string; role: UserRole; name: string }): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    const { error } = await client.from('profiles').upsert({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      avatar: profile.avatar,
      linked_student_id: profile.linkedStudentId || null,
      linked_student_ids: profile.linkedStudentIds || [],
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.warn('Failed to upsert profile in Supabase:', error.message);
      return false;
    }
    return true;
  },

  // -------------------------------------------------------------
  // Real Database CRUD Operations
  // -------------------------------------------------------------
  async fetchConceptNodes(): Promise<ConceptNode[] | null> {
    const client = this.getClient();
    if (!client) return null;

    const { data, error } = await client.from('concept_nodes').select('*');
    if (error || !data || data.length === 0) return null;

    return data.map((row: any): ConceptNode => ({
      id: row.id,
      subject: row.subject,
      title: row.title,
      category: row.category,
      description: row.description || '',
      status: row.status || 'in_progress',
      masteryScore: Number(row.mastery_score) || 0,
      prerequisites: row.prerequisites || [],
      x: Number(row.pos_x) || 100,
      y: Number(row.pos_y) || 100,
      estimatedStudyMins: Number(row.estimated_mins) || 15,
      commonMisconception: row.common_misconception,
      keyTakeaways: row.key_takeaways || []
    }));
  },

  async upsertConceptNode(node: ConceptNode): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    const row = {
      id: node.id,
      subject: node.subject,
      title: node.title,
      category: node.category,
      description: node.description,
      status: node.status,
      mastery_score: node.masteryScore,
      prerequisites: node.prerequisites,
      pos_x: node.x,
      pos_y: node.y,
      estimated_mins: node.estimatedStudyMins,
      common_misconception: node.commonMisconception,
      key_takeaways: node.keyTakeaways,
      updated_at: new Date().toISOString()
    };

    const { error } = await client.from('concept_nodes').upsert(row);
    if (error) {
      console.error('Supabase upsertConceptNode error:', error.message);
      return false;
    }
    return true;
  },

  async fetchRecallCards(): Promise<RecallCard[] | null> {
    const client = this.getClient();
    if (!client) return null;

    const { data, error } = await client.from('recall_cards').select('*');
    if (error || !data || data.length === 0) return null;

    return data.map((row: any): RecallCard => ({
      id: row.id,
      topicId: row.topic_id,
      subject: row.subject,
      front: row.front,
      back: row.back,
      equation: row.equation,
      hint: row.hint,
      intervalDays: Number(row.interval_days) || 1,
      easeFactor: Number(row.ease_factor) || 2.5,
      repetitions: Number(row.repetitions) || 0,
      nextReviewDate: row.next_review_date || new Date().toISOString(),
      lastReviewed: row.last_reviewed,
      status: row.status || 'learning'
    }));
  },

  async upsertRecallCard(card: RecallCard): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    const row = {
      id: card.id,
      topic_id: card.topicId,
      subject: card.subject,
      front: card.front,
      back: card.back,
      equation: card.equation,
      hint: card.hint,
      interval_days: card.intervalDays,
      ease_factor: card.easeFactor,
      repetitions: card.repetitions,
      next_review_date: card.nextReviewDate,
      last_reviewed: card.lastReviewed,
      status: card.status,
      updated_at: new Date().toISOString()
    };

    const { error } = await client.from('recall_cards').upsert(row);
    return !error;
  },

  async fetchWorksheets(): Promise<DifferentiatedWorksheet[] | null> {
    const client = this.getClient();
    if (!client) return null;

    const { data, error } = await client.from('worksheets').select('*');
    if (error || !data || data.length === 0) return null;

    return data.map((row: any): DifferentiatedWorksheet => ({
      id: row.id,
      title: row.title,
      subject: row.subject,
      topicTitle: row.topic_title || row.title,
      createdAt: row.created_at || new Date().toISOString(),
      tier1Foundational: row.tier1_foundational,
      tier2Intermediate: row.tier2_intermediate,
      tier3Extension: row.tier3_extension
    }));
  },

  async upsertWorksheet(worksheet: DifferentiatedWorksheet): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    const row = {
      id: worksheet.id,
      title: worksheet.title,
      subject: worksheet.subject,
      topic_title: worksheet.topicTitle,
      tier1_foundational: worksheet.tier1Foundational,
      tier2_intermediate: worksheet.tier2Intermediate,
      tier3_extension: worksheet.tier3Extension,
      created_at: worksheet.createdAt || new Date().toISOString()
    };

    const { error } = await client.from('worksheets').upsert(row);
    return !error;
  },

  async fetchStudentReport(studentId: string): Promise<StudentComprehensiveReport | null> {
    const client = this.getClient();
    if (!client) return null;

    const { data, error } = await client
      .from('student_reports')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error || !data) return null;

    return {
      studentId: data.student_id,
      studentName: data.student_name,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      grade: data.grade,
      school: data.school || 'St. Jude STEM Academy',
      academicYear: data.academic_year || '2025 - 2026',
      studentEmail: data.student_email || '',
      parentEmail: data.parent_email || '',
      parentName: data.parent_name || '',
      attendance: data.attendance,
      subjectBreakdown: data.subject_breakdown,
      weakAreasRadar: data.weak_areas_radar,
      studyHabits: data.study_habits
    };
  },

  async upsertStudentReport(report: StudentComprehensiveReport): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    const row = {
      student_id: report.studentId,
      student_name: report.studentName,
      avatar: report.avatar,
      grade: report.grade,
      school: report.school,
      academic_year: report.academicYear,
      student_email: report.studentEmail,
      parent_email: report.parentEmail,
      parent_name: report.parentName,
      attendance: report.attendance,
      subject_breakdown: report.subjectBreakdown,
      weak_areas_radar: report.weakAreasRadar,
      study_habits: report.studyHabits,
      updated_at: new Date().toISOString()
    };

    const { error } = await client.from('student_reports').upsert(row);
    return !error;
  },

  // -------------------------------------------------------------
  // Real-Time Cross-Device Postgres Subscriptions
  // -------------------------------------------------------------
  subscribeToDatabaseChanges(onTableChange: (table: string, payload: any) => void) {
    const client = this.getClient();
    if (!client) return () => {};

    const channel = client
      .channel('waypoint_cross_device_realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, payload => {
        onTableChange(payload.table, payload);
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }
};
