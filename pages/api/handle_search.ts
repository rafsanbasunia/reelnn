import { BACKEND_URL } from "@/config";

export const runtime = 'edge';

export default async function handler(request: Request) {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');

    if (!query || query.length < 3) {
      return new Response(
        JSON.stringify({ error: "Query should be at least 3 characters" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Search API error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch search results" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}