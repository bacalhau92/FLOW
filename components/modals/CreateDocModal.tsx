import React, { useState } from "react";
import { X, FileText, FolderKanban } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const CreateDocModal: React.FC = () => {
  const { isCreateDocOpen, setIsCreateDocOpen, createDocument, projects, activeProjectId } = useApp();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Planeamento");
  const [projectId, setProjectId] = useState(activeProjectId || projects[0]?.id || "");
  const [content, setContent] = useState("");

  if (!isCreateDocOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createDocument({
      title: title.trim(),
      category,
      projectId: projectId || undefined,
      content: content.trim() || `# ${title}\n\nDocumento criado na plataforma FLOW.`,
      tags: [category],
    });

    setTitle("");
    setContent("");
    setIsCreateDocOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-card dark:bg-brand-950 rounded-2xl shadow-s border border-line dark:border-brand-800 overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-line dark:border-brand-800 flex items-center justify-between bg-paper/60 dark:bg-brand-900/30">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span className="font-bold text-sm text-ink dark:text-[#EAECE9] font-display">Novo Documento</span>
          </div>
          <button
            onClick={() => setIsCreateDocOpen(false)}
            className="p-1 text-faint hover:text-ink dark:hover:text-white rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Título do Documento *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Ata de Reunião de Alinhamento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-line dark:border-brand-800 bg-card dark:bg-brand-900/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium text-ink dark:text-[#EAECE9]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Projeto Associado</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-line dark:border-brand-800 rounded-xl bg-card dark:bg-brand-900 text-ink dark:text-[#EAECE9]"
              >
                <option value="">Geral / Sem Projeto</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-line dark:border-brand-800 rounded-xl bg-card dark:bg-brand-900 text-ink dark:text-[#EAECE9]"
              >
                <option value="Planeamento">Planeamento</option>
                <option value="Branding">Branding</option>
                <option value="Atas & Reuniões">Atas & Reuniões</option>
                <option value="Processos">Processos</option>
                <option value="Técnico">Técnico</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Conteúdo Inicial (Markdown)</label>
            <textarea
              rows={4}
              placeholder="Comece a redigir o documento aqui..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-line dark:border-brand-800 bg-card dark:bg-brand-900/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-xs text-ink dark:text-[#EAECE9]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateDocOpen(false)}
              className="px-4 py-2 text-xs font-medium text-soft dark:text-brand-300 hover:bg-paper dark:hover:bg-brand-900 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all shadow-xs"
            >
              Criar Documento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
