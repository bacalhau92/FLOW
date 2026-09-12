-- Habilitar extensão para vetores (RAG)
create extension if not exists vector;

-- Tabela de Documentos para RAG
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  title text not null,
  content text not null, -- Texto completo ou chunk
  metadata jsonb default '{}'::jsonb, -- Metadados (autor, data, tipo de arquivo)
  embedding vector(1536), -- Embedding OpenAI (dimensão 1536)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para Performance de Produção
create index idx_documents_workspace on public.documents(workspace_id);
create index idx_documents_embedding on public.documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index idx_documents_metadata on public.documents using gin (metadata);

-- Tabela de Histórico de Chat (Contexto para o RAG)
create table public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  created_at timestamptz default now()
);

create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  sources jsonb default '[]'::jsonb, -- Referências aos documentos usados no RAG
  created_at timestamptz default now()
);

create index idx_chat_sessions_user on public.chat_sessions(user_id);
create index idx_chat_messages_session on public.chat_messages(session_id);

-- Políticas de Segurança (RLS) - CRÍTICO PARA PRODUÇÃO
alter table public.documents enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- Política para Documents: Apenas membros do workspace podem ver/editar
create policy "Membros do workspace podem ver documentos"
on public.documents for select
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = documents.workspace_id
    and wm.user_id = auth.uid()
    and wm.status = 'active'
  )
);

create policy "Admins/Owners podem inserir documentos"
on public.documents for insert
with check (
  exists (
    select 1 from public.workspace_members wm
    join public.roles r on r.id = wm.role_id
    where wm.workspace_id = documents.workspace_id
    and wm.user_id = auth.uid()
    and r.name in ('owner', 'admin', 'manager')
  )
);

-- Política para Chat: Usuário dono da sessão
create policy "Usuários veem seus próprios chats"
on public.chat_sessions for select
using (auth.uid() = user_id);

create policy "Usuários criam seus próprios chats"
on public.chat_sessions for insert
with check (auth.uid() = user_id);

create policy "Mensagens visíveis aos participantes da sessão"
on public.chat_messages for select
using (
  exists (
    select 1 from public.chat_sessions cs
    where cs.id = chat_messages.session_id
    and cs.user_id = auth.uid()
  )
);

-- Função para Busca Híbrida (RAG Profissional)
-- Combina similaridade de cosseno com filtro de workspace
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int default 5,
  filter_workspace_id uuid
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where d.workspace_id = filter_workspace_id
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;
