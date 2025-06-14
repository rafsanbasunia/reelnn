import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRegCalendarAlt,
  FaRegHeart,
  FaHeart,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { MdOutlineCalendarMonth, MdOutlineLiveTv } from "react-icons/md";

interface MovieDetailsProps {
  title: string;
  trailer: string;
  year: number;
  genres: string[];
  poster: string;
  logo?: string;
  backgroundImage: string;
  total_seasons: number;
  total_episodes: number;
  show_status: string;
  description: string;
  creators: string[];
  isFavorite?: boolean;
  isWatched?: boolean;
  runtime: number; 
  vote?: number;
  contentId?: number; 
}

// YouTube Trailer Modal Component
interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
  title: string;
}


const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, trailerUrl, title }) => {
  if (!isOpen) return null;


  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtube.com\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeVideoId(trailerUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} 
    >
      <motion.div 
        className="relative w-full max-w-4xl aspect-video bg-black rounded-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 15 }}
        onClick={e => e.stopPropagation()} 
      >
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-white p-2 hover:text-gray-300"
          aria-label="Close trailer"
        >
          <FaTimes size={24} />
        </button>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={`${title} Trailer`}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            {trailerUrl ? "Invalid YouTube URL" : "No trailer available"}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const TopCard: React.FC<MovieDetailsProps> = ({
  title,
  trailer,
  year,
  poster,
  total_seasons,
  total_episodes,
  show_status,
  description,
  logo,
  creators,
  isFavorite = false,
  isWatched = false,
  vote,
  contentId
}) => {

  const getStorageKey = (type: 'favorite' | 'watched') => `show_${type}_${contentId || title.replace(/\s+/g, '_')}`;
  
  const loadFromStorage = (type: 'favorite' | 'watched', defaultValue: boolean) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(getStorageKey(type));
      return stored ? JSON.parse(stored) : defaultValue;
    }
    return defaultValue;
  };
  
  const saveToStorage = (type: 'favorite' | 'watched', value: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getStorageKey(type), JSON.stringify(value));
    }
  };

  const [favorite, setFavorite] = useState(() => loadFromStorage('favorite', isFavorite));
  const [watched, setWatched] = useState(() => loadFromStorage('watched', isWatched));
  const [trailerOpen, setTrailerOpen] = useState(false);


  const handleFavoriteToggle = () => {
    const newFavorite = !favorite;
    setFavorite(newFavorite);
    saveToStorage('favorite', newFavorite);
  };

  const handleWatchedToggle = () => {
    const newWatched = !watched;
    setWatched(newWatched);
    saveToStorage('watched', newWatched);
  };

  const hasValidTrailer = useMemo(() => {
    try {
      if (!trailer) return false;
      new URL(trailer);
      return true;
    } catch (e) {
      console.error("Invalid trailer URL:", e);
      return false;
    }
  }, [trailer]);
  
  return (
    <div className="font-mont w-full text-white">

      <div className="flex flex-col md:flex-row w-full p-3 sm:p-6">
        {/* Movie Poster */}
        <div className="w-full max-w-[300px] h-[450px] md:w-80 md:h-[480px] mx-auto md:mx-0 relative rounded-md overflow-hidden shadow-lg mb-6 md:mb-0 flex-shrink-0 pointer-events-none">
          <Image
            src={poster}
            alt={`${title} poster`}
            layout="fill"
            objectFit="cover"
            className="w-full h-full"
            priority 
            sizes="(max-width: 768px) 300px, 320px"
            unoptimized
          />
        </div>

        {/* Movie Details */}
        <div className="md:ml-8 flex-grow">
          
          {logo && (
            <div className="font-light uppercase mb-2 hidden sm:block pointer-events-none">
              <Image
                src={`https://image.tmdb.org/t/p/w500${logo}`}
                alt={`${title} logo`}
                width={420}
                height={120}
                layout="intrinsic"
                className="w-auto h-auto max-h-[80px] md:max-h-[120px]"
                unoptimized
              />
            </div>
          )}

          {/* Movie Title */}
          <h1 className="text-2xl font-bold mb-2 sm:hidden">{title}</h1>

          {/* Basic Movie Info */}
          <div className="flex mt-4 flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-2 text-sm sm:text-base">
            <span className="flex items-center">
              <MdOutlineCalendarMonth className="mr-1" />
              <span className="text-gray-300">{year}</span>
            </span>
            {vote !== undefined && vote > 0 && (
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="gold"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  className="mr-1"
                >
                  <path d="M12 .587l3.668 7.568L24 9.423l-6 5.847 1.417 8.253L12 18.897l-7.417 4.626L6 15.27 0 9.423l8.332-1.268z" />
                </svg>
                {vote.toFixed(1)}
              </span>
            )}
            <span className="flex items-center">
              <MdOutlineLiveTv className="mr-1" />
              <span className="text-gray-300 ">{show_status}</span>
            </span>
          </div>

          {/* Technical Details  */}
          <div className="mb-4 sm:mb-2  text-xs sm:text-sm text-gray-400">
            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-1 sm:space-y-0">
              <div>
                <span className="font-semibold mr-2">Seasons:</span>
                <span>{total_seasons}</span>
              </div>
              <div>
                <span className="font-semibold mr-2">Episodes:</span>
                <span>{total_episodes}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
            {hasValidTrailer && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTrailerOpen(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-md flex items-center justify-center"
              >
                <FaRegCalendarAlt className="mr-2" /> Play Trailer
              </motion.button>
            )}

            {/* Icons */}
            {/* TODO */}
            <div className="col-span-2 flex justify-start space-x-3 mt-2 sm:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full"
                onClick={handleWatchedToggle}
                aria-label={watched ? "Mark as unwatched" : "Mark as watched"}
              >
                {watched ? <FaCheck /> : <FaCheck className="text-gray-400" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full"
                onClick={handleFavoriteToggle}
                aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
              >
                {favorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              </motion.button>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-300 mb-4 max-w-2xl leading-relaxed">
            {description || "No description available."}
          </p>

          {/* creators */}
          <div className="text-sm sm:text-base text-gray-400">
            <span className="font-semibold mr-2">Creators:</span> {creators.join(", ")}
          </div>
        </div>
      </div>

      {/* Trailer Modal  */}
      <AnimatePresence>
        {trailerOpen && (
          <TrailerModal 
            isOpen={trailerOpen} 
            onClose={() => setTrailerOpen(false)} 
            trailerUrl={trailer} 
            title={title} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopCard;