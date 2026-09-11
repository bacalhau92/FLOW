// Rotas da API de IA
import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { CONFIG } from "../config/index.js";
import { authenticateAPI } from "../middleware/auth.js";
import { validateRequest, schemas } from "../middleware/validator.js";

const router = Router();

// Cliente AI
function getGeminiClient(): GoogleGenAI | null {
  if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: CONFIG.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "flow-saas",
      },
    },
  });
}

// Timeout wrapper
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout após ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// Fallbacks
function buildFallbackProject(prompt: string, workspaceName?: string) {
  const cleanTitle = prompt.length > 35 ? prompt.slice(0, 35) + "..." : prompt;
  return {
    name: cleanTitle,
    description: `Projeto estruturado para "${prompt}".`,
    color: "#6366f1",
    icon: "Layers",
    priority: "ALTA" as const,
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
        description: `Estabelecer objetivos para ${cleanTitle}.`,
        columnId: "col-todo",
        priority: "ALTA" as const,
        estimatedHours: 4,
        subtasks: [
          { title: "Briefing detalhado", completed: true },
          { title: "Definição de marcos", completed: false },
        ],
      },
      {
        title: "Execução da primeira fase",
        description: "Desenvolvimento das primeiras entregas.",
        columnId: "col-in-progress",
        priority: "URGENTE" as const,
        estimatedHours: 12,
        subtasks: [
          { title: "Desenvolvimento", completed: false },
          { title: "Ponto de situação", completed: false },
        ],
      },
    ],
  };
}

function buildFallbackTasks(prompt: string, projectName?: string) {
  return [
    {
      title: prompt.length > 50 ? prompt.slice(0, 50) + "..." : prompt,
      description: `Execução para ${projectName || "projeto"}.`,
      priority: "ALTA" as const,
      columnId: "col-todo",
      estimatedHours: 4,
      subtasks: [{ title: "Implementar solução", completed: false }],
    },
    {
      title: `Validação: ${projectName || "Geral"}`,
      description: "Assegurar conformidade.",
      priority: "MÉDIA" as const,
      columnId: "col-todo",
      estimatedHours: 3,
      subtasks: [{ title: "Conferência", completed: false }],
    },
  ];
}

function buildFallbackSummary(project: any, tasks: any[]) {
  const total = tasks?.length || 0;
  const done = tasks?.filter((t: any) => t.columnId === "col-done").length || 0;
  const inProgress = tasks?.filter((t: any) => t.columnId === "col-in-progress").length || 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return {
    progressPercent: pct,
    completedCount: done,
    pendingCount: total - done,
    inProgressCount: inProgress,
    executiveSummary: `Projeto "${project?.name || "Projeto"}" com ${pct}% de conclusão.`,
    keyAccomplishments: ["Planeamento estruturado", `${done} tarefas concluídas`],
    risks: [{ level: pct < 40 ? "MÉDIO" : "BAIXO", description: "Atenção aos prazos." }],
    nextSteps: ["Concluir tarefas prioritárias", "Rever dependências"],
  };
}

function buildFallbackCommand(command: string) {
  const lower = (command || "").toLowerCase();
  if (lower.includes("projeto") && (lower.includes("cria") || lower.includes("novo"))) {
    return {
      action: "CREATE_PROJECT",
      intent: "Criar novo projeto",
      payload: { name: command.replace(/cria(r)?\s+(um\s+)?projeto\s+(para\s+)?/i, "").trim() || "Novo Projeto" },
      message: "Identifiquei intenção de criar projeto.",
    };
  }
  if (lower.includes("atrasad") || lower.includes("pendent")) {
    return {
      action: "FILTER_OVERDUE",
      intent: "Filtrar tarefas atrasadas",
      payload: {},
      message: "Apresentando tarefas com prazo expirado.",
    };
  }
  return {
    action: "GENERAL_ANSWER",
    intent: "Assistente FLOW",
    payload: {},
    message: `Comando interpretado: "${command}".`,
  };
}

// Call AI com fallback
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  options: { contents: string; systemInstruction?: string; responseMimeType?: string; temperature?: number },
  timeoutMs: number = CONFIG.AI_TIMEOUT_MS
): Promise<string> {
  let lastError: any = null;

  for (const model of CONFIG.AI_FALLBACK_MODELS) {
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
      console.warn(`[FLOW AI] Modelo ${model}: ${err?.message}`);
      lastError = err;
    }
  }

  throw lastError;
}

// Aplicar autenticação em todas as rotas
router.use(authenticateAPI);

// POST /api/ai/create-project
router.post("/create-project", validateRequest(schemas.createProject), async (req, res) => {
  const { prompt, workspaceName } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({ success: true, project: buildFallbackProject(prompt, workspaceName) });
  }

  try {
    const systemInstruction = `Você é o assistente de gestão de projetos da FLOW.
Responda EXCLUSIVAMENTE com JSON sem markdown:
{
  "name": "Nome do projeto",
  "description": "Descrição clara",
  "color": "#6366f1",
  "icon": "Briefcase|Folder|Target|Rocket|Compass",
  "priority": "BAIXA|MÉDIA|ALTA|URGENTE",
  "tasks": [{"title": "...", "description": "...", "columnId": "col-todo|col-backlog|col-in-progress", "priority": "...", "estimatedHours": 4, "subtasks": [...]}]
}`;

    const text = await callGeminiWithFallback(ai, {
      contents: `Cria projeto para: ${prompt} no Workspace "${workspaceName || "Principal"}"`,
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.7,
    });

    const projectData = JSON.parse(text.trim());
    res.json({ success: true, project: projectData });
  } catch (error: any) {
    console.warn("[FLOW AI] Fallback create-project:", error?.message);
    res.json({ success: true, project: buildFallbackProject(prompt, workspaceName) });
  }
});

// POST /api/ai/generate-tasks
router.post("/generate-tasks", validateRequest(schemas.generateTasks), async (req, res) => {
  const { prompt, projectName, existingTasks } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({ success: true, tasks: buildFallbackTasks(prompt, projectName) });
  }

  try {
    const systemInstruction = `Gere tarefas detalhadas em JSON:
{"tasks": [{"title": "...", "description": "...", "priority": "...", "estimatedHours": 3, "subtasks": [...]}]}`;

    const text = await callGeminiWithFallback(ai, {
      contents: `Projeto: ${projectName}. Pedido: ${prompt}. Tarefas existentes: ${JSON.stringify(existingTasks || [])}`,
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.6,
    });

    const data = JSON.parse(text.trim());
    res.json({ success: true, ...data });
  } catch (error: any) {
    console.warn("[FLOW AI] Fallback generate-tasks:", error?.message);
    res.json({ success: true, tasks: buildFallbackTasks(prompt, projectName) });
  }
});

// POST /api/ai/summarize-project
router.post("/summarize-project", validateRequest(schemas.summarizeProject), async (req, res) => {
  const { project, tasks } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({ success: true, summary: buildFallbackSummary(project, tasks) });
  }

  try {
    const systemInstruction = `Analise projeto e gere relatório em JSON:
{"progressPercent": 65, "completedCount": 4, "pendingCount": 2, "inProgressCount": 2, "executiveSummary": "...", "keyAccomplishments": [], "risks": [{"level": "BAIXO|MÉDIO|ALTO", "description": "..."}], "nextSteps": []}`;

    const text = await callGeminiWithFallback(ai, {
      contents: `Projeto: ${JSON.stringify(project)}. Tarefas: ${JSON.stringify(tasks)}`,
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.5,
    });

    const data = JSON.parse(text.trim());
    res.json({ success: true, summary: data });
  } catch (error: any) {
    console.warn("[FLOW AI] Fallback summarize:", error?.message);
    res.json({ success: true, summary: buildFallbackSummary(project, tasks) });
  }
});

// POST /api/ai/command
router.post("/command", validateRequest(schemas.command), async (req, res) => {
  const { command, currentContext } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({ success: true, ...buildFallbackCommand(command) });
  }

  try {
    const systemInstruction = `Interprete comando e responda em JSON:
{"action": "CREATE_PROJECT|CREATE_TASK|FILTER_OVERDUE|SHOW_DAILY_BRIEFING|ANALYZE_RISKS|NAVIGATE|GENERAL_ANSWER", "intent": "...", "message": "...", "payload": {...}, "requiresConfirmation": boolean}`;

    const text = await callGeminiWithFallback(ai, {
      contents: `Comando: "${command}". Contexto: ${JSON.stringify(currentContext || {})}`,
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.4,
    });

    const data = JSON.parse(text.trim());
    res.json({ success: true, ...data });
  } catch (error: any) {
    console.warn("[FLOW AI] Fallback command:", error?.message);
    res.json({ success: true, ...buildFallbackCommand(command) });
  }
});

export default router;
