import { ENABLE_AUTH_PROTECTION } from '@/config';

export const runtime = "edge";

export default function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    return new Response(
      JSON.stringify({
        authProtectionEnabled: ENABLE_AUTH_PROTECTION
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in protection-status API:', error);
    return new Response(
      JSON.stringify({
        authProtectionEnabled: false,
        error: 'Failed to check protection status'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}