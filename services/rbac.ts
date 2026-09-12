import type { UserRole, Permission, RoleDefinition, WorkspaceMember, User } from '../types';

/**
 * Definição completa de papéis e permissões RBAC
 * Sistema profissional de controle de acesso baseado em funções
 */
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  OWNER: {
    role: "OWNER",
    label: "Proprietário",
    description: "Acesso total ao workspace, incluindo faturamento, configurações e gestão de membros",
    permissions: [
      { resource: "workspace", actions: ["create", "read", "update", "delete"] },
      { resource: "project", actions: ["create", "read", "update", "delete"] },
      { resource: "task", actions: ["create", "read", "update", "delete"] },
      { resource: "document", actions: ["create", "read", "update", "delete"] },
      { resource: "team", actions: ["create", "read", "update", "delete"] },
      { resource: "member", actions: ["create", "read", "update", "delete", "invite", "remove"] },
      { resource: "automation", actions: ["create", "read", "update", "delete"] },
      { resource: "integration", actions: ["create", "read", "update", "delete"] },
      { resource: "billing", actions: ["create", "read", "update", "delete"] },
      { resource: "settings", actions: ["create", "read", "update", "delete"] },
      { resource: "audit_log", actions: ["read"] },
    ],
    canManageMembers: true,
    canManageWorkspace: true,
    canManageBilling: true,
    canManageIntegrations: true,
    canDeleteProjects: true,
    canManageAutomations: true,
  },
  ADMIN: {
    role: "ADMIN",
    label: "Administrador",
    description: "Gestão completa do workspace exceto faturamento e exclusão do workspace",
    permissions: [
      { resource: "workspace", actions: ["read", "update"] },
      { resource: "project", actions: ["create", "read", "update", "delete"] },
      { resource: "task", actions: ["create", "read", "update", "delete"] },
      { resource: "document", actions: ["create", "read", "update", "delete"] },
      { resource: "team", actions: ["create", "read", "update", "delete"] },
      { resource: "member", actions: ["create", "read", "update", "invite", "remove"] },
      { resource: "automation", actions: ["create", "read", "update", "delete"] },
      { resource: "integration", actions: ["create", "read", "update", "delete"] },
      { resource: "billing", actions: ["read"] },
      { resource: "settings", actions: ["read", "update"] },
      { resource: "audit_log", actions: ["read"] },
    ],
    canManageMembers: true,
    canManageWorkspace: true,
    canManageBilling: false,
    canManageIntegrations: true,
    canDeleteProjects: true,
    canManageAutomations: true,
  },
  MANAGER: {
    role: "MANAGER",
    label: "Gestor",
    description: "Gestão de projetos, tarefas e equipas sem acesso a configurações do workspace",
    permissions: [
      { resource: "workspace", actions: ["read"] },
      { resource: "project", actions: ["create", "read", "update", "delete"] },
      { resource: "task", actions: ["create", "read", "update", "delete"] },
      { resource: "document", actions: ["create", "read", "update", "delete"] },
      { resource: "team", actions: ["create", "read", "update"] },
      { resource: "member", actions: ["read"] },
      { resource: "automation", actions: ["create", "read", "update"] },
      { resource: "integration", actions: ["read"] },
      { resource: "billing", actions: [] },
      { resource: "settings", actions: ["read"] },
      { resource: "audit_log", actions: [] },
    ],
    canManageMembers: false,
    canManageWorkspace: false,
    canManageBilling: false,
    canManageIntegrations: false,
    canDeleteProjects: true,
    canManageAutomations: true,
  },
  MEMBER: {
    role: "MEMBER",
    label: "Membro",
    description: "Acesso padrão para colaboração em projetos e tarefas",
    permissions: [
      { resource: "workspace", actions: ["read"] },
      { resource: "project", actions: ["read", "update"] },
      { resource: "task", actions: ["create", "read", "update"] },
      { resource: "document", actions: ["create", "read", "update"] },
      { resource: "team", actions: ["read"] },
      { resource: "member", actions: ["read"] },
      { resource: "automation", actions: ["read"] },
      { resource: "integration", actions: [] },
      { resource: "billing", actions: [] },
      { resource: "settings", actions: [] },
      { resource: "audit_log", actions: [] },
    ],
    canManageMembers: false,
    canManageWorkspace: false,
    canManageBilling: false,
    canManageIntegrations: false,
    canDeleteProjects: false,
    canManageAutomations: false,
  },
  VIEWER: {
    role: "VIEWER",
    label: "Visualizador",
    description: "Acesso apenas de leitura para observadores externos ou stakeholders",
    permissions: [
      { resource: "workspace", actions: ["read"] },
      { resource: "project", actions: ["read"] },
      { resource: "task", actions: ["read"] },
      { resource: "document", actions: ["read"] },
      { resource: "team", actions: ["read"] },
      { resource: "member", actions: [] },
      { resource: "automation", actions: [] },
      { resource: "integration", actions: [] },
      { resource: "billing", actions: [] },
      { resource: "settings", actions: [] },
      { resource: "audit_log", actions: [] },
    ],
    canManageMembers: false,
    canManageWorkspace: false,
    canManageBilling: false,
    canManageIntegrations: false,
    canDeleteProjects: false,
    canManageAutomations: false,
  },
};

/**
 * Verifica se um usuário tem permissão para realizar uma ação específica
 */
export const hasPermission = (userRole: UserRole, resource: string, action: string): boolean => {
  const roleDef = ROLE_DEFINITIONS[userRole];
  if (!roleDef) return false;

  const permission = roleDef.permissions.find(p => p.resource === resource);
  if (!permission) return false;

  return permission.actions.includes(action);
};

/**
 * Verifica se um usuário pode executar múltiplas ações num recurso
 */
export const hasAllPermissions = (userRole: UserRole, resource: string, actions: string[]): boolean => {
  return actions.every(action => hasPermission(userRole, resource, action));
};

/**
 * Verifica se um usuário pode pelo menos uma ação num recurso
 */
export const hasAnyPermission = (userRole: UserRole, resource: string, actions: string[]): boolean => {
  return actions.some(action => hasPermission(userRole, resource, action));
};

/**
 * Retorna todas as permissões de um papel específico
 */
export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_DEFINITIONS[role]?.permissions || [];
};

/**
 * Verifica capacidades especiais de um papel
 */
export const hasCapability = (userRole: UserRole, capability: keyof RoleDefinition): boolean => {
  const roleDef = ROLE_DEFINITIONS[userRole];
  if (!roleDef || !(capability in roleDef)) return false;
  
  // Skip non-boolean properties
  if (typeof roleDef[capability] !== 'boolean') return false;
  
  return roleDef[capability] as boolean;
};

/**
 * Valida se um usuário pode convidar novos membros
 */
export const canInviteMembers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, "member", "invite");
};

/**
 * Valida se um usuário pode remover membros
 */
export const canRemoveMembers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, "member", "remove");
};

/**
 * Valida se um usuário pode alterar configurações do workspace
 */
export const canManageWorkspaceSettings = (userRole: UserRole): boolean => {
  return hasAnyPermission(userRole, "settings", ["update", "delete"]);
};

/**
 * Valida se um usuário pode ver o log de auditoria
 */
export const canViewAuditLog = (userRole: UserRole): boolean => {
  return hasPermission(userRole, "audit_log", "read");
};

/**
 * Cria um membro de workspace com permissões baseadas no papel
 */
export const createWorkspaceMember = (
  userId: string,
  workspaceId: string,
  role: UserRole,
  invitedBy?: string
): WorkspaceMember => {
  return {
    id: `wm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId,
    workspaceId,
    role,
    invitedAt: new Date().toISOString(),
    invitedBy,
    status: "pending",
    permissions: getRolePermissions(role),
  };
};

/**
 * Ativa um membro pendente quando aceita o convite
 */
export const activateWorkspaceMember = (member: WorkspaceMember): WorkspaceMember => {
  return {
    ...member,
    status: "active",
    joinedAt: new Date().toISOString(),
  };
};

/**
 * Atualiza o papel de um membro e suas permissões
 */
export const updateMemberRole = (member: WorkspaceMember, newRole: UserRole): WorkspaceMember => {
  return {
    ...member,
    role: newRole,
    permissions: getRolePermissions(newRole),
  };
};

/**
 * Hierarquia de papéis para validação de níveis de acesso
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  MEMBER: 2,
  VIEWER: 1,
};

/**
 * Verifica se um papel é superior ou igual a outro
 */
export const isRoleAtLeast = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

/**
 * Verifica se um papel é estritamente superior a outro
 */
export const isRoleHigherThan = (userRole: UserRole, comparedRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[comparedRole];
};

/**
 * Valida se um usuário pode modificar o papel de outro usuário
 * (apenas papéis superiores podem modificar papéis inferiores)
 */
export const canModifyUserRole = (actorRole: UserRole, targetRole: UserRole): boolean => {
  return isRoleHigherThan(actorRole, targetRole);
};

/**
 * Retorna papéis que um usuário pode atribuir a outros
 */
export const getAssignableRoles = (userRole: UserRole): UserRole[] => {
  return (Object.keys(ROLE_HIERARCHY) as UserRole[])
    .filter(role => isRoleHigherThan(userRole, role));
};

/**
 * Validações específicas para ações críticas
 */
export const canPerformCriticalAction = (userRole: UserRole, action: string): boolean => {
  const criticalActions: Record<string, UserRole[]> = {
    "delete_workspace": ["OWNER"],
    "manage_billing": ["OWNER"],
    "delete_project": ["OWNER", "ADMIN", "MANAGER"],
    "remove_member": ["OWNER", "ADMIN"],
    "change_member_role": ["OWNER", "ADMIN"],
    "manage_integrations": ["OWNER", "ADMIN"],
    "view_audit_logs": ["OWNER", "ADMIN"],
    "manage_automations": ["OWNER", "ADMIN", "MANAGER"],
  };

  return criticalActions[action]?.includes(userRole) ?? false;
};
