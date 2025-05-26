import React, { useRef, useState, useEffect } from "react";
import { Card, content } from "./Card";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { debounce } from "lodash";

interface contentGridProps {
  contents: content[];
  displayStyle?: "slider" | "grid";
  similar?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const CardGrid: React.FC<contentGridProps> = ({
  contents,
  displayStyle = "slider",
  similar = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollable = () => {
    if (scrollContainerRef.current) {
      const containerEl = scrollContainerRef.current;
      const canRight =
        containerEl.scrollWidth >
        containerEl.clientWidth + containerEl.scrollLeft;
      const canLeft = containerEl.scrollLeft > 0;
      setCanScrollRight(canRight);
      setCanScrollLeft(canLeft);
    }
  };

  useEffect(() => {
    if (displayStyle === "slider") {
      const containerEl = scrollContainerRef.current;
      const debouncedCheckScroll = debounce(checkScrollable, 100);

      checkScrollable();

      if (containerEl) {
        containerEl.addEventListener("scroll", debouncedCheckScroll);
      }

      const resizeObserver = new ResizeObserver(debouncedCheckScroll);
      if (containerEl) resizeObserver.observe(containerEl);

      return () => {
        if (containerEl) {
          containerEl.removeEventListener("scroll", debouncedCheckScroll);
          resizeObserver.unobserve(containerEl);
        }
        debouncedCheckScroll.cancel();
      };
    }
  }, [contents, displayStyle]);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.min(300, window.innerWidth * 0.3);
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.min(300, window.innerWidth * 0.3);
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (similar === true) {
    const gridContents = contents.slice(0, 16);
    return (
      <motion.div
        className="font-mont w-full px-2 sm:px-4 md:px-6 lg:px-8"
        initial="hidden"
        animate="show"
        variants={container}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {gridContents.map((content) => (
            <motion.div 
              key={content.id} 
              variants={container}
              className="flex justify-center"
            >
              <div className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]">
                <Link href={`/${content.media_type}/${content.id}`}>
                  <Card content={content} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>)};

    if (displayStyle === "grid") {
    const gridContents = contents.slice(0, 16);
    return (
      <motion.div
        className="font-mont w-full px-2 sm:px-4 md:px-6 lg:px-8"
        initial="hidden"
        animate="show"
        variants={container}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5">
          {gridContents.map((content) => (
            <motion.div 
              key={content.id} 
              variants={container}
              className="flex justify-center"
            >
              <div className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]">
                <Link href={`/${content.media_type}/${content.id}`}>
                  <Card content={content} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="font-mont w-full px-2 sm:px-4 md:px-6 lg:px-8"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {contents.map((content) => (
            <div
              key={content.id}
              className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]"
            >
              <Link href={`/${content.media_type}/${content.id}`}>
                <Card content={content} />
              </Link>
            </div>
          ))}
        </div>

        {canScrollLeft && (
          <motion.button
            className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 flex items-center justify-center bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white z-10 cursor-pointer rounded-r-md"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <FaChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        )}

        {canScrollRight && (
          <motion.button
            className="absolute right-0 top-0 bottom-0 w-8 sm:w-10 flex items-center justify-center bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white z-10 cursor-pointer rounded-l-md"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <FaChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
