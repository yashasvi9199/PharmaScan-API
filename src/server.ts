import express from "express";
import type {Request, Response} from "express";

const app = express();
app.use(express.json());

// Temp root for vercel
app.get("/", (_req: Request, res: Response) => {
    res.json( {status: "PharmaScan API running"} );
});

export default app;