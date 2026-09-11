import React, { useState } from "react";
import { Settings, Shield, User, Bell, Check, Lock } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { UserRole } from "../../types";

export const SettingsView: React.FC = () => {
  const { currentWorkspace, currentUser, users, addToast } = useApp();
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace.name);

  const roles: { role: UserRole; title: string; desc: string }[] = [
    {
      role: "ADMIN",
      title: "Administrador",
      desc: "Acesso total ao workspace, faturação, integrações e gestão de utilizadores",
    },
    {
      role: "MANAGER",
      title: "Gestor de Projeto",
      desc: "Criação de projetos, atribuição de tarefas e relatórios da equipa",
    },
    {
      role: "MEMBER",
      title: "Membro",
      desc: "Execução e atualização de tarefas, comentários e criação de documentos",
    },
    {
      role: "VIEWER",
      title: "Convidado (Cliente/Externo)",
      desc: "Apenas visualização e comentários nos projetos autorizados",
    },
  ];

  const handleSaveWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: "success",
      title: "Workspace Atualizado",
      description: "As alterações foram guardadas.",
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150 text-xs">
      <div>
        <h1 className="text-xl font-bold text-ink dark:text-[#EAECE9] tracking-tight flex items-center gap-2 font-display">
          <Settings className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>Definições do Workspace & Permissões RBAC</span>
        </h1>
        <p className="text-xs text-soft dark:text-brand-300/80 mt-0.5">
          Configuração corporativa, segurança e níveis de privilégios de acesso
        </p>
      </div>

      {/* Workspace General Config */}
      <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-5 space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-ink dark:text-[#EAECE9] font-display">Geral</h3>
        <form onSubmit={handleSaveWorkspace} className="space-y-4">
          <div className="max-w-md">
            <label className="block font-semibold text-ink dark:text-[#EAECE9] mb-1">
              Nome do Workspace
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-3 py-2 border border-line dark:border-brand-800 rounded-xl bg-card dark:bg-brand-900/60 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium text-ink dark:text-[#EAECE9]"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-xs"
          >
            Guardar Alterações
          </button>
        </form>
      </div>

      {/* RBAC Role Matrix */}
      <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-ink dark:text-[#EAECE9] flex items-center gap-2 font-display">
            <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Matriz de Funções & Permissões (RBAC)</span>
          </h3>
          <span className="text-[10px] text-faint font-medium">Controlo Granular</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roles.map((r) => (
            <div
              key={r.role}
              className="p-4 rounded-xl border border-line/60 dark:border-brand-800 bg-paper/50 dark:bg-brand-900/30 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-ink dark:text-[#EAECE9]">{r.title}</span>
                <span className="text-[10px] font-bold bg-brand-50 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-700/60">
                  {r.role}
                </span>
              </div>
              <p className="text-[11px] text-soft dark:text-brand-300/80 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Profiles inside Workspace */}
      <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-5 space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-ink dark:text-[#EAECE9] font-display">Membros Atuais</h3>
        <div className="divide-y divide-line/60 dark:divide-brand-800/60">
          {users.map((u) => (
            <div key={u.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-line dark:ring-brand-800"
                />
                <div>
                  <div className="font-semibold text-ink dark:text-[#EAECE9]">{u.name}</div>
                  <div className="text-[10px] text-faint">{u.email}</div>
                </div>
              </div>

              <span className="text-[11px] font-semibold px-2.5 py-1 bg-paper dark:bg-brand-900 text-soft dark:text-brand-300 rounded-lg border border-line dark:border-brand-800">
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
