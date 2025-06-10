import * as jose from 'jose';
import { SITE_SECRET, BACKEND_URL } from '@/config';

interface UserCheckPayload {
  user_id: number;
  exp: number;
}

interface BackendUserResponse {
  status: string;
  message: string;
  user: {
    user_id: number;
    username: string;
    first_name: string;
    last_name: string;
    registration_date: string;
    slimit: number;
    is_active: boolean;
  };
}

interface BackendErrorResponse {
  detail: string;
}

export async function verifyUserWithBackend(userId: string): Promise<{
  success: boolean;
  user?: BackendUserResponse['user'];
  error?: string;
}> {
  try {
    
    const payload: UserCheckPayload = {
      user_id: parseInt(userId),
      exp: Math.floor(Date.now() / 1000) + 3600 
    };

    
    const secret = new TextEncoder().encode(SITE_SECRET);
    const token = await new jose.SignJWT(payload as unknown as jose.JWTPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(payload.exp)
      .sign(secret);

    
    const response = await fetch(`${BACKEND_URL}/api/v1/checkUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      return {
        success: true,
        user: data.user
      };
    } else {
      
      const errorData = data as BackendErrorResponse;
      return {
        success: false,
        error: errorData.detail || 'Unknown error occurred'
      };
    }
  } catch (error) {
    console.error('Backend user verification error:', error);
    return {
      success: false,
      error: 'Failed to verify user with backend'
    };
  }
}