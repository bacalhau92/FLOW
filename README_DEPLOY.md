# FLOW - Guia de Deploy na Vercel

## Análise do Projeto

### ✅ Pontos Fortes
- **Arquitetura moderna**: React 19 + Vite 6 + TypeScript
- **Backend robusto**: Express com integração IA (Google Gemini)
- **UI completa**: TailwindCSS 4, Framer Motion, Lucide Icons
- **Resiliência**: Sistema de fallback para falhas da API de IA
- **Build funcional**: Script de build já configurado e testado

### ⚠️ Pontos de Atenção
1. **API Key necessária**: Precisa configurar `GEMINI_API_KEY` na Vercel
2. **Serverless function**: Backend adaptado para Functions da Vercel
3. **SPA Routing**: Rewrites configurados no vercel.json

## Estrutura Preparada para Vercel

```
/workspace
├── api/
│   └── server.ts          # Função serverless para rotas /api/*
├── dist/                  # Build de produção (gerado automaticamente)
│   ├── index.html
│   ├── assets/
│   └── server.cjs
├── components/
├── context/
├── services/
├── types/
├── vercel.json            # Configuração Vercel
└── package.json
```

## Passos para Deploy

### 1. Instalar Vercel CLI (opcional, mas recomendado)
```bash
npm install -g vercel
```

### 2. Login na Vercel
```bash
vercel login
```

### 3. Deploy (no diretório do projeto)
```bash
vercel
```

### 4. Configurar Variáveis de Ambiente
No dashboard da Vercel ou via CLI:
```bash
vercel env add GEMINI_API_KEY
```
Cole sua chave da API do Google Gemini quando solicitado.

### 5. Deploy de Produção
```bash
vercel --prod
```

## Configuração Automática

O arquivo `vercel.json` já está configurado com:
- **buildCommand**: Executa `npm run build`
- **outputDirectory**: `dist` (contém frontend + backend)
- **rewrites**: 
  - `/api/*` → função serverless `api/server.ts`
  - `/*` → `index.html` (para SPA routing)
- **functions**: Configura memória (1024MB) e timeout (60s) para a API

## Endpoints da API

Após o deploy, sua API estará disponível em:
- `https://seu-projeto.vercel.app/api/health`
- `https://seu-projeto.vercel.app/api/ai/create-project`
- `https://seu-projeto.vercel.app/api/ai/generate-tasks`
- `https://seu-projeto.vercel.app/api/ai/summarize-project`
- `https://seu-projeto.vercel.app/api/ai/command`

## Teste Local (antes de deploy)

```bash
# Build de produção
npm run build

# Preview local (simula ambiente production)
npm run start
```

## Troubleshooting

### Erro: "GEMINI_API_KEY not configured"
- A API funcionará em modo fallback (dados mockados)
- Para ativar IA real, adicione a variável no dashboard da Vercel

### Erro: "Function invocation failed"
- Verifique logs: `vercel logs`
- Aumente memory/timeout no vercel.json se necessário

### Frontend não carrega
- Verifique se `dist/index.html` existe após build
- Confira rewrites no vercel.json

---

**Projeto pronto para deploy!** 🚀
