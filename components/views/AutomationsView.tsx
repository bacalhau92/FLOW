import React, { useState } from "react";
import { Zap, Plus, CheckCircle2, Play, ToggleLeft, ToggleRight, ArrowRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  executionsCount: number;
}

export const AutomationsView: React.FC = () => {
  const { addToast } = useApp();

  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: "auto-1",
      name: "Notificar ao Concluir Tarefa",
      trigger: "Quando uma tarefa for movida para a coluna 'CONCLUÍDO'",
      action: "Notificar o responsável e registar no log de auditoria",
      active: true,
      executionsCount: 24,
    },
    {
      id: "auto-2",
      name: "Alerta de Prazo Crítico",
      trigger: "Quando faltarem 24 horas para o prazo limite de uma tarefa",
      action: "Marcar prioridade como 'URGENTE' e enviar aviso na Inbox",
      active: true,
      executionsCount: 11,
    },
    {
      id: "auto-3",
      name: "Atribuição Automática por Equipa",
      trigger: "Quando uma nova tarefa for criada no projeto de Marketing",
      action: "Atribuir automaticamente ao líder do departamento",
      active: false,
      executionsCount: 5,
    },
    {
      id: "auto-4",
      name: "Desbloqueio de Dependências",
      trigger: "Quando todas as subtarefas forem concluídas",
      action: "Avançar status da tarefa para 'EM REVISÃO'",
      active: true,
      executionsCount: 18,
    },
  ]);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
    addToast({
      type: "info",
      title: "Regra Atualizada",
      description: "O estado da automação foi alterado com sucesso.",
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Automações de Trabalho & Gatilhos</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Automatize tarefas repetitivas, transições de status e notificações entre equipas
          </p>
        </div>

        <button
          onClick={() =>
            addToast({
              type: "success",
              title: "Construtor de Automações",
              description: "Nova regra pronta para ser configurada.",
            })
          }
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Automação</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-card dark:bg-brand-950/60 p-5 rounded-2xl border border-line dark:border-brand-800 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-ink dark:text-[#EAECE9] flex items-center gap-2 font-display">
                  <span>{rule.name}</span>
                  {rule.active && (
                    <span className="text-[10px] bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full font-bold border border-brand-200 dark:border-brand-700/60">
                      Ativa
                    </span>
                  )}
                </h3>
                <div className="text-[11px] text-faint mt-0.5">
                  Executada {rule.executionsCount} vezes neste mês
                </div>
              </div>

              <button
                onClick={() => toggleRule(rule.id)}
                className="text-faint hover:text-ink dark:hover:text-white transition-colors"
              >
                {rule.active ? (
                  <ToggleRight className="w-7 h-7 text-brand-500" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-line2 dark:text-brand-800" />
                )}
              </button>
            </div>

            {/* Visual Workflow Steps (Trigger -> Action) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-paper/70 dark:bg-brand-900/30 rounded-xl border border-line/60 dark:border-brand-800/60">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] font-bold text-warn bg-warnbg px-2 py-0.5 rounded uppercase shrink-0 border border-warn/20">
                  Gatilho
                </span>
                <span className="text-ink dark:text-[#EAECE9] font-medium">{rule.trigger}</span>
              </div>

              <ArrowRight className="w-4 h-4 text-faint hidden sm:block shrink-0" />

              <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] font-bold text-brand-800 dark:text-brand-200 bg-brand-100 dark:bg-brand-900 px-2 py-0.5 rounded uppercase shrink-0 border border-brand-200 dark:border-brand-700">
                  Ação
                </span>
                <span className="text-ink dark:text-[#EAECE9] font-medium">{rule.action}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
