// src/middlewares/upload.ts
// Minimal multer-based upload middleware that keeps file in memory and exposes
// a normalized `req.fileBuffer` and `req.filename` for downstream handlers.

import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { Buffer } from "buffer";

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Extend Request type locally for middleware usage
export interface UploadRequest extends Request {
  file?: Express.Multer.File;
  fileBuffer?: Buffer;
  filename?: string;
}

export const handleUploadError = (err: Error, _req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

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
