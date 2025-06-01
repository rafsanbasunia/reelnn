import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiChevronDown,
  FiSearch,
  FiDownload,
  FiPlay,
} from "react-icons/fi";
import Image from "next/image";
import VideoPlayer from "./VideoPlayer";
import { useStreamToken } from '@/hooks/useStreamToken';
import { AnimatePresence } from "framer-motion";
import Download from "./Download";


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

interface TVShowEpisodesProps {
  seasons: Season[];
}

interface SeasonSelectorProps {
  currentSeason: number;
  seasons: number[];
  onSeasonChange: (season: number) => void;
}

interface EpisodeListProps {
  episodes: Episode[];
  searchQuery: string;
  currentSeason: number;
}

// Season Selector Component
const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  currentSeason,
  seasons,
  onSeasonChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full sm:w-auto min-w-[200px]">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-transparent backdrop-blur-md text-white py-2 px-4 rounded-md border border-gray-700 flex items-center justify-between w-full"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>Season {currentSeason}</span>
        <FiChevronDown
          className={`ml-2 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-1 w-full bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-md z-20 max-h-60 overflow-y-auto"
            role="listbox"
          >
            {seasons.map((season) => (
              <motion.div
                key={season}
                whileHover={{ backgroundColor: "rgba(51, 51, 51, 0.6)" }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => {
                  onSeasonChange(season);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={season === currentSeason}
              >
                Season {season}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Search Bar Component
const SearchBar: React.FC<{ onSearch: (query: string) => void }> = ({
  onSearch,
}) => {
  return (
    <div className="font-mont relative w-full">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
      <input
        type="text"
        placeholder="Search episode..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full bg-transparent backdrop-blur-md border border-gray-700 py-2 pl-10 pr-4 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors"
        aria-label="Search episodes"
      />
    </div>
  );
};

// Episode Item Component
const EpisodeItem: React.FC<{ episode: Episode; index: number; showId: string; seasonNumber: number }> = ({
  episode,
  index,
  showId,
  seasonNumber,
}) => {
  const [showQualityOptions, setShowQualityOptions] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(
    episode.quality && episode.quality.length > 0 ? 0 : -1
  );
  const [showPlayer, setShowPlayer] = useState(false);
  const [showDownload, setShowDownload] = useState(false); 


  const { streamUrl } = useStreamToken({
    contentId: showId,
    mediaType: 'show',
    qualityIndex: selectedQuality,
    seasonNumber: seasonNumber,
    episodeNumber: episode.episode_number,
    isActive: showPlayer || showDownload 
  });

  // Memoize the quality info to prevent unnecessary calculations
  const currentQuality = useMemo(() => (
    episode.quality && selectedQuality >= 0 && selectedQuality < episode.quality.length
      ? episode.quality[selectedQuality]
      : null
  ), [episode.quality, selectedQuality]);

  const imageUrl = episode.still_path
    ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
    : "/placeholder-episode.jpg";

  const handlePlay = () => {
    if (episode.quality && episode.quality.length > 0 && selectedQuality >= 0) {
      setShowPlayer(true);
    }
  };

  const closePlayer = () => {
    setShowPlayer(false);
  };

  // Handle download button click
  const handleDownload = () => {
    if (episode.quality && episode.quality.length > 0 && selectedQuality >= 0) {
      setShowDownload(true);
    }
  };

  // Create episode title
  const episodeTitle = `${episode.name || `Episode ${episode.episode_number}`}`;

  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(55, 55, 55, 0.4)" }}
      className="flex flex-col sm:flex-row items-start p-3 sm:p-4 border-b border-gray-800 relative group"
    >

      <AnimatePresence>
        {showDownload && currentQuality && (
          <Download
            isOpen={showDownload}
            onClose={() => setShowDownload(false)}
            contentId={parseInt(showId)}
            title={episodeTitle}
            selectedQuality={{
              type: currentQuality.type || "Unknown",
              fileid: currentQuality.fileID || "",
              size: currentQuality.size || "Unknown",
              audio: currentQuality.audio || "Unknown",
              subtitle: currentQuality.subtitle || "",
              video_codec: currentQuality.video_codec || "",
              file_type: currentQuality.file_type || ""
            }}
            qualityIndex={selectedQuality}
            seasonNumber={seasonNumber}
            episodeNumber={episode.episode_number}
          />
        )}
      </AnimatePresence>

      {/* Episode thumbnail */}
      <div className="flex-shrink-0 relative w-full sm:w-32 h-40 sm:h-20 mb-2 sm:mb-0 sm:mr-4">
        <div className="w-full h-full bg-gray-800 relative overflow-hidden rounded">
          {episode.still_path ? (
            <Image
              src={imageUrl}
              alt={episode.name || `Episode ${episode.episode_number}`}
              fill
              sizes="(max-width: 640px) 100vw, 128px"
              style={{ objectFit: "cover" }}
              className="rounded"
              priority={index < 3}
              loading={index >= 3 ? "lazy" : undefined}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <span className="text-lg font-bold text-white">
                {episode.episode_number}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow w-full sm:w-auto pr-20 sm:pr-24">
        <h3 className="text-lg font-semibold text-white truncate">
          {episode.episode_number}. {episode.name || "Untitled Episode"}
        </h3>
        <p className="text-gray-300 text-sm line-clamp-2 mt-1">
          {episode.overview || "No description available"}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-2 mb-2">
          {episode.air_date && (
            <span className="inline-block">
              {new Date(episode.air_date).toLocaleDateString()}
            </span>
          )}
          {episode.quality &&
            episode.quality.length > 0 &&
            selectedQuality >= 0 && (
              <>
                <button
                  onClick={() => setShowQualityOptions(!showQualityOptions)}
                  className="inline-flex items-center gap-1 bg-gray-700 px-2 py-0.5 rounded hover:bg-gray-600 transition-colors"
                >
                  <span>
                    {episode.quality[selectedQuality].type || "Quality"}
                  </span>
                  <FiChevronDown
                    className={`transition-transform ${
                      showQualityOptions ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {episode.quality[selectedQuality].video_codec && (
                  <span className="inline-block bg-gray-700 px-2 py-0.5 rounded">
                    {episode.quality[selectedQuality].video_codec}
                  </span>
                )}
                {episode.quality[selectedQuality].runtime && (
                  <span className="inline-block bg-gray-700 px-2 py-0.5 rounded">
                    {episode.quality[selectedQuality].runtime}min
                  </span>
                )}
              </>
            )}
        </div>

        {/* Quality selector dropdown */}
        {showQualityOptions &&
          episode.quality &&
          episode.quality.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-20 mt-1 bg-gray-800 rounded-md shadow-lg border border-gray-700 w-38 ml-16"
            >
              {episode.quality.map((quality, idx) => (
                <button
                  key={idx}
                  className={`flex-col w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors ${
                    selectedQuality === idx ? "bg-gray-700" : ""
                  }`}
                  onClick={() => {
                    setSelectedQuality(idx);
                    setShowQualityOptions(false);
                  }}
                >
                  <div className="text-sm">{quality.type || "Unknown"}</div>
                  <div className="text-xs text-gray-400 flex flex-wrap gap-1">
                    
                    {quality.video_codec && <span> {quality.video_codec}</span>}
                    {quality.size && <div className="ml-auto">{quality.size}</div>}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
      </div>
      <div className="flex gap-2 absolute top-1/2 -translate-y-1/2 right-4 z-10 sm:flex-col">
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="p-2 rounded-full bg-gray-700 hover:bg-red-500 text-white shadow-md"
          aria-label="Play episode"
          onClick={handlePlay}
        >
          <FiPlay size={16} className="sm:size-[18px]" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          className="p-2 rounded-full bg-gray-700 hover:bg-blue-500 text-white shadow-md"
          aria-label="Download episode"
          onClick={handleDownload}
        >
          <FiDownload size={16} className="sm:size-[18px]" />
        </motion.button>
      </div>
      
      {/* Video Player Component */}
      {showPlayer && episode.quality && episode.quality.length > 0 && selectedQuality >= 0 && streamUrl && (
        <VideoPlayer
          videoSource={streamUrl}
          title={episodeTitle}
          quality={episode.quality[selectedQuality].type || ""}
          onClose={closePlayer}
        />
      )}
    </motion.div>
  );
};

// Episode List Component
const EpisodeList: React.FC<EpisodeListProps & { showId: string; currentSeason: number }> = ({
  episodes,
  searchQuery,
  currentSeason,
  showId
}) => {
  const filteredEpisodes = useMemo(() => {
    return episodes
      .filter(episode => 
        episode.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        episode.overview?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.episode_number - b.episode_number);
  }, [episodes, searchQuery]);

  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No episodes available for this season.
      </div>
    );
  }


  const shouldUseScroll = filteredEpisodes.length >= 3;
  const containerClassName = `mt-4 border-t border-gray-800 ${
    shouldUseScroll ? 'max-h-[500px] overflow-y-auto pr-1 custom-scrollbar' : ''
  }`;

  return (
    <div className={containerClassName}>
      {filteredEpisodes.length > 0 ? (
        filteredEpisodes.map((episode, index) => (
          <EpisodeItem
            key={episode.episode_number}
            episode={episode}
            index={index}
            showId={showId}
            seasonNumber={currentSeason}
          />
        ))
      ) : (
        <div className="text-center py-8 text-gray-400">
          No episodes found matching your search criteria.
        </div>
      )}
    </div>
  );
};


// Main Component
const TVShowEpisodes: React.FC<TVShowEpisodesProps & { showId: string }> = ({ seasons, showId }) => {
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle missing or empty seasons
  if (!seasons || seasons.length === 0) {
    return (
      <section className="text-white" aria-labelledby="episodes-heading">
      
        <div className="max-w-6xl mx-auto">
        <h2 id="episodes-heading" className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Episodes</h2>
        <div className="text-center py-8 text-gray-400">No episodes available for this show.</div>
        </div>
      </section>
    );
  }

  const seasonNumbers = seasons.map(season => season.season_number);
  

  const currentSeason = seasonNumbers[currentSeasonIndex] || seasonNumbers[0] || 1;


  const currentEpisodes = seasons.find(s => s.season_number === currentSeason)?.episodes || [];

  return (
    <section
      className="text-white"
      aria-labelledby="episodes-heading"
    >
      <div className="max-w-6xl mx-auto">
        

        <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <SeasonSelector
            currentSeason={currentSeason}
            seasons={seasonNumbers}
            onSeasonChange={(season) => {
              const index = seasonNumbers.indexOf(season);
              if (index !== -1) setCurrentSeasonIndex(index);
            }}
          />

          <SearchBar onSearch={setSearchQuery} />
        </div>

        <EpisodeList
          episodes={currentEpisodes}
          searchQuery={searchQuery}
          currentSeason={currentSeason}
          showId={showId}
        />
      </div>
    </section>
  );
};

export default TVShowEpisodes;