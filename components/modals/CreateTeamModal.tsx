import React, { useState } from "react";
import { X, Users } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const CreateTeamModal: React.FC = () => {
  const { isCreateTeamOpen, setIsCreateTeamOpen, createTeam, currentWorkspace } = useApp();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isCreateTeamOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createTeam(name.trim(), description.trim());
    setName("");
    setDescription("");
    setIsCreateTeamOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-card dark:bg-brand-950 rounded-2xl shadow-s border border-line dark:border-brand-800 overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-line dark:border-brand-800 flex items-center justify-between bg-paper/60 dark:bg-brand-900/30">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span className="font-bold text-sm text-ink dark:text-[#EAECE9] font-display">Nova Equipa</span>
          </div>
          <button
            onClick={() => setIsCreateTeamOpen(false)}
            className="p-1 text-faint hover:text-ink dark:hover:text-white rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Nome da Equipa / Departamento *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Marketing & Conteúdo, Operações..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-line dark:border-brand-800 bg-card dark:bg-brand-900/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium text-ink dark:text-[#EAECE9]"
            />
          </div>

          <div>
            <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">Descrição</label>
            <textarea
              rows={3}
              placeholder="Finalidade desta equipa dentro do workspace..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-line dark:border-brand-800 bg-card dark:bg-brand-900/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink dark:text-[#EAECE9]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateTeamOpen(false)}
              className="px-4 py-2 text-xs font-medium text-soft dark:text-brand-300 hover:bg-paper dark:hover:bg-brand-900 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all shadow-xs"
            >
              Criar Equipa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
