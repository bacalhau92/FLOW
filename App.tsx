import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Navbar } from "./components/layout/Navbar";
import { DashboardView } from "./components/views/DashboardView";
import { ProjectDetailView } from "./components/views/ProjectDetailView";
import { MyWorkView } from "./components/views/MyWorkView";
import { InboxView } from "./components/views/InboxView";
import { CalendarGlobalView } from "./components/views/CalendarGlobalView";
import { TeamsView } from "./components/views/TeamsView";
import { DocumentsView } from "./components/views/DocumentsView";
import { ReportsView } from "./components/views/ReportsView";
import { AutomationsView } from "./components/views/AutomationsView";
import { SettingsView } from "./components/views/SettingsView";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { CommandPalette } from "./components/modals/CommandPalette";
import { TaskModal } from "./components/modals/TaskModal";
import { CreateProjectModal } from "./components/modals/CreateProjectModal";
import { CreateTaskModal } from "./components/modals/CreateTaskModal";
import { CreateDocModal } from "./components/modals/CreateDocModal";
import { CreateTeamModal } from "./components/modals/CreateTeamModal";
import { AIAssistantModal } from "./components/modals/AIAssistantModal";
import { ToastContainer } from "./components/common/ToastContainer";

type AuthView = 'login' | 'register';

const MainLayout: React.FC = () => {
  const { currentView, setIsCommandPaletteOpen } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global key listener for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsCommandPaletteOpen]);

  // Render view based on active currentView
  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />;
      case "project-detail":
        return <ProjectDetailView />;
      case "my-work":
        return <MyWorkView />;
      case "inbox":
        return <InboxView />;
      case "teams":
        return <TeamsView />;
      case "calendar":
        return <CalendarGlobalView />;
      case "documents":
        return <DocumentsView />;
      case "reports":
        return <ReportsView />;
      case "automations":
        return <AutomationsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-paper dark:bg-brand-950 font-sans text-ink dark:text-[#EAECE9] antialiased selection:bg-brand-500 selection:text-white transition-colors duration-300">
      {/* Subtle Ambient Glows for authentic minimalist Glassmorphism depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 w-[600px] h-[500px] bg-brand-500/10 dark:bg-brand-500/[0.08] rounded-full blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-10 w-[600px] h-[500px] bg-brand-700/10 dark:bg-brand-800/[0.06] rounded-full blur-[160px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/3 w-[450px] h-[450px] bg-gold/5 dark:bg-gold/[0.04] rounded-full blur-[150px]"
      />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0 relative z-20">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-50 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main App Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden relative z-10">
        <Navbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-paper/50 dark:bg-black/25 backdrop-blur-xs">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Interactive Modals & Drawers */}
      <CommandPalette />
      <TaskModal />
      <CreateProjectModal />
      <CreateTaskModal />
      <CreateDocModal />
      <CreateTeamModal />
      <AIAssistantModal />
      <ToastContainer />
    </div>
  );
};

const AuthWrapper: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 dark:from-brand-950 dark:via-brand-900 dark:to-brand-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-700 dark:text-brand-300 font-medium">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AuthWrapper />
      </AppProvider>
    </AuthProvider>
  );
}
