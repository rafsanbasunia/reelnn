import React, { useState, useEffect, useRef } from "react";
import { CardGrid } from "./CardGrid";
import { content } from "./Card";

// Cache object to store previous requests
const similarContentCache: Record<string, {
  data: content[],
  timestamp: number
}> = {};

// Cache expiration time (10 minutes)
const CACHE_EXPIRATION = 10 * 60 * 1000;

interface SimilarProps {
  mediaType: "movie" | "show";
  genres: string[];
}

const Similar: React.FC<SimilarProps> = ({ mediaType, genres }) => {
  const [similarContent, setSimilarContent] = useState<content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchSimilarContent = async () => {
      if (!mediaType || !genres.length) return;

      try {
        setLoading(true);
        const limitedGenres = genres.slice(0, 2);
        

        const cacheKey = `${mediaType}-${limitedGenres.sort().join('-')}`;
  
        const cachedData = similarContentCache[cacheKey];
        const now = Date.now();
        
        if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRATION)) {

          if (isMounted.current) {
            setSimilarContent(cachedData.data);
            setLoading(false);
          }
          return;
        }


        const params = new URLSearchParams();
        params.append("media_type", mediaType);
        limitedGenres.forEach((genre) => params.append("genres", genre));

        const response = await fetch(`/api/getSimilar?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        similarContentCache[cacheKey] = {
          data,
          timestamp: now
        };
        
        if (isMounted.current) {
          setSimilarContent(data);
        }
      } catch (err) {
        console.error("Error fetching similar content:", err);
        if (isMounted.current) {
          setError("Failed to fetch similar content");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchSimilarContent();
  }, [mediaType, genres]);

  if (loading) {
    return (
      <div className="text-white">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-gray-800 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white py-6">
        <div className="text-center py-4 text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (similarContent.length === 0) {
    return (
      <div className="text-white py-6">
        <div className="text-center py-4 text-gray-400">
          No similar content found.
        </div>
      </div>
    );
  }

  return (
    <div>
      <CardGrid similar={true} contents={similarContent} displayStyle="grid" />
    </div>
  );
};

export default Similar;
