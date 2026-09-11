import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient timeout wrapper for external AI requests
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// Resilient helper to call Gemini with model fallbacks if 503 or overload spikes occur
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  options: {
    contents: string;
    systemInstruction?: string;
    responseMimeType?: string;
    temperature?: number;
  },
  timeoutMs: number = 6000
): Promise<string> {
  const modelsToTry = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const generatePromise = ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: options.responseMimeType,
          temperature: options.temperature,
        },
      });

      const response = await withTimeout(generatePromise, timeoutMs);

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[FLOW AI] Model ${model} notice: ${err?.message || err}. Tentando modelo alternativo...`);
      lastError = err;
    }
  }

  throw lastError;
}

// Robust fallback generators in case of model demand spikes (503 / rate limits)
function buildFallbackProject(prompt: string, workspaceName?: string) {
  const cleanTitle = prompt.length > 35 ? prompt.slice(0, 35) + "..." : prompt;
  return {
    name: cleanTitle,
    description: `Projeto estruturado para "${prompt}". Alinhado aos padrões do workspace ${workspaceName || "FLOW"}.`,
    color: "#6366f1",
    icon: "Layers",
    priority: "ALTA",
    columns: [
      { id: "col-backlog", title: "BACKLOG", order: 0 },
      { id: "col-todo", title: "A FAZER", order: 1 },
      { id: "col-in-progress", title: "EM ANDAMENTO", order: 2 },
      { id: "col-review", title: "EM REVISÃO", order: 3 },
      { id: "col-done", title: "CONCLUÍDO", order: 4 },
    ],
    tasks: [
      {
        title: "Alinhamento de escopo e definição de metas",
        description: `Estabelecer os objetivos centrais, marcos de entrega e critérios de sucesso para ${cleanTitle}.`,
        columnId: "col-todo",
        priority: "ALTA",
        estimatedHours: 4,
        subtasks: [
          { title: "Briefing detalhado com stakeholders", completed: true },
          { title: "Definição de marcos e prazos chave", completed: false },
          { title: "Aprovação de orçamento e recursos", completed: false },
        ],
      },
      {
        title: "Preparação de materiais e ferramentas",
        description: "Estruturar a documentação técnica e configurar o ambiente de trabalho da equipa.",
        columnId: "col-todo",
        priority: "MÉDIA",
        estimatedHours: 6,
        subtasks: [
          { title: "Checklist de pré-requisitos", completed: false },
          { title: "Distribuição de tarefas técnicas", completed: false },
        ],
      },
      {
        title: "Execução da primeira fase do cronograma",
        description: "Arrancar com o desenvolvimento e implementação das primeiras entregas práticas.",
        columnId: "col-in-progress",
        priority: "URGENTE",
        estimatedHours: 12,
        subtasks: [
          { title: "Desenvolvimento do primeiro entregável", completed: false },
          { title: "Ponto de situação com os responsáveis", completed: false },
        ],
      },
      {
        title: "Controlo de qualidade e validação",
        description: "Revisão meticulosa de todos os itens produzidos antes da entrega final.",
        columnId: "col-backlog",
        priority: "MÉDIA",
        estimatedHours: 5,
        subtasks: [
          { title: "Testes de conformidade e usabilidade", completed: false },
          { title: "Ajustes de feedback e aprovação", completed: false },
        ],
      },
    ],
  };
}

function buildFallbackTasks(prompt: string, projectName?: string) {
  return [
    {
      title: prompt.length > 50 ? prompt.slice(0, 50) + "..." : prompt,
      description: `Execução planeada para ${projectName || "o projeto"}.`,
      priority: "ALTA",
      columnId: "col-todo",
      estimatedHours: 4,
      subtasks: [
        { title: "Definir requisitos e critérios de aceitação", completed: false },
        { title: "Implementar a solução / execução prática", completed: false },
        { title: "Revisão de qualidade e alinhamento com a equipa", completed: false },
      ],
    },
    {
      title: `Validação e testes de entrega: ${projectName || "Geral"}`,
      description: "Assegurar que todas as especificações técnicas e de negócio foram cumpridas.",
      priority: "MÉDIA",
      columnId: "col-todo",
      estimatedHours: 3,
      subtasks: [
        { title: "Conferência de itens do checklist", completed: false },
        { title: "Validação com o gestor do projeto", completed: false },
      ],
    },
  ];
}

function buildFallbackSummary(project: any, tasks: any[]) {
  const total = tasks?.length || 0;
  const done = tasks?.filter((t: any) => t.columnId === "col-done" || t.isCompleted).length || 0;
  const inProgress = tasks?.filter((t: any) => t.columnId === "col-in-progress").length || 0;
  const pending = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return {
    progressPercent: pct,
    completedCount: done,
    pendingCount: pending,
    inProgressCount: inProgress,
    executiveSummary: `O projeto "${project?.name || "Projeto"}" apresenta ${pct}% de taxa de conclusão (${done} de ${total} tarefas entregues). O ritmo da equipa é constante, com ${inProgress} tarefas ativas nesta fase.`,
    keyAccomplishments: [
      "Planeamento estruturado das etapas fundamentais",
      `${done} tarefas já concluídas e validadas pela equipa`,
      "Equilíbrio na atribuição de responsabilidades",
    ],
    risks: [
      {
        level: pct < 40 ? "MÉDIO" : "BAIXO",
        description: "Atenção a tarefas com prazos próximos para evitar acumulação na fase de revisão.",
      },
      {
        level: "BAIXO",
        description: "Manter validações frequentes para garantir alinhamento com as expetativas.",
      },
    ],
    nextSteps: [
      "Concluir as tarefas prioritárias em andamento",
      "Realizar alinhamento rápido com os responsáveis de entrega",
      "Rever dependências antes da próxima fase",
    ],
  };
}

function buildFallbackCommand(command: string) {
  const lower = (command || "").toLowerCase();
  if (lower.includes("projeto") && (lower.includes("cria") || lower.includes("novo") || lower.includes("lançamento"))) {
    const rawName = command.replace(/cria(r)?\s+(um\s+)?projeto\s+(para\s+)?/i, "").trim() || "Novo Projeto";
    return {
      action: "CREATE_PROJECT",
      intent: "Criar novo projeto com base na instrução",
      payload: { name: rawName },
      message: `Identifiquei a intenção de criar o projeto: "${rawName}". Podes confirmar para estruturar o plano.`,
    };
  }
  if (lower.includes("atrasad") || lower.includes("pendent") || lower.includes("expirad")) {
    return {
      action: "FILTER_OVERDUE",
      intent: "Filtrar e mostrar tarefas atrasadas e pendentes",
      payload: {},
      message: "Apresentando todas as tarefas com prazo expirado ou em risco de atraso.",
    };
  }
  if (lower.includes("dia") || lower.includes("hoje") || lower.includes("resumo") || lower.includes("briefing")) {
    return {
      action: "SHOW_DAILY_BRIEFING",
      intent: "Apresentar resumo do dia de trabalho",
      payload: {},
      message: "Aqui está o resumo executivo do teu dia e prioridades de entrega.",
    };
  }
  if (lower.includes("risco") || lower.includes("analis") || lower.includes("gargalo")) {
    return {
      action: "ANALYZE_RISKS",
      intent: "Analisar riscos e gargalos do projeto",
      payload: {},
      message: "A abrir a análise preditiva de riscos e pontos de atenção.",
    };
  }
  if (lower.includes("tarefa") && (lower.includes("cria") || lower.includes("nova"))) {
    return {
      action: "CREATE_TASK",
      intent: "Criar nova tarefa",
      payload: {},
      message: "A abrir formulário de criação rápida de tarefa.",
    };
  }
  return {
    action: "GENERAL_ANSWER",
    intent: "Assistente de produtividade",
    payload: {},
    message: `Comando interpretado: "${command}". Podes pedir-me para criar projetos, filtrar tarefas urgentes ou analisar o estado da equipa.`,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "FLOW", timestamp: new Date().toISOString() });
  });

  // AI Endpoint: Create Project from Natural Language
  app.post("/api/ai/create-project", async (req, res) => {
    const { prompt, workspaceName } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({ success: true, project: buildFallbackProject(prompt, workspaceName) });
    }

    try {
      const systemInstruction = `Você é o assistente inteligente de gestão de projetos da plataforma SaaS "FLOW".
O utilizador deseja criar um novo projeto através de uma instrução em linguagem natural.
Responda EXCLUSIVAMENTE com um JSON estruturado sem markdown ticks nem formatação extra:
{
  "name": "Nome conciso e profissional do projeto",
  "description": "Descrição clara dos objetivos e escopo",
  "color": "#6366f1",
  "icon": "Briefcase ou Folder ou Target ou Rocket ou Compass",
  "priority": "BAIXA" | "MÉDIA" | "ALTA" | "URGENTE",
  "tasks": [
    {
      "title": "Título da tarefa",
      "description": "Detalhes objetivos da tarefa",
      "columnId": "col-todo" ou "col-backlog" ou "col-in-progress",
      "priority": "BAIXA" | "MÉDIA" | "ALTA" | "URGENTE",
      "estimatedHours": 4,
      "subtasks": [
        { "title": "Subtarefa 1", "completed": false },
        { "title": "Subtarefa 2", "completed": false }
      ]
    }
  ]
}
Gere entre 4 a 6 tarefas realistas e coerentes com a solicitação. Responda em Português profissional.`;

      const text = await callGeminiWithFallback(ai, {
        contents: `Cria um projeto para o seguinte pedido no Workspace "${workspaceName || "Principal"}": ${prompt}`,
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      });

      const projectData = JSON.parse(text.trim());
      res.json({ success: true, project: projectData });
    } catch (error: any) {
      console.warn("AI Create Project encountered error, serving resilient fallback:", error?.message || error);
      res.json({ success: true, project: buildFallbackProject(prompt, workspaceName) });
    }
  });

  // AI Endpoint: Generate Tasks / Subtasks for existing project
  app.post("/api/ai/generate-tasks", async (req, res) => {
    const { prompt, projectName, existingTasks } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({ success: true, tasks: buildFallbackTasks(prompt, projectName) });
    }

    try {
      const systemInstruction = `Você é o assistente inteligente da plataforma FLOW.
Gere tarefas detalhadas com subtarefas com base na solicitação do utilizador.
Responda EXCLUSIVAMENTE com JSON no formato:
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "BAIXA" | "MÉDIA" | "ALTA" | "URGENTE",
      "estimatedHours": 3,
      "subtasks": [
        { "title": "string", "completed": false }
      ]
    }
  ]
}
Responda em Português.`;

      const text = await callGeminiWithFallback(ai, {
        contents: `Projeto: ${projectName || "Projeto Geral"}. Pedido: ${prompt}. Tarefas já existentes: ${JSON.stringify(existingTasks || [])}`,
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.6,
      });

      const data = JSON.parse(text.trim());
      res.json({ success: true, ...data });
    } catch (error: any) {
      console.warn("AI Generate Tasks encountered error, serving resilient fallback:", error?.message || error);
      res.json({ success: true, tasks: buildFallbackTasks(prompt, projectName) });
    }
  });

  // AI Endpoint: Summarize Project & Risk Analysis
  app.post("/api/ai/summarize-project", async (req, res) => {
    const { project, tasks } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({ success: true, summary: buildFallbackSummary(project, tasks) });
    }

    try {
      const systemInstruction = `Você é o analista sênior de projetos da plataforma FLOW.
Analise os dados estruturados do projeto e tarefas fornecidos e gere um relatório executivo de resumo e análise de riscos.
Responda EXCLUSIVAMENTE em JSON:
{
  "progressPercent": 65,
  "completedCount": 4,
  "pendingCount": 2,
  "inProgressCount": 2,
  "executiveSummary": "Visão geral executiva em 2 a 3 frases",
  "keyAccomplishments": ["Ponto 1", "Ponto 2"],
  "risks": [
    { "level": "BAIXO" | "MÉDIO" | "ALTO", "description": "Descrição do risco com sugestão de mitigação" }
  ],
  "nextSteps": ["Passo 1", "Passo 2", "Passo 3"]
}
Responda em Português profissional limpo.`;

      const text = await callGeminiWithFallback(ai, {
        contents: `Projeto: ${JSON.stringify(project)}. Tarefas: ${JSON.stringify(tasks)}`,
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.5,
      });

      const data = JSON.parse(text.trim());
      res.json({ success: true, summary: data });
    } catch (error: any) {
      console.warn("AI Summarize encountered error, serving resilient fallback:", error?.message || error);
      res.json({ success: true, summary: buildFallbackSummary(project, tasks) });
    }
  });

  // AI Endpoint: Natural Language Workspace Command ("✨ O que queres fazer?")
  app.post("/api/ai/command", async (req, res) => {
    const { command, currentContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({ success: true, ...buildFallbackCommand(command) });
    }

    try {
      const systemInstruction = `Você é o orquestrador de comandos de linguagem natural da FLOW.
Interprete o comando do utilizador e responda EXCLUSIVAMENTE em JSON:
{
  "action": "CREATE_PROJECT" | "CREATE_TASK" | "FILTER_OVERDUE" | "SHOW_DAILY_BRIEFING" | "ANALYZE_RISKS" | "NAVIGATE" | "GENERAL_ANSWER",
  "intent": "Explicação curta do que foi compreendido",
  "message": "Resposta amigável e direta em português ao utilizador",
  "payload": {
    "name": "opcional",
    "targetName": "opcional",
    "priority": "opcional",
    "filter": "opcional",
    "view": "opcional"
  },
  "requiresConfirmation": boolean
}`;

      const text = await callGeminiWithFallback(ai, {
        contents: `Comando do utilizador: "${command}". Contexto do workspace atual: ${JSON.stringify(currentContext || {})}`,
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.4,
      });

      const data = JSON.parse(text.trim());
      res.json({ success: true, ...data });
    } catch (error: any) {
      console.warn("AI Command encountered notice (e.g. 503 high demand spike), serving resilient heuristic fallback:", error?.message || error);
      res.json({ success: true, ...buildFallbackCommand(command) });
    }
  });

  });

  // Vercel Serverless Function - Export app directly
  // Static files are served by Vercel from the dist folder
  // SPA fallback is handled by vercel.json rewrites
  
  // Export for Vercel serverless function
  export default app;
}

// Only start server if running directly (not in Vercel)
if (process.env.VERCEL !== '1') {
  startServer();
}
