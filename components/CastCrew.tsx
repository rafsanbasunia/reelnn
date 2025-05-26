import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import Image from "next/image";

interface CastMember {
  name: string;
  character: string;
  imageUrl: string;
}

interface CastCrewProps {
  castMembers: CastMember[];
}

const CastCrew: React.FC<CastCrewProps> = ({ castMembers }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollable = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      const tolerance = 1;
      const canRight =
        container.scrollWidth >
        container.clientWidth + container.scrollLeft + tolerance;
      const canLeft = container.scrollLeft > tolerance;

      setCanScrollRight(canRight);
      setCanScrollLeft(canLeft);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const options = {
      root: container,
      rootMargin: "0px",
      threshold: 0.1,
    };

    // left and right sentinel elements
    const leftSentinel = document.createElement("div");
    leftSentinel.style.position = "absolute";
    leftSentinel.style.left = "0";
    leftSentinel.style.height = "100%";
    leftSentinel.style.width = "1px";

    const rightSentinel = document.createElement("div");
    rightSentinel.style.position = "absolute";
    rightSentinel.style.right = "0";
    rightSentinel.style.height = "100%";
    rightSentinel.style.width = "1px";

    container.appendChild(leftSentinel);
    container.appendChild(rightSentinel);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === leftSentinel) {
          setCanScrollLeft(!entry.isIntersecting);
        } else if (entry.target === rightSentinel) {
          setCanScrollRight(!entry.isIntersecting);
        }
      });
    }, options);

    observer.observe(leftSentinel);
    observer.observe(rightSentinel);

    setTimeout(checkScrollable, 100);

    return () => {
      observer.disconnect();
      container.removeChild(leftSentinel);
      container.removeChild(rightSentinel);
    };
  }, [castMembers]);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.min(
        300,
        scrollContainerRef.current.clientWidth * 0.8
      );
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });

      setTimeout(checkScrollable, 150);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.min(
        300,
        scrollContainerRef.current.clientWidth * 0.8
      );
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });

      setTimeout(checkScrollable, 150);
    }
  };

  if (!castMembers || castMembers.length === 0) {
    return null;
  }

  return (
    <div className=" font-mont w-full relative group">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide w-full px-2 sm:px-4 md:px-6 lg:px-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {castMembers.map((member, index) => (
          <motion.div
            key={member.name || index}
            className="flex-shrink-0 w-36 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <motion.div className="relative w-full h-48 mb-2 overflow-hidden rounded-lg shadow-md">
              {member.imageUrl ? (
                <motion.div
                  className="font-mont w-full h-full"
                  initial={{ opacity: 0.8 }}
                  whileHover={{
                    scale: 1.1,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/w300${member.imageUrl}`}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 144px, 144px"
                    className="object-cover object-top pointer-events-none"
                    loading="lazy"
                  />
                </motion.div>
              ) : (
                // Placeholder for missing image
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No Image</span>
                </div>
              )}
            </motion.div>
            <h3 className="font-semibold text-sm sm:text-base truncate px-1">
              {member.name}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm truncate px-1">
              {member.character}
            </p>
          </motion.div>
        ))}
      </div>

      {canScrollLeft && (
        <motion.button
          className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 flex items-center justify-center bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white z-10 cursor-pointer rounded-r-md" // Matched CardGrid style
          onClick={scrollLeft}
          aria-label="Scroll left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <FaChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
      )}

      {canScrollRight && (
        <motion.button
          className="absolute right-0 top-0 bottom-0 w-8 sm:w-10 flex items-center justify-center bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white z-10 cursor-pointer rounded-l-md" // Matched CardGrid style
          onClick={scrollRight}
          aria-label="Scroll right"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <FaChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
      )}
    </div>
  );
};

export default CastCrew;
