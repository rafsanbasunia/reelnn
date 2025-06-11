import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaRegCalendarAlt,
  FaRegHeart,
  FaHeart,
  FaCheck,
  FaTimes,
  FaDownload,
} from "react-icons/fa";
import Download from "./Download";
import { MdOutlineCalendarMonth } from "react-icons/md";

interface MovieDetailsProps {
  trailer: string;
  title: string;
  year: number;
  genres: string[];
  poster: string;
  logo?: string;
  backgroundImage: string;
  videoQuality: string;
  size: string;
  audioQuality: string;
  subtitles: string;
  description: string;
  director: string[];
  isFavorite?: boolean;
  isWatched?: boolean;
  vote?: number;
  runtime: number;
  onPlayClick?: (qualityIndex?: number) => void;
  quality?: {
    type: string;
    fileid: string;
    size: string;
    audio: string;
    subtitle: string;
    video_codec: string;
    file_type: string;
  }[];
  streamUrl?: string;
  contentId: number;
}

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
  title: string;
}

const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  trailerUrl,
  title,
}) => {
  if (!isOpen) return null;

  // Extract video ID from YouTube URL
  const getYoutubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtube.com\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeVideoId(trailerUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : "";

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
        onClick={(e) => e.stopPropagation()}
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
            Invalid YouTube URL
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const TopCard: React.FC<MovieDetailsProps> = ({
  contentId,
  title,
  trailer,
  year,
  poster,
  description,
  logo,
  director,
  isFavorite = false,
  isWatched = false,
  runtime,
  vote,
  onPlayClick,
  quality = [],
}) => {
  const getStorageKey = (type: 'favorite' | 'watched') => `${type}_${contentId}`;


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

  const [favorite, setFavorite] = React.useState(() => loadFromStorage('favorite', isFavorite));
  const [watched, setWatched] = React.useState(() => loadFromStorage('watched', isWatched));
  const [trailerOpen, setTrailerOpen] = React.useState(false);
  const [showQualityOptions, setShowQualityOptions] = React.useState(false);
  const [selectedQuality, setSelectedQuality] = React.useState(0);
  const [showDownload, setShowDownload] = React.useState(false);


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

  const handlePlayClick = () => {
    if (onPlayClick) {
      onPlayClick(selectedQuality);
    }
  };

  const handleTrailerClick = () => {
    setTrailerOpen(true);
  };

  const closeTrailer = () => {
    setTrailerOpen(false);
  };

  const getQualityInfo = (
    qualityArray: MovieDetailsProps["quality"],
    selectedIndex: number
  ) => {
    const selected =
      qualityArray && qualityArray.length > 0
        ? qualityArray[selectedIndex]
        : null;

    return {
      quality: selected?.type || "N/A",
      size: selected?.size || "N/A",
      audio: selected?.audio || "English AAC 5.1 (Default)",
      subtitle: selected?.subtitle || "English (Default SUBRIP)",
    };
  };

  const qualityInfo = getQualityInfo(quality, selectedQuality);

  return (
    <div className="font-mont flex flex-col w-full text-white min-h-[500px] relative">
      <AnimatePresence>
        {showDownload && (
          <Download
            isOpen={showDownload}
            onClose={() => setShowDownload(false)}
            contentId={contentId}
            title={title}
            selectedQuality={quality[selectedQuality]}
            qualityIndex={selectedQuality}
          />
        )}
      </AnimatePresence>

      {/* Content Container */}
      <div className="flex flex-col md:flex-row z-10 w-full p-4 sm:p-6 relative">
        {/* Movie Poster */}
        <div className="w-full max-w-[300px] h-[450px] md:w-80 md:h-[480px] mx-auto relative rounded-md overflow-hidden shadow-lg mb-6 md:mb-0 flex-shrink-0">
          <Image
            src={poster}
            alt={`${title} poster`}
            layout="fill"
            objectFit="cover"
            className="w-full h-full"
            priority={true}
            sizes="(max-width: 768px) 100vw, 300px"
            unoptimized
          />
        </div>

        {/* Movie Details */}
        <div className="md:ml-8 flex-grow">
          {logo ? (
            <div className="font-light uppercase mb-2 hidden sm:block pointer-events-none">
              <Image
                src={`https://image.tmdb.org/t/p/w500${logo}`}
                alt="Logo"
                width={420}
                height={120}
                layout="intrinsic"
                className="w-auto h-auto max-h-[80px] md:max-h-[120px]"
                unoptimized
              />
            </div>
          ) : (
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 hidden sm:block">
              {title}
            </h1>
          )}

          {/* Movie Title */}
          <h1 className="text-2xl font-bold mb-2 sm:hidden">{title}</h1>

          {/* Basic Movie Info */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6 text-sm sm:text-base">
            <MdOutlineCalendarMonth />
            <span className="text-gray-300">{year}</span>
            {vote && (
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
            <span className="flex items-center text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                className="mr-1"
              >
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
              {runtime} mins
            </span>
            <span> | </span>
            {(() => {
              const currentTime = new Date();
              const endTime = new Date(currentTime.getTime() + runtime * 60000);
              const formattedEndTime = endTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <span className="text-gray-300">
                  Ends at {formattedEndTime}
                </span>
              );
            })()}
          </div>

          {/* Technical Details */}
          <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-400">
            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-1 sm:space-y-0">
              <div className="relative">
                <button
                  onClick={() => setShowQualityOptions(!showQualityOptions)}
                  className="flex items-center hover:text-white transition-colors"
                >
                  <span className="font-semibold mr-2">Quality:</span>
                  <span>{qualityInfo.quality}</span>
                  {quality && quality.length > 1 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                        showQualityOptions ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>

                {/* Quality selector dropdown */}
                {showQualityOptions && quality && quality.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 mt-1 bg-gray-800 rounded-md shadow-lg border border-gray-700 w-48"
                  >
                    {quality.map((q, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200 border-b border-gray-700 last:border-0"
                        onClick={() => {
                          setSelectedQuality(idx);
                          setShowQualityOptions(false);
                        }}
                      >
                        <div className="flex justify-between">
                          <span>{q.type || "Unknown"}</span>
                          <span className="text-gray-400">{q.size || ""}</span>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-400 mt-1">
                          {q.audio && <span>{q.audio}</span>}
                          {q.video_codec && (
                            <span className="ml-auto">{q.video_codec}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
              <div>
                <span className="font-semibold mr-2">Size:</span>
                <span>{qualityInfo.size}</span>
              </div>
              <div>
                <span className="font-semibold mr-2">Audio:</span>
                <span>{qualityInfo.audio}</span>
              </div>
              <div>
                <span className="font-semibold mr-2">Subtitles:</span>
                <span>{qualityInfo.subtitle}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons grid layout */}
          <div className="flex flex-wrap gap-2 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handlePlayClick}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-700/80 backdrop-blur-md hover:bg-gray-600/80 text-white px-4 sm:px-6 py-2 rounded-md flex items-center justify-center transition-all duration-200"
            >
              <FaPlay className="mr-2" /> Play
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTrailerClick}
              className="bg-gray-700/80 backdrop-blur-md hover:bg-gray-600/80 text-white px-4 sm:px-6 py-2 rounded-md flex items-center justify-center transition-all duration-200"
            >
              <FaRegCalendarAlt className="mr-2" /> Trailer
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDownload(true)}
              className="bg-gray-700/80 backdrop-blur-md hover:bg-gray-600/80 text-white px-4 sm:px-6 py-2 rounded-md flex items-center justify-center transition-all duration-200"
            >
              <FaDownload className="mr-2" /> Download
            </motion.button>

            {/* Icon buttons */}
            <div className="col-span-3 flex justify-center sm:justify-start space-x-3 mt-2 sm:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-700/80 backdrop-blur-md hover:bg-gray-600/80 text-white p-2 rounded-full transition-all duration-200"
                onClick={handleWatchedToggle}
              >
                {watched ? <FaCheck /> : <FaCheck className="text-gray-400" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-700/80 backdrop-blur-md hover:bg-gray-600/80 text-white p-2 rounded-full transition-all duration-200"
                onClick={handleFavoriteToggle}
              >
                {favorite ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart />
                )}
              </motion.button>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-300 mb-4 max-w-2xl leading-relaxed">
            {description}
          </p>

          {/* Director */}
          <div className="text-sm sm:text-base text-gray-400">
            <span className="font-semibold mr-2">Director:</span>{" "}
            {director.join(", ")}
          </div>
        </div>
      </div>
      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={closeTrailer}
        trailerUrl={trailer}
        title={title}
      />
    </div>
  );
};

export default TopCard;
