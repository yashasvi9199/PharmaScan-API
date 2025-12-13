import { Request, Response } from "express";

export async function getPharmacies(req: Request, res: Response) {
  res.json({ success: true, data: [] });
}

export async function getPharmacyById(req: Request, res: Response) {
  res.json({ success: true, data: null });
}
