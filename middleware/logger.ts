// Middleware de logging estruturado
import { Request, Response, NextFunction } from "express";
import { CONFIG } from "../config/index.js";

interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  statusCode?: number;
  durationMs?: number;
  ip: string;
  userAgent?: string;
  error?: string;
}

/**
 * Logger de requests para debugging e monitoramento
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  
  // Captura o status code após a resposta ser enviada
  res.on("finish", () => {
    const duration = Date.now() - start;
    const log: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      ip,
      userAgent: req.headers["user-agent"],
    };
    
    // Em produção, enviar para serviço de logs (ex: Datadog, CloudWatch)
    if (CONFIG.NODE_ENV === "development") {
      const color = res.statusCode >= 500 ? "\x1b[31m" : res.statusCode >= 400 ? "\x1b[33m" : "\x1b[36m";
      const reset = "\x1b[0m";
      console.log(`${color}[FLOW]${reset} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    } else {
      // Production: JSON log para sistemas externos
      console.log(JSON.stringify(log));
    }
  });
  
  // Captura erros não tratados
  res.on("error", (error) => {
    const log: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      ip,
      userAgent: req.headers["user-agent"],
      error: error.message,
    };
    console.error("[FLOW ERROR]", JSON.stringify(log));
  });
  
  next();
}

/**
 * Handler global de erros
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const log: LogEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    ip: req.ip || "unknown",
    error: err.message || "Unknown error",
  };
  
  console.error("[FLOW ERROR]", JSON.stringify(log));
  
  // Não expor detalhes do erro em produção
  const isDev = CONFIG.NODE_ENV === "development";
  
  res.status(err.status || 500).json({
    success: false,
    error: isDev ? err.message : "INTERNAL_SERVER_ERROR",
    ...(isDev && { stack: err.stack }),
  });
}
