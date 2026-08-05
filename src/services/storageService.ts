import {
  ConceptNode,
  RecallCard,
  UserProfile,
  UserRole,
  DifferentiatedWorksheet,
  AuthUser,
  StudentComprehensiveReport,
  ColorThemeId
} from '../types';
import {
  initialConceptNodes,
  initialRecallCards,
  initialStudentProfile,
  mockWorksheets,
  mockAuthUsers,
  mockStudentComprehensiveReport
} from '../data/mockData';

const KEYS = {
  USER_ROLE: 'waypoint_user_role',
  USER_PROFILE: 'waypoint_user_profile',
  AUTH_USER: 'waypoint_auth_user',
  THEME: 'waypoint_theme',
  COLOR_THEME: 'waypoint_color_theme',
  CONCEPT_NODES: 'waypoint_concept_nodes',
  RECALL_CARDS: 'waypoint_recall_cards',
  WORKSHEETS: 'waypoint_worksheets',
};

export const StorageService = {
  getCurrentUser(): AuthUser | null {
    const data = localStorage.getItem(KEYS.AUTH_USER);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        // fallback
      }
    }
    return null;
  },

  login(user: AuthUser): void {
    localStorage.setItem(KEYS.AUTH_USER, JSON.stringify(user));
    this.setRole(user.role);
  },

  logout(): void {
    localStorage.removeItem(KEYS.AUTH_USER);
  },

  getRole(): UserRole {
    return (localStorage.getItem(KEYS.USER_ROLE) as UserRole) || 'student';
  },

  setRole(role: UserRole): void {
    localStorage.setItem(KEYS.USER_ROLE, role);
  },

  getProfile(): UserProfile {
    const data = localStorage.getItem(KEYS.USER_PROFILE);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        // fallback
      }
    }
    return initialStudentProfile;
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  getStudentReport(_studentId?: string): StudentComprehensiveReport {
    return mockStudentComprehensiveReport;
  },

  addXP(amount: number): UserProfile {
    const profile = this.getProfile();
    const newXP = profile.xp + amount;
    const newLevel = Math.floor(newXP / 250) + 1;
    const updated = {
      ...profile,
      xp: newXP,
      level: newLevel,
    };
    this.saveProfile(updated);
    return updated;
  },

  getTheme(): 'dark' | 'light' {
    return (localStorage.getItem(KEYS.THEME) as 'dark' | 'light') || 'dark';
  },

  setTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  getColorTheme(): ColorThemeId {
    return (localStorage.getItem(KEYS.COLOR_THEME) as ColorThemeId) || 'indigo';
  },

  setColorTheme(colorTheme: ColorThemeId): void {
    localStorage.setItem(KEYS.COLOR_THEME, colorTheme);
    document.documentElement.setAttribute('data-color-theme', colorTheme);
  },

  getConceptNodes(): ConceptNode[] {
    const data = localStorage.getItem(KEYS.CONCEPT_NODES);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        // fallback
      }
    }
    return initialConceptNodes;
  },

  saveConceptNodes(nodes: ConceptNode[]): void {
    localStorage.setItem(KEYS.CONCEPT_NODES, JSON.stringify(nodes));
  },

  updateNodeMastery(nodeId: string, delta: number): ConceptNode[] {
    const nodes = this.getConceptNodes();
    const updated = nodes.map(node => {
      if (node.id === nodeId) {
        const newScore = Math.max(0, Math.min(100, node.masteryScore + delta));
        let newStatus = node.status;
        if (newScore >= 80) newStatus = 'mastered';
        else if (newScore < 50) newStatus = 'weak';
        else newStatus = 'in_progress';
        return { ...node, masteryScore: newScore, status: newStatus };
      }
      return node;
    });
    this.saveConceptNodes(updated);
    return updated;
  },

  getRecallCards(): RecallCard[] {
    const data = localStorage.getItem(KEYS.RECALL_CARDS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        // fallback
      }
    }
    return initialRecallCards;
  },

  saveRecallCards(cards: RecallCard[]): void {
    localStorage.setItem(KEYS.RECALL_CARDS, JSON.stringify(cards));
  },

  saveSingleCard(card: RecallCard): RecallCard[] {
    const cards = this.getRecallCards();
    const index = cards.findIndex(c => c.id === card.id);
    let updated: RecallCard[];
    if (index >= 0) {
      updated = [...cards];
      updated[index] = card;
    } else {
      updated = [card, ...cards];
    }
    this.saveRecallCards(updated);
    return updated;
  },

  getWorksheets(): DifferentiatedWorksheet[] {
    const data = localStorage.getItem(KEYS.WORKSHEETS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        // fallback
      }
    }
    return mockWorksheets;
  },

  saveWorksheets(worksheets: DifferentiatedWorksheet[]): void {
    localStorage.setItem(KEYS.WORKSHEETS, JSON.stringify(worksheets));
  }
};
