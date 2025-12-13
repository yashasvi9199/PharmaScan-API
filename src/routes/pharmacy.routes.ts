import { Router } from "express";
import { getPharmacies, getPharmacyById } from "../controllers/pharmacy.controller";

const router = Router();

router.get("/", getPharmacies);
router.get("/:id", getPharmacyById);

export default router;
