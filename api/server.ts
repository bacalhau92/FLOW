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

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs)),
  ]);
}

async function callGeminiWithFallback(
  ai: any,
  prompt: string,
  timeoutMs: number = 8000
): Promise<string | null> {
  try {
    const response: any = await withTimeout(
      ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      }),
      timeoutMs
    );
    if (response && response.text) {
      return await response.text();
    }
    return null;
  } catch (error: any) {
    console.warn("Gemini API error:", error?.message || error);
    return null;
  }
}

function buildFallbackProject(prompt: string, workspaceName?: string) {
  const keywords: Record<string, any> = {
    marketing: { name: "Campanha de Marketing", icon: "📢", color: "#EC4899", description: "Planeamento e execução de campanha" },
    website: { name: "Desenvolvimento Website", icon: "🌐", color: "#3B82F6", description: "Criação ou redesign de site" },
    mobile: { name: "App Mobile", icon: "📱", color: "#8B5CF6", description: "Desenvolvimento de aplicação móvel" },
    evento: { name: "Organização de Evento", icon: "🎉", color: "#F59E0B", description: "Planeamento completo de evento" },
    produto: { name: "Lançamento de Produto", icon: "🚀", color: "#10B981", description: "Go-to-market de novo produto" },
  };

  let selected = keywords.produto;
  const lower = prompt.toLowerCase();
  if (lower.includes("marketing") || lower.includes("campanha")) selected = keywords.marketing;
  else if (lower.includes("site") || lower.includes("website") || lower.includes("web")) selected = keywords.website;
  else if (lower.includes("app") || lower.includes("mobile") || lower.includes("móvel")) selected = keywords.mobile;
  else if (lower.includes("evento") || lower.includes("feira") || lower.includes("conferência")) selected = keywords.evento;

  const today = new Date();
  const targetDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

  return {
    name: selected.name,
    description: selected.description + (prompt.length > 20 ? ": " + prompt : ""),
    icon: selected.icon,
    color: selected.color,
    status: "Planejamento",
    priority: "ALTA",
    startDate: today.toISOString().split("T")[0],
    targetDate: targetDate.toISOString().split("T")[0],
  };
}

function buildFallbackTasks(prompt: string, projectName?: string) {
  const baseTasks = [
    { title: "Definir objetivos e requisitos", description: "Levantamento inicial", priority: "ALTA" as const, columnId: "col-todo" },
    { title: "Planeamento de recursos", description: "Alocação de equipa e orçamento", priority: "MÉDIA" as const, columnId: "col-todo" },
    { title: "Execução da fase 1", description: "Implementação inicial", priority: "MÉDIA" as const, columnId: "col-progress" },
    { title: "Revisão e validação", description: "QA e feedback", priority: "ALTA" as const, columnId: "col-review" },
    { title: "Entrega final", description: "Deploy e documentação", priority: "URGENTE" as const, columnId: "col-done" },
  ];

  const lower = prompt.toLowerCase();
  if (lower.includes("marketing")) {
    return [
      { title: "Briefing da campanha", description: "Objetivos, público e mensagem", priority: "ALTA" as const, columnId: "col-todo" },
      { title: "Criação de conteúdo", description: "Copy e design", priority: "MÉDIA" as const, columnId: "col-todo" },
      { title: "Configurar canais", description: "Redes sociais e ads", priority: "MÉDIA" as const, columnId: "col-progress" },
      { title: "Lançamento", description: "Go-live da campanha", priority: "URGENTE" as const, columnId: "col-review" },
      { title: "Análise de resultados", description: "KPIs e relatório", priority: "BAIXA" as const, columnId: "col-done" },
    ];
  }
  if (lower.includes("site") || lower.includes("web")) {
    return [
      { title: "Wireframes e UX", description: "Estrutura e navegação", priority: "ALTA" as const, columnId: "col-todo" },
      { title: "Design UI", description: "Interface visual", priority: "ALTA" as const, columnId: "col-todo" },
      { title: "Desenvolvimento Frontend", description: "HTML/CSS/JS", priority: "MÉDIA" as const, columnId: "col-progress" },
      { title: "Backend e Integrações", description: "API e database", priority: "MÉDIA" as const, columnId: "col-progress" },
      { title: "Testes e Deploy", description: "QA e publicação", priority: "URGENTE" as const, columnId: "col-review" },
    ];
  }
  return baseTasks;
}

function buildFallbackSummary(project: any, tasks: any[]) {
  return {
    projectTitle: project.name,
    overview: `Projeto "${project.name}" criado com ${tasks.length} tarefas principais.`,
    nextSteps: tasks.slice(0, 3).map((t: any) => `- **${t.title}**: ${t.description}`),
    tips: [
      "Defina responsáveis para cada tarefa",
      "Estabeleça datas de entrega realistas",
      "Revise o progresso semanalmente",
    ],
  };
}

function buildFallbackCommand(command: string) {
  const lower = command.toLowerCase();
  if (lower.includes("projeto") && (lower.includes("cria") || lower.includes("novo") || lower.includes("lançamento"))) {
    return { action: "create_project", data: buildFallbackProject(command) };
  }
  if (lower.includes("atrasad") || lower.includes("pendent") || lower.includes("expirad")) {
    return { action: "filter_tasks", data: { filter: "overdue" } };
  }
  if (lower.includes("dia") || lower.includes("hoje") || lower.includes("resumo") || lower.includes("briefing")) {
    return { action: "show_dashboard", data: {} };
  }
  if (lower.includes("risco") || lower.includes("analis") || lower.includes("gargalo")) {
    return { action: "analyze_risks", data: {} };
  }
  if (lower.includes("tarefa") && (lower.includes("cria") || lower.includes("nova"))) {
    return { action: "create_task", data: { title: "Nova Tarefa", description: command } };
  }
  return { action: "unknown", data: { message: "Comando não reconhecido" } };
}

const app = express();
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "FLOW", timestamp: new Date().toISOString() });
});

// AI Project Generation
app.post("/api/ai/generate-project", async (req, res) => {
  const { prompt, workspaceName } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  const ai = getGeminiClient();
  if (!ai) {
    const project = buildFallbackProject(prompt, workspaceName);
    return res.json({ success: true, project, source: "fallback" });
  }

  try {
    const sysPrompt = "You are a project management assistant. Output ONLY valid JSON.";
    const userPrompt = `Create a project based on: "${prompt}". Return JSON: {"name":"...", "description":"...", "icon":"emoji", "color":"#hex", "status":"Planejamento", "priority":"ALTA|MÉDIA|BAIXA", "startDate":"YYYY-MM-DD", "targetDate":"YYYY-MM-DD"}`;
    
    const text = await callGeminiWithFallback(ai, `${sysPrompt}\n\n${userPrompt}`, 8000);
    if (text) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const project = JSON.parse(jsonMatch[0]);
        return res.json({ success: true, project, source: "ai" });
      }
    }
  } catch (error: any) {
    console.warn("AI Project generation error:", error?.message || error);
  }

  const project = buildFallbackProject(prompt, workspaceName);
  res.json({ success: true, project, source: "fallback" });
});

// AI Task Generation
app.post("/api/ai/generate-tasks", async (req, res) => {
  const { prompt, projectName } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  const ai = getGeminiClient();
  if (!ai) {
    const tasks = buildFallbackTasks(prompt, projectName);
    return res.json({ success: true, tasks, source: "fallback" });
  }

  try {
    const sysPrompt = "You are a task planning assistant. Output ONLY valid JSON array.";
    const userPrompt = `Create 5-7 tasks for project "${projectName || prompt}". Return JSON array: [{"title":"...", "description":"...", "priority":"ALTA|MÉDIA|BAIXA|URGENTE", "columnId":"col-todo|col-progress|col-review|col-done"}]`;
    
    const text = await callGeminiWithFallback(ai, `${sysPrompt}\n\n${userPrompt}`, 8000);
    if (text) {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const tasks = JSON.parse(jsonMatch[0]);
        return res.json({ success: true, tasks, source: "ai" });
      }
    }
  } catch (error: any) {
    console.warn("AI Tasks generation error:", error?.message || error);
  }

  const tasks = buildFallbackTasks(prompt, projectName);
  res.json({ success: true, tasks, source: "fallback" });
});

// AI Summary
app.post("/api/ai/generate-summary", async (req, res) => {
  const { project, tasks } = req.body;
  if (!project) return res.status(400).json({ error: "Project required" });

  const ai = getGeminiClient();
  if (!ai) {
    const summary = buildFallbackSummary(project, tasks || []);
    return res.json({ success: true, summary, source: "fallback" });
  }

  try {
    const sysPrompt = "You are a project summary assistant. Output ONLY valid JSON.";
    const userPrompt = `Summarize project "${project.name}" with ${tasks?.length || 0} tasks. Return JSON: {"projectTitle":"...", "overview":"...", "nextSteps":["..."], "tips":["..."]}`;
    
    const text = await callGeminiWithFallback(ai, `${sysPrompt}\n\n${userPrompt}`, 8000);
    if (text) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const summary = JSON.parse(jsonMatch[0]);
        return res.json({ success: true, summary, source: "ai" });
      }
    }
  } catch (error: any) {
    console.warn("AI Summary generation error:", error?.message || error);
  }

  const summary = buildFallbackSummary(project, tasks || []);
  res.json({ success: true, summary, source: "fallback" });
});

// AI Command Parser
app.post("/api/ai/parse-command", async (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: "Command required" });

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ success: true, ...buildFallbackCommand(command), source: "fallback" });
  }

  try {
    const sysPrompt = "You are a command parser. Output ONLY valid JSON.";
    const userPrompt = `Parse command: "${command}". Return JSON: {"action":"create_project|create_task|filter_tasks|show_dashboard|analyze_risks", "data":{...}}`;
    
    const text = await callGeminiWithFallback(ai, `${sysPrompt}\n\n${userPrompt}`, 6000);
    if (text) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return res.json({ success: true, ...data, source: "ai" });
      }
    }
  } catch (error: any) {
    console.warn("AI Command parsing error:", error?.message || error);
  }

  res.json({ success: true, ...buildFallbackCommand(command), source: "fallback" });
});

// Vercel Serverless Function - Export app directly
export default app;

// Only start server if running directly (not in Vercel)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 FLOW API server running on port ${PORT}`);
  });
}
