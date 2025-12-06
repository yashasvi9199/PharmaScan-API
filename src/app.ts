import express from "express";
import routes from "./routes/index";

const app = express();

// Basic middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount feature routes under /api
app.use("/api", routes);

export default app;
