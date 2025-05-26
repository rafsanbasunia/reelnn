import { BACKEND_URL } from "@/config";

export const runtime = 'edge';

export default async function handler() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/heroslider`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error fetching hero slider data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch hero slider data" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}