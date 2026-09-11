import React, { useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Inbox,
  FolderKanban,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Zap,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  PanelLeftClose,
  PanelLeft,
  Star,
  HelpCircle,
  LogOut,
  Building2,
  Check,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const Sidebar: React.FC = () => {
  const {
    currentWorkspace,
    workspaces,
    setCurrentWorkspaceId,
    createWorkspace,
    currentView,
    setCurrentView,
    activeProjectId,
    setActiveProjectId,
    projects,
    notifications,
    currentUser,
    users,
    setCurrentUser,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    setIsCommandPaletteOpen,
    setIsAIAssistantOpen,
    setIsCreateProjectOpen,
    setIsCreateTaskOpen,
  } = useApp();

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [newWsName, setNewWsName] = useState("");
  const [showNewWsInput, setShowNewWsInput] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const workspaceProjects = projects.filter((p) => p.workspaceId === currentWorkspace.id);
  const favoriteProjects = workspaceProjects.filter((p) => p.isFavorite);

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWsName.trim()) {
      createWorkspace(newWsName.trim(), "#2E7D5B");
      setNewWsName("");
      setShowNewWsInput(false);
      setIsWorkspaceMenuOpen(false);
    }
  };

  const navSections = [
    {
      title: "Geral",
      items: [
        { id: "dashboard", label: "Visão Geral", icon: LayoutDashboard },
        { id: "my-work", label: "O Meu Trabalho", icon: CheckSquare },
        { id: "inbox", label: "Caixa de Entrada", icon: Inbox, badge: unreadCount > 0 ? unreadCount : undefined },
      ],
    },
    {
      title: "Colaboração",
      items: [
        { id: "calendar", label: "Calendário", icon: Calendar },
        { id: "documents", label: "Documentos", icon: FileText },
        { id: "teams", label: "Equipas", icon: Users },
      ],
    },
    {
      title: "Governação & Inteligência",
      items: [
        { id: "reports", label: "Relatórios & Métricas", icon: BarChart3 },
        { id: "automations", label: "Automações", icon: Zap },
      ],
    },
  ];

  return (
    <aside
      className={`relative z-20 flex flex-col border-r border-line dark:border-white/[0.08] bg-card/80 dark:bg-brand-950/85 backdrop-blur-xl transition-all duration-200 select-none text-ink dark:text-[#EAECE9] ${
        isSidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Header / Workspace Switcher */}
      <div className="h-14 border-b border-line dark:border-white/[0.08] flex items-center justify-between px-3">
        {!isSidebarCollapsed ? (
          <div className="relative flex-1 mr-2">
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="w-full flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-line/40 dark:hover:bg-brand-900/30 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs"
                  style={{ backgroundColor: currentWorkspace.color }}
                >
                  {currentWorkspace.name.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-xs text-ink dark:text-[#EAECE9] tracking-tight leading-tight truncate font-display">
                    {currentWorkspace.name}
                  </div>
                  <div className="text-[10px] text-faint font-medium">Workspace</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-faint shrink-0" />
            </button>

            {/* Workspace Dropdown */}
            {isWorkspaceMenuOpen && (
              <div className="absolute top-12 left-0 w-64 bg-card/95 dark:bg-brand-900/95 backdrop-blur-2xl rounded-2xl shadow-s border border-line dark:border-brand-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-ink dark:text-[#EAECE9]">
                <div className="text-[11px] font-semibold text-faint px-2 py-1 uppercase tracking-wider font-display">
                  Workspaces
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setCurrentWorkspaceId(ws.id);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium hover:bg-line/40 dark:hover:bg-white/[0.06] transition-colors text-ink dark:text-brand-100"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: ws.color }}
                        >
                          {ws.name.charAt(0)}
                        </div>
                        <span className="truncate">{ws.name}</span>
                      </div>
                      {ws.id === currentWorkspace.id && <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-line dark:border-brand-800 mt-2 pt-2">
                  {!showNewWsInput ? (
                    <button
                      onClick={() => setShowNewWsInput(true)}
                      className="w-full flex items-center gap-2 p-1.5 text-xs text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white hover:bg-line/40 dark:hover:bg-white/[0.06] rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Criar novo Workspace</span>
                    </button>
                  ) : (
                    <form onSubmit={handleCreateWorkspace} className="space-y-1.5 p-1">
                      <input
                        type="text"
                        placeholder="Nome do Workspace..."
                        value={newWsName}
                        onChange={(e) => setNewWsName(e.target.value)}
                        autoFocus
                        className="w-full text-xs px-2.5 py-1.5 bg-paper dark:bg-brand-950 border border-line2 dark:border-brand-800 text-ink dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <div className="flex gap-1">
                        <button
                          type="submit"
                          className="flex-1 text-[11px] bg-brand-500 text-white py-1 rounded-lg font-medium hover:bg-brand-600 shadow-xs"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewWsInput(false)}
                          className="text-[11px] bg-line/40 dark:bg-white/[0.06] text-soft dark:text-brand-300 px-2 py-1 rounded-lg hover:bg-line"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs mx-auto shadow-xs"
            style={{ backgroundColor: currentWorkspace.color }}
          >
            {currentWorkspace.name.charAt(0)}
          </div>
        )}

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-1.5 text-faint hover:text-ink dark:hover:text-white rounded-lg hover:bg-line/40 dark:hover:bg-white/[0.06] transition-colors shrink-0"
          title={isSidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
        >
          {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Global Quick Action & Search */}
      <div className="p-3 border-b border-line dark:border-white/[0.08] space-y-2">
        {!isSidebarCollapsed ? (
          <>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 bg-paper/80 dark:bg-brand-900/30 hover:bg-paper dark:hover:bg-brand-900/50 text-soft dark:text-brand-200 hover:text-ink dark:hover:text-white rounded-xl text-xs font-medium border border-line dark:border-brand-800 transition-all backdrop-blur-md shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-faint" />
                <span>Pesquisar...</span>
              </div>
              <kbd className="text-[10px] bg-card dark:bg-brand-950 border border-line dark:border-brand-800 text-faint px-1.5 py-0.5 rounded-md shadow-xs font-mono">
                Ctrl K
              </kbd>
            </button>

            {/* AI Assistant Special Trigger */}
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-2 bg-brand-50/80 dark:bg-brand-900/40 hover:bg-brand-100/80 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-200 rounded-xl text-xs font-semibold border border-brand-200/80 dark:border-brand-700/50 transition-all shadow-xs group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400 group-hover:rotate-12 transition-transform" />
                <span>Assistente IA</span>
              </div>
              <span className="text-[10px] bg-brand-200/60 dark:bg-brand-700/50 text-brand-800 dark:text-brand-200 px-1.5 py-0.5 rounded-md font-bold">
                PRO
              </span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="p-2 text-soft hover:bg-line/40 dark:hover:bg-white/[0.06] rounded-xl"
              title="Pesquisa (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="p-2 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/40 hover:bg-brand-100 rounded-xl"
              title="Assistente IA"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation Items (Grouped by Category) */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navSections.map((section, idx) => (
          <div key={section.title} className="space-y-0.5">
            {!isSidebarCollapsed ? (
              <div className="px-2 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-faint font-display">
                {section.title}
              </div>
            ) : idx > 0 ? (
              <div className="w-8 h-px bg-line/60 dark:bg-brand-900/50 mx-auto my-2" />
            ) : null}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-brand-50 dark:bg-brand-800/50 text-brand-700 dark:text-brand-200 font-semibold shadow-xs border border-brand-200 dark:border-brand-700/60"
                      : "text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white hover:bg-line/40 dark:hover:bg-brand-900/30"
                  } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-brand-600 dark:text-brand-400" : "text-faint dark:text-brand-400/60"
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="text-[10px] bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-200 px-1.5 py-0.2 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Projects Tree */}
        {!isSidebarCollapsed && (
          <div className="space-y-1 pt-1 border-t border-line/60 dark:border-brand-900/50">
            <div className="flex items-center justify-between px-2 text-[10px] font-semibold text-faint uppercase tracking-wider font-display">
              <button
                onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                className="flex items-center gap-1 hover:text-ink dark:hover:text-white transition-colors"
              >
                {isProjectsExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <span>Projetos ({workspaceProjects.length})</span>
              </button>
              <button
                onClick={() => setIsCreateProjectOpen(true)}
                className="p-1 hover:bg-line/40 dark:hover:bg-white/[0.06] rounded-md text-faint hover:text-ink dark:hover:text-white transition-colors"
                title="Novo Projeto"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {isProjectsExpanded && (
              <div className="space-y-0.5 mt-1">
                {workspaceProjects.map((p) => {
                  const isActive = currentView === "project-detail" && activeProjectId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProjectId(p.id);
                        setCurrentView("project-detail");
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-all group ${
                        isActive
                          ? "bg-brand-50/90 dark:bg-brand-800/40 text-brand-800 dark:text-brand-200 font-semibold border border-brand-200 dark:border-brand-700/60"
                          : "text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white hover:bg-line/40 dark:hover:bg-brand-900/30"
                      }`}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="flex-1 text-left truncate">{p.name}</span>
                      {p.isFavorite && <Star className="w-3 h-3 text-gold fill-gold shrink-0" />}
                    </button>
                  );
                })}

                {workspaceProjects.length === 0 && (
                  <div className="p-3 bg-paper/60 dark:bg-brand-900/30 rounded-xl border border-dashed border-line dark:border-brand-800/80 text-center space-y-1.5 my-1">
                    <p className="text-[11px] text-faint">Sem projetos no workspace.</p>
                    <button
                      onClick={() => setIsCreateProjectOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-300 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Criar primeiro projeto</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Settings shortcut */}
        <div className="pt-2 border-t border-line dark:border-white/[0.08]">
          <button
            onClick={() => setCurrentView("settings")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              currentView === "settings"
                ? "bg-brand-50 dark:bg-brand-800/50 text-brand-700 dark:text-brand-200 font-semibold shadow-xs"
                : "text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white hover:bg-line/40 dark:hover:bg-brand-900/30"
            } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
            title={isSidebarCollapsed ? "Configurações" : undefined}
          >
            <Settings className="w-4 h-4 text-faint shrink-0" />
            {!isSidebarCollapsed && <span className="text-left">Configurações</span>}
          </button>
        </div>
      </div>

      {/* User Profile Footer & Switcher */}
      <div className="p-3 border-t border-line dark:border-white/[0.08] relative">
        {!isSidebarCollapsed ? (
          <>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center gap-2.5 p-1 rounded-xl hover:bg-line/40 dark:hover:bg-white/[0.06] transition-colors text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-line dark:border-white/[0.1] shrink-0"
              />
              <div className="flex-1 truncate">
                <div className="text-xs font-semibold text-ink dark:text-[#EAECE9] truncate leading-tight font-display">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-faint font-medium truncate">
                  {currentUser.role} · {currentUser.email}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-faint shrink-0" />
            </button>

            {/* User Dropdown / Switch Persona */}
            {isUserMenuOpen && (
              <div className="absolute bottom-14 left-3 right-3 bg-card/95 dark:bg-brand-900/95 backdrop-blur-2xl rounded-2xl shadow-s border border-line dark:border-brand-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-ink dark:text-[#EAECE9]">
                <div className="text-[10px] font-semibold text-faint px-2 py-1 uppercase tracking-wider font-display">
                  Alternar Utilizador (Demo)
                </div>
                <div className="space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-1.5 rounded-xl text-xs hover:bg-line/40 dark:hover:bg-white/[0.06] transition-colors text-ink dark:text-brand-100"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-line dark:border-white/10"
                        />
                        <div className="text-left truncate">
                          <div className="font-medium text-xs truncate">{u.name}</div>
                          <div className="text-[10px] text-faint">{u.role}</div>
                        </div>
                      </div>
                      {u.id === currentUser.id && (
                        <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-line dark:border-brand-800 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setCurrentView("settings");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-1.5 text-xs text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white hover:bg-line/40 dark:hover:bg-white/[0.06] rounded-xl"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Gerir Permissões RBAC</span>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center justify-center mx-auto"
            title={currentUser.name}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-line dark:border-white/[0.1]"
            />
          </button>
        )}
      </div>
    </aside>
  );
};
