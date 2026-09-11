// Configurações centrais da aplicação FLOW
import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  // Server
  PORT: parseInt(process.env.PORT || "3000", 10),
  HOST: process.env.HOST || "0.0.0.0",
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // API Security
  API_SECRET: process.env.FLOW_API_SECRET || "flow-dev-secret-change-in-prod",
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minuto
  RATE_LIMIT_MAX_REQUESTS: 30, // 30 requisições por minuto por IP
  
  // AI Settings
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  AI_TIMEOUT_MS: 6000,
  AI_FALLBACK_MODELS: ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.1-flash-lite"],
  
  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173", "http://localhost:3000"],
  
  // Request limits
  MAX_REQUEST_SIZE: "10mb",
} as const;

export type Config = typeof CONFIG;
