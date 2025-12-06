// controlled by CORS_ORIGIN (comma-separated list). Keeps things explicit and
// avoids extra package dependencies.

import app from "./app";

const PORT = Number(process.env.PORT ?? 3000);
const rawOrigins = process.env.CORS_ORIGIN ?? ""; // comma-separated list

function parseOrigins(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const allowedOrigins = parseOrigins(rawOrigins);

// Simple CORS middleware (applies to all routes)
app.use((req, res, next) => {
  if (allowedOrigins.length === 0) {
    // permissive for local dev when CORS_ORIGIN isn't configured
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://localhost:${PORT} (NODE_ENV=${process.env.NODE_ENV ?? "undefined"})`);
});
