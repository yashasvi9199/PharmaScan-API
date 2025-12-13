import { Request, Response } from "express";

export async function getProducts(req: Request, res: Response) {
  res.json({ success: true, data: [] });
}

export async function getProductById(req: Request, res: Response) {
  res.json({ success: true, data: null });
}
