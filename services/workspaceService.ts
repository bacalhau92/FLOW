import { supabase } from './supabase';
import type { WorkspaceMember, WorkspaceSettings, UserRole, User } from '../types';
import { 
  createWorkspaceMember as createRBACMember,
  activateWorkspaceMember,
  updateMemberRole,
  getRolePermissions 
} from './rbac';

/**
 * Serviços de gestão de membros e configurações do Workspace
 * Integrado com Supabase para persistência de dados
 */

// ==================== WORKSPACE MEMBERS ====================

/**
 * Obtém todos os membros de um workspace
 */
export const getWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      *,
      user:users (
        id,
        name,
        email,
        avatar,
        role
      )
    `)
    .eq('workspace_id', workspaceId)
    .eq('status', 'active')
    .order('joined_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Obtém um membro específico do workspace
 */
export const getWorkspaceMember = async (
  workspaceId: string,
  userId: string
): Promise<WorkspaceMember | null> => {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data || null;
};

/**
 * Convida um novo membro para o workspace
 */
export const inviteWorkspaceMember = async (
  workspaceId: string,
  email: string,
  role: UserRole,
  invitedBy: string
): Promise<WorkspaceMember> => {
  // First check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  let userId = existingUser?.id;

  // If user doesn't exist, we'll create a pending invitation
  if (!userId) {
    // Create user placeholder or send invitation email
    const { data: newUser, error: userError } = await supabase.rpc('create_or_get_user', {
      p_email: email,
      p_name: email.split('@')[0],
    });

    if (userError && userError.code !== 'PGRST116') {
      // If RPC doesn't exist, handle manually
      userId = `pending-${Date.now()}`;
    } else if (newUser) {
      userId = newUser.id;
    }
  }

  const member = createRBACMember(userId || `pending-${Date.now()}`, workspaceId, role, invitedBy);

  const { data, error } = await supabase
    .from('workspace_members')
    .insert({
      id: member.id,
      workspace_id: workspaceId,
      user_id: member.userId,
      role: member.role,
      status: member.status,
      invited_at: member.invitedAt,
      invited_by: member.invitedBy,
      permissions: member.permissions,
    })
    .select()
    .single();

  if (error) throw error;

  // TODO: Send invitation email here

  return data;
};

/**
 * Ativa a associação de um membro (quando aceita o convite)
 */
export const acceptInvitation = async (memberId: string): Promise<WorkspaceMember> => {
  const { data, error } = await supabase
    .from('workspace_members')
    .update({
      status: 'active',
      joined_at: new Date().toISOString(),
    })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

/**
 * Atualiza o papel de um membro do workspace
 */
export const updateMemberRoleInWorkspace = async (
  memberId: string,
  newRole: UserRole
): Promise<WorkspaceMember> => {
  const permissions = getRolePermissions(newRole);

  const { data, error } = await supabase
    .from('workspace_members')
    .update({
      role: newRole,
      permissions,
      updated_at: new Date().toISOString(),
    })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

/**
 * Remove um membro do workspace
 */
export const removeWorkspaceMember = async (memberId: string): Promise<void> => {
  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
};

/**
 * Suspende temporariamente um membro
 */
export const suspendWorkspaceMember = async (memberId: string): Promise<WorkspaceMember> => {
  const { data, error } = await supabase
    .from('workspace_members')
    .update({
      status: 'suspended',
      suspended_at: new Date().toISOString(),
    })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

/**
 * Reativa um membro suspenso
 */
export const unsuspendWorkspaceMember = async (memberId: string): Promise<WorkspaceMember> => {
  const { data, error } = await supabase
    .from('workspace_members')
    .update({
      status: 'active',
      unsuspended_at: new Date().toISOString(),
    })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

/**
 * Verifica se um usuário é membro ativo de um workspace
 */
export const isWorkspaceMember = async (
  workspaceId: string,
  userId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error && error.code === 'PGRST116') return false;
  if (error) throw error;

  return !!data;
};

/**
 * Obtém o papel de um usuário num workspace
 */
export const getUserRoleInWorkspace = async (
  workspaceId: string,
  userId: string
): Promise<UserRole | null> => {
  const member = await getWorkspaceMember(workspaceId, userId);
  return member?.role || null;
};

// ==================== WORKSPACE SETTINGS ====================

/**
 * Obtém configurações de um workspace
 */
export const getWorkspaceSettings = async (workspaceId: string): Promise<WorkspaceSettings | null> => {
  const { data, error } = await supabase
    .from('workspace_settings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

/**
 * Cria ou atualiza configurações de workspace
 */
export const upsertWorkspaceSettings = async (
  workspaceId: string,
  settings: Partial<WorkspaceSettings>
): Promise<WorkspaceSettings> => {
  // Check if settings exist
  const existing = await getWorkspaceSettings(workspaceId);

  if (existing) {
    return updateWorkspaceSettings(workspaceId, settings);
  } else {
    return createWorkspaceSettings(workspaceId, settings);
  }
};

/**
 * Cria configurações padrão para um novo workspace
 */
export const createWorkspaceSettings = async (
  workspaceId: string,
  overrides?: Partial<WorkspaceSettings>
): Promise<WorkspaceSettings> => {
  const defaultSettings: WorkspaceSettings = {
    id: `ws-settings-${Date.now()}`,
    workspaceId,
    allowPublicProjects: false,
    allowGuestAccess: false,
    requireTwoFactor: false,
    defaultRole: 'MEMBER',
    auditLogEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };

  const { data, error } = await supabase
    .from('workspace_settings')
    .insert(defaultSettings)
    .select()
    .single();

  if (error) throw error;

  return data;
};

/**
 * Atualiza configurações de workspace
 */
export const updateWorkspaceSettings = async (
  workspaceId: string,
  updates: Partial<WorkspaceSettings>
): Promise<WorkspaceSettings> => {
  const { data, error } = await supabase
    .from('workspace_settings')
    .update({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .eq('workspace_id', workspaceId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

/**
 * Valida se um domínio de email é permitido para registro automático
 */
export const isEmailDomainAllowed = async (
  workspaceId: string,
  email: string
): Promise<boolean> => {
  const settings = await getWorkspaceSettings(workspaceId);
  
  if (!settings?.allowedDomains || settings.allowedDomains.length === 0) {
    return true; // No restrictions
  }

  const domain = email.split('@')[1];
  return settings.allowedDomains.includes(domain);
};

// ==================== AUDIT LOG ====================

/**
 * Registra uma atividade no log de auditoria
 */
export const logAuditEvent = async (
  workspaceId: string,
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> => {
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      timestamp: new Date().toISOString(),
    });

  if (error) {
    console.warn('Failed to log audit event:', error);
    // Don't throw - audit logging shouldn't block operations
  }
};

/**
 * Obtém logs de auditoria de um workspace
 */
export const getAuditLogs = async (
  workspaceId: string,
  limit: number = 100,
  offset: number = 0
): Promise<any[]> => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      user:users (
        id,
        name,
        email,
        avatar
      )
    `)
    .eq('workspace_id', workspaceId)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
};

/**
 * Obtém logs de auditoria filtrados por tipo de ação
 */
export const getAuditLogsByAction = async (
  workspaceId: string,
  action: string,
  limit: number = 50
): Promise<any[]> => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('action', action)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Verifica permissões de um usuário para uma ação específica
 */
export const checkPermission = async (
  workspaceId: string,
  userId: string,
  resource: string,
  action: string
): Promise<boolean> => {
  const member = await getWorkspaceMember(workspaceId, userId);
  
  if (!member || member.status !== 'active') {
    return false;
  }

  const permissions = member.permissions || getRolePermissions(member.role);
  const permission = permissions.find(p => p.resource === resource);
  
  return permission?.actions.includes(action) ?? false;
};

/**
 * Valida se um usuário pode executar uma ação crítica
 */
export const canPerformCriticalAction = async (
  workspaceId: string,
  userId: string,
  action: string
): Promise<boolean> => {
  const role = await getUserRoleInWorkspace(workspaceId, userId);
  
  if (!role) return false;

  const criticalActions: Record<string, UserRole[]> = {
    "delete_workspace": ["OWNER"],
    "manage_billing": ["OWNER"],
    "delete_project": ["OWNER", "ADMIN", "MANAGER"],
    "remove_member": ["OWNER", "ADMIN"],
    "change_member_role": ["OWNER", "ADMIN"],
    "manage_integrations": ["OWNER", "ADMIN"],
    "view_audit_logs": ["OWNER", "ADMIN"],
  };

  return criticalActions[action]?.includes(role) ?? false;
};

/**
 * Inicializa um novo workspace com configurações padrão e proprietário
 */
export const initializeWorkspace = async (
  workspaceId: string,
  ownerId: string,
  ownerEmail: string
): Promise<void> => {
  // Create workspace settings
  await createWorkspaceSettings(workspaceId);

  // Add owner as OWNER member
  const ownerMember = createRBACMember(ownerId, workspaceId, 'OWNER');
  await supabase
    .from('workspace_members')
    .insert({
      id: ownerMember.id,
      workspace_id: workspaceId,
      user_id: ownerId,
      role: 'OWNER',
      status: 'active',
      invited_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
      permissions: getRolePermissions('OWNER'),
    });

  // Log initialization
  await logAuditEvent(
    workspaceId,
    ownerId,
    'workspace_created',
    'workspace',
    workspaceId,
    { ownerEmail }
  );
};
