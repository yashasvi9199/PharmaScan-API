import { Router } from "express";
import scanRoutes from "./scan.routes";
import historyRoutes from "./history.routes";
import lookupRoutes from "./lookup.routes";
import productRoutes from "./product.routes";
import pharmacyRoutes from "./pharmacy.routes";
import authRoutes from "./auth.routes";

const router = Router();

// Mount feature routes
router.use("/scan", scanRoutes);
router.use("/history", historyRoutes);
router.use("/lookup", lookupRoutes);
router.use("/products", productRoutes);
router.use("/pharmacies", pharmacyRoutes);
router.use("/auth", authRoutes);

export default router;
