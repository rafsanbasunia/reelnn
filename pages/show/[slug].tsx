import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TopCardShow from "@/components/TopCardShow";
import CastCrew from "@/components/CastCrew";
import AboutCard from "@/components/AboutCard";
import TVShowEpisodes from "@/components/TVShowEpisodes";
import Similar from "@/components/Similar";
import Backward from "@/components/Backward";
import Image from "next/image";
import Head from "next/head";
import { NEXT_PUBLIC_SITE_NAME } from "@/config";
import ProtectedRoute from "@/components/ProtectedRoute";

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
  trailer: string;
  total_seasons: number;
  total_episodes: number;
  title: string;
  status: string;
  release_date?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  popularity?: number;
  vote_average?: number;
  logo?: string;
  genres?: string[];
  season: Season[];
  cast: CastMember[];
  creators: string[];
  links: string[];
  studios: string[];
}

const styles = {
  container: "relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 pb-16 md:pb-20",
  innerContainer: "max-w-6xl mx-auto space-y-12",
  sectionHeading: "text-xl sm:text-2xl font-bold mb-4 sm:mb-8 text-white",
  skeletonBlock: "bg-gray-700 rounded animate-pulse",
};

interface ContentSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  children,
  className = "",
}) => (
  <section className={`text-white ${className}`}>
    {title && <h2 className={styles.sectionHeading}>{title}</h2>}
    {children}
  </section>
);

const Slug = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [showData, setShowData] = useState<ShowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShowDetails = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/getShowDetails?sid=${slug}`);

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        setShowData(data);
      } catch (err) {
        console.error("Error fetching show details:", err);
        setError("Failed to fetch show details");
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [slug]);


  const SkeletonLoader = () => (
  <div className="min-h-screen">

    <div className="fixed top-0 left-0 w-full h-screen z-0 bg-black"></div>


    <div className={styles.container}>

      <div className="py-6 max-w-6xl mx-auto">
        <div className={`${styles.skeletonBlock} h-8 w-20`}></div>
      </div>


      <div className={styles.innerContainer}>

        <section className="text-white">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 lg:w-1/4">
              <div className="aspect-[2/3] bg-gray-700 rounded-lg"></div>
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


        <section className="text-white">
          <div className={`${styles.skeletonBlock} h-8 w-1/5 mb-4 sm:mb-8`}></div>
          <div className="space-y-4">

            <div className="flex space-x-2 mb-4 overflow-x-auto">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`${styles.skeletonBlock} h-10 w-24 flex-shrink-0`}></div>
              ))}
            </div>

            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-800/50 rounded">
                <div className={`${styles.skeletonBlock} aspect-video sm:w-1/4 w-full rounded`}></div>
                <div className="sm:w-3/4 space-y-2">
                  <div className={`${styles.skeletonBlock} h-6 w-3/4`}></div>
                  <div className={`${styles.skeletonBlock} h-4 w-1/3`}></div>
                  <div className={`${styles.skeletonBlock} h-4 w-full`}></div>
                  <div className={`${styles.skeletonBlock} h-4 w-5/6`}></div>
                </div>
              </div>
            ))}
          </div>
        </section>


        <section className="text-white">
          <div className={`${styles.skeletonBlock} h-8 w-1/5 mb-4 sm:mb-8`}></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-square bg-gray-700 rounded-full"></div>
                <div className={`${styles.skeletonBlock} h-4 w-3/4 mx-auto`}></div>
                <div className={`${styles.skeletonBlock} h-3 w-1/2 mx-auto`}></div>
              </div>
            ))}
          </div>
        </section>


        <section className="text-white">
          <div className={`${styles.skeletonBlock} h-8 w-1/6 mb-4 sm:mb-2`}></div>
          <div className="space-y-3 p-4 bg-gray-800/50 rounded">
            <div className={`${styles.skeletonBlock} h-4 w-1/3`}></div>
            <div className={`${styles.skeletonBlock} h-4 w-1/2`}></div>
            <div className={`${styles.skeletonBlock} h-4 w-1/4`}></div>
            <div className={`${styles.skeletonBlock} h-4 w-2/5`}></div>
          </div>
        </section>


        <section className="text-white">
          <div className={`${styles.skeletonBlock} h-8 w-1/5 mb-4`}></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-700 rounded"></div>
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

  if (error || !showData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Error: {error || "Show not found"}
      </div>
    );
  }

  const year = showData.release_date
    ? new Date(showData.release_date).getFullYear()
    : new Date().getFullYear();

  const mediaInfo = showData.season?.[0]?.episodes?.[0]?.quality?.[0]
    ? `${showData.season[0].episodes[0].quality[0].type || ""}-${
        showData.season[0].episodes[0].quality[0].video_codec || ""
      }-${showData.season[0].episodes[0].quality[0].file_type || ""}`
    : "";

  return (
    <ProtectedRoute>
    <div className="font-mont min-h-screen relative">
      <Head>
        <title>
          {showData.title} | {NEXT_PUBLIC_SITE_NAME}
        </title>
        <meta
          name="description"
          content={
            showData.overview?.substring(0, 160) ||
            `Watch ${showData.title} on ${NEXT_PUBLIC_SITE_NAME}`
          }
        />
      </Head>

      <div className="fixed top-0 left-0 w-full h-screen z-0">
        <Image
          src={
            showData.backdrop_path
              ? `https://image.tmdb.org/t/p/original${showData.backdrop_path}`
              : "/back.jpg"
          }
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={85}
          priority
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/90"></div>
      </div>

      {/* Page content */}
      <div className={styles.container}>
        {/* Back button */}
        <div className="py-6 max-w-6xl mx-auto">
          <Backward />
        </div>

        {/* All content */}
        <div className={styles.innerContainer}>
          <ContentSection>
            <TopCardShow
              title={showData.title}
              trailer={showData.trailer}
              year={year}
              logo={showData.logo || "/logo.png"}
              genres={showData.genres || []}
              poster={
                showData.poster_path
                  ? `https://image.tmdb.org/t/p/w500${showData.poster_path}`
                  : "/tu.jpg"
              }
              total_seasons={showData.total_seasons || 0}
              total_episodes={showData.total_episodes || 0}
              show_status={showData.status || ""}
              description={showData.overview || ""}
              creators={showData.creators || []}
              isFavorite={false}
              isWatched={false}
              backgroundImage={
                showData.backdrop_path
                  ? `https://image.tmdb.org/t/p/original${showData.backdrop_path}`
                  : "/back.jpg"
              }
              vote={showData.vote_average || 0}
              runtime={
                showData.season?.[0]?.episodes?.[0]?.quality?.[0]?.runtime || 0
              }
            />
          </ContentSection>

          <ContentSection title="Episodes">
            <TVShowEpisodes
              seasons={showData.season || []}
              showId={slug as string}
            />
          </ContentSection>

          <ContentSection title="Cast & Crew">
            <CastCrew castMembers={showData.cast || []} />
          </ContentSection>

          <ContentSection title="About">
            <AboutCard
              genres={showData.genres || []}
              studios={showData.studios || []}
              links={showData.links || []}
              mediaInfo={mediaInfo}
            />
          </ContentSection>

          <ContentSection title="Similar Titles">
            <Similar mediaType="show" genres={showData.genres || []} />
          </ContentSection>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default Slug;
