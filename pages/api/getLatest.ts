import { BACKEND_URL } from "@/config";

export const runtime = 'edge';

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const media_type = url.searchParams.get('media_type');

  if (!media_type || (media_type !== "movie" && media_type !== "show")) {
    return new Response(JSON.stringify({ error: 'Invalid media type. Use "movie" or "show".' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/getlatest/${media_type}`
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Error fetching ${media_type} data:`, error);
    return new Response(JSON.stringify({ error: `Failed to fetch ${media_type} data` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}