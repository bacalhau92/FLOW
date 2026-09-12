-- ============================================
-- SCHEMA COMPLETO PARA GESTÃO DE WORKSPACE & RBAC
-- Copie e execute este SQL no Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABELA DE PERFIS DE USUÁRIOS (profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  title TEXT,
  role TEXT DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER')),
  team_id UUID,
  workspace_id UUID,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_workspace ON profiles(workspace_id);

-- ============================================
-- 2. TABELA DE WORKSPACES
-- ============================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  color TEXT DEFAULT '#6366f1',
  owner_id UUID NOT NULL REFERENCES profiles(id),
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);

-- ============================================
-- 3. TABELA DE MEMBROS DO WORKSPACE
-- ============================================
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  invited_by UUID REFERENCES profiles(id),
  suspended_at TIMESTAMPTZ,
  unsuspended_at TIMESTAMPTZ,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique user-workspace combination
  UNIQUE(workspace_id, user_id)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_status ON workspace_members(status);

-- ============================================
-- 4. TABELA DE CONFIGURAÇÕES DO WORKSPACE
-- ============================================
CREATE TABLE IF NOT EXISTS workspace_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  allow_public_projects BOOLEAN DEFAULT FALSE,
  allow_guest_access BOOLEAN DEFAULT FALSE,
  require_two_factor BOOLEAN DEFAULT FALSE,
  default_role TEXT DEFAULT 'MEMBER' CHECK (default_role IN ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER')),
  max_members INTEGER,
  allowed_domains TEXT[], -- Array de domínios para SSO
  custom_roles JSONB DEFAULT '[]'::jsonb,
  audit_log_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for workspace lookup
CREATE INDEX IF NOT EXISTS idx_workspace_settings_workspace ON workspace_settings(workspace_id);

-- ============================================
-- 5. TABELA DE LOG DE AUDITORIA
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace ON audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- 6. TABELA DE EQUIPAS (TEAMS)
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID NOT NULL REFERENCES profiles(id),
  member_ids UUID[] DEFAULT '{}',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_workspace ON teams(workspace_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON teams(leader_id);

-- ============================================
-- 7. TABELA DE PROJETOS
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#6366f1',
  owner_id UUID NOT NULL REFERENCES profiles(id),
  start_date DATE,
  target_date DATE,
  status TEXT DEFAULT 'Em andamento' CHECK (status IN ('Planejamento', 'Em andamento', 'Em pausa', 'Concluído', 'Cancelado')),
  priority TEXT DEFAULT 'MÉDIA' CHECK (priority IN ('BAIXA', 'MÉDIA', 'ALTA', 'URGENTE')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  member_ids UUID[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ============================================
-- 8. TABELA DE TAREFAS
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  column_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'MÉDIA' CHECK (priority IN ('BAIXA', 'MÉDIA', 'ALTA', 'URGENTE')),
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  collaborator_ids UUID[] DEFAULT '{}',
  labels TEXT[] DEFAULT '{}',
  start_date DATE,
  due_date DATE,
  estimated_hours DECIMAL(5,2),
  logged_hours DECIMAL(5,2) DEFAULT 0,
  subtasks JSONB DEFAULT '[]'::jsonb,
  dependencies UUID[] DEFAULT '{}',
  attachments_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(is_completed);

-- ============================================
-- 9. TABELA DE DOCUMENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_workspace ON documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_author ON documents(author_id);

-- ============================================
-- 10. TABELA DE AUTOMAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  trigger TEXT NOT NULL CHECK (trigger IN ('task_completed', 'task_overdue', 'task_created', 'status_changed_review')),
  condition_desc TEXT,
  action TEXT NOT NULL CHECK (action IN ('move_to_done', 'set_high_priority', 'assign_project_owner', 'notify_manager')),
  action_desc TEXT,
  executions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_workspace ON automation_rules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_automation_active ON automation_rules(active);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE SEGURANÇA
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA PROFILES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile on signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to read profiles of members in their workspaces
CREATE POLICY "Users can view workspace members"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.user_id = profiles.id
      AND wm.workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================
-- POLÍTICAS PARA WORKSPACES
-- ============================================

-- Members can view their workspaces
CREATE POLICY "Members can view workspaces"
  ON workspaces FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspaces.id
      AND wm.user_id = auth.uid()
      AND wm.status = 'active'
    )
  );

-- Owners and admins can update workspaces
CREATE POLICY "Owners and admins can update workspaces"
  ON workspaces FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspaces.id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('OWNER', 'ADMIN')
      AND wm.status = 'active'
    )
  );

-- ============================================
-- POLÍTICAS PARA WORKSPACE_MEMBERS
-- ============================================

-- Active members can view other members in their workspace
CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Owners and admins can invite/remove members
CREATE POLICY "Owners and admins can manage members"
  ON workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('OWNER', 'ADMIN')
      AND wm.status = 'active'
    )
  );

-- ============================================
-- POLÍTICAS PARA WORKSPACE_SETTINGS
-- ============================================

-- Members can view settings
CREATE POLICY "Members can view workspace settings"
  ON workspace_settings FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Owners and admins can update settings
CREATE POLICY "Owners and admins can update workspace settings"
  ON workspace_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_settings.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('OWNER', 'ADMIN')
      AND wm.status = 'active'
    )
  );

-- ============================================
-- POLÍTICAS PARA AUDIT_LOGS
-- ============================================

-- Only owners and admins can view audit logs
CREATE POLICY "Owners and admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = audit_logs.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('OWNER', 'ADMIN')
      AND wm.status = 'active'
    )
  );

-- System can insert audit logs (via service role or triggers)
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- TRIGGERS E FUNÇÕES
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_members_updated_at
  BEFORE UPDATE ON workspace_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_settings_updated_at
  BEFORE UPDATE ON workspace_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    'MEMBER',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to auto-increment member count
CREATE OR REPLACE FUNCTION increment_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE workspaces
  SET member_count = member_count + 1,
      updated_at = NOW()
  WHERE id = NEW.workspace_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE workspaces
  SET member_count = GREATEST(member_count - 1, 0),
      updated_at = NOW()
  WHERE id = OLD.workspace_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_member_added
  AFTER INSERT ON workspace_members
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION increment_member_count();

CREATE TRIGGER on_member_removed
  AFTER DELETE ON workspace_members
  FOR EACH ROW
  WHEN (OLD.status = 'active')
  EXECUTE FUNCTION decrement_member_count();

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Inserir um workspace padrão se necessário
-- INSERT INTO workspaces (id, name, slug, color, owner_id, member_count)
-- VALUES ('ws-prime', 'PRIME ACADEMY', 'prime-academy', '#6366f1', [OWNER_ID], 1);

-- ============================================
-- COMENTÁRIOS NAS TABELAS (DOCUMENTAÇÃO)
-- ============================================

COMMENT ON TABLE profiles IS 'Perfis de usuários autenticados';
COMMENT ON TABLE workspaces IS 'Espaços de trabalho colaborativos';
COMMENT ON TABLE workspace_members IS 'Membros e suas permissões por workspace';
COMMENT ON TABLE workspace_settings IS 'Configurações e políticas de cada workspace';
COMMENT ON TABLE audit_logs IS 'Log de auditoria para rastreamento de atividades';
COMMENT ON TABLE teams IS 'Equipas dentro de um workspace';
COMMENT ON TABLE projects IS 'Projetos organizados por workspace e equipa';
COMMENT ON TABLE tasks IS 'Tarefas individuais dentro de projetos';
COMMENT ON TABLE documents IS 'Documentação e wikis do workspace';
COMMENT ON TABLE automation_rules IS 'Regras de automação de fluxos de trabalho';

COMMENT ON COLUMN workspace_members.role IS 'Papel RBAC: OWNER, ADMIN, MANAGER, MEMBER, VIEWER';
COMMENT ON COLUMN workspace_members.status IS 'Estado: active, pending, suspended';
COMMENT ON COLUMN workspace_members.permissions IS 'Permissões específicas em formato JSON';
COMMENT ON COLUMN workspace_settings.allowed_domains IS 'Domínios de email permitidos para SSO';
COMMENT ON COLUMN audit_logs.details IS 'Metadados adicionais da ação em JSON';

-- ============================================
-- FIM DO SCRIPT
-- ============================================
