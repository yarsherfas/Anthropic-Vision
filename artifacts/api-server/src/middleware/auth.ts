import { createClient } from "@supabase/supabase-js";
import type { Request, Response, NextFunction } from "express";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthUser {
  id: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next();

  const token = authHeader.slice(7);
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) {
      req.user = { id: data.user.id, email: data.user.email };
    }
  } catch {
    // ignore — user stays undefined
  }
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  await optionalAuth(req, res, async () => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    next();
  });
}
