import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RiPlayLargeLine,
  RiPauseLargeFill,
  RiForward10Line,
  RiReplay10Line,
  RiVolumeDownLine,
  RiVolumeUpLine,
  RiVolumeMuteLine,
  RiSettingsLine,
  RiArrowLeftLine,
  RiFullscreenLine,
  RiFullscreenExitLine,
} from "react-icons/ri";
import Image from "next/image";

interface VideoPlayerProps {
  videoSource: string;
  title?: string;
  logoUrl?: string;
  onClose: () => void;
  subtitles?: string;
  quality?: string;
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
const aspectRatioModes = [
  "bestFit",
  "fitScreen",
  "fill",
  "ratio16_9",
  "ratio4_3",
] as const; 
type AspectRatioMode = (typeof aspectRatioModes)[number];

const settingTabs = ["Speed", "Subtitles", "Settings"] as const;
type SettingTab = (typeof settingTabs)[number];

const getAspectRatioLabel = (mode: AspectRatioMode): string => {
  switch (mode) {
    case "bestFit":
      return "Best Fit";
    case "fitScreen":
      return "Fit Screen";
    case "fill":
      return "Fill";
    case "ratio16_9":
      return "16:9";
    case "ratio4_3":
      return "4:3";
    default:
      return "Aspect Ratio";
  }
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSource,
  title,
  logoUrl,
  onClose,
  subtitles,
  quality,
}) => {
  const [playerState, setPlayerState] = useState({
    isPlaying: true,
    progress: 0,
    currentTime: 0,
    duration: 0,
    volume: 1,
    lastVolume: 1,
    playbackRate: 1,
    isFullscreen: false,
    showControls: true,
    isLoading: true,
    bufferProgress: 0,
  });

  const updatePlayerState = useCallback((updates: Partial<typeof playerState>) => {
    setPlayerState((prev) => ({ ...prev, ...updates }));
  }, []);

  const [aspectRatioMode, setAspectRatioMode] =
    useState<AspectRatioMode>("bestFit");
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] =
    useState<SettingTab>("Settings");

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleBeforeUnload = () => {
      const currentPos = videoElement.currentTime;
      if (currentPos > 0) {
        sessionStorage.setItem("videoPosition", currentPos.toString());
      }
    };

    const resumePosition = sessionStorage.getItem("videoPosition");
    if (resumePosition) {
      videoElement.currentTime = parseFloat(resumePosition);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

useEffect(() => {
  const videoElement = videoRef.current;
  if (!videoElement) return;

  const handleTimeUpdate = () => {
    updatePlayerState({
      currentTime: videoElement.currentTime,
      progress: (videoElement.currentTime / videoElement.duration) * 100,
    });
  };

  const handleLoadedMetadata = () => {
    updatePlayerState({
      duration: videoElement.duration,
      volume: videoElement.volume,
      playbackRate: videoElement.playbackRate,
    });
  };

  videoElement.addEventListener("timeupdate", handleTimeUpdate);
  videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);

  videoElement.volume = playerState.volume;
  videoElement.playbackRate = playerState.playbackRate;

  return () => {
    videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
  };
}, [playerState.volume, playerState.playbackRate, updatePlayerState]);


  useEffect(() => {
  const resetTimer = () => {
    updatePlayerState({ showControls: true });
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);

    controlsTimeoutRef.current = setTimeout(() => {
      updatePlayerState({ showControls: false });
    }, 3000);
  };

  const handleInteraction = () => {
    resetTimer();
  };

  resetTimer();

  const playerElement = playerRef.current;
  if (playerElement) {
    playerElement.addEventListener("mousemove", handleInteraction);
    playerElement.addEventListener("click", handleInteraction);
  }

  document.addEventListener("keydown", handleInteraction);

  return () => {
    if (playerElement) {
      playerElement.removeEventListener("mousemove", handleInteraction);
      playerElement.removeEventListener("click", handleInteraction);
    }
    document.removeEventListener("keydown", handleInteraction);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
  };
}, [updatePlayerState]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const settingsButton = document.getElementById("video-settings-button");
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target as Node) &&
        settingsButton &&
        !settingsButton.contains(event.target as Node)
      ) {
        setShowSettingsMenu(false);
      }
    };

    if (showSettingsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettingsMenu]);

  useEffect(() => {
  const videoElement = videoRef.current;
  if (!videoElement) return;

  const handleLoadingChange = () => {
    updatePlayerState({ isLoading: videoElement.readyState < 3 });
  };

  const handleProgress = () => {
    if (!videoElement.duration || !isFinite(videoElement.duration)) return;

    const buffer = videoElement.buffered;
    if (buffer.length > 0) {
      const bufferedEnd = buffer.end(buffer.length - 1);
      updatePlayerState({
        bufferProgress: (bufferedEnd / videoElement.duration) * 100,
      });
    }
  };
  handleLoadingChange();

  videoElement.addEventListener("waiting", () =>
    updatePlayerState({ isLoading: true })
  );
  videoElement.addEventListener("playing", () =>
    updatePlayerState({ isLoading: false })
  );
  videoElement.addEventListener("canplay", handleLoadingChange);
  videoElement.addEventListener("canplaythrough", handleLoadingChange);
  videoElement.addEventListener("progress", handleProgress);

  videoElement.addEventListener("stalled", () =>
    updatePlayerState({ isLoading: true })
  );

  videoElement.addEventListener("seeking", () =>
    updatePlayerState({ isLoading: true })
  );
  videoElement.addEventListener("seeked", handleLoadingChange);

  return () => {
    videoElement.removeEventListener("waiting", () =>
      updatePlayerState({ isLoading: true })
    );
    videoElement.removeEventListener("playing", () =>
      updatePlayerState({ isLoading: false })
    );
    videoElement.removeEventListener("canplay", handleLoadingChange);
    videoElement.removeEventListener("canplaythrough", handleLoadingChange);
    videoElement.removeEventListener("progress", handleProgress);
    videoElement.removeEventListener("stalled", () =>
      updatePlayerState({ isLoading: true })
    );
    videoElement.removeEventListener("seeking", () =>
      updatePlayerState({ isLoading: true })
    );
    videoElement.removeEventListener("seeked", handleLoadingChange);
  };
}, [updatePlayerState]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = playerState.volume;

      videoRef.current.addEventListener("loadedmetadata", () => {
        if (videoRef.current) {
          videoRef.current.muted = false;
          videoRef.current.volume = playerState.volume;
        }
      });
    }
  }, [playerState.volume]);

  // Player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (playerState.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current
          .play()
          .catch((error) => console.error("Play failed:", error));
      }
      updatePlayerState({ isPlaying: !playerState.isPlaying });
    }
  };

  const seek = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(
        0,
        Math.min(videoRef.current.currentTime + seconds, playerState.duration)
      );
      videoRef.current.currentTime = newTime;
      updatePlayerState({
        currentTime: newTime,
        progress: (newTime / playerState.duration) * 100,
      });
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    if (
      videoRef.current &&
      playerState.duration > 0 &&
      isFinite(playerState.duration)
    ) {
      const newTime = (newProgress / 100) * playerState.duration;
      videoRef.current.currentTime = newTime;
      updatePlayerState({ currentTime: newTime, progress: newProgress });
    }
  };

  // --- Volume Controls ---
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    updatePlayerState({ volume: newVolume });
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
    if (newVolume > 0) {
      updatePlayerState({ lastVolume: newVolume });
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (playerState.volume > 0) {
        updatePlayerState({ lastVolume: playerState.volume, volume: 0 });
        videoRef.current.volume = 0;
        videoRef.current.muted = true;
      } else {
        const newVolume =
          playerState.lastVolume > 0 ? playerState.lastVolume : 1;
        updatePlayerState({ volume: newVolume });
        videoRef.current.volume = newVolume;
        videoRef.current.muted = false;
      }
    }
  };

  const getVolumeIcon = () => {
    if (playerState.volume === 0) return <RiVolumeMuteLine size={24} />;
    if (playerState.volume <= 0.33) return <RiVolumeDownLine size={24} />;
    if (playerState.volume <= 0.66) return <RiVolumeDownLine size={24} />;
    return <RiVolumeUpLine size={24} />;
  };

  // --- Playback Speed Controls ---
  const handleSpeedChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      updatePlayerState({ playbackRate: rate });
      setShowSettingsMenu(false);
    }
  };
  // --- End Playback Speed Controls ---

  const videoClasses = useMemo(() => {
    const baseClasses = "mx-auto my-auto z-0";
    switch (aspectRatioMode) {
      case "fitScreen":
        return `${baseClasses} w-full h-full object-cover`;
      case "fill":
        return `${baseClasses} w-full h-full object-fill`;
      case "ratio16_9":
        return `${baseClasses} aspect-video object-contain max-w-full max-h-full`;
      case "ratio4_3":
        return `${baseClasses} aspect-[4/3] object-contain max-w-full max-h-full`;
      case "bestFit":
      default:
        return `${baseClasses} max-w-full max-h-full object-contain`;
    }
  }, [aspectRatioMode]);

  const toggleFullscreen = () => {
    const playerElement = playerRef.current;
    if (!playerElement) return;

    if (!document.fullscreenElement) {
      playerElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
      updatePlayerState({ isFullscreen: true });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        updatePlayerState({ isFullscreen: false });
      }
    }
  };

  useEffect(() => {
  const handleFullscreenChange = () => {
    updatePlayerState({ isFullscreen: !!document.fullscreenElement });
  };
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  return () =>
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
}, [updatePlayerState]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const showLoadingOverlay =
    playerState.isLoading &&
    (playerState.currentTime < 1 || (videoRef.current?.readyState ?? 0) < 3);

  return (
    <motion.div
      className="font-mont fixed inset-0 bg-black z-50 flex flex-col select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={playerRef}
      onMouseLeave={() => {
        if (!showSettingsMenu) {
          updatePlayerState({ showControls: false });
        }
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <motion.button
          onClick={onClose}
          className="absolute top-4 left-4 z-30 text-white bg-black/50 rounded-full p-2 hover:bg-red-600 transition-all duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: playerState.showControls ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <RiArrowLeftLine size={24} />
        </motion.button>

        {/* Loading Overlay */}
        {showLoadingOverlay && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
            {logoUrl ? (
              <div className="relative max-w-[300px] md:max-w-[500px]">
                <Image
                  src={logoUrl}
                  alt="Loading logo"
                  width={500}
                  height={325}
                  className="w-full h-auto animate-pulse-opacity"
                  unoptimized
                  priority
                />
              </div>
            ) : (
              <div className="text-white text-xl font-medium text-center bg-black/30 p-4 rounded-md">
                <h3>{title || "Loading..."}</h3>

                <div className="mt-2 text-sm">Buffering...</div>
              </div>
            )}
          </div>
        )}

        <video
          ref={videoRef}
          src={videoSource}
          className={videoClasses}
          autoPlay
          crossOrigin="anonymous"
          onClick={(e) => {
            if (
              settingsMenuRef.current &&
              settingsMenuRef.current.contains(e.target as Node)
            ) {
              return;
            }

            const settingsButton = document.getElementById(
              "video-settings-button"
            );
            if (settingsButton && settingsButton.contains(e.target as Node)) {
              return;
            }

            if (showSettingsMenu) {
              setShowSettingsMenu(false);

              return;
            }
            togglePlay();
          }}
          onDoubleClick={toggleFullscreen}
        >
          {subtitles && (
            <track
              kind="subtitles"
              src={subtitles}
              srcLang="en"
              label="English"
              default
            />
          )}
          Your browser does not support the video tag.
        </video>

        {showSettingsMenu && (
          <motion.div
            ref={settingsMenuRef}
            className="absolute bottom-24 right-5 bg-gray-800/95 text-white rounded-lg shadow-xl z-30 w-auto min-w-[320px] max-w-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex border-b border-gray-700 px-2 pt-2">
              {settingTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSettingsTab(tab)}
                  className={`px-3 py-2 text-sm font-medium focus:outline-none transition-colors duration-150
                    ${
                      activeSettingsTab === tab
                        ? "border-b-2 border-red-500 text-red-500"
                        : "text-gray-300 hover:text-white hover:border-b-2 hover:border-gray-500"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div
              className="p-4 h-[250px] overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#ef4444 #1f2937",
                msOverflowStyle: "none",
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 8px;
                }
                div::-webkit-scrollbar-track {
                  background: #1f2937;
                  border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb {
                  background: #ef4444;
                  border-radius: 10px;
                }
              `}</style>

              {activeSettingsTab === "Speed" && (
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-xs mb-1 font-semibold">
                      Playback Speed
                    </div>
                    <div className="flex flex-col space-y-1">
                      {playbackSpeeds.map((speed) => (
                        <button
                          key={`speed-${speed}`}
                          onClick={() => handleSpeedChange(speed)}
                          className={`text-left text-sm px-3 py-1.5 rounded w-full transition-colors ${
                            playerState.playbackRate === speed
                              ? "font-semibold bg-red-600 text-white"
                              : "hover:bg-gray-700 text-gray-200"
                          }`}
                        >
                          {speed === 1 ? "Normal" : `${speed}x`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeSettingsTab === "Settings" && (
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-xs mb-1 font-semibold">
                      Aspect Ratio
                    </div>
                    <div className="flex flex-col space-y-1">
                      {aspectRatioModes.map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setAspectRatioMode(mode)}
                          className={`text-left text-sm px-3 py-1.5 rounded w-full transition-colors ${
                            aspectRatioMode === mode
                              ? "font-semibold bg-red-600 text-white"
                              : "hover:bg-gray-700 text-gray-200"
                          }`}
                        >
                          {getAspectRatioLabel(mode)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeSettingsTab === "Subtitles" && (
                <div>
                  <p className="text-green-300 text-sm">#TODO</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Video Controls Container */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20"
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: playerState.showControls ? 0 : 20,
            opacity: playerState.showControls ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Progress bar */}
          <div className="flex items-center mb-3">
            <span className="text-white text-xs mr-2 w-10 text-right">
              {formatTime(playerState.currentTime)}
            </span>
            <div className="relative w-full mx-2 group h-4 flex items-center">
              {/* Buffer progress bar */}
              <div
                className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-gray-500 rounded-full w-full"
                style={{ width: `${playerState.bufferProgress}%` }}
              />
              {/* Seek bar */}
              <input
                type="range"
                min="0"
                max="100"
                value={playerState.progress}
                onChange={handleProgressChange}
                className="w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer accent-red-600 z-10"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${playerState.progress}%, rgba(107, 114, 128, 0.5) ${playerState.progress}%, rgba(107, 114, 128, 0.5) 100%)`,
                }}
              />
            </div>
            <span className="text-white text-xs ml-2 w-10">
              {formatTime(playerState.duration)}
            </span>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label={playerState.isPlaying ? "Pause" : "Play"}
              >
                {playerState.isPlaying ? (
                  <RiPauseLargeFill size={28} />
                ) : (
                  <RiPlayLargeLine size={28} />
                )}
              </button>

              <button
                onClick={() => seek(-10)}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label="Seek backward 10 seconds"
              >
                <RiReplay10Line size={28} />
              </button>

              <button
                onClick={() => seek(10)}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label="Seek forward 10 seconds"
              >
                <RiForward10Line size={28} />
              </button>

              {/* Volume Control */}
              <div className="flex items-center group">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300 transition-colors mr-1"
                  aria-label={playerState.volume > 0 ? "Mute" : "Unmute"}
                >
                  {getVolumeIcon()}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={playerState.volume}
                  onChange={handleVolumeChange}
                  className="w-0 bg-white group-hover:w-20 h-1.5 rounded-lg appearance-none cursor-pointer accent-red-600 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 align-middle"
                  aria-label="Volume"
                />
              </div>
            </div>
            <div className="flex-grow text-center px-2 sm:px-4 overflow-hidden">
              <h3 className="text-white text-sm sm:text-base font-medium truncate">
                {title || ""}
              </h3>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {quality && (
                <div className="text-white text-xs bg-black/30 px-1.5 py-0.5 rounded hidden sm:block">
                  {quality}
                </div>
              )}

              <div className="relative">
                <button
                  id="video-settings-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettingsMenu((prev) => {
                      if (!prev) setActiveSettingsTab("Settings");
                      return !prev;
                    });
                  }}
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label="Settings"
                >
                  <RiSettingsLine size={24} />
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label={
                    playerState.isFullscreen
                      ? "Exit Fullscreen"
                      : "Enter Fullscreen"
                  }
                >
                  {playerState.isFullscreen ? (
                    <RiFullscreenExitLine size={24} />
                  ) : (
                    <RiFullscreenLine size={24} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;
