import express from "express";

const app = express();
app.use(express.json());

// simple test route
app.get("/", (_req, res) => {
  res.send("Backend OK");
});

export default app;
