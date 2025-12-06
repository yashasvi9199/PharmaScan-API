import { Router } from "express";
import { handleScan } from "../controllers/scan.controller";
import { singleFileUpload } from "../middlewares/upload";

const router = Router();

router.post("/", singleFileUpload, handleScan);

export default router;
