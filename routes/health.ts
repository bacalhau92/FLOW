// Rotas de saúde e status da API
import { Router } from "express";

const router = Router();

/**
 * GET /api/health
 * Health check básico para monitoramento
 */
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "FLOW",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /api/ready
 * Verifica se todos os serviços estão prontos
 */
router.get("/ready", (req, res) => {
  // Aqui poderiamos verificar DB, AI service, etc.
  res.json({
    ready: true,
    services: {
      api: "ok",
      ai: process.env.GEMINI_API_KEY ? "configured" : "not-configured",
    },
  });
});

export default router;
