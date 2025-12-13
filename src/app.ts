import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { corsConfig } from "./config/cors";
import { env } from "./config/env";
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
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "PharmaScan API is running",
    version: env.API_VERSION,
    env: env.NODE_ENV,
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Not Found" });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled Error: ${err.message}`);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: env.NODE_ENV === "development" ? err.message : undefined,
  });
});

logger.info("Express app initialized");

export default app;
