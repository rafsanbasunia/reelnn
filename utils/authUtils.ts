import * as jose from 'jose';
import { SITE_SECRET } from '@/config';

export interface AuthTokenPayload {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  authDate: string;
  iat: number;
  exp: number;
  [key: string]: unknown;
}

export async function generateAuthToken(userData: Omit<AuthTokenPayload, 'iat' | 'exp'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const tokenData = {
    ...userData,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  } as AuthTokenPayload;

  const secret = new TextEncoder().encode(SITE_SECRET);
  
  return await new jose.SignJWT(tokenData as jose.JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(tokenData.exp)
    .sign(secret);
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(SITE_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const decoded = payload as unknown as AuthTokenPayload;
    
    const now = Math.floor(Date.now() / 1000);
  
    if (decoded.exp < now) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Auth token verification failed:', error);
    return null;
  }
}