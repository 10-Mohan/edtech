import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthUser, ColorThemeId, ConceptNode, RecallCard, UserProfile, UserRole } from './types';
import { StorageService } from './services/storageService';
import { isCardDue } from './services/srsEngine';
import { mockDiagnosticQuestions } from './data/mockData';

import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { KnowledgeGraph } from './components/student/KnowledgeGraph';
import { ActiveRecallDeck } from './components/student/ActiveRecallDeck';
import { SocraticTutor } from './components/student/SocraticTutor';
import { LoadingFallback } from './components/common/LoadingFallback';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Code-split heavy and role-specific modules to optimize initial bundle size
const HomeworkScanner = lazy(() =>
  import('./components/student/HomeworkScanner').then(m => ({ default: m.HomeworkScanner }))
);
const CareerRoadmap = lazy(() =>
  import('./components/student/CareerRoadmap').then(m => ({ default: m.CareerRoadmap }))
);
const TeacherDashboard = lazy(() =>
  import('./components/teacher/TeacherDashboard').then(m => ({ default: m.TeacherDashboard }))
);
const ParentDashboard = lazy(() =>
  import('./components/parent/ParentDashboard').then(m => ({ default: m.ParentDashboard }))
);
const DiagnosticTestModal = lazy(() =>
  import('./components/student/DiagnosticTestModal').then(m => ({ default: m.DiagnosticTestModal }))
);
const ThemeSelectorModal = lazy(() =>
  import('./components/common/ThemeSelectorModal').then(m => ({ default: m.ThemeSelectorModal }))
);
const AISettingsModal = lazy(() =>
  import('./components/common/AISettingsModal').then(m => ({ default: m.AISettingsModal }))
);
const BackendSettingsModal = lazy(() =>
  import('./components/common/BackendSettingsModal').then(m => ({ default: m.BackendSettingsModal }))
);
const GovernanceMonitorModal = lazy(() =>
  import('./components/common/GovernanceMonitorModal').then(m => ({ default: m.GovernanceMonitorModal }))
);

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(StorageService.getCurrentUser());
  const [role, setRole] = useState<UserRole>(currentUser ? currentUser.role : StorageService.getRole());
  const [theme, setTheme] = useState<'dark' | 'light'>(StorageService.getTheme());
  const [colorTheme, setColorTheme] = useState<ColorThemeId>(StorageService.getColorTheme());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState<boolean>(false);
  const [isBackendSettingsOpen, setIsBackendSettingsOpen] = useState<boolean>(false);
  const [isGovernanceOpen, setIsGovernanceOpen] = useState<boolean>(false);

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

  useEffect(() => {
    StorageService.setColorTheme(colorTheme);
  }, [colorTheme]);

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

  const handleSelectColorTheme = (themeId: ColorThemeId) => {
    setColorTheme(themeId);
    StorageService.setColorTheme(themeId);
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

  // If unauthenticated, show the dedicated Role Selection Login Page with Theme Controls
  if (!currentUser) {
    return (
      <>
        <LoginPage
          onLogin={handleLogin}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          colorTheme={colorTheme}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenAISettings={() => setIsAISettingsOpen(true)}
          onOpenBackendSettings={() => setIsBackendSettingsOpen(true)}
          onOpenGovernanceMonitor={() => setIsGovernanceOpen(true)}
        />
        {isThemeModalOpen && (
          <Suspense fallback={<LoadingFallback message="Loading Theme Preferences..." />}>
            <ThemeSelectorModal
              isOpen={isThemeModalOpen}
              onClose={() => setIsThemeModalOpen(false)}
              currentColorTheme={colorTheme}
              onSelectColorTheme={handleSelectColorTheme}
              themeMode={theme}
              onToggleThemeMode={handleToggleTheme}
            />
          </Suspense>
        )}
        {isAISettingsOpen && (
          <Suspense fallback={<LoadingFallback message="Loading AI Gateway..." />}>
            <AISettingsModal
              isOpen={isAISettingsOpen}
              onClose={() => setIsAISettingsOpen(false)}
            />
          </Suspense>
        )}
        {isBackendSettingsOpen && (
          <Suspense fallback={<LoadingFallback message="Loading Cloud Database Config..." />}>
            <BackendSettingsModal
              isOpen={isBackendSettingsOpen}
              onClose={() => setIsBackendSettingsOpen(false)}
            />
          </Suspense>
        )}
        {isGovernanceOpen && (
          <Suspense fallback={<LoadingFallback message="Loading AI Safety Governance..." />}>
            <GovernanceMonitorModal
              isOpen={isGovernanceOpen}
              onClose={() => setIsGovernanceOpen(false)}
            />
          </Suspense>
        )}
      </>
    );
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
          colorTheme={colorTheme}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
          onOpenAISettings={() => setIsAISettingsOpen(true)}
        />

        {/* Page Body */}
        <main className="page-wrapper animate-fade-in">
          <ErrorBoundary isSection>
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
                    onOpenAISettings={() => setIsAISettingsOpen(true)}
                  />
                )}

                {studentTab === 'homework_scanner' && (
                  <Suspense fallback={<LoadingFallback message="Initializing AI Multimodal Scanner..." />}>
                    <HomeworkScanner
                      onRemediateTopic={handleRemediateFromScanner}
                      onAddXP={handleAddXP}
                    />
                  </Suspense>
                )}

                {studentTab === 'career_roadmap' && (
                  <Suspense fallback={<LoadingFallback message="Loading Career STEM Roadmaps..." />}>
                    <CareerRoadmap onAddXP={handleAddXP} />
                  </Suspense>
                )}
              </>
            )}

            {/* TEACHER PORTAL VIEWS */}
            {role === 'teacher' && (
              <Suspense fallback={<LoadingFallback message="Loading Teacher Studio & Class Analytics..." />}>
                <TeacherDashboard
                  nodes={conceptNodes}
                  activeTeacherTab={teacherTab}
                />
              </Suspense>
            )}

            {/* PARENT PORTAL VIEWS */}
            {role === 'parent' && (
              <Suspense fallback={<LoadingFallback message="Loading Guardian Portal & Progress Reports..." />}>
                <ParentDashboard
                  activeParentTab={parentTab}
                />
              </Suspense>
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Adaptive Diagnostic Modal */}
      {isDiagnosticOpen && (
        <Suspense fallback={<LoadingFallback message="Preparing Adaptive Diagnostic..." />}>
          <DiagnosticTestModal
            questions={mockDiagnosticQuestions}
            isOpen={isDiagnosticOpen}
            onClose={() => setIsDiagnosticOpen(false)}
            onAutoGenerateCards={handleAutoGenerateCards}
            onAddXP={handleAddXP}
          />
        </Suspense>
      )}

      {/* 9 Monochrome Single-Tone Theme Selector Modal */}
      {isThemeModalOpen && (
        <Suspense fallback={<LoadingFallback message="Loading Color Palette..." />}>
          <ThemeSelectorModal
            isOpen={isThemeModalOpen}
            onClose={() => setIsThemeModalOpen(false)}
            currentColorTheme={colorTheme}
            onSelectColorTheme={handleSelectColorTheme}
            themeMode={theme}
            onToggleThemeMode={handleToggleTheme}
          />
        </Suspense>
      )}

      {/* AI LLM Settings Modal */}
      {isAISettingsOpen && (
        <Suspense fallback={<LoadingFallback message="Loading AI Gateway..." />}>
          <AISettingsModal
            isOpen={isAISettingsOpen}
            onClose={() => setIsAISettingsOpen(false)}
          />
        </Suspense>
      )}

      {/* Backend & Cloud Database Sync Modal */}
      {isBackendSettingsOpen && (
        <Suspense fallback={<LoadingFallback message="Loading Database Sync..." />}>
          <BackendSettingsModal
            isOpen={isBackendSettingsOpen}
            onClose={() => setIsBackendSettingsOpen(false)}
          />
        </Suspense>
      )}

      {/* Enterprise AI Governance & Safety Monitor Modal */}
      {isGovernanceOpen && (
        <Suspense fallback={<LoadingFallback message="Loading AI Governance & Spend Analytics..." />}>
          <GovernanceMonitorModal
            isOpen={isGovernanceOpen}
            onClose={() => setIsGovernanceOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default App;
