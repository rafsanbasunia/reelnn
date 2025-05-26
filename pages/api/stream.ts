import { verifyStreamToken } from "@/utils/tokenUtils";
import { BACKEND_URL } from "@/config";

export const runtime = 'edge';

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response(JSON.stringify({ error: "Missing or invalid token" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const decodedToken = await verifyStreamToken(token);

    if (!decodedToken) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = decodedToken;

    const apiUrl = `${BACKEND_URL}/api/v1/dl/${id}?token=${token}`;

    const headers: HeadersInit = {};
    if (request.headers.get('range')) {
      headers["range"] = request.headers.get('range') || '';
    }

    const apiResponse = await fetch(apiUrl, { headers });

    if (!apiResponse.ok && apiResponse.status !== 206) {
      throw new Error(`Backend API responded with status: ${apiResponse.status}`);
    }

    // Create a Response with the same status and headers as the API response
    const responseHeaders = new Headers();
    apiResponse.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    // Return the response with its body stream for proper video streaming
    return new Response(apiResponse.body, {
      status: apiResponse.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error("Error fetching video stream:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch video stream data" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}