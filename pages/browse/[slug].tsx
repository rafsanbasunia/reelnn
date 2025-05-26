import { useRouter } from "next/router";
import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { Card, content } from "../../components/Card";
import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { NEXT_PUBLIC_SITE_NAME } from "@/config";



interface SortOptionProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}


interface PaginationData {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

const VALID_MEDIA_TYPES = ["movie", "show"];

const CardSkeleton = memo(() => (
  <div className="animate-pulse">
    <div className="aspect-[2/3] bg-gray-700 rounded-md"></div>
    <div className="h-4 bg-gray-700 rounded mt-2 w-3/4"></div>
    <div className="h-3 bg-gray-700 rounded mt-1 w-1/2"></div>
  </div>
));
CardSkeleton.displayName = "CardSkeleton";

interface BrowseSkeletonLoaderProps {
  itemsPerPage?: number;
}

const BrowseSkeletonLoader = memo<BrowseSkeletonLoaderProps>(
  ({ itemsPerPage = 20 }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
      {Array.from({ length: itemsPerPage }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
);
BrowseSkeletonLoader.displayName = "BrowseSkeletonLoader";

interface PaginationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}

const PaginationButton = memo<PaginationButtonProps>(
  ({ onClick, disabled = false, active = false, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2 sm:px-3 py-1 rounded text-sm sm:text-base transition-colors ${
        disabled
          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
          : active
          ? "bg-red-600 text-white"
          : "bg-gray-800 text-white hover:bg-gray-700"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </button>
  )
);
PaginationButton.displayName = "PaginationButton";

const SortOption = memo<SortOptionProps>(({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      active 
        ? "bg-red-600 text-white" 
        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
    }`}
  >
    {children}
  </button>
));
SortOption.displayName = "SortOption";

export default function BrowsePage() {
  const router = useRouter();
  const { slug, page = 1, sort_by = "new" } = router.query;

  const pageNumber = useMemo(() => {
    const parsed = parseInt(page as string, 10);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, [page]);

  const mediaType = slug as string;
  const sortOption = (sort_by as string) || "new";

  const [contents, setContents] = useState<content[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    total_pages: 0,
    total_items: 0,
    items_per_page: 20,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isValidMediaType = useMemo(
    () => Boolean(mediaType && VALID_MEDIA_TYPES.includes(mediaType)),
    [mediaType]
  );
  const fetchPage = useCallback(
    async (pageNum: number, sortBy: string = sortOption) => {
      if (!isValidMediaType) return;

      setLoading(true);
      setError(null);

      try {
        const sanitizedPage = Math.max(1, pageNum);
        const sanitizedMediaType = VALID_MEDIA_TYPES.includes(mediaType)
          ? mediaType
          : "movie";

        const res = await fetch(
          `/api/pagi_page?media_type=${sanitizedMediaType}&page=${sanitizedPage}&sort_by=${sortBy}`
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Error ${res.status}: Failed to fetch data`
          );
        }

        const data = await res.json();
        setContents(data.items);
        setPagination(data.pagination);

        if (pageNum !== pageNumber || sortBy !== sortOption) {
          router.push(`/browse/${mediaType}?page=${pageNum}&sort_by=${sortBy}`, undefined, {
            shallow: true,
          });
        }
      } catch (error) {
        console.error("Error fetching page data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load content. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [isValidMediaType, mediaType, pageNumber, sortOption, router]
  );

  const handleSortChange = (newSort: string) => {
    if (newSort !== sortOption && !loading) {
      fetchPage(1, newSort); // Reset to page 1 when sort changes
    }
  };


  useEffect(() => {
    if (!slug) return;

    if (!isValidMediaType) {
      router.push("/404");
      return;
    }

    fetchPage(pageNumber, sortOption);
  }, [slug, pageNumber, sortOption, router, isValidMediaType, fetchPage]);

  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages && !loading) {
      fetchPage(newPage);
    }
  };

  const pageNumbers = useMemo(() => {
    if (pagination.total_pages <= 1) return [];

    const { current_page, total_pages } = pagination;
    const numbers: (number | string)[] = [1];

    if (current_page > 3) numbers.push("...");

    if (current_page > 2) numbers.push(current_page - 1);

    if (current_page !== 1 && current_page !== total_pages) {
      numbers.push(current_page);
    }

    if (current_page < total_pages - 1) numbers.push(current_page + 1);

    if (current_page < total_pages - 2) numbers.push("...");

    if (total_pages > 1) numbers.push(total_pages);

    return numbers;
  }, [pagination]);

  if (!slug) {
    return (
      <div className="text-white min-h-screen bg-gray-900">
        <Navbar />
        <div className="pt-16 md:pt-20 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  const pageTitle = `Browse ${
    mediaType === "movie" ? "Movies" : "TV Shows"
  } | ${NEXT_PUBLIC_SITE_NAME}`;

  return (
    <div className="font-mont text-white min-h-screen bg-background ">
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={`Browse ${
            mediaType === "movie" ? "movies" : "TV shows"
          } on ${NEXT_PUBLIC_SITE_NAME}`}
        />
      </Head>

      <Navbar />

      <main className="pt-16 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto pb-16 md:pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8 mt-4 sm:mt-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Browse {mediaType === "movie" ? "Movies" : "TV Shows"}
          </h1>
          
          <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
            <SortOption 
              active={sortOption === "new"} 
              onClick={() => handleSortChange("new")}
            >
              Recently Added
            </SortOption>
            <SortOption 
              active={sortOption === "most"} 
              onClick={() => handleSortChange("most")}
            >
              Most Rated
            </SortOption>
            <SortOption 
              active={sortOption === "date"} 
              onClick={() => handleSortChange("date")}
            >
              Release Date
            </SortOption>
          </div>
        </div>

        {error && (
          <div
            className="bg-red-500 bg-opacity-20 border border-red-500 rounded-md p-4 mb-6"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <BrowseSkeletonLoader itemsPerPage={pagination.items_per_page} />
        ) : contents.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {contents.map((item) => (
              <Link key={item.id} href={`/${mediaType}/${item.id}`}>
                <Card content={item} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl">No content found.</p>
          </div>
        )}

        {!loading && pageNumbers.length > 0 && (
          <nav
            aria-label="Pagination"
            className="flex flex-wrap justify-center items-center gap-2 mt-8 sm:mt-12 mb-10"
          >
            <PaginationButton
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
            >
              Previous
            </PaginationButton>

            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {pageNumbers.map((page, index) =>
                typeof page === "number" ? (
                  <PaginationButton
                    key={index}
                    onClick={() => handlePageChange(page)}
                    active={page === pagination.current_page}
                  >
                    {page}
                  </PaginationButton>
                ) : (
                  <span
                    key={index}
                    className="px-1 text-gray-400 self-center"
                    aria-hidden="true"
                  >
                    …
                  </span>
                )
              )}
            </div>

            <PaginationButton
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.total_pages}
            >
              Next
            </PaginationButton>
          </nav>
        )}
      </main>
    </div>
  );
}
