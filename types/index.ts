export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";

export type Priority = "BAIXA" | "MÉDIA" | "ALTA" | "URGENTE";

export type ProjectStatus = "Planejamento" | "Em andamento" | "Em pausa" | "Concluído" | "Cancelado";

export type ProjectViewMode = "kanban" | "list" | "calendar" | "timeline" | "gantt" | "table";

// RBAC Permissions System
export interface Permission {
  resource: string;
  actions: string[]; // e.g., ["create", "read", "update", "delete"]
}

export interface RoleDefinition {
  role: UserRole;
  label: string;
  description: string;
  permissions: Permission[];
  canManageMembers: boolean;
  canManageWorkspace: boolean;
  canManageBilling: boolean;
  canManageIntegrations: boolean;
  canDeleteProjects: boolean;
  canManageAutomations: boolean;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: UserRole;
  invitedAt: string;
  joinedAt?: string;
  invitedBy?: string;
  status: "active" | "pending" | "suspended";
  permissions?: Permission[];
}

export interface WorkspaceSettings {
  id: string;
  workspaceId: string;
  allowPublicProjects: boolean;
  allowGuestAccess: boolean;
  requireTwoFactor: boolean;
  defaultRole: UserRole;
  maxMembers?: number;
  allowedDomains?: string[]; // For SSO
  customRoles?: RoleDefinition[];
  auditLogEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  title?: string;
  teamId?: string;
  workspaceId?: string;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  color: string;
  ownerId: string;
  memberCount: number;
  settings?: WorkspaceSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface Team {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  leaderId: string;
  memberIds: string[];
  color: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  order: number;
  color?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
  dueDate?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  attachments?: string[];
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export interface TaskDependency {
  taskId: string; // The prerequisite task ID
  dependencyType: "blocks" | "blocked_by";
}

export interface Task {
  id: string;
  workspaceId: string;
  projectId: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  assigneeId?: string;
  collaboratorIds: string[];
  labels: string[];
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  loggedHours?: number;
  subtasks: Subtask[];
  dependencies: string[]; // task IDs this task depends on
  attachmentsCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  isCompleted?: boolean;
}

export interface Project {
  id: string;
  workspaceId: string;
  teamId?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  ownerId: string;
  startDate: string;
  targetDate: string;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  memberIds: string[];
  isFavorite?: boolean;
}

export interface Document {
  id: string;
  workspaceId: string;
  projectId?: string;
  title: string;
  content: string;
  authorId: string;
  updatedAt: string;
  category: string;
  tags: string[];
}

export interface Notification {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  message: string;
  type: "assign" | "mention" | "due_soon" | "overdue" | "comment" | "automation";
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Activity {
  id: string;
  workspaceId: string;
  userId: string;
  action: string;
  targetType: "task" | "project" | "document" | "comment";
  targetTitle: string;
  timestamp: string;
}

export interface AutomationRule {
  id: string;
  workspaceId: string;
  name: string;
  active: boolean;
  trigger: "task_completed" | "task_overdue" | "task_created" | "status_changed_review";
  conditionDesc: string;
  action: "move_to_done" | "set_high_priority" | "assign_project_owner" | "notify_manager";
  actionDesc: string;
  executionsCount: number;
}
