import React, { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  BrainCircuit,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  summarizeProjectWithAI,
  generateTasksWithAI,
  AISummaryResult,
} from "../../services/aiService";

export const AIAssistantModal: React.FC = () => {
  const {
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    projects,
    activeProjectId,
    tasks,
    currentUser,
    setIsCreateProjectOpen,
    setSelectedTaskId,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"daily" | "summary" | "risks" | "tasks">("daily");
  const [selectedProjId, setSelectedProjId] = useState(activeProjectId || projects[0]?.id || "");
  const [summaryData, setSummaryData] = useState<AISummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [taskPrompt, setTaskPrompt] = useState("");

  if (!isAIAssistantOpen) return null;

  const currentProject = projects.find((p) => p.id === selectedProjId) || projects[0];
  const projectTasks = tasks.filter((t) => t.projectId === currentProject?.id);

  // Daily Briefing calculations
  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id);
  const overdueTasks = myTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.isCompleted);
  const highPriorityTasks = myTasks.filter((t) => (t.priority === "URGENTE" || t.priority === "ALTA") && !t.isCompleted);
  const todayTasks = myTasks.filter((t) => !t.isCompleted).slice(0, 4);

  // Trigger project summary with AI
  const handleSummarizeProject = async () => {
    if (!currentProject) return;
    setIsLoading(true);
    try {
      const summary = await summarizeProjectWithAI(currentProject, projectTasks);
      setSummaryData(summary);
    } catch (e: any) {
      addToast({
        type: "error",
        title: "Erro ao sintetizar",
        description: e.message || "Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-card dark:bg-brand-950 rounded-2xl shadow-s border border-line dark:border-brand-800 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line dark:border-brand-800 flex items-center justify-between bg-paper/60 dark:bg-brand-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-ink dark:text-[#EAECE9] flex items-center gap-2 font-display">
                <span>Assistente Inteligente FLOW</span>
                <span className="text-[10px] bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-300 px-1.5 py-0.5 rounded-full font-bold">
                  Gemini 3.8 Flash
                </span>
              </div>
              <div className="text-[11px] text-soft dark:text-brand-300">
                Copiloto de planeamento, gestão de riscos e produtividade da equipa
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsAIAssistantOpen(false)}
            className="p-1.5 text-faint hover:text-ink dark:hover:text-white rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 border-b border-line dark:border-brand-800 flex gap-2 overflow-x-auto bg-paper/40 dark:bg-brand-900/20 text-xs">
          <button
            onClick={() => setActiveTab("daily")}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === "daily"
                ? "border-brand-500 text-brand-700 dark:text-brand-300"
                : "border-transparent text-soft dark:text-brand-400 hover:text-ink dark:hover:text-white"
            }`}
          >
            Meu Dia & Recomendações
          </button>

          <button
            onClick={() => {
              setActiveTab("summary");
              if (!summaryData) handleSummarizeProject();
            }}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === "summary"
                ? "border-brand-500 text-brand-700 dark:text-brand-300"
                : "border-transparent text-soft dark:text-brand-400 hover:text-ink dark:hover:text-white"
            }`}
          >
            Resumo Executivo
          </button>

          <button
            onClick={() => {
              setActiveTab("risks");
              if (!summaryData) handleSummarizeProject();
            }}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === "risks"
                ? "border-brand-500 text-brand-700 dark:text-brand-300"
                : "border-transparent text-soft dark:text-brand-400 hover:text-ink dark:hover:text-white"
            }`}
          >
            Análise de Riscos & Gargalos
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto text-xs space-y-4">
          {/* TAB 1: DAILY BRIEFING */}
          {activeTab === "daily" && (
            <div className="space-y-4">
              <div className="p-4 bg-brand-50/60 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 rounded-2xl">
                <h3 className="font-bold text-sm text-ink dark:text-[#EAECE9] mb-1 font-display">
                  Bom dia, {currentUser.name}!
                </h3>
                <p className="text-soft dark:text-brand-300 leading-relaxed">
                  A IA analisou as tuas atribuições e prazos. Tens{" "}
                  <strong className="text-ink dark:text-[#EAECE9]">{todayTasks.length} tarefas prioritárias</strong> agendadas
                  {overdueTasks.length > 0 ? (
                    <>
                      {" "}
                      e{" "}
                      <span className="text-danger font-bold">
                        {overdueTasks.length} tarefa atrasada
                      </span>{" "}
                      que exige ação imediata.
                    </>
                  ) : (
                    " e os teus prazos estão todos em dia."
                  )}
                </p>
              </div>

              {/* Overdue alert if any */}
              {overdueTasks.length > 0 && (
                <div className="p-3 bg-dangerbg border border-danger/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-danger font-bold">
                    <AlertTriangle className="w-4 h-4 text-danger" />
                    <span>Atenção: Tarefas Expiradas</span>
                  </div>
                  <div className="space-y-1">
                    {overdueTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTaskId(t.id);
                          setIsAIAssistantOpen(false);
                        }}
                        className="flex items-center justify-between p-2 bg-card dark:bg-brand-900 rounded-lg border border-danger/20 cursor-pointer hover:bg-dangerbg/50"
                      >
                        <span className="font-medium text-ink dark:text-[#EAECE9] truncate">{t.title}</span>
                        <span className="text-[10px] text-danger font-bold">{t.dueDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Focus for Today */}
              <div>
                <span className="text-[11px] font-semibold text-faint uppercase tracking-wider block mb-2">
                  Foco Recomendado pela IA
                </span>
                <div className="space-y-1.5">
                  {todayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTaskId(t.id);
                        setIsAIAssistantOpen(false);
                      }}
                      className="p-2.5 bg-card dark:bg-brand-900 border border-line dark:border-brand-800 rounded-xl hover:border-brand-400 hover:shadow-xs cursor-pointer transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                        <span className="font-medium text-ink dark:text-[#EAECE9] truncate">{t.title}</span>
                      </div>
                      <span className="text-[10px] bg-paper dark:bg-brand-800 text-soft dark:text-brand-200 px-2 py-0.5 rounded font-medium shrink-0">
                        {t.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setIsAIAssistantOpen(false);
                    setIsCreateProjectOpen(true);
                  }}
                  className="flex-1 p-2.5 bg-paper dark:bg-brand-900 hover:bg-brand-50/50 dark:hover:bg-brand-800 text-ink dark:text-[#EAECE9] font-medium rounded-xl border border-line dark:border-brand-800 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Criar Novo Projeto com IA</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECT SUMMARY */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              {/* Project selector */}
              <div className="flex items-center justify-between gap-3 p-2.5 bg-paper/60 dark:bg-brand-900/30 rounded-xl border border-line dark:border-brand-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span className="font-semibold text-ink dark:text-[#EAECE9]">Projeto Selecionado:</span>
                </div>
                <select
                  value={selectedProjId}
                  onChange={(e) => {
                    setSelectedProjId(e.target.value);
                    setSummaryData(null);
                  }}
                  className="bg-card dark:bg-brand-900 border border-line dark:border-brand-800 rounded-lg px-2.5 py-1 font-medium text-ink dark:text-[#EAECE9]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {isLoading ? (
                <div className="py-12 text-center space-y-2 text-faint">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500" />
                  <p>A FLOW IA está a analisar o histórico e as tarefas do projeto...</p>
                </div>
              ) : summaryData ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-brand-50/70 dark:bg-brand-900/40 border border-brand-100 dark:border-brand-800 rounded-2xl">
                    <h4 className="font-bold text-xs text-brand-900 dark:text-brand-200 uppercase tracking-wider mb-1 font-display">
                      Visão Geral Executiva
                    </h4>
                    <p className="text-soft dark:text-brand-300/90 leading-relaxed text-xs">
                      {summaryData.executiveSummary}
                    </p>
                  </div>

                  {/* Accomplishments */}
                  <div>
                    <span className="text-[11px] font-semibold text-faint uppercase tracking-wider block mb-1.5">
                      Conquistas & Entregas Chave
                    </span>
                    <ul className="space-y-1.5">
                      {summaryData.keyAccomplishments.map((acc, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-ink dark:text-[#EAECE9]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                          <span>{acc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Next steps */}
                  <div>
                    <span className="text-[11px] font-semibold text-faint uppercase tracking-wider block mb-1.5">
                      Próximos Passos Recomendados
                    </span>
                    <ul className="space-y-1.5">
                      {summaryData.nextSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-ink dark:text-[#EAECE9]">
                          <ArrowRight className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <button
                    onClick={handleSummarizeProject}
                    className="px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold shadow-xs hover:bg-brand-600"
                  >
                    Gerar Resumo Executivo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RISK ANALYSIS */}
          {activeTab === "risks" && (
            <div className="space-y-4">
              <div className="p-3 bg-warnbg border border-warn/30 rounded-xl text-warn text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-warn shrink-0 mt-0.5" />
                <p>
                  O motor preditivo avalia gargalos de tarefas, dependências não cumpridas e prazos
                  críticos para alertar antes que ocorram atrasos na entrega.
                </p>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-faint">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500" />
                </div>
              ) : summaryData?.risks ? (
                <div className="space-y-2">
                  {summaryData.risks.map((risk, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                        risk.level === "ALTO"
                          ? "bg-dangerbg border-danger/30 text-danger"
                          : risk.level === "MÉDIO"
                          ? "bg-warnbg border-warn/30 text-warn"
                          : "bg-brand-50/60 dark:bg-brand-900/40 border-brand-200 dark:border-brand-800 text-brand-900 dark:text-brand-100"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          risk.level === "ALTO"
                            ? "bg-danger text-white"
                            : risk.level === "MÉDIO"
                            ? "bg-warn text-white"
                            : "bg-brand-500 text-white"
                        }`}
                      >
                        Risco {risk.level}
                      </span>
                      <p className="text-xs leading-relaxed">{risk.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <button
                    onClick={handleSummarizeProject}
                    className="px-4 py-2 bg-brand-500 text-white rounded-xl font-semibold shadow-xs hover:bg-brand-600"
                  >
                    Analisar Riscos Agora
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
