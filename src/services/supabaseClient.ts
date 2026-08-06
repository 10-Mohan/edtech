import { CloudBackendConfig } from '../types';

const CLOUD_CONFIG_KEY = 'waypoint_cloud_backend_config';

export const DEFAULT_CLOUD_CONFIG: CloudBackendConfig = {
  provider: 'local',
  supabaseUrl: '',
  supabaseAnonKey: '',
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'parent')),
  avatar TEXT,
  grade TEXT DEFAULT 'Grade 10',
  xp INTEGER DEFAULT 1420,
  level INTEGER DEFAULT 14,
  streak_days INTEGER DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Parent-Student Links (Many-to-Many for Multi-Student Families)
CREATE TABLE IF NOT EXISTS public.parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- 3. Classroom Cohorts
CREATE TABLE IF NOT EXISTS public.classroom_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Concept Knowledge Graph Nodes
CREATE TABLE IF NOT EXISTS public.concept_nodes (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  prerequisites TEXT[] DEFAULT '{}',
  pos_x NUMERIC DEFAULT 0,
  pos_y NUMERIC DEFAULT 0,
  estimated_mins INTEGER DEFAULT 15,
  common_misconception TEXT,
  key_takeaways TEXT[] DEFAULT '{}'
);

-- 5. Student Concept Mastery Scores (Live Per-Student Node Tracking)
CREATE TABLE IF NOT EXISTS public.student_node_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  node_id TEXT REFERENCES public.concept_nodes(id) ON DELETE CASCADE,
  mastery_score INTEGER DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  status TEXT DEFAULT 'in_progress',
  last_practiced TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, node_id)
);

-- 6. Spaced Repetition Recall Cards (SM-2 Algorithm State)
CREATE TABLE IF NOT EXISTS public.recall_cards (
  id TEXT PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  status TEXT DEFAULT 'learning'
);

-- 7. Differentiated Worksheets (Teacher Generated 3-Tier Materials)
CREATE TABLE IF NOT EXISTS public.differentiated_worksheets (
  id TEXT PRIMARY KEY,
  cohort_id UUID REFERENCES public.classroom_cohorts(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  tier1_foundational JSONB NOT NULL,
  tier2_intermediate JSONB NOT NULL,
  tier3_extension JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Homework & Diagnostic Submissions
CREATE TABLE IF NOT EXISTS public.homework_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  raw_expression TEXT NOT NULL,
  steps JSONB NOT NULL,
  concept_tested TEXT,
  remedial_concept_id TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_node_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recall_cards ENABLE ROW LEVEL SECURITY;
`;

export const SupabaseService = {
  getConfig(): CloudBackendConfig {
    const data = localStorage.getItem(CLOUD_CONFIG_KEY);
    if (data) {
      try {
        return { ...DEFAULT_CLOUD_CONFIG, ...JSON.parse(data) };
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_CLOUD_CONFIG;
  },

  saveConfig(config: CloudBackendConfig): void {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
  },

  isCloudConfigured(): boolean {
    const config = this.getConfig();
    return config.provider === 'supabase' && !!config.supabaseUrl && !!config.supabaseAnonKey;
  },

  async testSupabaseConnection(url: string, anonKey: string): Promise<boolean> {
    try {
      const endpoint = `${url.replace(/\/$/, '')}/rest/v1/profiles?select=count`;
      const res = await fetch(endpoint, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`
        }
      });
      return res.ok || res.status === 404 || res.status === 200;
    } catch (e) {
      return false;
    }
  }
};
