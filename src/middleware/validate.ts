import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Extract clean errors
      const errors = result.error.issues.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }

    // Replace req.body with parsed (and sanitized) data
    req.body = result.data;

    next();
  };
};