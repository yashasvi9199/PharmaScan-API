// src/config/cors.ts
// CORS configuration

import { env } from "./env";

export const corsConfig = {
  origin: env.CORS_ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export default corsConfig;
