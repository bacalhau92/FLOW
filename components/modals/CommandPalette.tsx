import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Sparkles,
  FolderKanban,
  CheckCircle2,
  FileText,
  Users,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { naturalLanguageCommand } from "../../services/aiService";

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    projects,
    tasks,
    documents,
    currentWorkspace,
    setActiveProjectId,
    setCurrentView,
    setSelectedTaskId,
    setQuickFilter,
    createProject,
    setIsAIAssistantOpen,
    addToast,
  } = useApp();

  const [input, setInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setInput("");
      setAiResponse(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const query = input.trim().toLowerCase();

  // Filtered matching items
  const matchingProjects = projects.filter((p) => p.name.toLowerCase().includes(query));
  const matchingTasks = tasks.filter((t) => t.title.toLowerCase().includes(query));
  const matchingDocs = documents.filter((d) => d.title.toLowerCase().includes(query));

  // AI Command submission
  const handleRunAiCommand = async (commandText: string) => {
    if (!commandText.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const res = await naturalLanguageCommand(commandText, {
        workspaceName: currentWorkspace.name,
        projectsCount: projects.length,
        tasksCount: tasks.length,
      });

      setAiResponse(res.message);

      // Execute intent action
      if (res.action === "FILTER_OVERDUE") {
        setQuickFilter("overdue");
        setCurrentView("dashboard");
        addToast({
          type: "info",
          title: "Filtro Aplicado",
          description: "A mostrar tarefas atrasadas e pendentes.",
        });
      } else if (res.action === "SHOW_DAILY_BRIEFING" || res.action === "ANALYZE_RISKS") {
        setIsAIAssistantOpen(true);
      } else if (res.action === "CREATE_PROJECT" && res.payload?.name) {
        createProject({
          name: res.payload.name,
          description: `Projeto gerado a partir do comando: "${commandText}"`,
          priority: "ALTA",
        });
        setCurrentView("project-detail");
      }
    } catch (err: any) {
      setAiResponse("Não foi possível processar o comando neste momento.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const suggestions = [
    "Cria um projeto para o lançamento do Jornal KINDA",
    "Mostra tudo que está atrasado",
    "Como está o meu dia?",
    "Quais projetos estão em risco?",
    "Resume o projeto PRIME ACADEMY",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-card dark:bg-brand-950 rounded-2xl shadow-s border border-line dark:border-brand-800 overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-line dark:border-brand-800 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="O que queres fazer? (ou pesquisa projetos, tarefas, docs...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                handleRunAiCommand(input);
              }
              if (e.key === "Escape") {
                setIsCommandPaletteOpen(false);
              }
            }}
            className="flex-1 bg-transparent text-sm text-ink dark:text-[#EAECE9] placeholder:text-faint focus:outline-none"
          />
          {input && (
            <button
              onClick={() => setInput("")}
              className="p-1 text-faint hover:text-ink dark:hover:text-white rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono text-faint bg-paper dark:bg-brand-900 border border-line dark:border-brand-800 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* AI Processing Banner / Feedback */}
        {isAiLoading && (
          <div className="px-4 py-3 bg-brand-50/70 dark:bg-brand-900/40 border-b border-brand-100 dark:border-brand-800 flex items-center gap-2.5 text-xs text-brand-800 dark:text-brand-200 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600 dark:text-brand-400" />
            <span>A FLOW IA está a analisar o comando e o contexto do workspace...</span>
          </div>
        )}

        {aiResponse && (
          <div className="p-3.5 bg-brand-50/80 dark:bg-brand-900/50 border-b border-brand-100 dark:border-brand-800 flex items-start justify-between gap-3 text-xs text-brand-950 dark:text-brand-100">
            <div>
              <span className="font-semibold text-brand-700 dark:text-brand-300 block mb-0.5">Resposta FLOW IA:</span>
              <p className="leading-relaxed">{aiResponse}</p>
            </div>
            <button
              onClick={() => setAiResponse(null)}
              className="text-brand-500 hover:text-brand-700 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs">
          {/* AI Quick Commands if input is empty */}
          {!input && (
            <div>
              <div className="text-[11px] font-semibold text-faint px-2 py-1 uppercase tracking-wider">
                Sugestões Rápidas de IA
              </div>
              <div className="space-y-1 mt-1">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(s);
                      handleRunAiCommand(s);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-brand-50/60 dark:hover:bg-brand-900/40 text-soft dark:text-brand-200 hover:text-brand-900 dark:hover:text-white transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-brand-500 group-hover:scale-110 transition-transform" />
                      <span>{s}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-faint group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {input && (
            <>
              {/* Natural Language Trigger button */}
              <button
                onClick={() => handleRunAiCommand(input)}
                className="w-full flex items-center justify-between p-2.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/40 dark:hover:bg-brand-900/60 text-brand-800 dark:text-brand-200 rounded-xl font-medium transition-colors border border-brand-200 dark:border-brand-700"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Executar com IA: &quot;{input}&quot;</span>
                </div>
                <span className="text-[10px] bg-brand-200 dark:bg-brand-800 text-brand-900 dark:text-brand-100 px-1.5 py-0.5 rounded font-bold">
                  Enter
                </span>
              </button>

              {/* Projects */}
              {matchingProjects.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-faint px-2 py-1 uppercase tracking-wider">
                    Projetos
                  </div>
                  <div className="space-y-1">
                    {matchingProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveProjectId(p.id);
                          setCurrentView("project-detail");
                          setIsCommandPaletteOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-paper dark:hover:bg-brand-900/40 text-ink dark:text-[#EAECE9] text-left transition-colors"
                      >
                        <FolderKanban className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                        <span className="font-medium truncate flex-1">{p.name}</span>
                        <span className="text-[10px] text-faint">{p.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {matchingTasks.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-faint px-2 py-1 uppercase tracking-wider">
                    Tarefas
                  </div>
                  <div className="space-y-1">
                    {matchingTasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTaskId(t.id);
                          setIsCommandPaletteOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-paper dark:hover:bg-brand-900/40 text-ink dark:text-[#EAECE9] text-left transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                        <span className="font-medium truncate flex-1">{t.title}</span>
                        <span className="text-[10px] bg-paper dark:bg-brand-900 text-soft dark:text-brand-300 px-1.5 py-0.5 rounded font-medium border border-line dark:border-brand-800">
                          {t.priority}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {matchingDocs.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-faint px-2 py-1 uppercase tracking-wider">
                    Documentos
                  </div>
                  <div className="space-y-1">
                    {matchingDocs.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setCurrentView("documents");
                          setIsCommandPaletteOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-paper dark:hover:bg-brand-900/40 text-ink dark:text-[#EAECE9] text-left transition-colors"
                      >
                        <FileText className="w-4 h-4 text-brand-500 shrink-0" />
                        <span className="font-medium truncate flex-1">{d.title}</span>
                        <span className="text-[10px] text-faint">{d.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchingProjects.length === 0 && matchingTasks.length === 0 && matchingDocs.length === 0 && (
                <div className="text-center py-6 text-faint">
                  Nenhum resultado direto encontrado. Pressiona <span className="font-semibold text-brand-600 dark:text-brand-400">Enter</span> para enviar à IA!
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 border-t border-line dark:border-brand-800 bg-paper/60 dark:bg-brand-900/40 flex items-center justify-between text-[11px] text-faint">
          <span>Navegue com setas ou clique</span>
          <span className="flex items-center gap-2">
            <span>Para executar IA pressione</span>
            <kbd className="bg-card dark:bg-brand-900 border border-line dark:border-brand-800 px-1.5 py-0.5 rounded font-mono text-soft dark:text-brand-200">
              Enter
            </kbd>
          </span>
        </div>
      </div>
    </div>
  );
};
