import React from "react";
import {
  CheckSquare,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  FolderKanban,
  Check,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const MyWorkView: React.FC = () => {
  const {
    currentUser,
    tasks,
    projects,
    setSelectedTaskId,
    toggleTaskCompletion,
    setIsCreateTaskOpen,
    setIsAIAssistantOpen,
    setCurrentView,
  } = useApp();

  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id);

  const todayStr = new Date().toISOString().split("T")[0];
  const now = new Date();

  const overdue = myTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && !t.isCompleted
  );

  const pending = myTasks.filter((t) => !t.isCompleted && !overdue.includes(t));
  const completed = myTasks.filter((t) => t.isCompleted);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-[#EAECE9] tracking-tight flex items-center gap-2 font-display">
            <CheckSquare className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>Meu Trabalho & Tarefas Pessoais</span>
          </h1>
          <p className="text-xs text-soft dark:text-brand-300/80 mt-0.5">
            Todas as tarefas atribuídas a {currentUser.name} em todos os projetos do workspace
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-200 font-bold px-3 py-1 rounded-full border border-brand-200 dark:border-brand-700">
            {myTasks.length} tarefas atribuídas
          </span>
          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {myTasks.length === 0 ? (
        <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-700/60 flex items-center justify-center mx-auto text-brand-600 dark:text-brand-300 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-ink dark:text-[#EAECE9] font-display">
              Sem tarefas atribuídas a ti
            </h3>
            <p className="text-xs text-soft dark:text-brand-300/80 leading-relaxed">
              O teu quadro pessoal está livre! Podes criar uma nova tarefa personalizada, pedir à IA para estruturar um plano de trabalho ou explorar outros projetos.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar Primeira Tarefa</span>
            </button>
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-200 border border-brand-200 dark:border-brand-700 hover:bg-brand-100 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Sugerir Tarefas com IA</span>
            </button>
            <button
              onClick={() => setCurrentView("dashboard")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-paper hover:bg-line/60 dark:bg-brand-900/50 dark:hover:bg-brand-800 border border-line dark:border-brand-800 text-ink dark:text-[#EAECE9] transition-all shadow-xs"
            >
              <span>Visão Geral</span>
              <ArrowRight className="w-3.5 h-3.5 text-faint" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Overdue Section */}
          {overdue.length > 0 && (
            <div className="bg-dangerbg/80 dark:bg-brand-900/30 border border-danger/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-danger font-bold text-xs font-display">
                <AlertTriangle className="w-4 h-4 text-danger" />
                <span>Em Atraso ({overdue.length})</span>
              </div>

              <div className="space-y-1.5">
                {overdue.map((t) => {
                  const project = projects.find((p) => p.id === t.projectId);
                  return (
                    <div
                      key={t.id}
                      className="bg-card dark:bg-brand-950/80 p-3 rounded-xl border border-danger/20 flex items-center justify-between gap-3 text-xs shadow-xs hover:border-danger/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <button
                          onClick={() => toggleTaskCompletion(t.id)}
                          className="w-4 h-4 rounded border border-danger/40 hover:border-brand-600 flex items-center justify-center shrink-0 transition-colors"
                        />
                        <span
                          onClick={() => setSelectedTaskId(t.id)}
                          className="font-semibold text-ink dark:text-[#EAECE9] hover:text-brand-600 dark:hover:text-brand-300 cursor-pointer truncate"
                        >
                          {t.title}
                        </span>
                        {project && (
                          <span className="text-[10px] text-faint bg-paper dark:bg-brand-900 px-2 py-0.5 rounded border border-line dark:border-brand-800">
                            {project.name}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-danger font-bold shrink-0">{t.dueDate}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* In Progress / Pending */}
          <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-5 space-y-4 shadow-xs">
            <h2 className="font-bold text-xs text-ink dark:text-[#EAECE9] uppercase tracking-wider flex items-center gap-2 font-display">
              <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Tarefas Pendentes ({pending.length})</span>
            </h2>

            <div className="space-y-2">
              {pending.map((t) => {
                const project = projects.find((p) => p.id === t.projectId);
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-line dark:border-brand-800/80 hover:border-brand-300 dark:hover:border-brand-700 flex items-center justify-between gap-3 text-xs transition-colors bg-paper/40 hover:bg-paper/80 dark:bg-brand-900/20 dark:hover:bg-brand-900/40"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <button
                        onClick={() => toggleTaskCompletion(t.id)}
                        className="w-4 h-4 rounded border border-line2 dark:border-brand-700 hover:border-brand-500 flex items-center justify-center shrink-0 transition-colors"
                      />
                      <span
                        onClick={() => setSelectedTaskId(t.id)}
                        className="font-semibold text-ink dark:text-[#EAECE9] hover:text-brand-600 dark:hover:text-brand-300 cursor-pointer truncate"
                      >
                        {t.title}
                      </span>
                      {project && (
                        <span className="text-[10px] text-soft dark:text-brand-300 bg-paper dark:bg-brand-900/60 px-2 py-0.5 rounded border border-line dark:border-brand-800">
                          {project.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          t.priority === "URGENTE"
                            ? "bg-dangerbg text-danger border-danger/30"
                            : t.priority === "ALTA"
                            ? "bg-warnbg text-warn border-warn/30"
                            : "bg-paper text-soft border-line dark:bg-brand-900 dark:text-brand-200"
                        }`}
                      >
                        {t.priority}
                      </span>
                      <span className="text-soft dark:text-brand-300 text-[11px]">
                        {t.dueDate || "Sem prazo"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {pending.length === 0 && (
                <div className="p-8 text-center space-y-2 border border-dashed border-line dark:border-brand-800 rounded-xl">
                  <p className="text-xs text-soft dark:text-brand-300 font-medium">
                    Sem tarefas pendentes no momento. Bom trabalho!
                  </p>
                  <button
                    onClick={() => setIsCreateTaskOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar tarefa a fazer</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Completed */}
          <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-5 space-y-4 shadow-xs">
            <h2 className="font-bold text-xs text-ink dark:text-[#EAECE9] uppercase tracking-wider flex items-center gap-2 font-display">
              <CheckCircle2 className="w-4 h-4 text-brand-500" />
              <span>Concluídas Recentemente ({completed.length})</span>
            </h2>

            <div className="space-y-1.5">
              {completed.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl border border-line/60 dark:border-brand-800/50 bg-paper/30 dark:bg-brand-900/10 flex items-center justify-between text-xs text-faint"
                >
                  <div className="flex items-center gap-2 truncate">
                    <button
                      onClick={() => toggleTaskCompletion(t.id)}
                      className="w-4 h-4 rounded bg-brand-500 text-white flex items-center justify-center shrink-0"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                    <span className="line-through truncate text-soft dark:text-brand-300/70">{t.title}</span>
                  </div>
                  <span className="text-[10px] text-faint">Concluída</span>
                </div>
              ))}
              {completed.length === 0 && (
                <div className="text-xs text-faint italic py-2">
                  Ainda não concluíste tarefas neste ciclo.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
