# 🔒 Guia de Segurança - FLOW SaaS Platform

## ✅ Melhorias de Segurança Implementadas

### 1. **Autenticação de API**
Todas as rotas `/api/ai/*` agora requerem autenticação via header:

```bash
# Header personalizado
curl -X POST http://localhost:3000/api/ai/command \
  -H "X-Flow-API-Key: sua-chave-secreta" \
  -H "Content-Type: application/json" \
  -d '{"command": "teste"}'

# Ou via Bearer token
curl -X POST http://localhost:3000/api/ai/command \
  -H "Authorization: Bearer sua-chave-secreta" \
  -H "Content-Type: application/json" \
  -d '{"command": "teste"}'
```

**Configuração:**
- Development: Autenticação opcional (para facilitar testes)
- Production: **OBRIGATÓRIO** configurar `FLOW_API_SECRET` no `.env`

### 2. **Rate Limiting**
Proteção contra abuso e ataques DDoS:
- **Limite:** 30 requisições por minuto por IP
- **Resposta HTTP 429:** Inclui header `Retry-After` com segundos para retry
- **Reset automático:** Janela deslizante de 60 segundos

### 3. **CORS Configurado**
Origens permitidas explicitamente:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://seusite.com
```

### 4. **Validação de Inputs (Zod)**
Todos os endpoints validam dados de entrada:
- Schema rigoroso para cada endpoint
- Erros detalhados com campos específicos
- Proteção contra injection attacks

### 5. **Logging Estruturado**
- Requests logados com timestamp, método, path, status, duração
- Erros capturados com stack trace em development
- JSON logs em production para integração com serviços externos

### 6. **Error Handling Global**
- Handler centralizado de erros
- Não expõe detalhes internos em production
- Stack trace apenas em development

---

## 🚀 Como Configurar para Produção

### Passo 1: Gerar API Secret Segura
```bash
# Gerar chave aleatória segura
openssl rand -hex 32
# Ou usar node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Passo 2: Configurar Variáveis de Ambiente
Crie um arquivo `.env.production`:
```env
# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Segurança - OBRIGATÓRIO EM PRODUÇÃO
FLOW_API_SECRET=sua-chave-secreta-gerada-acima

# CORS - Adicione seus domínios
ALLOWED_ORIGINS=https://seusite.com,https://app.seusite.com

# AI (opcional)
GEMINI_API_KEY=sua-gemini-api-key
```

### Passo 3: Build e Deploy
```bash
# Build para produção
npm run build

# Iniciar servidor production
npm start
```

---

## 📊 Arquitetura Refatorada

```
server.ts (90 linhas)
├── config/
│   └── index.ts         # Configurações centrais
├── middleware/
│   ├── auth.ts          # Autenticação API
│   ├── rateLimiter.ts   # Rate limiting
│   ├── validator.ts     # Validação Zod
│   └── logger.ts        # Logging estruturado
├── routes/
│   ├── ai.ts            # Rotas de IA (com auth + validation)
│   └── health.ts        # Health checks públicos
└── utils/               # Utilitários futuros
```

**Benefícios:**
- ✅ Separação de responsabilidades (Single Responsibility Principle)
- ✅ Código testável e mantível
- ✅ Fácil adição de novas rotas
- ✅ Middlewares reutilizáveis

---

## 🧪 Testes Manuais

### Health Check (público)
```bash
curl http://localhost:3000/api/health/health
# Retorna: {"status":"ok","app":"FLOW",...}
```

### Endpoint AI sem auth (development apenas)
```bash
curl -X POST http://localhost:3000/api/ai/command \
  -H "Content-Type: application/json" \
  -d '{"command": "criar projeto teste"}'
```

### Endpoint AI com auth (production)
```bash
curl -X POST http://localhost:3000/api/ai/command \
  -H "Content-Type: application/json" \
  -H "X-Flow-API-Key: sua-chave" \
  -d '{"command": "criar projeto teste"}'
```

### Testar Rate Limit
```bash
# Fazer 35 requests rápidas
for i in {1..35}; do 
  curl -s -X POST http://localhost:3000/api/ai/command \
    -H "Content-Type: application/json" \
    -d '{"command": "teste"}' > /dev/null
done

# 36ª request será bloqueada
curl -X POST http://localhost:3000/api/ai/command \
  -H "Content-Type: application/json" \
  -d '{"command": "teste"}'
# Retorna: HTTP 429 Too Many Requests
```

### Testar Validação
```bash
curl -X POST http://localhost:3000/api/ai/command \
  -H "Content-Type: application/json" \
  -d '{"command": ""}'
# Retorna: HTTP 400 VALIDATION_ERROR
```

---

## ⚠️ Próximos Passos Recomendados

1. **HTTPS/TLS**: Configurar certificado SSL (Let's Encrypt)
2. **API Keys por Usuário**: Implementar sistema de usuários com chaves individuais
3. **JWT Authentication**: Para sessões de frontend
4. **Redis para Rate Limiting**: Em produção com múltiplas instâncias
5. **Helmet.js**: Headers de segurança adicionais
6. **Monitoramento**: Integrar com Datadog, New Relic ou similar
7. **Tests Automatizados**: Unitários, integração e E2E

---

## 📝 Notas Importantes

- **Development**: Autenticação é bypassed se `FLOW_API_SECRET` não estiver configurada
- **Production**: **NUNCA** rode sem configurar `FLOW_API_SECRET`
- **API Keys**: Nunca commitar `.env` no git
- **Logs**: Em production, integrar com serviço externo (não apenas console.log)

---

**Status:** ✅ Falhas críticas de segurança resolvidas
**Próxima Auditoria:** Após implementação de HTTPS e JWT
