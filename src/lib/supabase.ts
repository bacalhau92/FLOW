import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Configuração Profissional para Produção
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas. Verifique o arquivo .env');
}

// Cliente Principal (Público)
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Mais seguro para produção
  },
  global: {
    headers: {
      'x-client-info': 'rag-workspace-prod'
    }
  },
  db: {
    schema: 'public'
  }
});

// Serviço de Autenticação
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, metadata?: { workspace_name?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Serviço RAG (Retrieval-Augmented Generation)
export const ragService = {
  // Upload de documento com embedding (chamar via Edge Function em produção)
  async uploadDocument(workspaceId: string, title: string, content: string, metadata: Record<string, any>) {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        workspace_id: workspaceId,
        title,
        content,
        metadata
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Database['public']['Tables']['documents']['Row'];
  },

  // Busca semântica usando a função match_documents
  async searchDocuments(workspaceId: string, queryEmbedding: number[], limit: number = 5) {
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_count: limit,
      filter_workspace_id: workspaceId
    });

    if (error) throw error;
    return data || [];
  },

  // Criar sessão de chat
  async createChatSession(workspaceId: string, userId: string, title?: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        title: title || 'Nova Conversa'
      })
      .select()
      .single();

    if (error) throw error;
    return data as Database['public']['Tables']['chat_sessions']['Row'];
  },

  // Adicionar mensagem ao chat
  async addMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string, sources?: any[]) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        sources: sources || []
      })
      .select()
      .single();

    if (error) throw error;
    return data as Database['public']['Tables']['chat_messages']['Row'];
  },

  // Obter histórico do chat
  async getChatHistory(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as Database['public']['Tables']['chat_messages']['Row'][];
  },

  // Listar sessões de chat do usuário
  async getUserChatSessions(userId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Database['public']['Tables']['chat_sessions']['Row'][];
  },

  // Deletar sessão de chat
  async deleteChatSession(sessionId: string) {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  }
};

// Serviço de Workspace e RBAC
export const workspaceService = {
  async getWorkspaceMembers(workspaceId: string) {
    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        *,
        user:users (id, email, full_name),
        role:roles (id, name, permissions)
      `)
      .eq('workspace_id', workspaceId)
      .eq('status', 'active');

    if (error) throw error;
    return (data || []) as any[];
  },

  async inviteMember(workspaceId: string, email: string, roleId: string) {
    const currentUser = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('workspace_invitations')
      .insert({
        workspace_id: workspaceId,
        email,
        role_id: roleId,
        invited_by: currentUser.data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Database['public']['Tables']['workspace_invitations']['Row'];
  },

  async updateMemberRole(memberId: string, roleId: string) {
    const { data, error } = await supabase
      .from('workspace_members')
      .update({ role_id: roleId } as any)
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data as Database['public']['Tables']['workspace_members']['Row'];
  },

  async removeMember(memberId: string) {
    const { error } = await supabase
      .from('workspace_members')
      .update({ status: 'inactive' } as any)
      .eq('id', memberId);

    if (error) throw error;
  },

  async getAuditLogs(workspaceId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:users (email, full_name)
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as any[];
  },

  async createWorkspace(name: string, description?: string) {
    const currentUser = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        name,
        description,
        owner_id: currentUser.data.user?.id
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data as Database['public']['Tables']['workspaces']['Row'];
  }
};

// Utilitários para Produção
export const productionUtils = {
  // Rate limiting simples no cliente
  requestQueue: new Map<string, { count: number; resetTime: number }>(),

  async rateLimitedRequest<T>(key: string, fn: () => Promise<T>, limit: number = 100, windowMs: number = 60000): Promise<T> {
    const now = Date.now();
    const record = this.requestQueue.get(key);

    if (!record || now > record.resetTime) {
      this.requestQueue.set(key, { count: 1, resetTime: now + windowMs });
    } else if (record.count >= limit) {
      throw new Error('Rate limit excedido. Tente novamente mais tarde.');
    } else {
      record.count++;
    }

    return fn();
  },

  // Cache simples para embeddings (evitar chamadas repetidas à API)
  embeddingCache: new Map<string, number[]>(),

  getCachedEmbedding(text: string): number[] | null {
    const hash = this.simpleHash(text);
    return this.embeddingCache.get(hash) || null;
  },

  setCachedEmbedding(text: string, embedding: number[]) {
    const hash = this.simpleHash(text);
    this.embeddingCache.set(hash, embedding);
  },

  simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  },

  // Formatar data para PT-BR
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Validar email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};

export default supabase;
