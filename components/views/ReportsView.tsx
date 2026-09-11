import React from "react";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  Award,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const ReportsView: React.FC = () => {
  const { tasks, projects, users } = useApp();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.isCompleted
  ).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Workload per user
  const userWorkload = users.map((u) => {
    const userTasks = tasks.filter((t) => t.assigneeId === u.id);
    const userCompleted = userTasks.filter((t) => t.isCompleted).length;
    const rate = userTasks.length > 0 ? Math.round((userCompleted / userTasks.length) * 100) : 0;
    return {
      user: u,
      total: userTasks.length,
      completed: userCompleted,
      rate,
    };
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150 text-xs">
      <div>
        <h1 className="text-xl font-bold text-ink dark:text-[#EAECE9] tracking-tight flex items-center gap-2 font-display">
          <BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>Relatórios de Produtividade & Métricas da Equipa</span>
        </h1>
        <p className="text-xs text-soft dark:text-brand-300/80 mt-0.5">
          Acompanhamento de velocidade, taxa de conclusão e balanço de carga de trabalho
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold text-faint uppercase tracking-wider">
            Taxa de Conclusão
          </span>
          <div className="text-2xl font-bold text-ink dark:text-[#EAECE9] font-display">{completionRate}%</div>
          <div className="text-[11px] text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +8% face ao ciclo anterior
          </div>
        </div>

        <div className="p-4 bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold text-faint uppercase tracking-wider">
            Entregas Concluídas
          </span>
          <div className="text-2xl font-bold text-ink dark:text-[#EAECE9] font-display">{completedTasks}</div>
          <div className="text-[11px] text-soft dark:text-brand-300/80">De {totalTasks} tarefas registadas</div>
        </div>

        <div className="p-4 bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold text-faint uppercase tracking-wider">
            Tarefas em Atraso
          </span>
          <div className="text-2xl font-bold text-danger font-display">{overdueTasks}</div>
          <div className="text-[11px] text-soft dark:text-brand-300/80">Exige acompanhamento</div>
        </div>

        <div className="p-4 bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold text-faint uppercase tracking-wider">
            Índice de Pontualidade
          </span>
          <div className="text-2xl font-bold text-brand-600 dark:text-brand-400 font-display">92%</div>
          <div className="text-[11px] text-soft dark:text-brand-300/80">Meta estipulada: 90%</div>
        </div>
      </div>

      {/* Team Workload Breakdown */}
      <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-5 space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-ink dark:text-[#EAECE9] flex items-center gap-2 font-display">
          <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Distribuição de Trabalho por Colaborador</span>
        </h3>

        <div className="space-y-3">
          {userWorkload.map((uw) => (
            <div key={uw.user.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={uw.user.avatar}
                    alt={uw.user.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="font-semibold text-ink dark:text-[#EAECE9]">{uw.user.name}</span>
                  <span className="text-[10px] text-faint">({uw.user.role})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-soft dark:text-brand-300 font-medium">
                    {uw.completed} de {uw.total} tarefas ({uw.rate}%)
                  </span>
                </div>
              </div>

              <div className="w-full bg-paper dark:bg-brand-900/80 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uw.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Status Summary */}
      <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-5 space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-ink dark:text-[#EAECE9] font-display">Saúde dos Projetos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {projects.map((p) => {
            const pTasks = tasks.filter((t) => t.projectId === p.id);
            const pCompleted = pTasks.filter((t) => t.isCompleted).length;
            const pRate = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0;

            return (
              <div key={p.id} className="p-3.5 rounded-xl border border-line dark:border-brand-800 bg-paper/50 dark:bg-brand-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-ink dark:text-[#EAECE9] truncate">{p.name}</span>
                  <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/60 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-700/60">
                    {pRate}%
                  </span>
                </div>
                <div className="w-full bg-line dark:bg-brand-900/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pRate}%`, backgroundColor: p.color }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-faint">
                  <span>{p.status}</span>
                  <span>{pCompleted}/{pTasks.length} concluídas</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
