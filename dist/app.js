"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cors_2 = require("./config/cors");
const env_1 = require("./config/env");
const middlewares_1 = require("./middlewares");
const logger_1 = require("./utils/logger");
const routes_1 = __importDefault(require("./routes"));
// Create express app
const app = (0, express_1.default)();
// Apply global middleware
app.use((0, cors_1.default)(cors_2.corsConfig));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: false }));
// Apply rate limiting to API routes
app.use("/api", middlewares_1.apiRateLimit);
// Mount API routes
app.use("/api", routes_1.default);
// Health endpoint for readiness checks
app.get("/", (_req, res) => {
    res.json({
        message: "PharmaScan API is running",
        version: env_1.env.API_VERSION,
        env: env_1.env.NODE_ENV,
    });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ success: false, error: "Not Found" });
});
// Global Error Handler
app.use((err, _req, res, _next) => {
    logger_1.logger.error(`Unhandled Error: ${err.message}`);
    res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: env_1.env.NODE_ENV === "development" ? err.message : undefined,
    });
});
logger_1.logger.info("Express app initialized");
exports.default = app;
//# sourceMappingURL=app.js.map