import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  FolderKanban,
  Edit3,
  Eye,
  Trash2,
  Tag,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const DocumentsView: React.FC = () => {
  const {
    documents,
    projects,
    setIsCreateDocOpen,
    deleteDocument,
    updateDocument,
    createDocument,
    activeProjectId,
  } = useApp();

  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateFromTemplate = (title: string, category: string, defaultContent: string) => {
    const newDoc = {
      title,
      category,
      content: defaultContent,
      tags: ["Template", category],
      projectId: activeProjectId || undefined,
    };
    createDocument(newDoc);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150 text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-[#EAECE9] tracking-tight flex items-center gap-2 font-display">
            <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>Documentos & Base de Conhecimento</span>
          </h1>
          <p className="text-xs text-soft dark:text-brand-300/80 mt-0.5">
            Documentação unificada, briefings, atas de reuniões e diretrizes partilhadas
          </p>
        </div>

        <button
          onClick={() => setIsCreateDocOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Documento</span>
        </button>
      </div>

      {/* Main Dual-Pane Layout: Docs List (Left) + Document Reader/Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left Pane: Doc List & Search (4 Cols) */}
        <div className="lg:col-span-4 bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-3 space-y-3 flex flex-col shadow-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-faint absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-paper dark:bg-brand-900/50 border border-line dark:border-brand-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs text-ink dark:text-[#EAECE9] placeholder:text-faint"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5">
            {filteredDocs.map((doc) => {
              const proj = projects.find((p) => p.id === doc.projectId);
              const isSelected = doc.id === selectedDoc?.id;

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "bg-brand-50 dark:bg-brand-800/40 border-brand-200 dark:border-brand-700 shadow-xs"
                      : "bg-card dark:bg-brand-900/20 border-line/60 dark:border-brand-800/60 hover:border-line2 hover:bg-paper/40 dark:hover:bg-brand-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-ink dark:text-[#EAECE9] truncate">{doc.title}</span>
                    <span className="text-[10px] bg-paper dark:bg-brand-900 text-soft dark:text-brand-300 px-1.5 py-0.5 rounded font-medium border border-line dark:border-brand-800">
                      {doc.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-soft dark:text-brand-300/70 line-clamp-1 leading-snug">
                    {doc.content.replace(/[#*`_]/g, "")}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-faint pt-1">
                    <span>{doc.updatedAt}</span>
                    {proj && <span className="text-brand-600 dark:text-brand-300 font-medium">{proj.name}</span>}
                  </div>
                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="text-center py-8 px-3 space-y-3">
                <p className="text-xs text-soft dark:text-brand-300 font-medium">
                  Nenhum documento encontrado.
                </p>
                <div className="space-y-1.5 text-left pt-2">
                  <div className="text-[10px] uppercase font-semibold text-faint tracking-wider px-1">
                    Modelos Rápidos:
                  </div>
                  <button
                    onClick={() =>
                      handleCreateFromTemplate(
                        "Briefing de Projeto",
                        "Planeamento",
                        "# Briefing do Projeto\n\n### Objetivos\n- Definir meta clara\n\n### Entregáveis\n- Versão Beta\n- Documentação"
                      )
                    }
                    className="w-full text-left p-2 rounded-xl bg-paper dark:bg-brand-900/40 hover:bg-line/40 border border-line dark:border-brand-800 text-[11px] font-medium text-ink dark:text-brand-200 transition-colors"
                  >
                    📄 Briefing de Projeto
                  </button>
                  <button
                    onClick={() =>
                      handleCreateFromTemplate(
                        "Ata de Reunião Semanal",
                        "Reuniões",
                        "# Ata de Reunião\n\n**Data:** Hoje\n**Participantes:** Equipa Core\n\n### Pauta\n1. Atualização dos sprints\n2. Bloqueios"
                      )
                    }
                    className="w-full text-left p-2 rounded-xl bg-paper dark:bg-brand-900/40 hover:bg-line/40 border border-line dark:border-brand-800 text-[11px] font-medium text-ink dark:text-brand-200 transition-colors"
                  >
                    📝 Ata de Reunião
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Document Viewer / Editor (8 Cols) */}
        <div className="lg:col-span-8 bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
          {selectedDoc ? (
            <>
              {/* Doc Header */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-line dark:border-brand-800 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-ink dark:text-[#EAECE9] font-display">{selectedDoc.title}</h2>
                    <span className="text-[10px] font-semibold bg-brand-50 dark:bg-brand-900/50 text-brand-700 dark:text-brand-200 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-700">
                      {selectedDoc.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-faint">
                    Última edição em {selectedDoc.updatedAt}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                      isEditing
                        ? "bg-brand-500 text-white"
                        : "bg-paper dark:bg-brand-900/50 hover:bg-line/60 dark:hover:bg-brand-800 text-ink dark:text-[#EAECE9] border border-line dark:border-brand-800"
                    }`}
                  >
                    {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    <span>{isEditing ? "Visualizar" : "Editar"}</span>
                  </button>

                  <button
                    onClick={() => deleteDocument(selectedDoc.id)}
                    className="p-1.5 text-faint hover:text-danger rounded-lg hover:bg-dangerbg transition-colors"
                    title="Eliminar Documento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Doc Body */}
              <div className="flex-1 overflow-y-auto">
                {isEditing ? (
                  <textarea
                    rows={16}
                    value={selectedDoc.content}
                    onChange={(e) =>
                      updateDocument(selectedDoc.id, { content: e.target.value })
                    }
                    className="w-full h-full p-4 border border-line dark:border-brand-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-xs leading-relaxed text-ink dark:text-[#EAECE9] bg-paper/40 dark:bg-brand-900/30"
                  />
                ) : (
                  <div className="prose prose-zinc dark:prose-invert max-w-none text-xs leading-relaxed text-ink dark:text-brand-200/90 whitespace-pre-wrap">
                    {selectedDoc.content}
                  </div>
                )}
              </div>

              {/* Footer Tags */}
              <div className="flex items-center gap-2 pt-3 border-t border-line dark:border-brand-800 text-[11px] text-faint">
                <Tag className="w-3.5 h-3.5" />
                <span>Etiquetas: {selectedDoc.tags.join(", ") || "Nenhuma"}</span>
              </div>
            </>
          ) : (
            <div className="text-center py-24 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-700/60 flex items-center justify-center mx-auto text-brand-600 dark:text-brand-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-xs text-soft dark:text-brand-300">
                Selecione um documento na barra lateral para começar a ler ou editar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
