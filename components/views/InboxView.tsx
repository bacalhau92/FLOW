import React from "react";
import { Inbox, CheckCircle2, Bell, Check, ArrowRight, Plus } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const InboxView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setSelectedTaskId,
    setCurrentView,
    setIsCreateTaskOpen,
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-[#EAECE9] tracking-tight flex items-center gap-2 font-display">
            <Inbox className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>Caixa de Entrada & Notificações</span>
          </h1>
          <p className="text-xs text-soft dark:text-brand-300/80 mt-0.5">
            Atualizações de tarefas, menções e alertas automáticos do fluxo
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/40 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-200 border border-brand-200 dark:border-brand-700 rounded-xl font-semibold transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Marcar todas como lidas</span>
          </button>
        )}
      </div>

      <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 divide-y divide-line dark:divide-brand-800/80 overflow-hidden shadow-xs">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              markNotificationAsRead(n.id);
              if (n.taskId) setSelectedTaskId(n.taskId);
            }}
            className={`p-4 flex items-start justify-between gap-4 cursor-pointer transition-colors ${
              n.read
                ? "hover:bg-paper/50 dark:hover:bg-white/[0.02]"
                : "bg-brand-50/60 dark:bg-brand-900/30 hover:bg-brand-50/90 dark:hover:bg-brand-900/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                  n.read
                    ? "bg-line2 dark:bg-brand-800"
                    : "bg-brand-500 ring-2 ring-brand-200 dark:ring-brand-700/50"
                }`}
              />
              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-ink dark:text-[#EAECE9]">{n.title}</h4>
                <p className="text-[11px] text-soft dark:text-brand-200/80 leading-relaxed">{n.message}</p>
              </div>
            </div>

            <span className="text-[10px] text-faint shrink-0">{n.createdAt}</span>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-700/60 flex items-center justify-center mx-auto text-brand-600 dark:text-brand-300 shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h3 className="text-sm font-bold text-ink dark:text-[#EAECE9] font-display">
                Tudo limpo por aqui!
              </h3>
              <p className="text-xs text-soft dark:text-brand-300/80 leading-relaxed">
                Está a par de todas as atualizações de tarefas, comentários e menções do workspace.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCurrentView("my-work")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-paper hover:bg-line/60 dark:bg-brand-900/50 dark:hover:bg-brand-800 border border-line dark:border-brand-800 text-ink dark:text-[#EAECE9] transition-all shadow-xs"
              >
                <span>Ver o Meu Trabalho</span>
                <ArrowRight className="w-3.5 h-3.5 text-faint" />
              </button>
              <button
                onClick={() => setIsCreateTaskOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Criar Tarefa</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
