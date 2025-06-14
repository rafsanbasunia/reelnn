import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaPlay } from "react-icons/fa";
import { useHeroSlider } from "../context/HeroSliderContext";
import Navbar from "./Navbar";
import Link from "next/link";

const HeroSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { movies, isLoading, error } = useHeroSlider();
  
  useEffect(() => {
    if (movies.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [movies.length]);

  const currentMovie = movies[currentIndex];

  if (isLoading) {
    return (
      <div className="relative w-full h-[50vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] bg-neutral-900">
        {/* Background skeleton */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-neutral-800 to-neutral-900"></div>

        {/* Content skeleton */}
        <div className="relative z-20 h-full flex flex-col justify-end px-4 sm:px-8 md:px-12 lg:px-16 pb-8 sm:pb-12 md:pb-16 pt-16 sm:pt-20 md:pt-24">
          <div className="w-full mx-auto md:mx-4 lg:mx-8 xl:mx-16 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
            {/* Title skeleton */}
            <div className="h-12 sm:h-16 w-48 sm:w-64 md:w-80 bg-neutral-700 rounded animate-pulse mb-4"></div>

            {/* Meta data skeleton */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
              <div className="h-5 w-10 bg-neutral-700 rounded animate-pulse"></div>
              <div className="h-5 w-16 bg-neutral-700 rounded animate-pulse"></div>
              <div className="h-5 w-12 bg-neutral-700 rounded animate-pulse"></div>
            </div>

            {/* Description skeleton */}
            <div className="space-y-2 mb-6">
              <div className="h-3 bg-neutral-700 rounded animate-pulse"></div>
              <div className="h-3 bg-neutral-700 rounded animate-pulse"></div>
              <div className="h-3 bg-neutral-700 rounded animate-pulse w-3/4"></div>
            </div>

            {/* Buttons skeleton */}
            <div className="flex gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-700 animate-pulse"></div>
              <div className="w-24 h-10 sm:h-10 rounded-full bg-neutral-700 animate-pulse"></div>
            </div>
          </div>

          {/* Navigation dots skeleton */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-neutral-700 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Add this safety check
  if (!currentMovie || movies.length === 0) {
    return (
      <div className="relative w-full h-[85vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-md flex items-center justify-center">
              <span className="text-2xl">🖼️</span>
            </div>
            <p className="text-lg font-medium">No Backdrop</p>
            <p className="text-sm">No hero content available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" font-mont relative w-full h-[85vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden">
      <Navbar />

      {error && (
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-red-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded z-50 text-xs sm:text-sm">
          Failed to load content.
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute z-[2] w-full h-full bg-background/30 bg-gradient-to-b from-background/10 to-background" />
          {currentMovie.backdrop_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
              alt={currentMovie.title || 'Movie backdrop'}
              fill
              style={{ objectFit: "cover", objectPosition: "center 20%" }}
              quality={100}
              priority
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-md flex items-center justify-center">
                  <span className="text-4xl">🖼️</span>
                </div>
                <p className="text-xl font-medium">No Backdrop</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full flex flex-col justify-end px-4 sm:px-8 md:px-12 lg:px-16 pb-24 sm:pb-12 md:pb-16 pt-16 sm:pt-20 md:pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full mx-auto md:mx-4 lg:mx-8 xl:mx-16 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl"
          >
            <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4 pointer-events-none">
              {currentMovie.logo ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${currentMovie.logo}`}
                  alt={`${currentMovie.title} Logo`}
                  width={400}
                  height={208}
                  className="object-contain w-48 sm:w-64 md:w-80 lg:w-96 h-auto"
                  priority
                  unoptimized
                />
              ) : (
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                  {currentMovie.title}
                </h1>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <span className="bg-red-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold rounded">
                HD
              </span>
              <div className="flex items-center">
                <span className="text-yellow-400 mr-1">★</span>
                <span className="text-white text-xs sm:text-sm">
                  {(currentMovie.vote_average ?? 0).toFixed(1)}/10
                </span>
              </div>
              <span className="text-white text-xs sm:text-sm">
                {currentMovie.release_date.substring(0, 4)}
              </span>
              {currentMovie.genres.slice(0, 2).map((genre, index) => (
                <span
                  key={index}
                  className="text-white text-xs sm:text-sm hidden sm:inline"
                >
                  {genre}
                </span>
              ))}
            </div>
            <p className="text-white/80 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 md:mb-8 max-w-full line-clamp-3 sm:line-clamp-4 md:line-clamp-none">
              {currentMovie.overview}
            </p>
            <div className="flex gap-3 sm:gap-4 ">
              <Link
                href={`/${currentMovie.type}/${currentMovie.id}`}
                className="cursor-pointer"
              >
                <button className="flex items-center justify-center bg-white hover:bg-white/90 text-black font-medium rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 transition">
                  <FaPlay size={16} className="sm:hidden" />
                  <FaPlay size={18} className="hidden sm:block" />
                </button>
              </Link>
              <Link
                href={`/${currentMovie.type}/${currentMovie.id}`}
                className="cursor-pointer"
              >
                <button className="border border-white/30 text-white hover:bg-white/10 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-sm md:text-base rounded-full transition">
                  See More
                </button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                index === currentIndex ? "bg-white w-5 sm:w-6" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlideshow;
