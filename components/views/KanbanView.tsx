import React, { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Paperclip,
  CheckSquare,
  Search,
  Filter,
  User,
  Sparkles,
  ArrowRightLeft,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Priority, Task } from "../../types";

export const KanbanView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const {
    tasks,
    columns,
    moveTask,
    createTask,
    setSelectedTaskId,
    users,
    currentUser,
    setIsCreateTaskOpen,
    setIsAIAssistantOpen,
    addToast,
  } = useApp();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [quickTitleByCol, setQuickTitleByCol] = useState<Record<string, string>>({});
  const [activeNewTaskCol, setActiveNewTaskCol] = useState<string | null>(null);
  const [openMoveMenuTaskId, setOpenMoveMenuTaskId] = useState<string | null>(null);

  // Filters with Progressive Disclosure
  const [filterSearch, setFilterSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [filterAssignee, setFilterAssignee] = useState<string>("ALL");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const activeFiltersCount =
    (filterPriority !== "ALL" ? 1 : 0) +
    (filterAssignee !== "ALL" ? 1 : 0) +
    (filterSearch.trim() ? 1 : 0);

  const clearAllFilters = () => {
    setFilterSearch("");
    setFilterPriority("ALL");
    setFilterAssignee("ALL");
  };

  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  // Apply filters
  const filteredTasks = projectTasks.filter((t) => {
    if (filterSearch && !t.title.toLowerCase().includes(filterSearch.toLowerCase())) {
      return false;
    }
    if (filterPriority !== "ALL" && t.priority !== filterPriority) {
      return false;
    }
    if (filterAssignee !== "ALL" && t.assigneeId !== filterAssignee) {
      return false;
    }
    return true;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverColId(colId);
  };

  const handleDragLeave = (colId: string) => {
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (taskId) {
      moveTask(taskId, colId);
    }
    setDraggedTaskId(null);
    setDragOverColId(null);
  };

  const handleQuickMove = (taskId: string, targetColId: string, targetColTitle: string) => {
    moveTask(taskId, targetColId);
    setOpenMoveMenuTaskId(null);
    addToast({
      type: "success",
      title: "Tarefa Movida",
      description: `Etapa atualizada para "${targetColTitle}".`,
    });
  };

  const handleQuickAddTask = (colId: string) => {
    const title = quickTitleByCol[colId]?.trim();
    if (!title) return;

    createTask({
      title,
      projectId,
      columnId: colId,
      priority: "MÉDIA",
      assigneeId: currentUser.id,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      subtasks: [],
    });

    setQuickTitleByCol((prev) => ({ ...prev, [colId]: "" }));
    setActiveNewTaskCol(null);
  };

  const priorityBadge: Record<Priority, { label: string; style: string }> = {
    BAIXA: { label: "Baixa", style: "bg-paper text-soft border-line dark:bg-brand-900/60 dark:text-brand-300 dark:border-brand-800" },
    MÉDIA: { label: "Média", style: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:border-brand-700" },
    ALTA: { label: "Alta", style: "bg-warnbg text-warn border-warn/30" },
    URGENTE: { label: "Urgente", style: "bg-dangerbg text-danger border-danger/30" },
  };

  return (
    <div className="space-y-4">
      {/* Search & Progressive Disclosure Filters Bar */}
      <div className="bg-card dark:bg-brand-950/60 p-3 rounded-2xl border border-line dark:border-brand-800 text-xs shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Always accessible instant search input */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-faint absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar tarefas por título..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 bg-paper dark:bg-brand-900/50 border border-line dark:border-brand-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs text-ink dark:text-[#EAECE9] placeholder:text-faint"
              />
              {filterSearch && (
                <button
                  onClick={() => setFilterSearch("")}
                  className="absolute right-2.5 top-2.5 text-faint hover:text-ink dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Progressive Disclosure Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                isFiltersExpanded || activeFiltersCount > 0
                  ? "bg-brand-50 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-700 shadow-2xs"
                  : "bg-paper dark:bg-brand-900/40 text-soft dark:text-brand-300 border-line dark:border-brand-800 hover:text-ink dark:hover:text-white"
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 text-faint transition-transform duration-200 ${
                  isFiltersExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-2.5 py-1.5 text-xs text-faint hover:text-ink dark:hover:text-white hover:bg-paper dark:hover:bg-brand-900/60 rounded-xl transition-colors"
                title="Limpar todos os filtros"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Secondary Filters (Progressive Disclosure) */}
        {isFiltersExpanded && (
          <div className="pt-2.5 border-t border-line/60 dark:border-brand-800/60 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-1.5">
              <span className="text-faint text-[11px] font-medium">Prioridade:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-paper dark:bg-brand-900/50 border border-line dark:border-brand-800 rounded-xl px-2.5 py-1 text-xs text-ink dark:text-[#EAECE9] focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="ALL">Todas as prioridades</option>
                <option value="URGENTE">Urgente</option>
                <option value="ALTA">Alta</option>
                <option value="MÉDIA">Média</option>
                <option value="BAIXA">Baixa</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-faint text-[11px] font-medium">Responsável:</span>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="bg-paper dark:bg-brand-900/50 border border-line dark:border-brand-800 rounded-xl px-2.5 py-1 text-xs text-ink dark:text-[#EAECE9] focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="ALL">Todos os responsáveis</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {projectTasks.length === 0 && (
        <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-700/60 flex items-center justify-center mx-auto text-brand-600 dark:text-brand-300">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-ink dark:text-[#EAECE9] font-display">
              Quadro Kanban vazio
            </h3>
            <p className="text-xs text-soft dark:text-brand-300/80">
              Este projeto ainda não tem tarefas cadastradas. Comece criando os primeiros cartões ou gere um plano completo com a IA.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Primeira Tarefa</span>
            </button>
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-200 border border-brand-200 dark:border-brand-700 hover:bg-brand-100 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Gerar Tarefas com IA</span>
            </button>
          </div>
        </div>
      )}

      {projectTasks.length > 0 && filteredTasks.length === 0 && (
        <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-paper dark:bg-brand-900/40 border border-line dark:border-brand-800 flex items-center justify-center mx-auto text-faint">
            <Search className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-ink dark:text-[#EAECE9] font-display">
              Nenhuma tarefa encontrada
            </h3>
            <p className="text-xs text-soft dark:text-brand-300/80">
              Nenhum item corresponde aos critérios de pesquisa ou filtros selecionados.
            </p>
          </div>
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={() => {
                setFilterSearch("");
                setFilterPriority("ALL");
                setFilterAssignee("ALL");
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-200 border border-brand-200 dark:border-brand-700 hover:bg-brand-100 transition-all shadow-xs"
            >
              Limpar Filtros de Pesquisa
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 select-none min-h-[560px] items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.columnId === col.id);
          const isOver = dragOverColId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => handleDragLeave(col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-72 shrink-0 bg-paper/70 dark:bg-brand-950/40 rounded-2xl p-3 border transition-colors flex flex-col max-h-[75vh] ${
                isOver
                  ? "border-brand-400 bg-brand-50/40 dark:bg-brand-900/50 ring-2 ring-brand-200 dark:ring-brand-700/60"
                  : "border-line dark:border-brand-800/80"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-line/60 dark:border-brand-800/60">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-ink dark:text-[#EAECE9] tracking-tight font-display">
                    {col.title}
                  </span>
                  <span className="text-[10px] font-bold bg-card dark:bg-brand-900 text-soft dark:text-brand-200 px-2 py-0.5 rounded-full border border-line dark:border-brand-800 shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => setActiveNewTaskCol(col.id)}
                  className="p-1 hover:bg-card dark:hover:bg-brand-900 text-faint hover:text-ink dark:hover:text-[#EAECE9] rounded-lg transition-colors"
                  title="Adicionar tarefa rápida"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks Cards List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                {colTasks.map((task) => {
                  const assignee = users.find((u) => u.id === task.assigneeId);
                  const isOverdue =
                    task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;
                  const totalSub = task.subtasks.length;
                  const compSub = task.subtasks.filter((s) => s.completed).length;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="bg-card dark:bg-brand-900/50 rounded-xl p-3.5 border border-line dark:border-brand-800 shadow-xs hover:shadow-s hover:border-brand-300 dark:hover:border-brand-700 transition-all cursor-grab active:cursor-grabbing space-y-2.5 group"
                    >
                      {/* Top labels, priority & Touch/Mobile Quick Move */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex flex-wrap items-center gap-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              priorityBadge[task.priority].style
                            }`}
                          >
                            {priorityBadge[task.priority].label}
                          </span>
                          {task.labels.slice(0, 1).map((lbl, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-paper dark:bg-brand-900 text-soft dark:text-brand-300 px-1.5 py-0.5 rounded border border-line/60 dark:border-brand-800"
                            >
                              {lbl}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1">
                          {isOverdue && (
                            <span className="flex items-center gap-1 text-[10px] text-danger font-bold bg-dangerbg px-1.5 py-0.5 rounded border border-danger/20">
                              <AlertTriangle className="w-3 h-3" />
                              Atrasada
                            </span>
                          )}

                          {/* Quick Move Action (Accessible on Touch / Mobile) */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMoveMenuTaskId(openMoveMenuTaskId === task.id ? null : task.id);
                              }}
                              className="p-1 rounded-md text-faint hover:text-ink dark:hover:text-[#EAECE9] hover:bg-paper dark:hover:bg-brand-800 transition-colors"
                              title="Mover tarefa para outra etapa"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                            </button>

                            {openMoveMenuTaskId === task.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-6 z-20 w-44 bg-card dark:bg-brand-950 rounded-xl shadow-s border border-line dark:border-brand-800 p-1.5 space-y-1 animate-in fade-in duration-100"
                              >
                                <div className="px-2 py-1 text-[10px] font-bold text-faint uppercase tracking-wider">
                                  Mover para:
                                </div>
                                {columns.map((c) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => handleQuickMove(task.id, c.id, c.title)}
                                    className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-left text-xs transition-colors ${
                                      task.columnId === c.id
                                        ? "bg-brand-50 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-semibold"
                                        : "text-soft dark:text-brand-200 hover:bg-paper dark:hover:bg-brand-900/40 hover:text-ink dark:hover:text-white"
                                    }`}
                                  >
                                    <span className="truncate">{c.title}</span>
                                    {task.columnId === c.id && <Check className="w-3 h-3 shrink-0" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-xs text-ink dark:text-[#EAECE9] leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                        {task.title}
                      </h4>

                      {/* Subtask or description hint */}
                      {totalSub > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-soft dark:text-brand-300/80">
                          <CheckSquare className="w-3.5 h-3.5 text-faint" />
                          <span>
                            {compSub}/{totalSub} subtarefas
                          </span>
                        </div>
                      )}

                      {/* Card Footer: Due date & Assignee avatar */}
                      <div className="flex items-center justify-between pt-2 border-t border-line/60 dark:border-brand-800/60 text-[11px] text-faint">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className={isOverdue ? "text-danger font-bold" : ""}>
                            {task.dueDate || "Sem prazo"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {task.commentsCount > 0 && (
                            <span className="flex items-center gap-0.5 text-faint">
                              <MessageSquare className="w-3 h-3" />
                              <span className="text-[10px]">{task.commentsCount}</span>
                            </span>
                          )}

                          {assignee && (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              title={assignee.name}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-line dark:ring-brand-700"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty column placeholder if no tasks in this column */}
                {colTasks.length === 0 && !activeNewTaskCol && (
                  <div className="py-8 px-2 text-center text-[11px] text-faint border border-dashed border-line dark:border-brand-800/80 rounded-xl my-1">
                    Sem tarefas nesta etapa
                  </div>
                )}

                {/* Quick Add Form in Column */}
                {activeNewTaskCol === col.id ? (
                  <div className="p-2.5 bg-card dark:bg-brand-900 rounded-xl border border-brand-200 dark:border-brand-700 shadow-xs space-y-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Nome da tarefa..."
                      value={quickTitleByCol[col.id] || ""}
                      onChange={(e) =>
                        setQuickTitleByCol({ ...quickTitleByCol, [col.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleQuickAddTask(col.id);
                        if (e.key === "Escape") setActiveNewTaskCol(null);
                      }}
                      className="w-full text-xs px-2 py-1.5 border border-line dark:border-brand-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 bg-paper dark:bg-brand-950 text-ink dark:text-[#EAECE9]"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleQuickAddTask(col.id)}
                        className="flex-1 bg-brand-500 text-white text-xs py-1 rounded-lg font-semibold hover:bg-brand-600 transition-colors"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => setActiveNewTaskCol(null)}
                        className="text-xs bg-paper dark:bg-brand-800 text-soft dark:text-brand-200 px-2 py-1 rounded-lg hover:bg-line/40 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveNewTaskCol(col.id)}
                    className="w-full py-2 flex items-center justify-center gap-1.5 text-xs text-soft dark:text-brand-300 hover:text-ink dark:hover:text-white hover:bg-card/80 dark:hover:bg-brand-900/60 rounded-xl border border-dashed border-line dark:border-brand-800 transition-colors font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar tarefa</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
