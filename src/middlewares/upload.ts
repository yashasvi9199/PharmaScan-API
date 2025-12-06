// src/middlewares/upload.ts
// Minimal multer-based upload middleware that keeps file in memory and exposes
// a normalized `req.fileBuffer` and `req.filename` for downstream handlers.

import { Request, Response, NextFunction } from "express";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

// Extend Request type locally for middleware usage
export interface UploadRequest extends Request {
  fileBuffer?: Buffer;
  filename?: string;
}

// Single-file middleware (form key: "file")
export const singleFileUpload = (req: Request, res: Response, next: NextFunction) => {
  const handler = upload.single("file");

  handler(req, res, (err: unknown) => {
    if (err) {
      return res.status(400).json({ error: "file upload failed", detail: (err as Error).message });
    }

    const r = req as UploadRequest;
    if (r.file) {
      r.fileBuffer = r.file.buffer;
      r.filename = r.file.originalname || r.file.filename || "upload";
    }
    next();
  });
};
