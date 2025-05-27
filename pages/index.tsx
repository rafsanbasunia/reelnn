"use client";

import HeroSlideshow from "@/components/HeroSlideShow";
import { CardGrid } from "../components/CardGrid";
import { useContent } from "../context/ContentContext";
import Footer from "@/components/Footer";
import { RxExit } from "react-icons/rx";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import Head from "next/head";
import { NEXT_PUBLIC_SITE_NAME } from "@/config";

export default function Home() {
  const { movies, shows, trending, isLoading, error } = useContent();

  return (
    <>
    <Head>
        <title>
          {NEXT_PUBLIC_SITE_NAME}
        </title>
        <meta
          name="description"
          content={
            `Watch Movies and TV Shows on ${NEXT_PUBLIC_SITE_NAME}`
          }
        />
      </Head>
      <HeroSlideshow />
      <main className="font-mont lg:px-32 md:px-16 px-0 bg-background">
        <div className="py-6 md:py-8">
          {error && (
            <div
              className="text-red-500 font-bold text-center my-4 p-3 bg-red-500/10 rounded-md"
              role="alert"
            >
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center my-12 h-32">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"
                aria-label="Loading content"
              ></div>
            </div>
          ) : (
            <>
              {/* Trending section */}
              <section aria-labelledby="trending-heading" className="px-4">
                <div className="flex items-center justify-between mt-8 mb-6">
                  <SectionHeading label="WHAT'S" title="TRENDING" />
                </div>
                {trending.length > 0 ? (
                  <CardGrid contents={trending} />
                ) : (
                  <p className="text-white mt-4 p-4 bg-gray-800/30 rounded-md text-center">
                    No trending content available.
                  </p>
                )}
              </section>

              {/* LATEST MOVIES Section */}
              <section aria-labelledby="movies-heading" className="mt-12 px-4">
                <div className="flex items-center justify-between mt-8 mb-6">
                  <SectionHeading label="LATEST" title="MOVIES" />
                  <Link href="/browse/movie">
                    <button className="text-white text-xs md:text-base self-end mb-2 md:mb-4 flex items-center gap-1 hover:text-red-500/80 transition-colors group">
                      <span>See More</span>
                      <RxExit className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </Link>
                </div>
                {movies.length > 0 ? (
                  <CardGrid contents={movies} displayStyle="grid" />
                ) : (
                  <p className="text-white mt-4 p-4 bg-gray-800/30 rounded-md text-center">
                    No movies available.
                  </p>
                )}
              </section>

              {/* LATEST SHOWS Section */}
              <section aria-labelledby="shows-heading" className="mt-12 px-4">
                <div className="flex items-center justify-between mb-6">
                  <SectionHeading label="LATEST" title="SERIES" />
                  <Link href="/browse/show">
                    <button className="text-white text-xs md:text-base self-end mb-2 md:mb-4 flex items-center gap-1 hover:text-red-500/80 transition-colors group">
                      <span>See More</span>
                      <RxExit className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </Link>
                </div>
                {shows.length > 0 ? (
                  <CardGrid contents={shows} displayStyle="grid" />
                ) : (
                  <p className="text-white mt-4 p-4 bg-gray-800/30 rounded-md text-center">
                    No shows available.
                  </p>
                )}
              </section>
            </>
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}
