# Documentação: Sistema RBAC e Gestão de Workspace

## Visão Geral

Este projeto implementa um sistema profissional de **RBAC (Role-Based Access Control)** para gestão de workspaces colaborativos, integrado com Supabase como base de dados.

## Estrutura de Papéis (Roles)

### Hierarquia de Papéis

| Papel | Nível | Descrição |
|-------|-------|-----------|
| **OWNER** | 5 | Proprietário com acesso total |
| **ADMIN** | 4 | Administrador sem acesso a billing |
| **MANAGER** | 3 | Gestor de projetos e equipas |
| **MEMBER** | 2 | Membro padrão da equipa |
| **VIEWER** | 1 | Visualizador apenas leitura |

### Permissões por Papel

#### OWNER (Proprietário)
- ✅ Gestão completa do workspace
- ✅ Faturamento e subscrições
- ✅ Configurações globais
- ✅ Gestão de membros (todos os níveis)
- ✅ Integrações externas
- ✅ Log de auditoria
- ✅ Criar, ler, atualizar, eliminar todos os recursos

#### ADMIN (Administrador)
- ✅ Gestão de workspace (exceto billing)
- ✅ Gestão de membros (exceto OWNER)
- ✅ Configurações do workspace
- ✅ Integrações
- ✅ Log de auditoria
- ✅ Projetos, tarefas, documentos, equipas

#### MANAGER (Gestor)
- ✅ Gestão de projetos e tarefas
- ✅ Gestão de equipas
- ✅ Automações
- ❌ Sem acesso a configurações do workspace
- ❌ Sem gestão de membros

#### MEMBER (Membro)
- ✅ Colaboração em projetos
- ✅ Criar e editar tarefas
- ✅ Criar documentos
- ❌ Apenas leitura em configurações
- ❌ Sem gestão de membros

#### VIEWER (Visualizador)
- ✅ Acesso de leitura a projetos
- ✅ Visualização de documentos
- ❌ Sem edição ou criação
- ❌ Acesso limitado

## Ficheiros Implementados

### 1. `/types/index.ts`
Tipos TypeScript para todo o sistema RBAC:
- `Permission`: Interface de permissões
- `RoleDefinition`: Definição completa de papéis
- `WorkspaceMember`: Membro de workspace
- `WorkspaceSettings`: Configurações do workspace
- Interfaces estendidas de `User` e `Workspace`

### 2. `/services/rbac.ts`
Lógica central de controlo de acesso:
- `ROLE_DEFINITIONS`: Mapeamento completo de papéis
- `hasPermission()`: Verifica permissão específica
- `hasCapability()`: Verifica capacidades especiais
- `canInviteMembers()`: Valida convites
- `canRemoveMembers()`: Valida remoções
- `ROLE_HIERARCHY`: Números de hierarquia
- `isRoleAtLeast()`: Compara níveis de papel
- `canModifyUserRole()`: Valida mudança de papéis
- `getAssignableRoles()`: Retorna papéis atribuíveis

### 3. `/services/workspaceService.ts`
Serviços de integração com Supabase:
- Gestão de membros do workspace
- Convites e ativações
- Atualização de papéis
- Configurações do workspace
- Log de auditoria
- Verificação de permissões
- Inicialização de workspaces

### 4. `/supabase-schema.sql`
Schema completo da base de dados:
- 10 tabelas principais
- Row Level Security (RLS)
- Triggers automáticos
- Índices otimizados
- Políticas de segurança
- Funções utilitárias

## Como Configurar no Supabase

### Passo 1: Executar Schema SQL
1. Aceda ao dashboard do Supabase
2. Vá para **SQL Editor**
3. Copie o conteúdo de `/supabase-schema.sql`
4. Execute o script completo

### Passo 2: Configurar Variáveis de Ambiente
Crie um ficheiro `.env` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projecto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### Passo 3: Obter Chaves API
1. No dashboard Supabase, vá para **Settings** → **API**
2. Copie a **Project URL** para `VITE_SUPABASE_URL`
3. Copie a **anon public** key para `VITE_SUPABASE_ANON_KEY`

### Passo 4: Configurar Authentication
No Supabase:
1. Vá para **Authentication** → **Providers**
2. Ative **Email** provider
3. Para desenvolvimento, desative **Confirm email**
4. Configure templates de email de convite

## Utilização na Aplicação

### Exemplo: Verificar Permissão

```typescript
import { hasPermission, canInviteMembers } from './services/rbac';
import { useAuth } from './context/AuthContext';

function InviteButton() {
  const { user } = useAuth();
  
  if (!user || !hasPermission(user.role, 'member', 'invite')) {
    return null; // Não mostra botão
  }
  
  return <button>Convidar Membro</button>;
}
```

### Exemplo: Proteger Rota

```typescript
import { isRoleAtLeast } from './services/rbac';

function SettingsPage({ user }) {
  if (!isRoleAtLeast(user.role, 'ADMIN')) {
    return <AccessDenied />;
  }
  
  return <SettingsContent />;
}
```

### Exemplo: Convidar Membro

```typescript
import { inviteWorkspaceMember } from './services/workspaceService';

async function handleInvite(email: string, role: UserRole) {
  try {
    await inviteWorkspaceMember(
      workspaceId,
      email,
      role,
      currentUser.id
    );
    // Sucesso!
  } catch (error) {
    console.error('Falha ao convidar:', error);
  }
}
```

### Exemplo: Log de Auditoria

```typescript
import { logAuditEvent } from './services/workspaceService';

// Quando eliminar projeto
await logAuditEvent(
  workspaceId,
  userId,
  'project_deleted',
  'project',
  projectId,
  { projectName: 'Meu Projeto' }
);
```

## Tabelas da Base de Dados

### Principais Tabelas

1. **profiles** - Dados dos usuários
2. **workspaces** - Espaços de trabalho
3. **workspace_members** - Membros e papéis
4. **workspace_settings** - Configurações
5. **audit_logs** - Log de atividades
6. **teams** - Equipas
7. **projects** - Projetos
8. **tasks** - Tarefas
9. **documents** - Documentos
10. **automation_rules** - Automações

### Segurança RLS

Todas as tabelas têm **Row Level Security** ativado com políticas que garantem:
- Usuários veem apenas seus workspaces
- Apenas OWNER/ADMIN gerem membros
- Apenas OWNER vê logs de auditoria críticos
- Membros ativos têm acesso apropriado

## Próximos Passos Sugeridos

1. **UI de Gestão de Membros**: Criar modal para convites e gestão de papéis
2. **Página de Configurações**: Interface para administrar workspace
3. **Dashboard de Auditoria**: Visualizar logs de atividades
4. **Convites por Email**: Integrar com serviço de email
5. **SSO por Domínio**: Permitir registro automático por domínio corporativo

## Notas Importantes

- ⚠️ Sempre verifique permissões no frontend E backend (RLS)
- ⚠️ Logs de auditoria são essenciais para compliance
- ⚠️ Teste todas as combinações de papéis antes de produção
- ⚠️ Mantenha backup das configurações de RLS

---

**Autor**: Sistema Flow Project Manager  
**Versão**: 1.0.0  
**Última atualização**: 2026
