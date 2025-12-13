// src/middlewares/validate.ts
// Request validation middleware

import { Request, Response, NextFunction } from "express";

type ValidatorFn = (value: unknown) => boolean;

interface ValidationRule {
  field: string;
  validator: ValidatorFn;
  message: string;
  optional?: boolean;
}

/**
 * Create a validation middleware from rules
 */
export function validate(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const body = req.body || {};
    const query = req.query || {};
    const params = req.params || {};

    for (const rule of rules) {
      // Check body, query, and params
      const value = body[rule.field] ?? query[rule.field] ?? params[rule.field];

      if (value === undefined || value === null || value === "") {
        if (!rule.optional) {
          errors.push(`${rule.field}: ${rule.message}`);
        }
        continue;
      }

      if (!rule.validator(value)) {
        errors.push(`${rule.field}: ${rule.message}`);
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
      return;
    }

    next();
  };
}

// Common validators
export const validators = {
  isString: (v: unknown): boolean => typeof v === "string",
  isNumber: (v: unknown): boolean => typeof v === "number" && !isNaN(v),
  isEmail: (v: unknown): boolean =>
    typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  isUUID: (v: unknown): boolean =>
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
  minLength:
    (min: number) =>
    (v: unknown): boolean =>
      typeof v === "string" && v.length >= min,
  maxLength:
    (max: number) =>
    (v: unknown): boolean =>
      typeof v === "string" && v.length <= max,
};
