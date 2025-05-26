import { BACKEND_URL } from "@/config";

export const runtime = 'edge';

interface MovieQuality {
  resolution: string;
  format: string;
}

interface MovieData {
  mid: number;
  title: string;
  original_title: string;
  release_date?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  cast: string[];
  logo?: string;
  genres?: string[];
  quality: MovieQuality[];
}

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const mid = url.searchParams.get('mid');

  if (!mid) {
    return new Response(JSON.stringify({ error: "Movie ID is required" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/getMovieDetails/${mid}`
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: MovieData = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch movie details" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}