export type UserRole = 'student' | 'teacher' | 'parent';

export type SubjectId = 'math' | 'physics' | 'cs' | 'biology' | 'chemistry';

export type ColorThemeId =
  | 'indigo'
  | 'teal'
  | 'emerald'
  | 'coral'
  | 'plum'
  | 'slate'
  | 'amber'
  | 'rose'
  | 'graphite';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  grade: string;
  xp: number;
  level: number;
  streakDays: number;
  dailyGoalMinutes: number;
  completedMinutesToday: number;
  cardsReviewedToday: number;
}

export type NodeStatus = 'mastered' | 'weak' | 'in_progress' | 'locked';

export interface ConceptNode {
  id: string;
  title: string;
  subject: SubjectId;
  category: string;
  status: NodeStatus;
  masteryScore: number; // 0 to 100
  prerequisites: string[]; // Node IDs
  x: number;
  y: number;
  description: string;
  estimatedStudyMins: number;
  commonMisconception?: string;
  keyTakeaways: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface DiagnosticQuestion {
  id: string;
  subject: SubjectId;
  topicId: string;
  topicTitle: string;
  question: string;
  equation?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    misconceptionFeedback?: string;
  }[];
  hint: string;
}

export interface DiagnosticResult {
  totalQuestions: number;
  correctAnswers: number;
  identifiedGaps: {
    topicId: string;
    topicTitle: string;
    severity: 'high' | 'medium' | 'low';
    misconception: string;
    recommendedAction: string;
  }[];
  generatedCardIds: string[];
}

export type ConfidenceRating = 'again' | 'hard' | 'good' | 'easy';

export interface RecallCard {
  id: string;
  topicId: string;
  subject: SubjectId;
  front: string;
  back: string;
  equation?: string;
  hint?: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: string; // ISO string
  lastReviewed?: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  mode?: 'socratic' | 'feynman';
  feynmanFeedback?: {
    comprehensionScore: number; // 0 - 100
    clarityScore: number;
    missingKeyPoints: string[];
    praise: string;
    suggestion: string;
  };
  isLoading?: boolean;
}

export interface HomeworkProblem {
  id: string;
  title: string;
  subject: SubjectId;
  rawExpression: string;
  steps: {
    stepNumber: number;
    expression: string;
    explanation: string;
    isError: boolean;
    errorType?: string;
    correctionHint?: string;
  }[];
  conceptTested: string;
  remedialConceptId: string;
  uploadedImageUrl?: string;
}

export interface CareerPath {
  id: string;
  title: string;
  icon: string;
  industry: string;
  matchScore: number; // 0 - 100
  avgSalary: string;
  growthRate: string;
  description: string;
  connectedSyllabusTopics: {
    topicId: string;
    topicTitle: string;
    howItIsUsed: string;
  }[];
  miniSimulation: {
    scenario: string;
    challengeQuestion: string;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
      feedback: string;
    }[];
  };
}

export interface StudentClassroomMetric {
  studentId: string;
  studentName: string;
  avatar: string;
  grade: string;
  overallMastery: number;
  status: 'thriving' | 'on_track' | 'needs_support' | 'at_risk';
  gapTopicsCount: number;
  lastActive: string;
  topicScores: Record<string, number>; // topicId -> score 0-100
}

export interface DifferentiatedWorksheet {
  id: string;
  title: string;
  subject: SubjectId;
  topicTitle: string;
  createdAt: string;
  tier1Foundational: {
    targetStudents: string[];
    description: string;
    problems: string[];
  };
  tier2Intermediate: {
    targetStudents: string[];
    description: string;
    problems: string[];
  };
  tier3Extension: {
    targetStudents: string[];
    description: string;
    problems: string[];
  };
}

export interface ParentWeeklySummary {
  weekLabel: string;
  overallHealth: 'excellent' | 'steady' | 'needs_attention';
  hoursLearned: number;
  masteryGainPercent: number;
  cardsMasteredCount: number;
  headlineSummary: string;
  celebrations: string[];
  focusAreas: {
    subject: string;
    topic: string;
    homeActionTip: string;
  }[];
  dinnerTablePrompts: {
    prompt: string;
    context: string;
    followUp: string;
  }[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  title: string;
  linkedStudentId?: string; // Active linked student
  linkedStudentIds?: string[]; // All linked students for multi-child parents
}

export interface StudentComprehensiveReport {
  studentId: string;
  studentName: string;
  avatar: string;
  grade: string;
  school: string;
  academicYear: string;
  studentEmail: string;
  parentEmail: string;
  parentName: string;

  // Attendance metrics
  attendance: {
    overallRate: number; // e.g. 96.8%
    presentDays: number;
    totalDays: number;
    excusedAbsences: number;
    unexcusedAbsences: number;
    tardies: number;
    recentLog: {
      date: string;
      status: 'present' | 'absent' | 'tardy' | 'excused';
      subject: string;
      note?: string;
    }[];
  };

  // Multi-subject performance & strengths
  subjectBreakdown: {
    subject: string;
    score: number; // 0-100
    gradeLetter: string; // "A+", "A", "B+"
    strengths: string[];
    weakSections: string[];
    teacherRemarks: string;
    teacherName: string;
    rankInClass: string;
  }[];

  // Priority remediation topics / weak spots
  weakAreasRadar: {
    topic: string;
    subject: string;
    severity: 'critical' | 'moderate' | 'mild';
    misconceptionSummary: string;
    recommendedHomeAction: string;
  }[];

  // Cognitive & Habits metrics
  studyHabits: {
    weeklyFocusHours: number;
    activeRecallStreakDays: number;
    masteredCardsCount: number;
    socraticSessionsCompleted: number;
    completionRate: number; // 94%
  };
}

// -------------------------------------------------------------
// AI Provider & LLM Engine Configuration Types
// -------------------------------------------------------------
export type AIProviderId = 'openai' | 'anthropic' | 'gemini' | 'simulated';

export interface AIConfig {
  provider: AIProviderId;
  apiKey: string;
  model: string;
  temperature: number;
  visionModel?: string;
  customEndpoint?: string;
}

export interface VisionScanResult {
  title: string;
  subject: SubjectId;
  rawExpression: string;
  steps: {
    stepNumber: number;
    expression: string;
    explanation: string;
    isError: boolean;
    errorType?: string;
    correctionHint?: string;
  }[];
  conceptTested: string;
  remedialConceptId: string;
}

// -------------------------------------------------------------
// Cloud Database & Backend Configuration Types
// -------------------------------------------------------------
export type CloudProviderId = 'local' | 'supabase' | 'firebase';

export interface CloudBackendConfig {
  provider: CloudProviderId;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  firebaseProjectId?: string;
  firebaseApiKey?: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}

// -------------------------------------------------------------
// Curriculum Authoring & Generation Types
// -------------------------------------------------------------
export interface CurriculumGenerationPrompt {
  subject: SubjectId;
  courseTitle: string;
  targetLevel: 'introductory' | 'ap_advanced' | 'college' | 'remedial';
  keyUnits: string[];
  generateQuestions: boolean;
}

export interface GeneratedCurriculum {
  courseTitle: string;
  subject: SubjectId;
  nodes: ConceptNode[];
  edges: GraphEdge[];
  sampleWorksheets?: DifferentiatedWorksheet[];
}

// -------------------------------------------------------------
// Vector Storage & Qdrant Configuration Types
// -------------------------------------------------------------
export interface QdrantConfig {
  url: string;
  apiKey: string;
  collectionName: string;
  dimension: number;
  isConnected: boolean;
  indexedPointsCount?: number;
  lastIndexedAt?: string;
}

export interface RAGSearchResult {
  nodeId: string;
  title: string;
  subject: SubjectId;
  score: number;
  category: string;
  description: string;
  commonMisconception?: string;
  keyTakeaways: string[];
  prerequisites: string[];
}

// -------------------------------------------------------------
// Enterprise AI Guardrails & Governance Types
// -------------------------------------------------------------
export type GuardrailProviderId = 'enkrypt' | 'local_regex' | 'hybrid';

export interface GuardrailConfig {
  provider: GuardrailProviderId;
  enkryptApiKey: string;
  enkryptEndpoint?: string;
  maskPII: boolean;
  blockPromptInjections: boolean;
  contentSafetyThreshold: 'strict' | 'moderate' | 'relaxed';
}

export type SafetyViolationType =
  | 'PROMPT_INJECTION'
  | 'SYSTEM_PROMPT_EXTRACTION'
  | 'PII_DETECTED'
  | 'TOXIC_CONTENT'
  | 'ACADEMIC_CHEATING'
  | 'JAILBREAK_ATTEMPT';

export interface GuardrailCheckResult {
  passed: boolean;
  blocked: boolean;
  sanitizedText: string;
  violations: SafetyViolationType[];
  redactedFields: string[];
  riskScore: number; // 0.0 - 1.0
  reason?: string;
  enkryptScanId?: string;
}

export interface AIAuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userRole: UserRole;
  promptOriginal: string;
  promptSanitized: string;
  ragCitations?: string[];
  guardrailStatus: 'passed' | 'flagged' | 'blocked';
  violations: SafetyViolationType[];
  redactedFields: string[];
  riskScore: number;
  latencyMs: number;
  tokensEstimate: number;
  model: string;
  provider: string;
  responseSnippet?: string;
}

