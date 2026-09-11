var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express3 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_cors = __toESM(require("cors"), 1);

// config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var CONFIG = {
  // Server
  PORT: parseInt(process.env.PORT || "3000", 10),
  HOST: process.env.HOST || "0.0.0.0",
  NODE_ENV: process.env.NODE_ENV || "development",
  // API Security
  API_SECRET: process.env.FLOW_API_SECRET || "flow-dev-secret-change-in-prod",
  RATE_LIMIT_WINDOW_MS: 6e4,
  // 1 minuto
  RATE_LIMIT_MAX_REQUESTS: 30,
  // 30 requisições por minuto por IP
  // AI Settings
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  AI_TIMEOUT_MS: 6e3,
  AI_FALLBACK_MODELS: ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.1-flash-lite"],
  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173", "http://localhost:3000"],
  // Request limits
  MAX_REQUEST_SIZE: "10mb"
};

// middleware/rateLimiter.ts
var requestMap = /* @__PURE__ */ new Map();
function rateLimiter(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const record = requestMap.get(ip);
  if (!record || now > record.resetTime) {
    requestMap.set(ip, {
      count: 1,
      resetTime: now + CONFIG.RATE_LIMIT_WINDOW_MS
    });
    return next();
  }
  if (record.count >= CONFIG.RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1e3);
    res.setHeader("Retry-After", retryAfter.toString());
    return res.status(429).json({
      success: false,
      error: "TOO_MANY_REQUESTS",
      message: `Muitas requisi\xE7\xF5es. Limite de ${CONFIG.RATE_LIMIT_MAX_REQUESTS} por ${CONFIG.RATE_LIMIT_WINDOW_MS / 1e3}s.`,
      retryAfter
    });
  }
  record.count++;
  requestMap.set(ip, record);
  next();
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of requestMap.entries()) {
    if (now > info.resetTime) {
      requestMap.delete(ip);
    }
  }
}, CONFIG.RATE_LIMIT_WINDOW_MS);

// middleware/logger.ts
function requestLogger(req, res, next) {
  const start = Date.now();
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      ip,
      userAgent: req.headers["user-agent"]
    };
    if (CONFIG.NODE_ENV === "development") {
      const color = res.statusCode >= 500 ? "\x1B[31m" : res.statusCode >= 400 ? "\x1B[33m" : "\x1B[36m";
      const reset = "\x1B[0m";
      console.log(`${color}[FLOW]${reset} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    } else {
      console.log(JSON.stringify(log));
    }
  });
  res.on("error", (error) => {
    const log = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      method: req.method,
      path: req.originalUrl,
      ip,
      userAgent: req.headers["user-agent"],
      error: error.message
    };
    console.error("[FLOW ERROR]", JSON.stringify(log));
  });
  next();
}
function errorHandler(err, req, res, next) {
  const log = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    method: req.method,
    path: req.originalUrl,
    ip: req.ip || "unknown",
    error: err.message || "Unknown error"
  };
  console.error("[FLOW ERROR]", JSON.stringify(log));
  const isDev = CONFIG.NODE_ENV === "development";
  res.status(err.status || 500).json({
    success: false,
    error: isDev ? err.message : "INTERNAL_SERVER_ERROR",
    ...isDev && { stack: err.stack }
  });
}

// routes/ai.ts
var import_express = require("express");
var import_genai = require("@google/genai");

// middleware/auth.ts
function authenticateAPI(req, res, next) {
  if (CONFIG.NODE_ENV === "development" && CONFIG.API_SECRET === "flow-dev-secret-change-in-prod") {
    return next();
  }
  const authHeader = req.headers["x-flow-api-key"];
  const bearerToken = req.headers["authorization"]?.split(" ")[1];
  const providedKey = authHeader || bearerToken;
  if (!providedKey) {
    return res.status(401).json({
      success: false,
      error: "UNAUTHORIZED",
      message: "API key necess\xE1ria. Use o header 'X-Flow-API-Key' ou 'Authorization: Bearer <token>'"
    });
  }
  if (providedKey !== CONFIG.API_SECRET) {
    return res.status(403).json({
      success: false,
      error: "FORBIDDEN",
      message: "API key inv\xE1lida"
    });
  }
  next();
}

// middleware/validator.ts
var import_zod = require("zod");
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const validatedReq = req;
      if (schema.shape.body) {
        validatedReq.validatedBody = schema.shape.body.parse(req.body);
      }
      if (schema.shape.query) {
        validatedReq.validatedQuery = schema.shape.query.parse(req.query);
      }
      if (schema.shape.params) {
        validatedReq.validatedParams = schema.shape.params.parse(req.params);
      }
      if (validatedReq.validatedBody) req.body = validatedReq.validatedBody;
      if (validatedReq.validatedQuery) req.query = validatedReq.validatedQuery;
      if (validatedReq.validatedParams) req.params = validatedReq.validatedParams;
      next();
    } catch (error) {
      if (error instanceof import_zod.z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Dados inv\xE1lidos na requisi\xE7\xE3o",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
      }
      next(error);
    }
  };
}
var schemas = {
  createProject: import_zod.z.object({
    body: import_zod.z.object({
      prompt: import_zod.z.string().min(5).max(500),
      workspaceName: import_zod.z.string().optional()
    })
  }),
  generateTasks: import_zod.z.object({
    body: import_zod.z.object({
      prompt: import_zod.z.string().min(5).max(500),
      projectName: import_zod.z.string().optional(),
      existingTasks: import_zod.z.array(import_zod.z.any()).optional()
    })
  }),
  summarizeProject: import_zod.z.object({
    body: import_zod.z.object({
      project: import_zod.z.object({}).passthrough(),
      tasks: import_zod.z.array(import_zod.z.any())
    })
  }),
  command: import_zod.z.object({
    body: import_zod.z.object({
      command: import_zod.z.string().min(1).max(300),
      currentContext: import_zod.z.object({}).passthrough().optional()
    })
  })
};

// routes/ai.ts
var router = (0, import_express.Router)();
function getGeminiClient() {
  if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new import_genai.GoogleGenAI({
    apiKey: CONFIG.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "flow-saas"
      }
    }
  });
}
function withTimeout(promise, timeoutMs) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout ap\xF3s ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}
function buildFallbackProject(prompt, workspaceName) {
  const cleanTitle = prompt.length > 35 ? prompt.slice(0, 35) + "..." : prompt;
  return {
    name: cleanTitle,
    description: `Projeto estruturado para "${prompt}".`,
    color: "#6366f1",
    icon: "Layers",
    priority: "ALTA",
    columns: [
      { id: "col-backlog", title: "BACKLOG", order: 0 },
      { id: "col-todo", title: "A FAZER", order: 1 },
      { id: "col-in-progress", title: "EM ANDAMENTO", order: 2 },
      { id: "col-review", title: "EM REVIS\xC3O", order: 3 },
      { id: "col-done", title: "CONCLU\xCDDO", order: 4 }
    ],
    tasks: [
      {
        title: "Alinhamento de escopo e defini\xE7\xE3o de metas",
        description: `Estabelecer objetivos para ${cleanTitle}.`,
        columnId: "col-todo",
        priority: "ALTA",
        estimatedHours: 4,
        subtasks: [
          { title: "Briefing detalhado", completed: true },
          { title: "Defini\xE7\xE3o de marcos", completed: false }
        ]
      },
      {
        title: "Execu\xE7\xE3o da primeira fase",
        description: "Desenvolvimento das primeiras entregas.",
        columnId: "col-in-progress",
        priority: "URGENTE",
        estimatedHours: 12,
        subtasks: [
          { title: "Desenvolvimento", completed: false },
          { title: "Ponto de situa\xE7\xE3o", completed: false }
        ]
      }
    ]
  };
}
function buildFallbackTasks(prompt, projectName) {
  return [
    {
      title: prompt.length > 50 ? prompt.slice(0, 50) + "..." : prompt,
      description: `Execu\xE7\xE3o para ${projectName || "projeto"}.`,
      priority: "ALTA",
      columnId: "col-todo",
      estimatedHours: 4,
      subtasks: [{ title: "Implementar solu\xE7\xE3o", completed: false }]
    },
    {
      title: `Valida\xE7\xE3o: ${projectName || "Geral"}`,
      description: "Assegurar conformidade.",
      priority: "M\xC9DIA",
      columnId: "col-todo",
      estimatedHours: 3,
      subtasks: [{ title: "Confer\xEAncia", completed: false }]
    }
  ];
}
function buildFallbackSummary(project, tasks) {
  const total = tasks?.length || 0;
  const done = tasks?.filter((t) => t.columnId === "col-done").length || 0;
  const inProgress = tasks?.filter((t) => t.columnId === "col-in-progress").length || 0;
  const pct = total > 0 ? Math.round(done / total * 100) : 0;
  return {
    progressPercent: pct,
    completedCount: done,
    pendingCount: total - done,
    inProgressCount: inProgress,
    executiveSummary: `Projeto "${project?.name || "Projeto"}" com ${pct}% de conclus\xE3o.`,
    keyAccomplishments: ["Planeamento estruturado", `${done} tarefas conclu\xEDdas`],
    risks: [{ level: pct < 40 ? "M\xC9DIO" : "BAIXO", description: "Aten\xE7\xE3o aos prazos." }],
    nextSteps: ["Concluir tarefas priorit\xE1rias", "Rever depend\xEAncias"]
  };
}
function buildFallbackCommand(command) {
  const lower = (command || "").toLowerCase();
  if (lower.includes("projeto") && (lower.includes("cria") || lower.includes("novo"))) {
    return {
      action: "CREATE_PROJECT",
      intent: "Criar novo projeto",
      payload: { name: command.replace(/cria(r)?\s+(um\s+)?projeto\s+(para\s+)?/i, "").trim() || "Novo Projeto" },
      message: "Identifiquei inten\xE7\xE3o de criar projeto."
    };
  }
  if (lower.includes("atrasad") || lower.includes("pendent")) {
    return {
      action: "FILTER_OVERDUE",
      intent: "Filtrar tarefas atrasadas",
      payload: {},
      message: "Apresentando tarefas com prazo expirado."
    };
  }
  return {
    action: "GENERAL_ANSWER",
    intent: "Assistente FLOW",
    payload: {},
    message: `Comando interpretado: "${command}".`
  };
}
async function callGeminiWithFallback(ai, options, timeoutMs = CONFIG.AI_TIMEOUT_MS) {
  let lastError = null;
  for (const model of CONFIG.AI_FALLBACK_MODELS) {
    try {
      const generatePromise = ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: options.responseMimeType,
          temperature: options.temperature
        }
      });
      const response = await withTimeout(generatePromise, timeoutMs);
      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn(`[FLOW AI] Modelo ${model}: ${err?.message}`);
      lastError = err;
    }
  }
  throw lastError;
}
router.use(authenticateAPI);
router.post("/create-project", validateRequest(schemas.createProject), async (req, res) => {
  const { prompt, workspaceName } = req.body;
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ success: true, project: buildFallbackProject(prompt, workspaceName) });
  }
  try {
    const systemInstruction = `Voc\xEA \xE9 o assistente de gest\xE3o de projetos da FLOW.
Responda EXCLUSIVAMENTE com JSON sem markdown:
{
  "name": "Nome do projeto",
  "description": "Descri\xE7\xE3o clara",
  "color": "#6366f1",
  "icon": "Briefcase|Folder|Target|Rocket|Compass",
  "priority": "BAIXA|M\xC9DIA|ALTA|URGENTE",
  "tasks": [{"title": "...", "description": "...", "columnId": "col-todo|col-backlog|col-in-progress", "priority": "...", "estimatedHours": 4, "subtasks": [...]}]
}`;
    const text = await callGeminiWithFallback(ai, {
      contents: `Cria projeto para: ${prompt} no Workspace "${workspaceName || "Principal"}"`,
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.7
    });
    const projectData = JSON.parse(text.trim());
    res.json({ success: true, project: projectData });
  } catch (error) {
    console.warn("[FLOW AI] Fallback create-project:", error?.message);
    res.json({ success: true, project: buildFallbackProject(prompt, workspaceName) });
  }
});
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
      temperature: 0.6
    });
    const data = JSON.parse(text.trim());
    res.json({ success: true, ...data });
  } catch (error) {
    console.warn("[FLOW AI] Fallback generate-tasks:", error?.message);
    res.json({ success: true, tasks: buildFallbackTasks(prompt, projectName) });
  }
});
router.post("/summarize-project", validateRequest(schemas.summarizeProject), async (req, res) => {
  const { project, tasks } = req.body;
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ success: true, summary: buildFallbackSummary(project, tasks) });
  }
  try {
    const systemInstruction = `Analise projeto e gere relat\xF3rio em JSON:
{"progressPercent": 65, "completedCount": 4, "pendingCount": 2, "inProgressCount": 2, "executiveSummary": "...", "keyAccomplishments": [], "risks": [{"level": "BAIXO|M\xC9DIO|ALTO", "description": "..."}], "nextSteps": []}`;
    const text = await callGeminiWithFallback(ai, {
      contents: `Projeto: ${JSON.stringify(project)}. Tarefas: ${JSON.stringify(tasks)}`,
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.5
    });
    const data = JSON.parse(text.trim());
    res.json({ success: true, summary: data });
  } catch (error) {
    console.warn("[FLOW AI] Fallback summarize:", error?.message);
    res.json({ success: true, summary: buildFallbackSummary(project, tasks) });
  }
});
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
      temperature: 0.4
    });
    const data = JSON.parse(text.trim());
    res.json({ success: true, ...data });
  } catch (error) {
    console.warn("[FLOW AI] Fallback command:", error?.message);
    res.json({ success: true, ...buildFallbackCommand(command) });
  }
});
var ai_default = router;

// routes/health.ts
var import_express2 = require("express");
var router2 = (0, import_express2.Router)();
router2.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "FLOW",
    version: "1.0.0",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    uptime: process.uptime()
  });
});
router2.get("/ready", (req, res) => {
  res.json({
    ready: true,
    services: {
      api: "ok",
      ai: process.env.GEMINI_API_KEY ? "configured" : "not-configured"
    }
  });
});
var health_default = router2;

// server.ts
async function startServer() {
  const app = (0, import_express3.default)();
  app.use((0, import_cors.default)({
    origin: CONFIG.ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Flow-API-Key"]
  }));
  app.use(rateLimiter);
  app.use(import_express3.default.json({ limit: CONFIG.MAX_REQUEST_SIZE }));
  app.use(import_express3.default.urlencoded({ extended: true, limit: CONFIG.MAX_REQUEST_SIZE }));
  app.use(requestLogger);
  app.use("/api/health", health_default);
  app.use("/api/ai", ai_default);
  app.use(errorHandler);
  if (CONFIG.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express3.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.log(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551           FLOW SaaS Platform                  \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551  Environment: ${CONFIG.NODE_ENV.padEnd(26)}\u2551
\u2551  Port:        ${CONFIG.PORT.toString().padEnd(30)}\u2551
\u2551  Host:        ${CONFIG.HOST.padEnd(29)}\u2551
\u2551  CORS:        ${CONFIG.ALLOWED_ORIGINS.length.toString().padEnd(29)} origins\u2551
\u2551  Rate Limit:  ${CONFIG.RATE_LIMIT_MAX_REQUESTS.toString().padEnd(15)} req/${(CONFIG.RATE_LIMIT_WINDOW_MS / 1e3).toString().padEnd(2)}s     \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
    `);
  });
}
startServer().catch((err) => {
  console.error("[FLOW] Falha cr\xEDtica ao iniciar servidor:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
