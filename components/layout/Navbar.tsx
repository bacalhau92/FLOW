import React, { useState } from "react";
import {
  Search,
  Plus,
  Bell,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  FilePlus,
  Users,
  Calendar,
  Check,
  ChevronDown,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const Navbar: React.FC<{ onMobileMenuToggle: () => void }> = ({ onMobileMenuToggle }) => {
  const {
    currentWorkspace,
    currentView,
    activeProjectId,
    projects,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsCommandPaletteOpen,
    setIsAIAssistantOpen,
    setIsCreateTaskOpen,
    setIsCreateProjectOpen,
    setIsCreateDocOpen,
    setIsCreateTeamOpen,
    theme,
    toggleTheme,
  } = useApp();

  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const unreadNotifications = notifications.filter((n) => !n.read);

  // Derive human-friendly title based on currentView
  const getViewTitle = () => {
    switch (currentView) {
      case "dashboard":
        return "Painel de Controlo";
      case "my-work":
        return "Meu Trabalho";
      case "inbox":
        return "Caixa de Entrada";
      case "projects":
        return "Projetos";
      case "project-detail":
        return activeProject?.name || "Projeto";
      case "teams":
        return "Equipas e Membros";
      case "calendar":
        return "Calendário Global";
      case "documents":
        return "Documentos e Conhecimento";
      case "reports":
        return "Relatórios & Produtividade";
      case "automations":
        return "Automações de Trabalho";
      case "settings":
        return "Definições e Permissões";
      default:
        return "FLOW";
    }
  };

  return (
    <header className="h-14 border-b border-line dark:border-white/[0.08] bg-paper/85 dark:bg-brand-950/80 backdrop-blur-xl sticky top-0 z-30 px-4 flex items-center justify-between gap-3 select-none text-ink dark:text-[#EAECE9] transition-colors">
      {/* Left: Mobile Toggle & View Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-1.5 text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white rounded-lg hover:bg-line/40 dark:hover:bg-white/[0.08]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-ink dark:text-[#EAECE9] tracking-tight text-sm md:text-base font-display">
            {getViewTitle()}
          </span>
          {currentView === "project-detail" && activeProject && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-card dark:bg-brand-900/60 text-soft dark:text-brand-200 border border-line dark:border-brand-800 shadow-xs">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: activeProject.color }}
              />
              {activeProject.status}
            </span>
          )}
        </div>
      </div>

      {/* Center: Global AI Command Bar ("✨ O que queres fazer?") */}
      <div className="hidden lg:flex flex-1 max-w-md mx-auto">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-card/75 dark:bg-brand-900/35 hover:bg-card dark:hover:bg-brand-900/50 text-soft dark:text-brand-200 hover:text-ink dark:hover:text-white border border-line dark:border-brand-800/80 rounded-full text-xs transition-all shadow-xs backdrop-blur-md group"
        >
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 group-hover:rotate-12 transition-transform shrink-0" />
            <span className="truncate">✨ O que queres fazer? (ex: Criar projeto, filtrar atrasadas...)</span>
          </div>
          <kbd className="text-[10px] font-mono text-faint dark:text-brand-300 bg-paper dark:bg-brand-950 border border-line dark:border-brand-800 px-1.5 py-0.5 rounded-md shrink-0 shadow-xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Actions: Theme Toggle, "+ Criar" Dropdown, AI Shortcut, Notifications */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className="p-2 text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white hover:bg-line/40 dark:hover:bg-white/[0.08] rounded-xl transition-all border border-transparent hover:border-line dark:hover:border-white/[0.08]"
          title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
          aria-label="Alternar tema"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-gold hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-brand-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* "+ Criar" Action Button */}
        <div className="relative">
          <button
            onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
            className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 border border-brand-400/30"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Criar</span>
            <ChevronDown className="w-3 h-3 text-brand-200" />
          </button>

          {/* Quick Create Dropdown */}
          {isCreateMenuOpen && (
            <div className="absolute right-0 top-10 w-52 bg-card/95 dark:bg-brand-900/95 backdrop-blur-2xl rounded-2xl shadow-s border border-line dark:border-brand-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-ink dark:text-[#EAECE9]">
              <button
                onClick={() => {
                  setIsCreateMenuOpen(false);
                  setIsCreateTaskOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-soft dark:text-brand-200 hover:text-ink dark:hover:text-white hover:bg-line/40 dark:hover:bg-white/[0.06] rounded-xl transition-colors font-medium text-left"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-500 dark:text-brand-400 shrink-0" />
                <div>
                  <div className="font-semibold text-ink dark:text-white">Nova tarefa</div>
                  <div className="text-[10px] text-faint dark:text-brand-300/70">Atribuir a projeto ou lista</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsCreateMenuOpen(false);
                  setIsCreateProjectOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-soft dark:text-brand-200 hover:text-ink dark:hover:text-white hover:bg-line/40 dark:hover:bg-white/[0.06] rounded-xl transition-colors font-medium text-left"
              >
                <FolderPlus className="w-4 h-4 text-warn shrink-0" />
                <div>
                  <div className="font-semibold text-ink dark:text-white">Novo projeto</div>
                  <div className="text-[10px] text-faint dark:text-brand-300/70">Manual ou gerado com IA</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsCreateMenuOpen(false);
                  setIsCreateDocOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-soft dark:text-brand-200 hover:text-ink dark:hover:text-white hover:bg-line/40 dark:hover:bg-white/[0.06] rounded-xl transition-colors font-medium text-left"
              >
                <FilePlus className="w-4 h-4 text-brand-400 shrink-0" />
                <div>
                  <div className="font-semibold text-ink dark:text-white">Novo documento</div>
                  <div className="text-[10px] text-faint dark:text-brand-300/70">Notas, briefing ou atas</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsCreateMenuOpen(false);
                  setIsCreateTeamOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-soft dark:text-brand-200 hover:text-ink dark:hover:text-white hover:bg-line/40 dark:hover:bg-white/[0.06] rounded-xl transition-colors font-medium text-left"
              >
                <Users className="w-4 h-4 text-brand-500 shrink-0" />
                <div>
                  <div className="font-semibold text-ink dark:text-white">Nova equipa</div>
                  <div className="text-[10px] text-faint dark:text-brand-300/70">Organizar departamentos</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* AI Quick Sparkle Trigger */}
        <button
          onClick={() => setIsAIAssistantOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-200 bg-brand-50 dark:bg-brand-900/40 hover:bg-brand-100 dark:hover:bg-brand-900/70 rounded-xl border border-brand-200 dark:border-brand-700/60 transition-colors"
          title="Assistente IA"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span className="hidden sm:inline font-medium">IA</span>
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white hover:bg-line/40 dark:hover:bg-white/[0.08] rounded-xl relative transition-colors"
            title="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-paper dark:ring-brand-950" />
            )}
          </button>

          {/* Notifications Flyout */}
          {isNotifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-card/95 dark:bg-brand-900/95 backdrop-blur-2xl rounded-2xl shadow-s border border-line dark:border-brand-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-ink dark:text-[#EAECE9]">
              <div className="flex items-center justify-between pb-2 border-b border-line dark:border-brand-800 mb-2">
                <div className="font-semibold text-xs text-ink dark:text-white font-display">Notificações</div>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-brand-600 dark:text-brand-300 hover:underline font-medium"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                      n.read
                        ? "bg-paper/40 dark:bg-white/[0.02] border-transparent text-soft dark:text-brand-200"
                        : "bg-brand-50/70 dark:bg-brand-800/40 border-brand-200 dark:border-brand-700 text-ink dark:text-white font-medium shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-semibold text-xs">{n.title}</div>
                      <span className="text-[10px] text-faint shrink-0">{n.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-soft dark:text-brand-200/80 mt-0.5 leading-snug">{n.message}</p>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-6 text-faint text-xs">
                    Sem notificações no momento.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

