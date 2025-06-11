import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTelegram, FaDownload, FaPlay, FaChevronDown } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { SiVlcmediaplayer } from "react-icons/si";
import { useStreamToken } from "@/hooks/useStreamToken";

interface DownloadProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: number;
  title: string;
  selectedQuality: {
    type: string;
    fileid: string;
    size: string;
    audio: string;
    subtitle: string;
    video_codec: string;
    file_type: string;
  } | null;
  qualityIndex: number;
  seasonNumber?: number;  
  episodeNumber?: number; 
}

const Download: React.FC<DownloadProps> = ({ 
  isOpen, 
  onClose, 
  contentId,
  title,
  selectedQuality,
  qualityIndex,
  seasonNumber, 
  episodeNumber 
}) => {
  const [telegramLink, setTelegramLink] = useState<string>("");
  const [directLink, setDirectLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExternalPlayers, setShowExternalPlayers] = useState(false);
  const [copyButtonState, setCopyButtonState] = useState<'default' | 'copied' | 'error'>('default');

  const { streamUrl, loading: tokenLoading, error: tokenError } = useStreamToken({
    contentId: contentId,
    mediaType: episodeNumber ? 'show' : 'movie', 
    qualityIndex: qualityIndex,
    seasonNumber, 
    episodeNumber, 
    isActive: isOpen  
  });

  const createStreamUrl = (url: string) => {
    if (!url) return '';
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    

    const host = typeof window !== 'undefined' ? window.location.origin : '';
    return url.startsWith('/') ? `${host}${url}` : `${host}/${url}`;
  };

  useEffect(() => {
  const getDownloadLinks = async () => {
    if (!streamUrl) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamUrl: streamUrl, 
          title,
          quality: selectedQuality?.type || "Unknown",
          size: selectedQuality?.size || "Unknown",
          contentId,
          mediaType: episodeNumber ? 'show' : 'movie',
          qualityIndex,
          seasonNumber,
          episodeNumber
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate download links');
      }
      
      const data = await response.json();
      
      let potentialDirectLink = data.directLink || streamUrl;

      if (potentialDirectLink) {
        if (potentialDirectLink.startsWith('http://https://')) {
          potentialDirectLink = potentialDirectLink.substring('http://'.length);
        } else if (potentialDirectLink.startsWith('https://http://')) {
          potentialDirectLink = potentialDirectLink.substring('https://'.length);
        }
      }
      
      setTelegramLink(data.telegramLink);
      setDirectLink(createStreamUrl(potentialDirectLink));
    } catch (err) {
      console.error("Error getting download links:", err);
      setError("Couldn't generate download links");
      
      let fallbackStreamUrl = streamUrl;
      if (fallbackStreamUrl) {
        if (fallbackStreamUrl.startsWith('http://https://')) {
          fallbackStreamUrl = fallbackStreamUrl.substring('http://'.length);
        } else if (fallbackStreamUrl.startsWith('https://http://')) {
          fallbackStreamUrl = fallbackStreamUrl.substring('https://'.length);
        }
      }
      setDirectLink(createStreamUrl(fallbackStreamUrl));
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isOpen && streamUrl) {
    getDownloadLinks();
  }
}, [isOpen, streamUrl, title, selectedQuality, contentId, episodeNumber, qualityIndex, seasonNumber]);

  if (!isOpen) return null;


  const handleDirectDownload = () => {
    if (directLink) {
      window.open(directLink, '_blank');
    }
  };
  const handleVLCPlay = () => {
    if (directLink) {

      const urlForVLC = directLink.replace(/^https?:\/\//i, '');
      window.open(`vlc://${urlForVLC}`, '_self');
    }
  };

  const handleMXPlayerPlay = () => {
    if (directLink) {
      const intent = `intent:${directLink}#Intent;package=com.mxtech.videoplayer.ad;type=video/*;end`;
      window.open(intent, '_self');
    }
  };

  const handlePotPlayerPlay = () => {
    if (directLink) {
      window.open(`potplayer://${directLink}`, '_self');
    }
  };

  const handleGenericPlayerPlay = () => {
    if (directLink) {
      navigator.clipboard.writeText(directLink).then(() => {
        setCopyButtonState('copied');
        setTimeout(() => setCopyButtonState('default'), 2000); 
      }).catch(() => {
        setCopyButtonState('error');
        setTimeout(() => setCopyButtonState('default'), 2000);
        prompt('Copy this URL to your media player:', directLink);
      });
    }
  };

  const qualityDisplay = selectedQuality ? 
    `${selectedQuality.type} (${selectedQuality.size})` : 
    "Standard quality";

  const showLoader = tokenLoading || isLoading;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gray-900 rounded-xl p-6 w-full max-w-md z-10 border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Download &quot;{title}&quot;</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-300 mb-2">
            Selected quality: <span className="font-semibold">{qualityDisplay}</span>
          </div>
          
          {showLoader ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error || tokenError ? (
            <div className="text-red-500 text-center py-4">{error || tokenError}</div>
          ) : (
            <>
              {/* Download Options */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white mb-2">Download Options</h3>
                
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg w-full transition-colors"
                >
                  <FaTelegram size={20} />
                  <span>Download via Telegram</span>
                </a>
                
                <button
                  onClick={handleDirectDownload}
                  className="flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg w-full transition-colors"
                >
                  <FaDownload size={20} />
                  <span>Direct Download</span>
                </button>
              </div>

              {/* External Players Section */}
              <div className="border-t border-gray-600 pt-4">
                <button
                  onClick={() => setShowExternalPlayers(!showExternalPlayers)}
                  className={`
                    flex items-center justify-between w-full py-3 px-4 rounded-lg 
                    bg-gray-800 hover:bg-gray-700 text-white transition-all duration-200
                    border border-gray-600 hover:border-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                    active:scale-[0.98] transform
                    sm:py-2.5 sm:px-3
                  `}
                >
                  <div className="flex items-center gap-3">
                    <FaPlay size={16} className="text-blue-400" />
                    <span className="font-medium text-sm sm:text-base">Play in External Player</span>
                  </div>
                  <FaChevronDown 
                    size={14} 
                    className={`
                      transform transition-transform duration-200 text-gray-400
                      ${showExternalPlayers ? 'rotate-180' : 'rotate-0'}
                    `}
                  />
                </button>

                {showExternalPlayers && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                      opacity: 1, 
                      height: 'auto',
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    exit={{ 
                      opacity: 0, 
                      height: 0,
                      transition: { duration: 0.15, ease: "easeIn" }
                    }}
                    className="mt-3 space-y-2 overflow-hidden"
                  >
                    {/* VLC Player */}
                    <button
                      onClick={handleVLCPlay}
                      className="flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 text-white py-2.5 px-4 rounded-lg w-full transition-all duration-200 active:scale-[0.98] transform"
                    >
                      <SiVlcmediaplayer size={18} />
                      <span className="text-sm sm:text-base">Open in VLC</span>
                    </button>

                    {/* MX Player (Android) */}
                    <button
                      onClick={handleMXPlayerPlay}
                      className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg w-full transition-all duration-200 active:scale-[0.98] transform"
                    >
                      <FaPlay size={16} />
                      <span className="text-sm sm:text-base">Open in MX Player</span>
                    </button>

                    {/* PotPlayer (PC) */}
                    <button
                      onClick={handlePotPlayerPlay}
                      className="flex items-center justify-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 px-4 rounded-lg w-full transition-all duration-200 active:scale-[0.98] transform"
                    >
                      <FaPlay size={16} />
                      <span className="text-sm sm:text-base">Open in PotPlayer</span>
                    </button>

                    {/* Generic/Copy URL */}
                    <button
                      onClick={handleGenericPlayerPlay}
                      className={`
                        flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg w-full transition-all duration-200 active:scale-[0.98] transform
                        ${copyButtonState === 'copied' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : copyButtonState === 'error'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-gray-600 hover:bg-gray-500'
                        } text-white
                      `}
                    >
                      <FaPlay size={16} />
                      <span className="text-sm sm:text-base">
                        {copyButtonState === 'copied' 
                          ? 'URL Copied!' 
                          : copyButtonState === 'error'
                          ? 'Copy Failed'
                          : 'Copy Stream URL'
                        }
                      </span>
                    </button>
                  </motion.div>
                )}
              </div>
            </>
          )}
          
          <p className="text-xs text-gray-400 text-center mt-4">
            Note: External players require the respective apps to be installed on your device.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Download;