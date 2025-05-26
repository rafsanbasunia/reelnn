import { BACKEND_URL } from "@/config";

export const runtime = 'edge';

interface PaginationData {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

interface ContentItem {
  id: string;
  title: string;
  year: number;
  poster: string;
  vote_average: number;
  vote_count: number;
  media_type: string;
}

interface ApiResponse {
  items: ContentItem[];
  pagination: PaginationData;
}

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const media_type = url.searchParams.get('media_type');
  const page = url.searchParams.get('page') || '1';
  const sort_by = url.searchParams.get('sort_by') || 'new';

  if (!media_type || (media_type !== "movie" && media_type !== "show")) {
    return new Response(JSON.stringify({ error: 'Invalid media type. Must be "movie" or "show".' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/paginated/${media_type}?page=${page}&sort_by=${sort_by}`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error fetching paginated data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data from API" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}