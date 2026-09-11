import React, { useState } from "react";
import {
  FolderKanban,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  Sparkles,
  Star,
  Plus,
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { KanbanView } from "./KanbanView";
import { ListView } from "./ListView";
import { TimelineView } from "./TimelineView";

export const ProjectDetailView: React.FC = () => {
  const {
    activeProjectId,
    projects,
    tasks,
    documents,
    teams,
    setCurrentView,
    toggleProjectFavorite,
    setIsCreateTaskOpen,
    setIsAIAssistantOpen,
    setSelectedTaskId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"kanban" | "list" | "timeline" | "docs">("kanban");

  const project = projects.find((p) => p.id === activeProjectId) || projects[0];
  if (!project) {
    return (
      <div className="p-8 text-center text-zinc-400">
        Nenhum projeto selecionado.
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedCount = projectTasks.filter((t) => t.isCompleted).length;
  const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;
  const projectDocs = documents.filter((d) => d.projectId === project.id);
  const team = teams.find((t) => t.id === project.teamId);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 animate-in fade-in duration-150">
      {/* Project Header Card */}
      <div className="bg-card dark:bg-brand-950/60 rounded-3xl p-5 md:p-6 border border-line dark:border-brand-800 shadow-xs space-y-4">
        {/* Top bar with back button, favorites & quick actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCurrentView("dashboard")}
              className="p-1.5 text-faint hover:text-ink dark:hover:text-[#EAECE9] rounded-lg hover:bg-paper dark:hover:bg-brand-900/60 transition-colors"
              title="Voltar ao início"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div
              className="w-3 h-3 rounded-full shrink-0 ring-2 ring-line dark:ring-brand-800"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-lg md:text-xl font-bold text-ink dark:text-[#EAECE9] tracking-tight font-display">
              {project.name}
            </h1>
            <button
              onClick={() => toggleProjectFavorite(project.id)}
              className="p-1 hover:bg-paper dark:hover:bg-brand-900/60 rounded-md transition-colors"
              title={project.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Star
                className={`w-4 h-4 ${
                  project.isFavorite
                    ? "text-gold fill-gold"
                    : "text-faint hover:text-gold"
                }`}
              />
            </button>
          </div>

          {/* Action Buttons: 1 secondary, 1 distinct primary */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-paper dark:bg-brand-900/60 hover:bg-brand-50/50 dark:hover:bg-brand-900 text-soft dark:text-brand-200 hover:text-ink dark:hover:text-[#EAECE9] rounded-xl text-xs font-semibold border border-line dark:border-brand-800 transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Resumo & Riscos IA</span>
            </button>

            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all border border-brand-400/30"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nova Tarefa</span>
            </button>
          </div>
        </div>

        {/* Description & metadata tags */}
        <p className="text-xs text-soft dark:text-brand-300/80 max-w-3xl leading-relaxed">
          {project.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          {team && (
            <div className="flex items-center gap-1.5 text-soft dark:text-brand-300">
              <Users className="w-3.5 h-3.5 text-faint" />
              <span>{team.name}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-soft dark:text-brand-300">
            <Clock className="w-3.5 h-3.5 text-faint" />
            <span>Prazo: {project.targetDate || "Não definido"}</span>
          </div>

          <span
            className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
              project.priority === "ALTA" || project.priority === "URGENTE"
                ? "bg-warnbg text-warn border border-warn/30"
                : "bg-paper text-soft border border-line dark:bg-brand-900 dark:text-brand-300"
            }`}
          >
            Prioridade {project.priority}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-line/60 dark:border-brand-800/60">
          <div className="flex items-center justify-between text-[11px] text-soft dark:text-brand-300">
            <span>Progresso Global do Projeto</span>
            <span className="font-semibold text-ink dark:text-[#EAECE9]">
              {completedCount} de {projectTasks.length} tarefas ({progress}%)
            </span>
          </div>
          <div className="w-full bg-paper dark:bg-brand-900/80 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: project.color }}
            />
          </div>
        </div>
      </div>

      {/* View Switcher Tabs (Kanban, Lista, Cronograma, Documentos) */}
      <div className="flex items-center gap-1 bg-card dark:bg-brand-950/60 p-1 rounded-2xl border border-line dark:border-brand-800 w-fit text-xs font-semibold shadow-2xs">
        <button
          onClick={() => setActiveTab("kanban")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeTab === "kanban"
              ? "bg-brand-500 text-white shadow-xs"
              : "text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white hover:bg-paper dark:hover:bg-brand-900/40"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Quadro (Kanban)</span>
        </button>

        <button
          onClick={() => setActiveTab("list")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeTab === "list"
              ? "bg-brand-500 text-white shadow-xs"
              : "text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white hover:bg-paper dark:hover:bg-brand-900/40"
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Lista</span>
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeTab === "timeline"
              ? "bg-brand-500 text-white shadow-xs"
              : "text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white hover:bg-paper dark:hover:bg-brand-900/40"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Cronograma</span>
        </button>

        <button
          onClick={() => setActiveTab("docs")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeTab === "docs"
              ? "bg-brand-500 text-white shadow-xs"
              : "text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white hover:bg-paper dark:hover:bg-brand-900/40"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Documentos ({projectDocs.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "kanban" && <KanbanView projectId={project.id} />}
        {activeTab === "list" && <ListView projectId={project.id} />}
        {activeTab === "timeline" && <TimelineView projectId={project.id} />}
        {activeTab === "docs" && (
          <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-5 space-y-4">
            <h3 className="font-bold text-sm text-ink dark:text-[#EAECE9] font-display">Documentos e Notas do Projeto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {projectDocs.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setCurrentView("documents")}
                  className="p-4 rounded-xl border border-line dark:border-brand-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-xs transition-all cursor-pointer space-y-2 bg-paper/50 dark:bg-brand-900/30"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span className="font-bold text-xs text-ink dark:text-[#EAECE9] truncate">{d.title}</span>
                  </div>
                  <p className="text-[11px] text-soft dark:text-brand-300/80 line-clamp-2">{d.content}</p>
                  <span className="text-[10px] bg-paper dark:bg-brand-900 text-soft dark:text-brand-300 px-2 py-0.5 rounded font-medium inline-block border border-line dark:border-brand-800">
                    {d.category}
                  </span>
                </div>
              ))}
              {projectDocs.length === 0 && (
                <div className="col-span-full py-8 text-center text-zinc-400 text-xs">
                  Nenhum documento associado a este projeto ainda.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
