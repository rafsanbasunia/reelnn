import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { content } from '../components/Card';

interface ContentContextType {
  movies: content[];
  shows: content[];
  trending: content[];
  isLoading: boolean;
  error: string | null;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [movies, setMovies] = useState<content[]>([]);
  const [shows, setShows] = useState<content[]>([]);
  const [trending, setTrending] = useState<content[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        
        const [moviesResponse, showsResponse, trendingResponse] = await Promise.all([
          fetch("/api/getLatest?media_type=movie"),
          fetch("/api/getLatest?media_type=show"),
          fetch("/api/getTrending")
        ]);
        
        // Check responses
        if (!moviesResponse.ok) throw new Error(`Error fetching movies: ${moviesResponse.status}`);
        if (!showsResponse.ok) throw new Error(`Error fetching shows: ${showsResponse.status}`);
        if (!trendingResponse.ok) throw new Error(`Error fetching trending: ${trendingResponse.status}`);
        
        // Parse all JSON in parallel
        const [moviesData, showsData, trendingData] = await Promise.all([
          moviesResponse.json(),
          showsResponse.json(),
          trendingResponse.json()
        ]);
        
        setMovies(moviesData);
        setShows(showsData);
        setTrending(trendingData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load content. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const value = {
    movies,
    shows,
    trending, 
    isLoading,
    error
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}