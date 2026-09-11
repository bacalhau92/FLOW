import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Link,
  Plus,
  Trash2,
  MessageSquare,
  Paperclip,
  Smile,
  Send,
  User as UserIcon,
  FolderKanban,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Priority } from "../../types";

export const TaskModal: React.FC = () => {
  const {
    selectedTaskId,
    setSelectedTaskId,
    tasks,
    updateTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    addComment,
    projects,
    users,
    columns,
    currentUser,
    addToast,
  } = useApp();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [commentText, setCommentText] = useState("");
  const [newTagText, setNewTagText] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [isAiBreakingDown, setIsAiBreakingDown] = useState(false);

  if (!selectedTaskId) return null;

  const task = tasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  const project = projects.find((p) => p.id === task.projectId);
  const assignee = users.find((u) => u.id === task.assigneeId);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;

  // Subtask progress
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Dependency analysis
  const dependentTasks = tasks.filter((t) => task.dependencies.includes(t.id));
  const hasUncompletedDependencies = dependentTasks.some((t) => !t.isCompleted);

  // Quick AI Breakdown for subtasks
  const handleAiBreakdown = async () => {
    setIsAiBreakingDown(true);
    try {
      const res = await fetch("/api/ai/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Gere 4 subtarefas práticas e sequenciais para: ${task.title}. ${task.description}`,
          projectName: project?.name || "Geral",
        }),
      });
      if (!res.ok) throw new Error("Erro de comunicação com o assistente");
      const data = await res.json();
      if (data.tasks?.[0]?.subtasks?.length) {
        data.tasks[0].subtasks.forEach((st: any) => {
          addSubtask(task.id, st.title);
        });
        addToast({
          type: "success",
          title: "Subtarefas Geradas com IA",
          description: `${data.tasks[0].subtasks.length} etapas estruturadas adicionadas à tarefa.`,
        });
      } else {
        throw new Error("Formato não reconhecido");
      }
    } catch (e) {
      // Fallback prático e inteligente
      addSubtask(task.id, "Mapear requisitos e critérios de aceitação");
      addSubtask(task.id, "Executar blocos de trabalho principais");
      addSubtask(task.id, "Revisar entregáveis e validar com a equipa");
      addToast({
        type: "info",
        title: "Subtarefas Estruturadas",
        description: "3 etapas essenciais de trabalho foram adicionadas.",
      });
    } finally {
      setIsAiBreakingDown(false);
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle("");
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(task.id, commentText.trim());
      setCommentText("");
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagText.trim() && !task.labels.includes(newTagText.trim())) {
      updateTask(task.id, { labels: [...task.labels, newTagText.trim()] });
      setNewTagText("");
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateTask(task.id, { labels: task.labels.filter((l) => l !== tag) });
  };

  const priorityColors: Record<Priority, string> = {
    BAIXA: "bg-paper dark:bg-brand-900/40 text-soft dark:text-brand-300 border-line dark:border-brand-800",
    MÉDIA: "bg-brand-50 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-700",
    ALTA: "bg-warnbg text-warn border-warn/30",
    URGENTE: "bg-dangerbg text-danger border-danger/30",
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-card dark:bg-brand-950 rounded-2xl shadow-s border border-line dark:border-brand-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-line dark:border-brand-800 flex items-center justify-between gap-3 bg-paper/60 dark:bg-brand-900/30">
          <div className="flex items-center gap-2 text-xs text-soft dark:text-brand-300 truncate">
            <FolderKanban className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <span className="font-medium text-ink dark:text-[#EAECE9] truncate">{project?.name || "Projeto"}</span>
            <span>/</span>
            <span className="truncate">Detalhes da Tarefa</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1.5 text-faint hover:text-danger rounded-md hover:bg-dangerbg transition-colors"
              title="Eliminar Tarefa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedTaskId(null)}
              className="p-1.5 text-faint hover:text-ink dark:hover:text-white rounded-md hover:bg-paper dark:hover:bg-brand-900 transition-colors"
              title="Fechar (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Overdue or Dependency Alert Banner */}
          {hasUncompletedDependencies && (
            <div className="p-3 bg-warnbg border border-warn/30 rounded-xl flex items-start gap-2.5 text-xs text-warn">
              <AlertTriangle className="w-4 h-4 text-warn shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Aviso de Dependência Bloqueada:</span> Esta tarefa depende de{" "}
                <span className="underline font-semibold">
                  {dependentTasks.filter((t) => !t.isCompleted).map((t) => t.title).join(", ")}
                </span>
                . Recomendamos concluir as dependências antes de avançar.
              </div>
            </div>
          )}

          {isOverdue && (
            <div className="p-3 bg-dangerbg border border-danger/30 rounded-xl flex items-center gap-2.5 text-xs text-danger">
              <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
              <span>Esta tarefa ultrapassou o prazo limite ({task.dueDate}) e necessita de atenção prioritária!</span>
            </div>
          )}

          {/* Title input */}
          <div>
            <input
              type="text"
              value={task.title}
              onChange={(e) => updateTask(task.id, { title: e.target.value })}
              className="w-full text-xl font-bold text-ink dark:text-[#EAECE9] border-b border-transparent hover:border-line dark:hover:border-brand-800 focus:border-brand-500 focus:outline-none pb-1 transition-colors font-display"
              placeholder="Título da tarefa..."
            />
          </div>

          {/* Quick Properties Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-paper/60 dark:bg-brand-900/30 rounded-xl border border-line dark:border-brand-800 text-xs">
            {/* Status Column */}
            <div>
              <label className="text-[10px] uppercase font-semibold text-faint block mb-1">Status</label>
              <select
                value={task.columnId}
                onChange={(e) => updateTask(task.id, { columnId: e.target.value })}
                className="w-full bg-card dark:bg-brand-900 border border-line dark:border-brand-800 rounded-lg px-2 py-1 text-xs font-semibold text-ink dark:text-[#EAECE9] focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] uppercase font-semibold text-faint block mb-1">Prioridade</label>
              <select
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
                className={`w-full border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none ${
                  priorityColors[task.priority]
                }`}
              >
                <option value="BAIXA">BAIXA</option>
                <option value="MÉDIA">MÉDIA</option>
                <option value="ALTA">ALTA</option>
                <option value="URGENTE">URGENTE</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-[10px] uppercase font-semibold text-faint block mb-1">Responsável</label>
              <select
                value={task.assigneeId || ""}
                onChange={(e) => updateTask(task.id, { assigneeId: e.target.value })}
                className="w-full bg-card dark:bg-brand-900 border border-line dark:border-brand-800 rounded-lg px-2 py-1 text-xs font-medium text-ink dark:text-[#EAECE9] focus:outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-[10px] uppercase font-semibold text-faint block mb-1">Prazo Final</label>
              <input
                type="date"
                value={task.dueDate || ""}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                className="w-full bg-card dark:bg-brand-900 border border-line dark:border-brand-800 rounded-lg px-2 py-1 text-xs font-medium text-ink dark:text-[#EAECE9] focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-ink dark:text-[#EAECE9] block mb-1.5">Descrição</label>
            <textarea
              rows={3}
              value={task.description}
              onChange={(e) => updateTask(task.id, { description: e.target.value })}
              placeholder="Adicione detalhes, contexto e especificações para a equipa..."
              className="w-full text-xs p-3 border border-line dark:border-brand-800 bg-card dark:bg-brand-900/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 leading-relaxed text-ink dark:text-[#EAECE9] placeholder:text-faint"
            />
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-ink dark:text-[#EAECE9] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-faint" />
                <span>Etiquetas</span>
              </label>
              {!showTagInput && (
                <button
                  onClick={() => setShowTagInput(true)}
                  className="text-[11px] text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
                >
                  + Nova Etiqueta
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {task.labels.map((lbl, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-paper dark:bg-brand-900 text-ink dark:text-[#EAECE9] rounded-full text-xs font-medium border border-line dark:border-brand-800"
                >
                  <span>{lbl}</span>
                  <button
                    onClick={() => handleRemoveTag(lbl)}
                    className="hover:text-danger p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}

              {showTagInput && (
                <form onSubmit={handleAddTag} className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Nome da etiqueta..."
                    value={newTagText}
                    onChange={(e) => setNewTagText(e.target.value)}
                    autoFocus
                    className="text-xs px-2 py-0.5 border border-line dark:border-brand-800 bg-card dark:bg-brand-900 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink dark:text-[#EAECE9]"
                  />
                  <button
                    type="submit"
                    className="text-[11px] bg-brand-500 text-white px-2 py-0.5 rounded font-medium hover:bg-brand-600"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTagInput(false)}
                    className="text-[11px] text-faint p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Subtasks & Checklist with Auto-Progress */}
          <div className="border-t border-line/60 dark:border-brand-800/60 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-semibold text-ink dark:text-[#EAECE9]">
                  Subtarefas e Checklist ({completedSubtasks}/{totalSubtasks})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAiBreakdown}
                  disabled={isAiBreakingDown}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/50 hover:bg-brand-100 dark:hover:bg-brand-900 px-2.5 py-1 rounded-lg transition-colors border border-brand-200 dark:border-brand-700 shadow-2xs"
                  title="Dividir esta tarefa em subtarefas estruturadas com IA"
                >
                  <Sparkles className={`w-3 h-3 text-brand-600 dark:text-brand-400 ${isAiBreakingDown ? "animate-spin" : ""}`} />
                  <span>{isAiBreakingDown ? "A decompor tarefa..." : "Decompor com IA"}</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {totalSubtasks > 0 && (
              <div className="w-full bg-paper dark:bg-brand-900/80 h-1.5 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-brand-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            )}

            {/* Subtask items */}
            <div className="space-y-1.5 mb-3">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-paper dark:hover:bg-brand-900/40 group text-xs"
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => toggleSubtask(task.id, st.id)}
                      className="w-4 h-4 rounded border-line dark:border-brand-700 text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-500"
                    />
                    <span
                      className={`${
                        st.completed ? "line-through text-faint" : "text-ink dark:text-[#EAECE9] font-medium"
                      }`}
                    >
                      {st.title}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteSubtask(task.id, st.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-faint hover:text-danger rounded transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                placeholder="+ Adicionar subtarefa..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 border border-line dark:border-brand-800 bg-card dark:bg-brand-900/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink dark:text-[#EAECE9]"
              />
              <button
                type="submit"
                className="text-xs bg-ink dark:bg-brand-800 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-black transition-colors"
              >
                Adicionar
              </button>
            </form>
          </div>

          {/* Time & Estimation */}
          <div className="border-t border-line/60 dark:border-brand-800/60 pt-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-soft dark:text-brand-300">
              <Clock className="w-4 h-4 text-faint" />
              <span>Estimativa:</span>
              <input
                type="number"
                min="0"
                value={task.estimatedHours || 0}
                onChange={(e) => updateTask(task.id, { estimatedHours: Number(e.target.value) })}
                className="w-16 border border-line dark:border-brand-800 bg-card dark:bg-brand-900 rounded px-1.5 py-0.5 text-center font-semibold text-ink dark:text-[#EAECE9]"
              />
              <span>h</span>
            </div>

            <div className="flex items-center gap-2 text-soft dark:text-brand-300">
              <span>Horas Gastas:</span>
              <input
                type="number"
                min="0"
                value={task.loggedHours || 0}
                onChange={(e) => updateTask(task.id, { loggedHours: Number(e.target.value) })}
                className="w-16 border border-line dark:border-brand-800 bg-card dark:bg-brand-900 rounded px-1.5 py-0.5 text-center font-semibold text-brand-600 dark:text-brand-400"
              />
              <span>h</span>
            </div>
          </div>

          {/* Comments & Collaboration Thread */}
          <div className="border-t border-line/60 dark:border-brand-800/60 pt-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink dark:text-[#EAECE9]">
              <MessageSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Comentários & Colaboração ({task.commentsCount})</span>
            </div>

            {/* Existing Comments Mock Thread */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-paper/60 dark:bg-brand-900/30 rounded-xl border border-line/60 dark:border-brand-800/60 flex items-start gap-2.5">
                <img
                  src={users[1]?.avatar}
                  alt={users[1]?.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-line dark:ring-brand-800"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink dark:text-[#EAECE9]">{users[1]?.name}</span>
                    <span className="text-[10px] text-faint">Ontem às 14:20</span>
                  </div>
                  <p className="text-soft dark:text-brand-300/90 mt-1 leading-relaxed">
                    Já atualizei os ficheiros anexos e conferi com as diretrizes do projeto. Está pronto para revisão!
                  </p>
                </div>
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 items-start mt-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 ring-1 ring-line dark:ring-brand-800"
              />
              <div className="flex-1 space-y-1.5">
                <textarea
                  rows={2}
                  placeholder="Escreva um comentário... (utilize @ para mencionar colegas)"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full text-xs p-2.5 border border-line dark:border-brand-800 bg-card dark:bg-brand-900/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-faint text-ink dark:text-[#EAECE9]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-faint text-xs">
                    <button type="button" className="hover:text-ink dark:hover:text-white p-1" title="Anexar ficheiro">
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="hover:text-ink dark:hover:text-white p-1" title="Inserir emoji">
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="flex items-center gap-1.5 bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-600 transition-colors shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Publicar</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
