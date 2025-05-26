import { NEXT_PUBLIC_TELEGRAM_BOT_NAME, SHORTENER_API_URL, SHORTENER_API_KEY } from '@/config';

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
    const { streamUrl, title, quality, contentId, mediaType, qualityIndex, seasonNumber, episodeNumber } = body;

    if (!streamUrl || !contentId) {
      return new Response(JSON.stringify({ error: 'Required parameters missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const mediaTypeCode = mediaType === 'show' ? 's' : 'm';
    const compactParams = `${contentId}_${mediaTypeCode}_${qualityIndex}_${seasonNumber || 0}_${episodeNumber || 0}`;
  
    const telegramLink = `https://t.me/${NEXT_PUBLIC_TELEGRAM_BOT_NAME}?start=file_${compactParams}&text=${encodeURIComponent(`${title} ${quality}`)}`;
    
    let directLink = streamUrl;
    
    // Use URL shortener if API URL and key are available
    if (SHORTENER_API_URL && SHORTENER_API_KEY) {
      try {
        const shortenerUrl = `${SHORTENER_API_URL}?api=${SHORTENER_API_KEY}&url=${encodeURIComponent(streamUrl)}`;
        const response = await fetch(shortenerUrl);
        const data = await response.json();
        
        if (data && data.shortenedUrl) {
          directLink = data.shortenedUrl;
        }
      } catch (shortenerError) {
        console.error('URL shortener error:', shortenerError);
      }
    }

    return new Response(JSON.stringify({
      directLink,
      telegramLink,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Download API error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred processing your request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}