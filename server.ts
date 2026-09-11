// FLOW SaaS Platform - Server Principal
// Arquitetura refatorada com separação de responsabilidades
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { CONFIG } from "./config/index.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { requestLogger, errorHandler } from "./middleware/logger.js";
import aiRoutes from "./routes/ai.js";
import healthRoutes from "./routes/health.js";

async function startServer() {
  const app = express();

  // ============================================
  // SECURITY MIDDLEWARES
  // ============================================
  
  // CORS configurado explicitamente
  app.use(cors({
    origin: CONFIG.ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Flow-API-Key"],
  }));

  // Rate limiting para prevenir abuso/DDoS
  app.use(rateLimiter);

  // Body parser com limite de tamanho
  app.use(express.json({ limit: CONFIG.MAX_REQUEST_SIZE }));
  app.use(express.urlencoded({ extended: true, limit: CONFIG.MAX_REQUEST_SIZE }));

  // ============================================
  // LOGGING
  // ============================================
  app.use(requestLogger);

  // ============================================
  // API ROUTES
  // ============================================
  
  // Health check (público, sem auth)
  app.use("/api/health", healthRoutes);
  
  // AI routes (com autenticação, validação e rate limiting)
  app.use("/api/ai", aiRoutes);

  // ============================================
  // ERROR HANDLING
  // ============================================
  app.use(errorHandler);

  // ============================================
  // VITE INTEGRATION (Dev only)
  // ============================================
  if (CONFIG.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // ============================================
  // START SERVER
  // ============================================
  app.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║           FLOW SaaS Platform                  ║
╠═══════════════════════════════════════════════╣
║  Environment: ${CONFIG.NODE_ENV.padEnd(26)}║
║  Port:        ${CONFIG.PORT.toString().padEnd(30)}║
║  Host:        ${CONFIG.HOST.padEnd(29)}║
║  CORS:        ${CONFIG.ALLOWED_ORIGINS.length.toString().padEnd(29)} origins║
║  Rate Limit:  ${CONFIG.RATE_LIMIT_MAX_REQUESTS.toString().padEnd(15)} req/${(CONFIG.RATE_LIMIT_WINDOW_MS / 1000).toString().padEnd(2)}s     ║
╚═══════════════════════════════════════════════╝
    `);
  });
}

startServer().catch((err) => {
  console.error("[FLOW] Falha crítica ao iniciar servidor:", err);
  process.exit(1);
});
