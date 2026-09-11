import React, { useState } from "react";
import { X, CheckCircle2, Calendar, User, Flag, FolderKanban } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Priority } from "../../types";

export const CreateTaskModal: React.FC = () => {
  const {
    isCreateTaskOpen,
    setIsCreateTaskOpen,
    createTask,
    projects,
    activeProjectId,
    columns,
    users,
    currentUser,
  } = useApp();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(activeProjectId || projects[0]?.id || "");
  const [columnId, setColumnId] = useState("col-todo");
  const [priority, setPriority] = useState<Priority>("MÉDIA");
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0]
  );
  const [estimatedHours, setEstimatedHours] = useState(4);

  if (!isCreateTaskOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask({
      title: title.trim(),
      description: description.trim(),
      projectId,
      columnId,
      priority,
      assigneeId,
      dueDate,
      estimatedHours,
      subtasks: [],
    });

    setTitle("");
    setDescription("");
    setIsCreateTaskOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-card dark:bg-brand-950 rounded-2xl shadow-s border border-line dark:border-brand-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line dark:border-brand-800 flex items-center justify-between bg-paper/60 dark:bg-brand-900/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span className="font-bold text-sm text-ink dark:text-[#EAECE9] font-display">Nova Tarefa</span>
          </div>
          <button
            onClick={() => setIsCreateTaskOpen(false)}
            className="p-1 text-faint hover:text-ink dark:hover:text-white rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Título da Tarefa *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="O que precisa de ser feito?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-line dark:border-brand-800 bg-card dark:bg-brand-900/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium text-ink dark:text-[#EAECE9]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Projeto</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-line dark:border-brand-800 rounded-xl bg-card dark:bg-brand-900 text-ink dark:text-[#EAECE9]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Coluna / Status</label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full px-3 py-2 border border-line dark:border-brand-800 rounded-xl bg-card dark:bg-brand-900 text-ink dark:text-[#EAECE9]"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 border border-line dark:border-brand-800 rounded-xl bg-card dark:bg-brand-900 text-ink dark:text-[#EAECE9]"
              >
                <option value="BAIXA">BAIXA</option>
                <option value="MÉDIA">MÉDIA</option>
                <option value="ALTA">ALTA</option>
                <option value="URGENTE">URGENTE</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Responsável</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 border border-line dark:border-brand-800 rounded-xl bg-card dark:bg-brand-900 text-ink dark:text-[#EAECE9]"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Prazo Limite</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-line dark:border-brand-800 bg-card dark:bg-brand-900 rounded-xl text-ink dark:text-[#EAECE9]"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Estimativa (Horas)</label>
              <input
                type="number"
                min="1"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-line dark:border-brand-800 bg-card dark:bg-brand-900 rounded-xl text-ink dark:text-[#EAECE9]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Descrição</label>
            <textarea
              rows={3}
              placeholder="Instruções ou notas adicionais..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-line dark:border-brand-800 bg-card dark:bg-brand-900/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink dark:text-[#EAECE9]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateTaskOpen(false)}
              className="px-4 py-2 text-xs font-medium text-soft dark:text-brand-300 hover:bg-paper dark:hover:bg-brand-900 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all shadow-xs"
            >
              Criar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
