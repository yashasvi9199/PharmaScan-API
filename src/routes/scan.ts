import express from "express";
import type { Request, Response } from "express";

const router = express.Router();

router.get("/", (_req: Request, res:Response) => {
    res.json({
        feature: "scan",
        status: "ready"
    });
});

router.post("/parse", (req: Request, res: Response) => {
    const payload = req.body ?? {};
    res.json({
        ok: true,
        received: payload,
        parsed: {
            medicineName: null,
            batch: null,
            expiry: null,
            note: "stub - OCR not implemented yet"
        },
    });
});

export default router;