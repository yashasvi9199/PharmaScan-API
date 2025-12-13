import express from "express";
import cors from "cors";
import { corsConfig } from "./config/cors";
import { errorHandler, apiRateLimit } from "./middlewares";
import { logger } from "./utils/logger";
import router from "./routes";

// Create express app
const app = express();

// Apply global middleware
app.use(cors(corsConfig));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

// Apply rate limiting to API routes
app.use("/api", apiRateLimit);

// Mount API routes
app.use("/api", router);

// Health endpoint for readiness checks
app.get("/health", (_req, res) => {
  res.status(200).json({ 
    ok: true, 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Not Found" });
});

// Global error handler (must be last)
app.use(errorHandler);

logger.info("Express app initialized");

export default app;
