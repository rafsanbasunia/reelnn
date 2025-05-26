import { generateStreamToken } from '@/utils/tokenUtils';

export const runtime = 'edge';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const body = await request.json();
    const { id, mediaType, qualityIndex, seasonNumber, episodeNumber } = body;
    
    if (!id || !mediaType) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = await generateStreamToken({
      id,
      mediaType,
      qualityIndex: qualityIndex || 0,
      seasonNumber,
      episodeNumber
    });
    
    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating stream token:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate token' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}