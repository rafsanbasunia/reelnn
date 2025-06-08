import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export interface content {
  id: string;
  title: string;
  year: number;
  poster: string;
  vote_average: number;
  media_type: string;
}

interface contentCardProps {
  content: content;
}

export const Card: React.FC<contentCardProps> = ({ content }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      aria-label={`${content.title} (${content.year})`}
      role="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <motion.div
          className="font-mont w-full h-full"
          animate={{
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
        >
          <Image
            src={`https://image.tmdb.org/t/p/w500${content.poster}`}
            alt={content.title}
            fill
            sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, 200px"
            className="rounded-lg object-cover"
            loading="lazy"
            unoptimized
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />

        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 rounded px-1.5 py-0.5 sm:px-2 sm:py-1 pointer-events-none">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-white text-xs font-medium">
            {content.vote_average.toFixed(1)}
          </span>
        </div>

        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] sm:text-xs font-medium rounded px-1.5 py-0.5 sm:px-2 sm:py-1 pointer-events-none">
          {content.year}
        </div>

        <AnimatePresence mode="wait">
          {isHovered && (
            <>
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-red-500/80 hover:bg-red-600 rounded-full p-2 sm:p-3 transition-colors">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-black/70 p-1.5 sm:p-2 text-white z-10"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xs sm:text-sm font-medium truncate">
                  {content.title}
                </h3>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
