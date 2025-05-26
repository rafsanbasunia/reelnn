import * as jose from 'jose';
import { SITE_SECRET } from '@/config';

export interface StreamParams {
  id: string;
  mediaType: string;
  qualityIndex?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  timestamp: number; 
  expiry: number;
  [key: string]: unknown;  // Add index signature for JWTPayload compatibility
}

// Explicitly define the input type to ensure required properties
type StreamParamsInput = {
  id: string;
  mediaType: string;
  qualityIndex?: number;
  seasonNumber?: number;
  episodeNumber?: number;
};

// Creates a JWT token that will be compatible with PyJWT
export async function generateStreamToken(params: StreamParamsInput): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const tokenData: StreamParams = {
    ...params,
    timestamp: now,
    expiry: now + 21601 // 6 hours
  };

  // Create a JWT that's compatible with PyJWT
  const secret = new TextEncoder().encode(SITE_SECRET);
  
  return await new jose.SignJWT(tokenData as jose.JWTPayload)
    .setProtectedHeader({ alg: 'HS256' }) // PyJWT default algorithm
    .setIssuedAt()
    .setExpirationTime(tokenData.expiry)
    .sign(secret);
}

export async function verifyStreamToken(token: string): Promise<StreamParams | null> {
  try {
    const secret = new TextEncoder().encode(SITE_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const decoded = payload as unknown as StreamParams;
    
    const now = Math.floor(Date.now() / 1000);
  
    if (decoded.expiry < now) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}