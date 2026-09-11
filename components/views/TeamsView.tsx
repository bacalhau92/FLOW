import React from "react";
import { Users, Plus, Mail, Shield, FolderKanban } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { EmptyState } from "../common/EmptyState";

export const TeamsView: React.FC = () => {
  const { teams, users, projects, setIsCreateTeamOpen } = useApp();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-[#EAECE9] tracking-tight flex items-center gap-2 font-display">
            <Users className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>Equipas & Colaboradores</span>
          </h1>
          <p className="text-xs text-soft dark:text-brand-300/80 mt-0.5">
            Organização departamental, distribuição de projetos e perfis de acesso
          </p>
        </div>

        <button
          onClick={() => setIsCreateTeamOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Equipa</span>
        </button>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhuma equipa estruturada"
          description="Crie departamentos funcionais para distribuir membros, atribuir permissões e organizar os projetos da sua empresa."
          action={{
            label: "Criar Primeira Equipa",
            onClick: () => setIsCreateTeamOpen(true),
            icon: Plus,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teams.map((t) => {
            const teamProjects = projects.filter((p) => p.teamId === t.id);
            const teamMembers = users.filter((u) => t.memberIds.includes(u.id));

            return (
              <div
                key={t.id}
                className="bg-card dark:bg-brand-950/60 p-5 rounded-2xl border border-line dark:border-brand-800 shadow-xs space-y-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-ink dark:text-[#EAECE9] font-display">{t.name}</h3>
                    <p className="text-[11px] text-soft dark:text-brand-300/80 mt-1 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-700/60">
                    {teamMembers.length} membros
                  </span>
                </div>

                {/* Members Avatars */}
                <div className="space-y-2 pt-2 border-t border-line/60 dark:border-brand-800/60">
                  <span className="text-[10px] font-semibold text-faint uppercase tracking-wider block">
                    Membros Ativos
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-1.5 bg-paper dark:bg-brand-900/60 border border-line dark:border-brand-800 rounded-full px-2.5 py-1"
                      >
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="text-ink dark:text-[#EAECE9] font-medium text-[11px]">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned Projects */}
                <div className="pt-2 border-t border-line/60 dark:border-brand-800/60">
                  <span className="text-[10px] font-semibold text-faint uppercase tracking-wider block mb-1">
                    Projetos do Departamento ({teamProjects.length})
                  </span>
                  <div className="space-y-1">
                    {teamProjects.map((tp) => (
                      <div
                        key={tp.id}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-paper/70 dark:bg-brand-900/40 text-ink dark:text-[#EAECE9] font-medium"
                      >
                        <span className="truncate">{tp.name}</span>
                        <span className="text-[10px] text-faint">{tp.status}</span>
                      </div>
                    ))}
                    {teamProjects.length === 0 && (
                      <div className="text-faint italic text-[11px]">
                        Nenhum projeto vinculado a esta equipa.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Workspace Users Directory */}
      <div className="bg-card dark:bg-brand-950/60 rounded-2xl border border-line dark:border-brand-800 p-5 space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-ink dark:text-[#EAECE9] flex items-center gap-2 font-display">
          <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Diretório de Utilizadores do Workspace</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 rounded-xl border border-line/60 dark:border-brand-800 bg-paper/50 dark:bg-brand-900/30 space-y-2 text-center flex flex-col items-center"
            >
              <img
                src={u.avatar}
                alt={u.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-card dark:border-brand-800 shadow-xs"
              />
              <div>
                <div className="font-bold text-xs text-ink dark:text-[#EAECE9]">{u.name}</div>
                <div className="text-[10px] text-faint">{u.email}</div>
              </div>
              <span className="text-[10px] font-bold bg-brand-50 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-700/60">
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
