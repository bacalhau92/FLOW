import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  FolderPlus,
  Calendar,
  Layers,
  CheckCircle2,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { createProjectWithAI } from "../../services/aiService";
import { Priority, ProjectStatus } from "../../types";

export const CreateProjectModal: React.FC = () => {
  const {
    isCreateProjectOpen,
    setIsCreateProjectOpen,
    createProject,
    currentWorkspace,
    teams,
    setCurrentView,
    addToast,
  } = useApp();

  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStepIndex, setAiStepIndex] = useState(0);

  const aiProgressSteps = [
    "A interpretar objetivos e contexto em linguagem natural...",
    "A decompor o escopo em etapas e tarefas prioritárias...",
    "A calcular estimativas de prazo, subtarefas e dependências...",
    "A finalizar plano de trabalho estruturado no quadro...",
  ];

  useEffect(() => {
    let timer: any;
    if (isAiLoading) {
      setAiStepIndex(0);
      timer = setInterval(() => {
        setAiStepIndex((prev) => (prev < aiProgressSteps.length - 1 ? prev + 1 : prev));
      }, 1300);
    } else {
      setAiStepIndex(0);
    }
    return () => clearInterval(timer);
  }, [isAiLoading]);

  // Manual form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState(teams[0]?.id || "");
  const [priority, setPriority] = useState<Priority>("ALTA");
  const [status, setStatus] = useState<ProjectStatus>("Em andamento");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [color, setColor] = useState("#2E7D5B");

  if (!isCreateProjectOpen) return null;

  const handleCreateWithAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    try {
      const generated = await createProjectWithAI(aiPrompt, currentWorkspace.name);
      createProject(
        {
          name: generated.name,
          description: generated.description,
          color: generated.color || "#2E7D5B",
          priority: generated.priority || "ALTA",
          teamId,
          startDate,
          targetDate,
        },
        generated.tasks
      );
      addToast({
        type: "success",
        title: "Projeto Gerado com Sucesso!",
        description: `"${generated.name}" foi estruturado com ${generated.tasks?.length || 0} tarefas prontas no quadro.`,
      });
      setIsCreateProjectOpen(false);
      setCurrentView("project-detail");
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Erro ao gerar projeto",
        description: err.message || "Tente novamente.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProject({
      name: name.trim(),
      description: description.trim(),
      teamId,
      priority,
      status,
      startDate,
      targetDate,
      color,
    });
    setIsCreateProjectOpen(false);
    setCurrentView("project-detail");
  };

  const promptExamples = [
    "Cria um projeto para organizar uma formação de gestão de três dias",
    "Preparar o lançamento oficial do Jornal KINDA",
    "Campanha de Black Friday com tráfego pago e e-mail marketing",
    "Reformulação da infraestrutura técnica e segurança em nuvem",
  ];

  const colors = [
    "#2E7D5B", // Brand Green
    "#164B37", // Deep Green
    "#A8630E", // Warn Ochre
    "#D9A441", // Gold
    "#BE3A2A", // Danger Rust
    "#5A9F7E", // Soft Sage
    "#20241F", // Ink Slate
  ];

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-card dark:bg-brand-950 rounded-2xl shadow-s border border-line dark:border-brand-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line dark:border-brand-800 flex items-center justify-between bg-paper/60 dark:bg-brand-900/30">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span className="font-bold text-sm text-ink dark:text-[#EAECE9] font-display">Criar Novo Projeto</span>
          </div>
          <button
            onClick={() => setIsCreateProjectOpen(false)}
            className="p-1 text-faint hover:text-ink dark:hover:text-white rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="p-3 border-b border-line dark:border-brand-800 flex gap-2 bg-paper/40 dark:bg-brand-900/20">
          <button
            onClick={() => setMode("ai")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === "ai"
                ? "bg-brand-500 text-white shadow-xs"
                : "bg-card dark:bg-brand-900 text-soft dark:text-brand-200 hover:bg-paper dark:hover:bg-brand-800 border border-line dark:border-brand-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Criar com Inteligência Artificial</span>
          </button>

          <button
            onClick={() => setMode("manual")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === "manual"
                ? "bg-brand-500 text-white shadow-xs"
                : "bg-card dark:bg-brand-900 text-soft dark:text-brand-200 hover:bg-paper dark:hover:bg-brand-800 border border-line dark:border-brand-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Configuração Manual</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {mode === "ai" ? (
            <form onSubmit={handleCreateWithAi} className="space-y-4 text-xs">
              <div className="p-3 bg-brand-50/80 dark:bg-brand-900/40 border border-brand-100 dark:border-brand-800 rounded-xl text-brand-950 dark:text-brand-100 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Descreva o seu objetivo em linguagem natural. A FLOW IA criará automaticamente o
                  cronograma, listas Kanban, tarefas estruturadas, subtarefas e estimativas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-[#EAECE9] mb-1.5">
                  O que pretendes organizar?
                </label>
                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Cria um projeto para organizar uma formação de três dias para diretores de PMEs com 6 sessões..."
                  className="w-full text-xs p-3 border border-line dark:border-brand-800 bg-card dark:bg-brand-900/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-faint text-ink dark:text-[#EAECE9] leading-relaxed"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-faint uppercase tracking-wider block mb-1.5">
                  Exemplos para clicar e testar:
                </span>
                <div className="space-y-1.5">
                  {promptExamples.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAiPrompt(ex)}
                      className="w-full text-left p-2 rounded-lg bg-paper/60 dark:bg-brand-900/40 hover:bg-brand-50/60 dark:hover:bg-brand-900/70 hover:text-brand-900 dark:hover:text-white text-soft dark:text-brand-200 transition-colors text-xs border border-line/60 dark:border-brand-800/60"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Progressive Feedback when generating with AI */}
              {isAiLoading && (
                <div className="p-3 bg-brand-50/80 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-700/70 rounded-xl space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-brand-900 dark:text-brand-100">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 animate-pulse" />
                      <span>{aiProgressSteps[aiStepIndex]}</span>
                    </span>
                    <span className="text-faint">{aiStepIndex + 1} de 4</span>
                  </div>
                  <div className="w-full bg-paper dark:bg-brand-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 transition-all duration-700 rounded-full"
                      style={{ width: `${((aiStepIndex + 1) / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProjectOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-soft dark:text-brand-300 hover:bg-paper dark:hover:bg-brand-900 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!aiPrompt.trim() || isAiLoading}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-brand-500 disabled:opacity-50 text-white rounded-xl hover:bg-brand-600 transition-all shadow-xs"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A Gerar Estrutura ({aiStepIndex + 1}/4)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Gerar Projeto Completo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateManual} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Nome do Projeto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campanha de Lançamento Q4"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-line dark:border-brand-800 bg-card dark:bg-brand-900/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink dark:text-[#EAECE9]"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Objetivos e escopo geral do projeto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-line dark:border-brand-800 bg-card dark:bg-brand-900/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink dark:text-[#EAECE9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Equipa</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full px-3 py-2 border border-line dark:border-brand-800 rounded-xl bg-card dark:bg-brand-900 text-ink dark:text-[#EAECE9]"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Data Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-line dark:border-brand-800 bg-card dark:bg-brand-900 rounded-xl text-ink dark:text-[#EAECE9]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Data Conclusão Prevista</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 border border-line dark:border-brand-800 bg-card dark:bg-brand-900 rounded-xl text-ink dark:text-[#EAECE9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1.5">Cor Temática</label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? "scale-125 ring-2 ring-brand-400 ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProjectOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-soft dark:text-brand-300 hover:bg-paper dark:hover:bg-brand-900 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all shadow-xs"
                >
                  Criar Projeto
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
