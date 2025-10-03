import { nanoid } from 'nanoid';
import type { User, Session, JWTPayload } from '../types';

// Simple JWT implementation for Cloudflare Workers
export class JWT {
  private static textEncoder = new TextEncoder();
  
  static async sign(payload: any, secret: string): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = this.base64url(JSON.stringify(header));
    const encodedPayload = this.base64url(JSON.stringify(payload));
    const message = `${encodedHeader}.${encodedPayload}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      this.textEncoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      this.textEncoder.encode(message)
    );
    
    const encodedSignature = this.base64url(signature);
    return `${message}.${encodedSignature}`;
  }
  
  static async verify(token: string, secret: string): Promise<any> {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) {
      throw new Error('Invalid token format');
    }
    
    const message = `${header}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      this.textEncoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureBuffer = this.base64urlDecode(signature);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      this.textEncoder.encode(message)
    );
    
    if (!isValid) {
      throw new Error('Invalid signature');
    }
    
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
    
    return decodedPayload;
  }
  
  private static base64url(input: string | ArrayBuffer): string {
    let binary: string;
    if (typeof input === 'string') {
      binary = btoa(input);
    } else {
      binary = btoa(String.fromCharCode(...new Uint8Array(input)));
    }
    return binary.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }
  
  private static base64urlDecode(input: string): ArrayBuffer {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
    const binary = atob(base64 + padding);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Password hashing using Web Crypto API (simplified for Cloudflare Workers)
export class Password {
  static async hash(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  static async verify(password: string, hash: string): Promise<boolean> {
    const computedHash = await this.hash(password);
    return computedHash === hash;
  }
}

// Auth helper functions
export async function createSession(
  db: D1Database,
  user: User,
  jwtSecret: string,
  sessionDuration: number = 86400
): Promise<{ token: string; session: Session }> {
  const sessionId = nanoid();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + sessionDuration;
  
  const payload: JWTPayload = {
    user_id: user.id,
    email: user.email,
    role: user.role,
    session_id: sessionId,
    iat: now,
    exp: expiresAt
  };
  
  const token = await JWT.sign(payload, jwtSecret);
  
  // Store session in database
  await db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at)
    VALUES (?, ?, ?, datetime(?, 'unixepoch'))
  `).bind(sessionId, user.id, token, expiresAt).run();
  
  const session: Session = {
    id: sessionId,
    user_id: user.id,
    token,
    expires_at: new Date(expiresAt * 1000).toISOString(),
    created_at: new Date().toISOString()
  };
  
  return { token, session };
}

export async function validateSession(
  db: D1Database,
  token: string,
  jwtSecret: string
): Promise<{ user: User; session: Session } | null> {
  try {
    const payload = await JWT.verify(token, jwtSecret) as JWTPayload;
    
    // Check if session exists in database
    const sessionResult = await db.prepare(`
      SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')
    `).bind(token).first();
    
    if (!sessionResult) {
      return null;
    }
    
    // Get user data
    const userResult = await db.prepare(`
      SELECT * FROM users WHERE id = ? AND is_active = true
    `).bind(payload.user_id).first();
    
    if (!userResult) {
      return null;
    }
    
    return {
      user: userResult as User,
      session: sessionResult as Session
    };
  } catch (error) {
    return null;
  }
}

export async function revokeSession(db: D1Database, token: string): Promise<void> {
  await db.prepare(`
    DELETE FROM sessions WHERE token = ?
  `).bind(token).run();
}

export async function cleanupExpiredSessions(db: D1Database): Promise<void> {
  await db.prepare(`
    DELETE FROM sessions WHERE expires_at < datetime('now')
  `).run();
}