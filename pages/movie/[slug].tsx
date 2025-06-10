import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TopCard from "@/components/TopCard";
import CastCrew from "@/components/CastCrew";
import AboutCard from "@/components/AboutCard";
import Backward from "@/components/Backward";
import Similar from "@/components/Similar";
import VideoPlayer from "@/components/VideoPlayer";
import { AnimatePresence } from "framer-motion";
import { useStreamToken } from "@/hooks/useStreamToken";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import Head from "next/head";
import { NEXT_PUBLIC_SITE_NAME } from "@/config";

interface MovieQuality {
  type: string;
  fileid: string;
  size: string;
  audio: string;
  subtitle: string;
  video_codec: string;
  file_type: string;
}

interface MovieData {
  id: number;
  title: string;
  trailer: string;
  original_title: string;
  release_date?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  cast: CastMember[];
  logo?: string;
  genres?: string[];
  quality: MovieQuality[];
  runtime?: number;
  vote: number;
  directors: string[];
  studios: string[];
  links: string[];
}

interface CastMember {
  name: string;
  character: string;
  imageUrl: string;
}

const styles = {
  container: "relative z-10 px-8 sm:px-6 md:px-8 lg:px-12 pb-16 md:pb-20",
  innerContainer: "max-w-6xl mx-auto space-y-12",
  sectionHeading: "text-xl sm:text-2xl font-bold mb-4 sm:mb-8 text-white",
  skeletonBlock: "bg-gray-800 rounded animate-pulse",
};

const Slug = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedQualityIndex, setSelectedQualityIndex] = useState(0);

  const { streamUrl } = useStreamToken({
    contentId: movieData?.id || 0,
    mediaType: "movie",
    qualityIndex: selectedQualityIndex,
    isActive: true,
  });

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/getMovieDetails?mid=${slug}`);

        if (response.ok) {
          setMovieData(await response.json());
        } else {
          throw new Error(`API responded with status: ${response.status}`);
        }
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError("Failed to fetch movie details");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [slug]);

  const handlePlayClick = (qualityIndex = 0) => {
    setSelectedQualityIndex(qualityIndex);
    setShowVideoPlayer(true);
  };
  const handleCloseVideoPlayer = () => {
    setShowVideoPlayer(false);
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="min-h-screen">
      {/* Fixed background placeholder */}
      <div className="fixed top-0 left-0 w-full h-screen z-0 bg-black"></div>

      {/* Page content container */}
      <div className={styles.container}>
        {/* Back button placeholder */}
        <div className="py-6 max-w-6xl mx-auto space-y-12">
          <div className={`${styles.skeletonBlock} h-8 w-20`}></div>
        </div>

        {/* All content container */}
        <div className={styles.innerContainer}>
          {/* TopCard Skeleton */}
          <section className="text-white">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 lg:w-1/4">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg"></div>
              </div>
              <div className="md:w-2/3 lg:w-3/4 space-y-4">
                <div className={`${styles.skeletonBlock} h-10 w-3/4`}></div>
                <div className={`${styles.skeletonBlock} h-6 w-1/2`}></div>
                <div className={`${styles.skeletonBlock} h-4 w-full`}></div>
                <div className={`${styles.skeletonBlock} h-4 w-full`}></div>
                <div className={`${styles.skeletonBlock} h-4 w-3/4`}></div>
                <div className="flex space-x-4 mt-4">
                  <div className={`${styles.skeletonBlock} h-10 w-24`}></div>
                  <div
                    className={`${styles.skeletonBlock} h-10 w-10 rounded-full`}
                  ></div>
                </div>
              </div>
            </div>
          </section>

          {/* Cast & Crew Skeleton */}
          <section className="text-white">
            <div
              className={`${styles.skeletonBlock} h-8 w-1/5 mb-4 sm:mb-8`}
            ></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square bg-gray-800 rounded-full"></div>
                  <div
                    className={`${styles.skeletonBlock} h-4 w-3/4 mx-auto`}
                  ></div>
                  <div
                    className={`${styles.skeletonBlock} h-3 w-1/2 mx-auto`}
                  ></div>
                </div>
              ))}
            </div>
          </section>

          {/* About Skeleton */}
          <section className="text-white">
            <div
              className={`${styles.skeletonBlock} h-8 w-1/6 mb-4 sm:mb-2`}
            ></div>
            <div className="space-y-3 p-4 bg-gray-800 rounded">
              <div className={`${styles.skeletonBlock} h-4 w-1/3`}></div>
              <div className={`${styles.skeletonBlock} h-4 w-1/2`}></div>
              <div className={`${styles.skeletonBlock} h-4 w-1/4`}></div>
              <div className={`${styles.skeletonBlock} h-4 w-2/5`}></div>
            </div>
          </section>

          {/* Similar Skeleton */}
          <section className="text-white">
            <div className={`${styles.skeletonBlock} h-8 w-1/5 mb-4`}></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-800 rounded"></div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error || !movieData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Error: {error || "Movie not found"}
      </div>
    );
  }

  const year = movieData.release_date
    ? new Date(movieData.release_date).getFullYear()
    : 2025;

  interface ContentSectionProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
  }

  const ContentSection = ({
    title,
    children,
    className = "",
  }: ContentSectionProps) => (
    <section className={`text-white ${className}`}>
      {title && <h2 className={styles.sectionHeading}>{title}</h2>}
      {children}
    </section>
  );

  return (
    <ProtectedRoute>
    <div className="font-mont min-h-screen relative">
      <Head>
        <title>
          {movieData.title} | {NEXT_PUBLIC_SITE_NAME}
        </title>
        <meta
          name="description"
          content={
            movieData.overview?.substring(0, 160) ||
            `Watch ${movieData.title} on ${NEXT_PUBLIC_SITE_NAME}`
          }
        />
      </Head>
      {/* Background Image */}
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        <Image
          src={
            movieData.backdrop_path
              ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`
              : ""
          }
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-black/90"></div>
      </div>

      {/* Page content */}
      <div className={styles.container}>
        {/* Back button */}
        <div className="py-6 max-w-6xl mx-auto ">
          <Backward />
        </div>

        {/* All content */}
        <div className={styles.innerContainer}>
          <ContentSection>
            <TopCard
              contentId={movieData.id}
              trailer={movieData.trailer}
              title={movieData.title}
              year={year}
              logo={movieData.logo || ""}
              quality={movieData.quality}
              genres={movieData.genres || []}
              size={
                movieData.quality && movieData.quality.length > 0
                  ? `${movieData.quality[0].size}`
                  : "N/A"
              }
              poster={
                movieData.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
                  : ""
              }
              videoQuality={
                movieData.quality && movieData.quality.length > 0
                  ? `${movieData.quality[0].type}`
                  : "N/A"
              }
              onPlayClick={handlePlayClick}
              audioQuality={
                movieData.quality && movieData.quality.length > 0
                  ? `${movieData.quality[0].audio}`
                  : "English AAC 5.1 (Default)"
              }
              subtitles={
                movieData.quality && movieData.quality.length > 0
                  ? `${movieData.quality[0].subtitle}`
                  : "English (Default SUBRIP)"
              }
              description={movieData.overview || ""}
              director={movieData.directors}
              isFavorite={false}
              isWatched={false}
              runtime={movieData.runtime || 0}
              vote={movieData.vote_average || 0}
              backgroundImage={
                movieData.backdrop_path
                  ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`
                  : ""
              }
              streamUrl={streamUrl ?? undefined}
            />
          </ContentSection>

          <ContentSection title="Cast & Crew">
            <CastCrew castMembers={movieData.cast} />
          </ContentSection>

          <ContentSection title="About">
            <AboutCard
              genres={movieData.genres || []}
              studios={movieData.studios || []}
              links={movieData.links || []}
              mediaInfo={
                movieData.quality && movieData.quality.length > 0
                  ? `${movieData.quality[0].type}-${movieData.quality[0].video_codec}-${movieData.quality[0].file_type}`
                  : ""
              }
            />
          </ContentSection>

          <ContentSection title="Similar Titles">
            <Similar mediaType="movie" genres={movieData.genres || []} />
          </ContentSection>
        </div>
      </div>

      {/* Video Player  */}
      <AnimatePresence>
        {showVideoPlayer && streamUrl && (
          <VideoPlayer
            videoSource={streamUrl}
            title={movieData.title}
            logoUrl={
              movieData.logo
                ? `https://image.tmdb.org/t/p/w500${movieData.logo}`
                : undefined
            }
            onClose={handleCloseVideoPlayer}
            subtitles={movieData.quality?.[selectedQualityIndex]?.subtitle}
            quality={movieData.quality?.[selectedQualityIndex]?.type}
          />
        )}
      </AnimatePresence>
    </div>
  </ProtectedRoute>
  );
};

export default Slug;
