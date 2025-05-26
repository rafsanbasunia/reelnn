import { useState, useEffect, useCallback, forwardRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { debounce } from "lodash";

interface SearchResult {
  id: number;
  title: string;
  year: number;
  poster: string;
  vote_average: number;
  vote_count: number;
  media_type: string;
}

interface SearchProps {
  isVisible: boolean;
  searchQuery: string;
}

const Search = forwardRef<HTMLDivElement, SearchProps>(
  ({ isVisible, searchQuery }, ref) => {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSearchQuery, setLastSearchQuery] = useState("");

    const debouncedSearch = useCallback(
      debounce(async (query: string) => {
        if (query.length < 3) {
          setResults([]);
          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch(
            `/api/handle_search?query=${encodeURIComponent(query)}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch search results");
          }

          const data = await response.json();
          setResults(data);
          setLastSearchQuery(query);
        } catch (err) {
          setError("An error occurred while searching. Please try again.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }, 500),
      []
    );

    useEffect(() => {
      if (
        isVisible &&
        searchQuery &&
        searchQuery !== lastSearchQuery &&
        searchQuery.length >= 3
      ) {
        debouncedSearch(searchQuery);
      } else if (searchQuery.length < 3) {
        setResults([]);
      }

      return () => {
        debouncedSearch.cancel();
      };
    }, [searchQuery, debouncedSearch, isVisible, lastSearchQuery]);

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className="font-mont fixed top-16 sm:right-4 right-0 w-full sm:w-[320px] max-h-[60vh] sm:max-h-[70vh] overflow-y-auto bg-gray-900 rounded-b-lg shadow-lg z-40"
        data-testid="search-results-container"
      >
        {searchQuery.length < 3 ? (
          <p className="text-gray-400 text-center py-4 sm:py-8 text-sm sm:text-base">
            Type at least 3 characters to search
          </p>
        ) : isLoading ? (
          <div className="flex justify-center py-4 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center py-4 sm:py-8 text-sm sm:text-base">
            {error}
          </p>
        ) : results.length === 0 ? (
          <p className="text-gray-400 text-center py-4 sm:py-8 text-sm sm:text-base">
            No results found
          </p>
        ) : (
          <div className="divide-y divide-gray-700">
            {results.map((item) => (
              <Link
                href={`/${item.media_type}/${item.id}`}
                key={`${item.media_type}-${item.id}`}
                className="block hover:bg-gray-800 transition-colors"
              >
                <div className="flex p-2 sm:p-3">
                  <div className="w-12 h-18 sm:w-16 sm:h-24 flex-shrink-0 relative rounded overflow-hidden">
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${item.poster}`}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 48px, 64px"
                    />
                  </div>
                  <div className="ml-2 sm:ml-3 flex-grow">
                    <p className="font-medium text-xs sm:text-sm truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 mt-0.5 sm:mt-1">
                      <span>{item.year}</span>
                      <span className="mx-1 sm:mx-2">•</span>
                      <span className="flex items-center">
                        ⭐ {item.vote_average.toFixed(1)}
                      </span>
                    </div>
                    <span className="inline-block mt-1 sm:mt-2 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-gray-700 rounded-full">
                      {item.media_type === "movie" ? "Movie" : "TV Show"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Search.displayName = "Search";
export default Search;
