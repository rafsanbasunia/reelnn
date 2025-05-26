import { BACKEND_URL } from "@/config";

export const runtime = 'edge';

interface SimilarContent {
  id: string;
  title: string;
  year: number;
  poster: string;
  vote_average: number;
  genres: string[];
  popularity: number;
  media_type: string;
}

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const media_type = url.searchParams.get('media_type');
  const genres = url.searchParams.getAll('genres');

  if (!media_type) {
    return new Response(JSON.stringify({ error: "Media type is required" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let apiUrl = `${BACKEND_URL}/api/v1/similar?media_type=${media_type}`;

    if (genres && genres.length > 0) {
      genres.forEach((genre) => {
        apiUrl += `&genres=${encodeURIComponent(genre)}`;
      });
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: SimilarContent[] = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error fetching similar content:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch similar content" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}