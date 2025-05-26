import React, { createContext, useContext, useState, useEffect } from 'react';


interface Movie {
  id: number | null;
  title: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number | null;
  release_date: string;
  overview: string;
  genres: string[];
  logo: string;
  type: string;
}

interface HeroSliderContextType {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
}

const HeroSliderContext = createContext<HeroSliderContextType | undefined>(undefined);


const sampleMovies: Movie[] = [
 
  {
    id: null,
    title: "",
    backdrop_path: "",
    poster_path: "",
    vote_average: null,
    release_date: "",
    overview: "",
    genres: [],
    logo: "",
    type: "",
  }
];

export const HeroSliderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>(sampleMovies);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    
    if (!hasLoaded) {
      const fetchMovies = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/heroSlider');
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          
          const data = await response.json();
          setMovies(data);
          setError(null);
        } catch (error) {
          console.error('Error fetching movies:', error);
          setError('Failed to load movies. Using sample data instead.');
        } finally {
          setIsLoading(false);
          setHasLoaded(true); 
        }
      };

      fetchMovies();
    }
  }, [hasLoaded]);

  return (
    <HeroSliderContext.Provider value={{ movies, isLoading, error }}>
      {children}
    </HeroSliderContext.Provider>
  );
};

export const useHeroSlider = () => {
  const context = useContext(HeroSliderContext);
  if (context === undefined) {
    throw new Error('useHeroSlider must be used within a HeroSliderProvider');
  }
  return context;
};