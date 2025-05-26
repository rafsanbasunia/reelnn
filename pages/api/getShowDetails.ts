import { BACKEND_URL } from "@/config";

export const runtime = 'edge';

interface Episode {
  episode_number: number;
  name: string;
  overview: string;
  still_path: string;
  air_date: string;
  quality: ShowQuality[];
}

interface Season {
  season_number: number;
  episodes: Episode[];
}

interface ShowQuality {
  type: string;
  fileID: string;
  size: string;
  audio: string;
  video_codec: string;
  file_type: string;
  subtitle: string;
  runtime: number | null;
}

interface CastMember {
  name: string;
  character: string;
  imageUrl: string;
}

interface ShowData {
  sid: number;
  title: string;
  original_title: string;
  release_date?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  logo?: string;
  genres?: string[];
  season: Season[];
  cast: CastMember[];
  creators: string[];
  links: string[];
  studios: string[];
}

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const sid = url.searchParams.get('sid');

  if (!sid) {
    return new Response(JSON.stringify({ error: "Show ID is required" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `${BACKEND_URL}/api/v1/getShowDetails/${sid}`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data: ShowData = await response.json();
    console.log("Fetched show details:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=43200'
      }
    });
  } catch (error) {
    console.error("Error fetching show details:", error);

    if (error instanceof TypeError && error.message.includes("abort")) {
      return new Response(JSON.stringify({ error: "Request timed out" }), {
        status: 504,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: "Failed to fetch show details" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}