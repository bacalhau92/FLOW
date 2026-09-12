// Tipos do Banco de Dados Supabase para TypeScript
// Gerado automaticamente - use `npx supabase gen types` para atualizar

export interface Database {
  public: {
    Tables: {
      // Tabela de Workspaces
      workspaces: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Tabela de Users (perfil estendido)
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };

      // Tabela de Roles (RBAC)
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          permissions: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          permissions?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          permissions?: string[];
          created_at?: string;
        };
      };

      // Tabela de Workspace Members
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role_id: string;
          status: 'active' | 'inactive' | 'suspended';
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role_id: string;
          status?: 'active' | 'inactive' | 'suspended';
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role_id?: string;
          status?: 'active' | 'inactive' | 'suspended';
          created_at?: string;
        };
      };

      // Tabela de Convites
      workspace_invitations: {
        Row: {
          id: string;
          workspace_id: string;
          email: string;
          role_id: string;
          invited_by: string;
          status: 'pending' | 'accepted' | 'declined' | 'expired';
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          role_id: string;
          invited_by: string;
          status?: 'pending' | 'accepted' | 'declined' | 'expired';
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          email?: string;
          role_id?: string;
          invited_by?: string;
          status?: 'pending' | 'accepted' | 'declined' | 'expired';
          expires_at?: string | null;
          created_at?: string;
        };
      };

      // Tabela de Audit Logs
      audit_logs: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          details: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          details?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          details?: Record<string, any>;
          created_at?: string;
        };
      };

      // Tabela de Documentos (RAG)
      documents: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          content: string;
          metadata: Record<string, any>;
          embedding: number[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          title: string;
          content: string;
          metadata?: Record<string, any>;
          embedding?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          title?: string;
          content?: string;
          metadata?: Record<string, any>;
          embedding?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Tabela de Chat Sessions
      chat_sessions: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          title: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          title?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          title?: string | null;
          created_at?: string;
        };
      };

      // Tabela de Chat Messages
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          sources: any[];
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          sources?: any[];
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          sources?: any[];
          created_at?: string;
        };
      };
    };

    Views: {};

    Functions: {
      // Função de busca semântica para RAG
      match_documents: {
        Args: {
          query_embedding: number[];
          match_count?: number;
          filter_workspace_id: string;
        };
        Returns: {
          id: string;
          content: string;
          metadata: Record<string, any>;
          similarity: number;
        }[];
      };
    };

    Enums: {};
  };
}

// Tipos auxiliares para RBAC
export type RoleName = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

export type Permission = 
  | 'workspace.read'
  | 'workspace.write'
  | 'workspace.delete'
  | 'members.read'
  | 'members.write'
  | 'members.invite'
  | 'members.remove'
  | 'documents.read'
  | 'documents.write'
  | 'documents.delete'
  | 'chat.read'
  | 'chat.write'
  | 'settings.read'
  | 'settings.write'
  | 'audit.read';

export interface WorkspaceMemberWithDetails extends Database['public']['Tables']['workspace_members']['Row'] {
  user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
  role?: {
    id: string;
    name: RoleName;
    permissions: string[];
  };
}
