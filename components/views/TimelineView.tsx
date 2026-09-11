import React from "react";
import { Calendar, Clock, CheckCircle2, Sparkles, Plus } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const TimelineView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { tasks, projects, setSelectedTaskId, setIsCreateTaskOpen } = useApp();

  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const project = projects.find((p) => p.id === projectId);

  // Generate 14 day horizon starting from 3 days ago
  const days: Date[] = [];
  const today = new Date();
  for (let i = -2; i < 12; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  return (
    <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 overflow-hidden text-xs shadow-xs p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-sm text-ink dark:text-[#EAECE9] font-display">Cronograma / Linha do Tempo</h3>
          <p className="text-[11px] text-soft dark:text-brand-300/80">
            Visualização sequencial das entregas e marcos do projeto
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-soft dark:text-brand-300">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
          <span>Em andamento</span>
          <span className="w-2.5 h-2.5 rounded-full bg-brand-700 ml-2" />
          <span>Concluída</span>
        </div>
      </div>

      {projectTasks.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-700/60 flex items-center justify-center mx-auto text-brand-600 dark:text-brand-300">
            <Clock className="w-5 h-5" />
          </div>
          <div className="max-w-sm mx-auto">
            <h4 className="font-bold text-xs text-ink dark:text-[#EAECE9]">Sem tarefas no cronograma</h4>
            <p className="text-[11px] text-soft dark:text-brand-300/80 mt-0.5">
              Crie tarefas com datas para visualizá-las ao longo do tempo.
            </p>
          </div>
          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Tarefa</span>
          </button>
        </div>
      ) : (
        /* Timeline Gantt Grid */
        <div className="overflow-x-auto border border-line dark:border-brand-800 rounded-xl">
          {/* Day header row */}
          <div className="grid grid-cols-12 min-w-[700px] border-b border-line dark:border-brand-800 bg-paper/60 dark:bg-brand-900/20 font-semibold text-[10px] text-faint text-center py-2">
            {days.slice(0, 12).map((d, idx) => {
              const isToday = d.toDateString() === today.toDateString();
              return (
                <div
                  key={idx}
                  className={`border-r border-line dark:border-brand-800 last:border-r-0 ${
                    isToday ? "bg-brand-100 dark:bg-brand-900/80 text-brand-900 dark:text-brand-100 font-bold" : ""
                  }`}
                >
                  <div>{d.toLocaleDateString("pt-PT", { weekday: "short" })}</div>
                  <div className="text-[11px]">{d.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Task rows */}
          <div className="divide-y divide-line/60 dark:divide-brand-800/60 min-w-[700px]">
            {projectTasks.map((t, idx) => {
              // Pseudo-span calculation based on index for demo rendering
              const startCol = (idx % 7) + 1;
              const span = Math.min(3 + (idx % 3), 12 - startCol);

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTaskId(t.id)}
                  className="grid grid-cols-12 py-2.5 px-2 hover:bg-paper/50 dark:hover:bg-brand-900/30 cursor-pointer items-center relative group"
                >
                  {/* Visual bar across columns */}
                  <div
                    className={`h-7 rounded-lg px-2 flex items-center text-white text-[11px] font-medium shadow-xs transition-transform group-hover:scale-102 truncate ${
                      t.isCompleted ? "bg-brand-700" : "bg-brand-500"
                    }`}
                    style={{
                      gridColumn: `${startCol} / span ${span}`,
                    }}
                  >
                    <span className="truncate">{t.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
