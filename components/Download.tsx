import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTelegram, FaDownload } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
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
  

  const { streamUrl, loading: tokenLoading, error: tokenError } = useStreamToken({
    contentId: contentId,
    mediaType: episodeNumber ? 'show' : 'movie', 
    qualityIndex: qualityIndex,
    seasonNumber, 
    episodeNumber, 
    isActive: isOpen  
  });

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
      
      // Update links from API response
      setTelegramLink(data.telegramLink);
      setDirectLink(data.directLink);
    } catch (err) {
      console.error("Error getting download links:", err);
      setError("Couldn't generate download links");
      
      
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isOpen && streamUrl) {
    getDownloadLinks();
  }
}, [isOpen, streamUrl, title, selectedQuality, contentId, episodeNumber, qualityIndex, seasonNumber]);

  if (!isOpen) return null;

  // Direct download handler
  const handleDirectDownload = () => {
    if (directLink) {
      window.open(directLink, '_blank');
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
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gray-900 rounded-xl p-6 w-full max-w-md z-10 border border-gray-700 shadow-2xl"
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
            </>
          )}
          
          <p className="text-xs text-gray-400 text-center mt-4">
            Note: Use telegram for faster downloads. Direct download may be slower.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Download;