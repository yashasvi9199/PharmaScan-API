import { Request, Response } from "express";

export async function login(req: Request, res: Response) {
  res.json({ success: true, token: "placeholder-token" });
}

export async function register(req: Request, res: Response) {
  res.json({ success: true, user: { id: "1", email: req.body.email } });
}

export async function me(req: Request, res: Response) {
  res.json({ success: true, user: { id: "1", email: "test@example.com" } });
}
