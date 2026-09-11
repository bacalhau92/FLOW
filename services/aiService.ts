import { Project, Task } from "../types";

export interface AIProjectResult {
  name: string;
  description: string;
  color?: string;
  icon?: string;
  priority?: "BAIXA" | "MÉDIA" | "ALTA" | "URGENTE";
  tasks: Array<{
    title: string;
    description: string;
    columnId: string;
    priority: "BAIXA" | "MÉDIA" | "ALTA" | "URGENTE";
    estimatedHours?: number;
    subtasks?: Array<{ title: string; completed: boolean }>;
  }>;
}

export interface AISummaryResult {
  progressPercent: number;
  completedCount: number;
  pendingCount: number;
  inProgressCount: number;
  executiveSummary: string;
  keyAccomplishments: string[];
  risks: Array<{ level: "BAIXO" | "MÉDIO" | "ALTO"; description: string }>;
  nextSteps: string[];
}

export interface AICommandResult {
  action: "CREATE_PROJECT" | "CREATE_TASK" | "FILTER_OVERDUE" | "SHOW_DAILY_BRIEFING" | "ANALYZE_RISKS" | "NAVIGATE" | "GENERAL_ANSWER";
  intent: string;
  message: string;
  payload?: any;
  requiresConfirmation?: boolean;
}

export async function createProjectWithAI(prompt: string, workspaceName: string): Promise<AIProjectResult> {
  const res = await fetch("/api/ai/create-project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, workspaceName }),
  });
  if (!res.ok) {
    throw new Error("Falha ao comunicar com o servidor de IA");
  }
  const data = await res.json();
  return data.project;
}

export async function generateTasksWithAI(
  prompt: string,
  projectName: string,
  existingTasks: Task[]
): Promise<Array<{ title: string; description: string; priority: any; estimatedHours?: number; subtasks: any[] }>> {
  const res = await fetch("/api/ai/generate-tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      projectName,
      existingTasks: existingTasks.map((t) => t.title),
    }),
  });
  if (!res.ok) {
    throw new Error("Falha ao gerar tarefas com IA");
  }
  const data = await res.json();
  return data.tasks || [];
}

export async function summarizeProjectWithAI(project: Project, tasks: Task[]): Promise<AISummaryResult> {
  const res = await fetch("/api/ai/summarize-project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project, tasks }),
  });
  if (!res.ok) {
    throw new Error("Falha ao sintetizar projeto com IA");
  }
  const data = await res.json();
  return data.summary;
}

export async function naturalLanguageCommand(command: string, currentContext: any): Promise<AICommandResult> {
  try {
    const res = await fetch("/api/ai/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command, currentContext }),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    const lower = (command || "").toLowerCase();
    if (lower.includes("projeto") && (lower.includes("cria") || lower.includes("novo") || lower.includes("lançamento"))) {
      const rawName = command.replace(/cria(r)?\s+(um\s+)?projeto\s+(para\s+)?/i, "").trim() || "Novo Projeto";
      return {
        action: "CREATE_PROJECT",
        intent: "Criar novo projeto",
        payload: { name: rawName },
        message: `Identifiquei a intenção de criar o projeto: "${rawName}". Podes confirmar para estruturar o plano.`,
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
      intent: "Assistente de produtividade",
      payload: {},
      message: `Comando interpretado: "${command}". Podes utilizar a FLOW para criar projetos, organizar prazos e gerir a tua equipa.`,
    };
  }
}
