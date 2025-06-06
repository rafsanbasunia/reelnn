import { NEXT_PUBLIC_TELEGRAM_BOT_NAME, SHORTENER_API_URL, SHORTENER_API_KEY } from '@/config';

export const runtime = 'edge';

// Helper function to shorten URL
async function shortenUrl(url: string): Promise<string> {
  if (!SHORTENER_API_URL || !SHORTENER_API_KEY) {
    return url;
  }

  try {
    const shortenerUrl = `${SHORTENER_API_URL}?api=${SHORTENER_API_KEY}&url=${encodeURIComponent(url)}`;
    console.log('Sending request to shortener:', shortenerUrl);
    
    const response = await fetch(shortenerUrl);
    console.log('Shortener response status:', response.status);
    
    const data = await response.json();
    console.log('Shortener response data:', data);
    
    if (data && data.shortenedUrl) {
      console.log('Successfully shortened URL:', data.shortenedUrl);
      return data.shortenedUrl;
    }
  } catch (error) {
    console.error('URL shortener error:', error);
  }
  return url;
}

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
  
    // Create Telegram link
    const telegramLink = `https://t.me/${NEXT_PUBLIC_TELEGRAM_BOT_NAME}?start=file_${compactParams}&text=${encodeURIComponent(`${title} ${quality}`)}`;
    
    // Debug logs
    console.log('Shortener Config:', {
      SHORTENER_API_URL,
      hasKey: !!SHORTENER_API_KEY,
      originalUrl: streamUrl
    });
    
    // Convert relative URL to absolute URL for direct link
    const absoluteUrl = new URL(streamUrl, request.url).toString();
    console.log('Converted to absolute URL:', absoluteUrl);
    
    // Shorten both URLs
    const [shortenedDirectLink, shortenedTelegramLink] = await Promise.all([
      shortenUrl(absoluteUrl),
      shortenUrl(telegramLink)
    ]);

    return new Response(JSON.stringify({
      directLink: shortenedDirectLink,
      telegramLink: shortenedTelegramLink,
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
