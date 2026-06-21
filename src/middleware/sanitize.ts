import { Request, Response, NextFunction } from 'express';
import { sanitizeHtml } from '../utils/xss';

export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    sanitizeObjectDeep(req.body);
  }

  if (req.query) {
    for (const key of Object.keys(req.query)) {
      const val = req.query[key];
      if (typeof val === 'string') {
        req.query[key] = sanitizeHtml(val).slice(0, 500);
      }
    }
  }

  if (req.params) {
    for (const key of Object.keys(req.params)) {
      const val = req.params[key];
      if (typeof val === 'string') {
        req.params[key] = sanitizeHtml(val).slice(0, 200);
      }
    }
  }

  next();
}

function sanitizeObjectDeep(obj: Record<string, any>): void {
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeHtml(obj[key]).slice(0, 5000);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObjectDeep(obj[key]);
    }
  }
}
