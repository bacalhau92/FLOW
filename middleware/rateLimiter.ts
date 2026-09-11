// Middleware de rate limiting simples
import { Request, Response, NextFunction } from "express";
import { CONFIG } from "../config/index.js";

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const requestMap = new Map<string, RateLimitInfo>();

/**
 * Rate limiting por IP para prevenir abuso e ataques DDoS
 */
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  
  const record = requestMap.get(ip);
  
  if (!record || now > record.resetTime) {
    // Novo窗口 ou janela expirada
    requestMap.set(ip, {
      count: 1,
      resetTime: now + CONFIG.RATE_LIMIT_WINDOW_MS,
    });
    return next();
  }
  
  // Janela ainda ativa
  if (record.count >= CONFIG.RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader("Retry-After", retryAfter.toString());
    return res.status(429).json({
      success: false,
      error: "TOO_MANY_REQUESTS",
      message: `Muitas requisições. Limite de ${CONFIG.RATE_LIMIT_MAX_REQUESTS} por ${CONFIG.RATE_LIMIT_WINDOW_MS / 1000}s.`,
      retryAfter,
    });
  }
  
  // Incrementa contador
  record.count++;
  requestMap.set(ip, record);
  next();
}

// Limpeza periódica do mapa (opcional, para produção usar Redis)
setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of requestMap.entries()) {
    if (now > info.resetTime) {
      requestMap.delete(ip);
    }
  }
}, CONFIG.RATE_LIMIT_WINDOW_MS);
