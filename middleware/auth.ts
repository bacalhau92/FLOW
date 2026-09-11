// Middleware de autenticação básica para API
import { Request, Response, NextFunction } from "express";
import { CONFIG } from "../config/index.js";

/**
 * Valida o header de autenticação da API
 * Em produção, usar JWT ou API Keys por usuário
 */
export function authenticateAPI(req: Request, res: Response, next: NextFunction) {
  // Em development, permitir sem auth se não houver secret configurada
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
      message: "API key necessária. Use o header 'X-Flow-API-Key' ou 'Authorization: Bearer <token>'",
    });
  }

  if (providedKey !== CONFIG.API_SECRET) {
    return res.status(403).json({
      success: false,
      error: "FORBIDDEN",
      message: "API key inválida",
    });
  }

  next();
}
