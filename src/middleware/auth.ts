import { Context, Next } from 'hono';
import { validateSession } from '../lib/auth';
import type { User, Session } from '../types';

interface AuthContext {
  user?: User;
  session?: Session;
}

declare module 'hono' {
  interface ContextVariableMap {
    user?: User;
    session?: Session;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authorization = c.req.header('Authorization');
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authorization.substring(7);
  const db = c.env.DB as D1Database;
  const jwtSecret = c.env.JWT_SECRET || 'development-secret';
  
  const result = await validateSession(db, token, jwtSecret);
  
  if (!result) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
  
  c.set('user', result.user);
  c.set('session', result.session);
  
  await next();
}

export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get('user');
  
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  
  await next();
}

export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authorization = c.req.header('Authorization');
  
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.substring(7);
    const db = c.env.DB as D1Database;
    const jwtSecret = c.env.JWT_SECRET || 'development-secret';
    
    const result = await validateSession(db, token, jwtSecret);
    
    if (result) {
      c.set('user', result.user);
      c.set('session', result.session);
    }
  }
  
  await next();
}