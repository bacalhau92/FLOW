import React from "react";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Plus,
  Calendar as CalendarIcon,
  Filter,
  Check,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const DashboardView: React.FC = () => {
  const {
    currentWorkspace,
    projects,
    tasks,
    currentUser,
    users,
    activities,
    quickFilter,
    setQuickFilter,
    setSelectedTaskId,
    toggleTaskCompletion,
    setActiveProjectId,
    setCurrentView,
    setIsCreateProjectOpen,
    setIsCreateTaskOpen,
    setIsAIAssistantOpen,
  } = useApp();

  const workspaceProjects = projects.filter((p) => p.workspaceId === currentWorkspace.id);
  const workspaceProjectIds = workspaceProjects.map((p) => p.id);
  const workspaceTasks = tasks.filter((t) => workspaceProjectIds.includes(t.projectId));

  // Metrics
  const totalProjects = workspaceProjects.length;
  const completedTasks = workspaceTasks.filter((t) => t.isCompleted).length;
  const pendingTasks = workspaceTasks.filter((t) => !t.isCompleted).length;
  const overdueTasks = workspaceTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.isCompleted
  ).length;

  // Filtered task display for quick action panel
  let displayTasks = workspaceTasks;
  if (quickFilter === "my-tasks") {
    displayTasks = displayTasks.filter((t) => t.assigneeId === currentUser.id);
  } else if (quickFilter === "overdue") {
    displayTasks = displayTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.isCompleted
    );
  } else if (quickFilter === "high-priority") {
    displayTasks = displayTasks.filter(
      (t) => t.priority === "ALTA" || t.priority === "URGENTE"
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Welcome Banner & AI Daily Briefing Prompt */}
      <div className="bg-linear-to-r from-brand-900 via-brand-800 to-ink text-white rounded-3xl p-6 md:p-8 shadow-s relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-brand-100 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-brand-200" />
              <span>Workspace: {currentWorkspace.name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
              Olá, {currentUser.name}!
            </h1>
            <p className="text-xs md:text-sm text-brand-100/90 leading-relaxed">
              Aqui está o panorama em tempo real do seu trabalho. Tens{" "}
              <strong className="text-white font-semibold">{pendingTasks} tarefas em curso</strong> nos teus{" "}
              <strong className="text-white font-semibold">{totalProjects} projetos ativos</strong>.
            </p>
          </div>

          {/* Quick AI Action button & Primary New Project */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs border border-white/20 backdrop-blur-xs transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-200" />
              <span>Assistente IA</span>
            </button>
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-semibold text-xs shadow-xs border border-brand-300/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Projeto</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <div className="p-4 bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-faint">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Projetos</span>
            <FolderKanban className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-ink dark:text-[#EAECE9] font-display">{totalProjects}</div>
          <div className="text-[11px] text-soft dark:text-brand-300 flex items-center gap-1">
            <span className="text-brand-600 dark:text-brand-400 font-semibold">100%</span> no prazo estimado
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="p-4 bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-faint">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pendentes</span>
            <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-ink dark:text-[#EAECE9] font-display">{pendingTasks}</div>
          <div className="text-[11px] text-soft dark:text-brand-300">
            Distribuição balanceada na equipa
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="p-4 bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-faint">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-ink dark:text-[#EAECE9] font-display">{completedTasks}</div>
          <div className="text-[11px] text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Taxa de avanço regular
          </div>
        </div>

        {/* Overdue Tasks */}
        <div
          className={`p-4 rounded-2xl border shadow-2xs space-y-2 ${
            overdueTasks > 0
              ? "bg-dangerbg/60 border-danger/30 text-danger"
              : "bg-card dark:bg-brand-950/60 border-line dark:border-brand-800"
          }`}
        >
          <div className="flex items-center justify-between text-faint">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                overdueTasks > 0 ? "text-danger" : "text-faint"
              }`}
            >
              Atrasadas
            </span>
            <AlertTriangle
              className={`w-4 h-4 ${overdueTasks > 0 ? "text-danger" : "text-faint"}`}
            />
          </div>
          <div
            className={`text-2xl font-bold font-display ${
              overdueTasks > 0 ? "text-danger" : "text-ink dark:text-[#EAECE9]"
            }`}
          >
            {overdueTasks}
          </div>
          <div className="text-[11px] text-soft dark:text-brand-300">
            {overdueTasks > 0 ? "Requer intervenção" : "Nenhum atraso crítico"}
          </div>
        </div>
      </div>

      {/* Main Grid: Projects Showcase & Actionable Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-ink dark:text-[#EAECE9] flex items-center gap-2 font-display">
              <FolderKanban className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Projetos em Andamento</span>
            </h2>
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Projeto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {workspaceProjects.map((p) => {
              const pTasks = tasks.filter((t) => t.projectId === p.id);
              const pCompleted = pTasks.filter((t) => t.isCompleted).length;
              const progress = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    setCurrentView("project-detail");
                  }}
                  className="bg-card dark:bg-brand-950/60 p-5 rounded-2xl border border-line dark:border-brand-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <h3 className="font-bold text-sm text-ink dark:text-[#EAECE9] group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors font-display">
                          {p.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-paper dark:bg-brand-900/60 text-soft dark:text-brand-300 border border-line dark:border-brand-800 shrink-0">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-soft dark:text-brand-300/80 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-line/60 dark:border-brand-800/60">
                    <div className="flex items-center justify-between text-[11px] text-soft dark:text-brand-300">
                      <span>Progresso ({progress}%)</span>
                      <span className="font-semibold text-ink dark:text-[#EAECE9]">
                        {pCompleted}/{pTasks.length} tarefas
                      </span>
                    </div>
                    <div className="w-full bg-paper dark:bg-brand-900 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%`, backgroundColor: p.color }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-faint">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{p.targetDate || "Sem prazo"}</span>
                      </div>
                      <span className="text-brand-600 dark:text-brand-400 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                        Abrir <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Quick Tasks & Filter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-ink dark:text-[#EAECE9] flex items-center gap-2 font-display">
              <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Tarefas Rápidas</span>
            </h2>
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <button
              onClick={() => setQuickFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                quickFilter === "all"
                  ? "bg-brand-500 text-white shadow-2xs"
                  : "bg-paper dark:bg-brand-900/60 text-soft dark:text-brand-300 hover:bg-card border border-line dark:border-brand-800"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setQuickFilter("my-tasks")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                quickFilter === "my-tasks"
                  ? "bg-brand-500 text-white shadow-2xs"
                  : "bg-paper dark:bg-brand-900/60 text-soft dark:text-brand-300 hover:bg-card border border-line dark:border-brand-800"
              }`}
            >
              Minhas
            </button>
            <button
              onClick={() => setQuickFilter("overdue")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                quickFilter === "overdue"
                  ? "bg-danger text-white shadow-2xs"
                  : "bg-paper dark:bg-brand-900/60 text-soft dark:text-brand-300 hover:bg-card border border-line dark:border-brand-800"
              }`}
            >
              Atrasadas
            </button>
            <button
              onClick={() => setQuickFilter("high-priority")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                quickFilter === "high-priority"
                  ? "bg-brand-500 text-white shadow-2xs"
                  : "bg-paper dark:bg-brand-900/60 text-soft dark:text-brand-300 hover:bg-card border border-line dark:border-brand-800"
              }`}
            >
              Urgentes
            </button>
          </div>

          {/* Tasks List */}
          <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-2 space-y-1 max-h-[480px] overflow-y-auto shadow-xs">
            {displayTasks.map((t) => {
              const isDuePast = t.dueDate && new Date(t.dueDate) < new Date() && !t.isCompleted;
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-paper dark:hover:bg-brand-900/50 border border-transparent hover:border-line dark:hover:border-brand-800 transition-all text-xs group"
                >
                  <button
                    onClick={() => toggleTaskCompletion(t.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      t.isCompleted
                        ? "bg-brand-500 border-brand-500 text-white"
                        : "border-line dark:border-brand-700 hover:border-brand-500"
                    }`}
                  >
                    {t.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div
                    onClick={() => setSelectedTaskId(t.id)}
                    className="flex-1 truncate cursor-pointer"
                  >
                    <div
                      className={`font-medium truncate ${
                        t.isCompleted ? "line-through text-faint" : "text-ink dark:text-[#EAECE9]"
                      }`}
                    >
                      {t.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-faint mt-0.5">
                      <span
                        className={`font-semibold ${
                          t.priority === "URGENTE"
                            ? "text-danger"
                            : t.priority === "ALTA"
                            ? "text-warn"
                            : "text-soft dark:text-brand-300"
                        }`}
                      >
                        {t.priority}
                      </span>
                      {t.dueDate && (
                        <span className={isDuePast ? "text-danger font-bold" : ""}>
                          · {t.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {displayTasks.length === 0 && (
              <div className="text-center py-8 text-faint text-xs">
                Nenhuma tarefa correspondente encontrada.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-5 space-y-4 shadow-xs">
        <h2 className="font-bold text-sm text-ink dark:text-[#EAECE9] flex items-center gap-2 font-display">
          <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Atividade Recente no Workspace</span>
        </h2>

        <div className="space-y-3 text-xs">
          {activities.slice(0, 5).map((act) => (
            <div key={act.id} className="flex items-start gap-3 text-soft dark:text-brand-300">
              <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
              <div className="flex-1">
                <span className="font-semibold text-ink dark:text-[#EAECE9]">{act.userName}</span>{" "}
                <span>{act.details}</span>
              </div>
              <span className="text-[10px] text-faint shrink-0">{act.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
