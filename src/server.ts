import express from "express";
import type {Request, Response} from "express";
import scanRouter from "./routes/scan.js"

const app = express();
app.use(express.json());

// Temp root for vercel
app.get("/", (_req: Request, res: Response) => {
    res.json( {status: "PharmaScan API running"} ); 
});

// feature router
app.use("/api/scan", scanRouter); 

export default app;