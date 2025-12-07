import express from "express";
import cors from "cors";

// Create express app and apply minimal global middleware.
// This file is intentionally defensive: if you already have route modules
// under ./routes, we'll try to mount them, but failure will not crash the app.
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

try {
  const routesModule = require("./routes");
  // routesModule may export a Router or an object with default
  const router = routesModule?.default ?? routesModule;
  if (router && typeof router === "function") {
    app.use("/api", router);
  }
} catch (err) {
  // ignore: routes folder may not exist yet in all branches
  // console.debug("No routes mounted:", (err as Error).message);
}

// Health endpoint for readiness checks (fast, no DB work).
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

export default app;
