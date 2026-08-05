import React, { useState, useEffect } from 'react';
import { AuthUser, ConceptNode, RecallCard, UserProfile, UserRole } from './types';
import { StorageService } from './services/storageService';
import { isCardDue } from './services/srsEngine';
import { mockDiagnosticQuestions } from './data/mockData';

import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { KnowledgeGraph } from './components/student/KnowledgeGraph';
import { ActiveRecallDeck } from './components/student/ActiveRecallDeck';
import { SocraticTutor } from './components/student/SocraticTutor';
import { HomeworkScanner } from './components/student/HomeworkScanner';
import { CareerRoadmap } from './components/student/CareerRoadmap';
import { DiagnosticTestModal } from './components/student/DiagnosticTestModal';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { ParentDashboard } from './components/parent/ParentDashboard';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(StorageService.getCurrentUser());
  const [role, setRole] = useState<UserRole>(currentUser ? currentUser.role : StorageService.getRole());
  const [theme, setTheme] = useState<'dark' | 'light'>(StorageService.getTheme());
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [conceptNodes, setConceptNodes] = useState<ConceptNode[]>(StorageService.getConceptNodes());
  const [recallCards, setRecallCards] = useState<RecallCard[]>(StorageService.getRecallCards());

  // Active Tab states
  const [studentTab, setStudentTab] = useState<string>('knowledge_graph');
  const [teacherTab, setTeacherTab] = useState<string>('class_overview');
  const [parentTab, setParentTab] = useState<string>('academic_report');

  // Modal / Practice selection state
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);
  const [practiceTopic, setPracticeTopic] = useState<ConceptNode | null>(null);

  useEffect(() => {
    StorageService.setTheme(theme);
  }, [theme]);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setRole(user.role);
    StorageService.login(user);
    if (user.role === 'parent') {
      setParentTab('academic_report');
    } else if (user.role === 'teacher') {
      setTeacherTab('class_overview');
    } else {
      setStudentTab('knowledge_graph');
    }
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    StorageService.setTheme(nextTheme);
  };

  const handleAddXP = (amount: number) => {
    const updated = StorageService.addXP(amount);
    setProfile(updated);
  };

  const handleUpdateNodeMastery = (nodeId: string, delta: number) => {
    const updated = StorageService.updateNodeMastery(nodeId, delta);
    setConceptNodes(updated);
    if (delta > 0) handleAddXP(20);
  };

  const handleSaveCard = (card: RecallCard) => {
    const updated = StorageService.saveSingleCard(card);
    setRecallCards(updated);
  };

  const handleAutoGenerateCards = (newCards: RecallCard[]) => {
    const current = StorageService.getRecallCards();
    const updated = [...newCards, ...current];
    StorageService.saveRecallCards(updated);
    setRecallCards(updated);
    setStudentTab('active_recall');
  };

  const handlePracticeNodeInSocratic = (node: ConceptNode) => {
    setPracticeTopic(node);
    setStudentTab('socratic_tutor');
  };

  const handleRemediateFromScanner = (topicId: string) => {
    const node = conceptNodes.find(n => n.id === topicId);
    if (node) {
      setPracticeTopic(node);
      setStudentTab('knowledge_graph');
    }
  };

  // If unauthenticated, show the dedicated Role Selection Login Page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const dueCardsCount = recallCards.filter(isCardDue).length;

  const currentActiveTab =
    role === 'student' ? studentTab : role === 'teacher' ? teacherTab : parentTab;

  const handleSelectTab = (tab: string) => {
    if (role === 'student') setStudentTab(tab);
    else if (role === 'teacher') setTeacherTab(tab);
    else setParentTab(tab);
  };

  return (
    <div className="app-container">
      {/* Dynamic Sidebar */}
      <Sidebar
        currentRole={role}
        activeTab={currentActiveTab}
        onSelectTab={handleSelectTab}
        dueCardsCount={dueCardsCount}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Sticky Glassmorphic Header */}
        <Header
          currentRole={role}
          profile={profile}
          currentUser={currentUser}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        />

        {/* Page Body */}
        <main className="page-wrapper animate-fade-in">
          {/* STUDENT PORTAL VIEWS */}
          {role === 'student' && (
            <>
              {studentTab === 'knowledge_graph' && (
                <KnowledgeGraph
                  nodes={conceptNodes}
                  onSelectNodeForPractice={handlePracticeNodeInSocratic}
                  onUpdateNodeMastery={handleUpdateNodeMastery}
                />
              )}

              {studentTab === 'active_recall' && (
                <ActiveRecallDeck
                  cards={recallCards}
                  onSaveCard={handleSaveCard}
                  onAddXP={handleAddXP}
                />
              )}

              {studentTab === 'socratic_tutor' && (
                <SocraticTutor
                  initialTopic={practiceTopic}
                  onAddXP={handleAddXP}
                />
              )}

              {studentTab === 'homework_scanner' && (
                <HomeworkScanner
                  onRemediateTopic={handleRemediateFromScanner}
                  onAddXP={handleAddXP}
                />
              )}

              {studentTab === 'career_roadmap' && (
                <CareerRoadmap onAddXP={handleAddXP} />
              )}
            </>
          )}

          {/* TEACHER PORTAL VIEWS */}
          {role === 'teacher' && (
            <TeacherDashboard
              nodes={conceptNodes}
              activeTeacherTab={teacherTab}
            />
          )}

          {/* PARENT PORTAL VIEWS */}
          {role === 'parent' && (
            <ParentDashboard
              activeParentTab={parentTab}
            />
          )}
        </main>
      </div>

      {/* Adaptive Diagnostic Modal */}
      <DiagnosticTestModal
        questions={mockDiagnosticQuestions}
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        onAutoGenerateCards={handleAutoGenerateCards}
        onAddXP={handleAddXP}
      />
    </div>
  );
};

export default App;
