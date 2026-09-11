import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  User as UserIcon,
  Plus,
  AlertTriangle,
  ChevronRight,
  MoreVertical,
  Check,
  Sparkles,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Priority } from "../../types";

export const ListView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const {
    tasks,
    columns,
    users,
    updateTask,
    setSelectedTaskId,
    toggleTaskCompletion,
    setIsCreateTaskOpen,
    setIsAIAssistantOpen,
  } = useApp();

  const [sortField, setSortField] = useState<"dueDate" | "priority" | "title">("dueDate");

  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  const priorityOrder: Record<Priority, number> = {
    URGENTE: 4,
    ALTA: 3,
    MÉDIA: 2,
    BAIXA: 1,
  };

  const sortedTasks = [...projectTasks].sort((a, b) => {
    if (sortField === "priority") {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (sortField === "dueDate") {
      return (a.dueDate || "").localeCompare(b.dueDate || "");
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 overflow-hidden text-xs shadow-xs">
      {/* Header action bar */}
      <div className="p-3 border-b border-line dark:border-brand-800 flex flex-wrap items-center justify-between gap-3 bg-paper/50 dark:bg-brand-900/30">
        <span className="font-bold text-xs text-ink dark:text-[#EAECE9] font-display">
          Tarefas do Projeto ({projectTasks.length})
        </span>

        <div className="flex items-center gap-2">
          <span className="text-faint">Ordenar por:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="bg-card dark:bg-brand-900/60 border border-line dark:border-brand-800 rounded-lg px-2 py-1 text-xs text-ink dark:text-[#EAECE9]"
          >
            <option value="dueDate">Prazo</option>
            <option value="priority">Prioridade</option>
            <option value="title">Título</option>
          </select>

          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white px-2.5 py-1 rounded-lg font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {projectTasks.length === 0 ? (
        <div className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-700/60 flex items-center justify-center mx-auto text-brand-600 dark:text-brand-300">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-ink dark:text-[#EAECE9] font-display">
              Nenhuma tarefa listada neste projeto
            </h3>
            <p className="text-xs text-soft dark:text-brand-300/80">
              Adicione itens estruturados com prazos e responsáveis ou deixe que a IA decomponha o escopo para si.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar Primeira Tarefa</span>
            </button>
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-200 border border-brand-200 dark:border-brand-700 hover:bg-brand-100 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Gerar com IA</span>
            </button>
          </div>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-line dark:border-brand-800 bg-paper/60 dark:bg-brand-900/20 text-[11px] font-semibold text-faint uppercase tracking-wider">
                <th className="py-2.5 px-4 w-10"></th>
                <th className="py-2.5 px-4">Título</th>
                <th className="py-2.5 px-4">Coluna / Status</th>
                <th className="py-2.5 px-4">Prioridade</th>
                <th className="py-2.5 px-4">Responsável</th>
                <th className="py-2.5 px-4">Prazo</th>
                <th className="py-2.5 px-4">Subtarefas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60 dark:divide-brand-800/60">
              {sortedTasks.map((t) => {
                const assignee = users.find((u) => u.id === t.assigneeId);
                const col = columns.find((c) => c.id === t.columnId);
                const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && !t.isCompleted;

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-paper/50 dark:hover:bg-brand-900/30 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleTaskCompletion(t.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          t.isCompleted
                            ? "bg-brand-500 border-brand-500 text-white"
                            : "border-line2 dark:border-brand-700 hover:border-brand-500"
                        }`}
                      >
                        {t.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    </td>

                    <td className="py-3 px-4" onClick={() => setSelectedTaskId(t.id)}>
                      <span
                        className={`font-semibold text-ink dark:text-[#EAECE9] group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors ${
                          t.isCompleted ? "line-through text-faint" : ""
                        }`}
                      >
                        {t.title}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={t.columnId}
                        onChange={(e) => updateTask(t.id, { columnId: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-paper dark:bg-brand-900/60 border border-line dark:border-brand-800 rounded px-2 py-0.5 text-xs font-medium text-ink dark:text-[#EAECE9]"
                      >
                        {columns.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md text-[10px] border ${
                          t.priority === "URGENTE"
                            ? "bg-dangerbg text-danger border-danger/30"
                            : t.priority === "ALTA"
                            ? "bg-warnbg text-warn border-warn/30"
                            : t.priority === "MÉDIA"
                            ? "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:border-brand-700"
                            : "bg-paper text-soft border-line dark:bg-brand-900 dark:text-brand-300"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {assignee ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-line dark:ring-brand-700"
                          />
                          <span className="text-soft dark:text-brand-200 font-medium">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-faint italic">Não atribuído</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          isOverdue ? "text-danger font-bold" : "text-soft dark:text-brand-300"
                        }`}
                      >
                        {t.dueDate || "—"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-soft dark:text-brand-300">
                      {t.subtasks.length > 0 ? (
                        <span>
                          {t.subtasks.filter((s) => s.completed).length}/{t.subtasks.length}
                        </span>
                      ) : (
                        <span className="text-faint">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
