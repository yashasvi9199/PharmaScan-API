// src/config/env.ts
// Environment configuration loader

interface EnvConfig {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  CORS_ORIGINS: string[];
  API_VERSION: string;
  REDIS_URL: string;
  LOG_LEVEL: string;
}

function parseEnv(): EnvConfig {
  const nodeEnv = process.env.NODE_ENV || "development";
  const port = parseInt(process.env.PORT || "10000", 10);
  const allowLocalhost = process.env.LOCALHOST === "true";
  
  const corsOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o: string) => o.trim())
    .filter(Boolean);

  if (allowLocalhost) {
    corsOrigins.push("http://localhost:5173", "http://localhost:3000");
  }

  return {
    NODE_ENV: nodeEnv as EnvConfig["NODE_ENV"],
    PORT: port,
    CORS_ORIGINS: corsOrigins,
    API_VERSION: process.env.API_VERSION || "1.0.0",
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
  };
}

export const env = parseEnv();

export default env;
