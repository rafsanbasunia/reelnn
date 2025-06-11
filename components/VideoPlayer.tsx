import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

type VideoJsPlayer = ReturnType<typeof videojs>;
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
    isPlaying: false,
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
    isSeeking: false,
    brightness: 100,
    hasError: false,
    errorMessage: '',
  });

  const [touchState, setTouchState] = useState({
    adjustingVolume: false,
    adjustingBrightness: false,
    initialTouch: { x: 0, y: 0 },
    initialValue: 0,
    doubleTapTimeout: null as NodeJS.Timeout | null,
    lastTap: 0,
    showVolumeIndicator: false,
    showBrightnessIndicator: false,
    touchStartTime: 0,
  });

  const [aspectRatioMode, setAspectRatioMode] = useState<AspectRatioMode>("bestFit");
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingTab>("Settings");
  const [isMobile, setIsMobile] = useState(false);
  const [mouseIdleTimer, setMouseIdleTimer] = useState<NodeJS.Timeout | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePlayerState = useCallback((updates: Partial<typeof playerState>) => {
    setPlayerState((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateTouchState = useCallback((updates: Partial<typeof touchState>) => {
    setTouchState((prev) => ({ ...prev, ...updates }));
  }, []);

  
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || (isTouchDevice && isSmallScreen));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  
  useEffect(() => {
    if (!videoRef.current || !videoSource) return;

    const videoElement = videoRef.current;
    
    
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    
    updatePlayerState({ hasError: false, errorMessage: '' });

    
    setTimeout(() => {
      
      const getVideoType = (src: string) => {
        const extension = src.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'mkv':
            return 'video/x-matroska';
          case 'mp4':
            return 'video/mp4';
          case 'webm':
            return 'video/webm';
          case 'ogg':
          case 'ogv':
            return 'video/ogg';
          case 'avi':
            return 'video/x-msvideo';
          case 'mov':
            return 'video/quicktime';
          case 'flv':
            return 'video/x-flv';
          case 'wmv':
            return 'video/x-ms-wmv';
          default:
            return 'video/mp4'; 
        }
      };

      const videoJsOptions = {
        autoplay: true,
        controls: false,
        responsive: true,
        fluid: true, 
        fill: false, 
        sources: [{
          src: videoSource,
          type: getVideoType(videoSource),
        }],
        playbackRates: playbackSpeeds,
        preload: 'auto',
        html5: {
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false,
        },
        techOrder: ['html5'],
        enableSourceOrder: true,
      };

      try {
        
        const player = videojs(videoElement, videoJsOptions);
        playerRef.current = player;

        
        player.ready(() => {
          console.log('Video.js player is ready');
          
          
          player.volume(playerState.volume);
          player.playbackRate(playerState.playbackRate);
          
          
          const videoEl = player.el().querySelector('video');
          if (videoEl) {
            videoEl.style.width = '100%';
            videoEl.style.height = '100%';
            videoEl.style.objectFit = 'contain';
          }
          
          
          const playPromise = player.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log('Video started playing successfully');
              updatePlayerState({ isPlaying: true, isLoading: false });
            }).catch((error) => {
              console.error('Error playing video:', error);
              updatePlayerState({ isLoading: false });
              
              
              const extension = videoSource.split('.').pop()?.toLowerCase();
              let errorMessage = 'Unable to play this video.';
              
              if (extension === 'mkv') {
                errorMessage = 'MKV files may not be supported by your browser. Try using MP4 or WebM format.';
              } else if (['avi', 'wmv', 'flv'].includes(extension || '')) {
                errorMessage = `${extension?.toUpperCase()} files are not supported by web browsers. Please use MP4, WebM, or other web-compatible formats.`;
              }
              
              updatePlayerState({ 
                hasError: true, 
                errorMessage 
              });
            });
          }
        });

        
        player.on('loadstart', () => {
          console.log('Video load started');
          updatePlayerState({ isLoading: true, hasError: false });
        });

        player.on('loadedmetadata', () => {
          console.log('Video metadata loaded');
          const duration = player.duration();
          updatePlayerState({
            duration: duration || 0,
            isLoading: false,
          });
          
          
          const videoEl = player.el().querySelector('video');
          if (videoEl) {
            videoEl.style.display = 'block';
            videoEl.style.visibility = 'visible';
          }
        });

        player.on('canplay', () => {
          console.log('Video can play');
          updatePlayerState({ isLoading: false });
        });

        
        player.on('play', () => {
          updatePlayerState({ isPlaying: true });
        });

        player.on('pause', () => {
          updatePlayerState({ isPlaying: false });
        });

        player.on('timeupdate', () => {
          const currentTime = player.currentTime() || 0;
          const duration = player.duration() || 0;
          
          updatePlayerState({
            currentTime,
            progress: duration > 0 ? (currentTime / duration) * 100 : 0,
          });
        });

        player.on('progress', () => {
          const buffered = player.buffered();
          if (buffered.length > 0) {
            const bufferedEnd = buffered.end(buffered.length - 1);
            const duration = player.duration() || 0;
            
            updatePlayerState({
              bufferProgress: duration > 0 ? (bufferedEnd / duration) * 100 : 0,
            });
          }
        });

        player.on('waiting', () => {
          updatePlayerState({ isLoading: true });
        });

        player.on('canplaythrough', () => {
          updatePlayerState({ isLoading: false });
        });

        player.on('error', (e: Event) => {
          const error = player.error();
          console.error('Video.js error:', e, error);
          
          let errorMessage = 'Unable to load this video.';
          
          if (error) {
            switch (error.code) {
              case 1: 
                errorMessage = 'Video playback was aborted.';
                break;
              case 2: 
                errorMessage = 'Network error occurred while loading the video.';
                break;
              case 3: 
                errorMessage = 'Video format is not supported or corrupted.';
                break;
              case 4: 
                const extension = videoSource.split('.').pop()?.toLowerCase();
                if (extension === 'mkv') {
                  errorMessage = 'MKV files are not supported by web browsers. Please use MP4, WebM, or other web-compatible formats.';
                } else {
                  errorMessage = 'Video format is not supported by your browser.';
                }
                break;
            }
          }
          
          updatePlayerState({
            isLoading: false,
            hasError: true,
            errorMessage
          });
        });

        
        if (subtitles) {
          player.addRemoteTextTrack({
            kind: 'subtitles',
            src: subtitles,
            srclang: 'en',
            label: 'English',
            default: true
          }, false);
        }

      } catch (error) {
        console.error('Error initializing Video.js:', error);
        updatePlayerState({
          hasError: true,
          errorMessage: 'Failed to initialize video player.'
        });
      }
    }, 100); 

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
          playerRef.current = null;
        } catch (error) {
          console.error('Error disposing player:', error);
        }
      }
    };
  }, [videoSource, subtitles, playerState.volume, playerState.playbackRate, updatePlayerState]);

  
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = () => {
      updatePlayerState({ showControls: true });
      
      if (mouseIdleTimer) {
        clearTimeout(mouseIdleTimer);
      }
      
      const timer = setTimeout(() => {
        if (!showSettingsMenu ) {
          updatePlayerState({ showControls: false });
        }
      }, 3000);
      
      setMouseIdleTimer(timer);
    };

    const handleMouseLeave = () => {
      if (!showSettingsMenu) {
        updatePlayerState({ showControls: false });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (mouseIdleTimer) {
        clearTimeout(mouseIdleTimer);
      }
    };
  }, [isMobile, showSettingsMenu, mouseIdleTimer, updatePlayerState]);

  
  const togglePlay = useCallback(() => {
    if (playerRef.current) {
      if (playerState.isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  }, [playerState.isPlaying]);

  const seek = useCallback((seconds: number) => {
    if (playerRef.current) {
      const currentTime = playerRef.current.currentTime() || 0;
      const newTime = Math.max(
        0,
        Math.min(currentTime + seconds, playerState.duration)
      );
      playerRef.current.currentTime(newTime);
    }
  }, [playerState.duration]);

  const handleProgressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    if (playerRef.current && playerState.duration > 0) {
      const newTime = (newProgress / 100) * playerState.duration;
      playerRef.current.currentTime(newTime);
    }
  }, [playerState.duration]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    updatePlayerState({ volume: newVolume });
    if (playerRef.current) {
      playerRef.current.volume(newVolume);
    }
    if (newVolume > 0) {
      updatePlayerState({ lastVolume: newVolume });
    }
  }, [updatePlayerState]);

  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      if (playerState.volume > 0) {
        updatePlayerState({ lastVolume: playerState.volume, volume: 0 });
        playerRef.current.volume(0);
      } else {
        const newVolume = playerState.lastVolume > 0 ? playerState.lastVolume : 1;
        updatePlayerState({ volume: newVolume });
        playerRef.current.volume(newVolume);
      }
    }
  }, [playerState.volume, playerState.lastVolume, updatePlayerState]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyF', 'KeyM'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'Space':
          togglePlay();
          break;
        case 'ArrowUp':
          handleVolumeChange({ target: { value: Math.min(1, playerState.volume + 0.1).toString() } } as React.ChangeEvent<HTMLInputElement>);
          break;
        case 'ArrowDown':
          handleVolumeChange({ target: { value: Math.max(0, playerState.volume - 0.1).toString() } } as React.ChangeEvent<HTMLInputElement>);
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'Escape':
          if (playerState.isFullscreen) {
            toggleFullscreen();
          } else if (showSettingsMenu) {
            setShowSettingsMenu(false);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, playerState.volume, playerState.isFullscreen, showSettingsMenu, togglePlay, handleVolumeChange, toggleFullscreen, toggleMute]);

  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const now = Date.now();

    if (touchState.doubleTapTimeout) {
      clearTimeout(touchState.doubleTapTimeout);
    }

    updateTouchState({
      initialTouch: { x, y },
      touchStartTime: now,
    });

    
    if (now - touchState.lastTap < 300) {
      
      togglePlay();
      updateTouchState({ lastTap: 0 });
    } else {
      updateTouchState({ lastTap: now });
      const doubleTapTimeout = setTimeout(() => {
        updatePlayerState({ showControls: !playerState.showControls });
      }, 300);
      updateTouchState({ doubleTapTimeout });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentY = touch.clientY - rect.top;
    const deltaY = currentY - touchState.initialTouch.y;

    if (touchState.doubleTapTimeout) {
      clearTimeout(touchState.doubleTapTimeout);
      updateTouchState({ doubleTapTimeout: null });
    }

    
    
    if (Math.abs(deltaY) > 20) {
      const isRightSide = touchState.initialTouch.x > rect.width / 2;
      
      if (isRightSide && !touchState.adjustingVolume) {
        updateTouchState({ 
          adjustingVolume: true, 
          initialValue: playerState.volume,
          showVolumeIndicator: true 
        });
      } else if (!isRightSide && !touchState.adjustingBrightness) {
        updateTouchState({ 
          adjustingBrightness: true, 
          initialValue: playerState.brightness,
          showBrightnessIndicator: true 
        });
      }
      
      if (touchState.adjustingVolume) {
        const volumeDelta = -(deltaY / rect.height);
        const newVolume = Math.max(0, Math.min(1, touchState.initialValue + volumeDelta));
        handleVolumeChange({ target: { value: newVolume.toString() } } as React.ChangeEvent<HTMLInputElement>);
      } else if (touchState.adjustingBrightness) {
        const brightnessDelta = -(deltaY / rect.height) * 100;
        const newBrightness = Math.max(20, Math.min(150, touchState.initialValue + brightnessDelta));
        updatePlayerState({ brightness: newBrightness });
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;

    setTimeout(() => {
      updateTouchState({
        showVolumeIndicator: false,
        showBrightnessIndicator: false,
      });
    }, 1000);

    updateTouchState({
      adjustingVolume: false,
      adjustingBrightness: false,
    });
  };

  const getVolumeIcon = () => {
    if (playerState.volume === 0) return <RiVolumeMuteLine size={isMobile ? 28 : 24} />;
    if (playerState.volume <= 0.33) return <RiVolumeDownLine size={isMobile ? 28 : 24} />;
    return <RiVolumeUpLine size={isMobile ? 28 : 24} />;
  };

  const handleSpeedChange = (rate: number) => {
    if (playerRef.current) {
      playerRef.current.playbackRate(rate);
      updatePlayerState({ playbackRate: rate });
      setShowSettingsMenu(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      updatePlayerState({ isFullscreen: !!document.fullscreenElement });
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [updatePlayerState]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  
  const handleVideoClick = (e: React.MouseEvent) => {
    if (isMobile) return;
    
    
    if (settingsMenuRef.current?.contains(e.target as Node) || 
        document.getElementById("video-settings-button")?.contains(e.target as Node)) {
      return;
    }
    
    if (showSettingsMenu) {
      setShowSettingsMenu(false);
      return;
    }
    
    togglePlay();
  };

  const handleVideoDoubleClick = () => {
    if (!isMobile) {
      toggleFullscreen();
    }
  };

  const showLoadingOverlay = playerState.isLoading && playerState.currentTime < 3;

  return (
    <motion.div
      ref={containerRef}
      className="font-mont fixed inset-0 bg-black z-50 flex flex-col select-none"
      style={{ touchAction: isMobile ? 'none' : 'auto' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Close button */}
        <motion.button
          onClick={onClose}
          className={`absolute top-4 left-4 z-30 text-white bg-black/50 rounded-full transition-all duration-300 hover:bg-red-600 ${
            isMobile ? 'p-3' : 'p-2'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: playerState.showControls ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <RiArrowLeftLine size={isMobile ? 28 : 24} />
        </motion.button>

        {/* Error overlay for unsupported formats */}
        {playerState.hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
            <div className="text-white text-center bg-black/30 p-6 rounded-md max-w-md mx-4">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-medium mb-2">Video Error</h3>
              <p className="text-sm text-gray-300 mb-4">
                {playerState.errorMessage}
              </p>
              <div className="space-y-2">
                
                <button
                  onClick={onClose}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Touch indicators (mobile only) */}
        {isMobile && touchState.showVolumeIndicator && (
          <motion.div
            className="absolute top-1/2 right-8 transform -translate-y-1/2 bg-black/80 text-white p-4 rounded-lg z-30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex flex-col items-center">
              {getVolumeIcon()}
              <div className="mt-2 text-sm">{Math.round(playerState.volume * 100)}%</div>
            </div>
          </motion.div>
        )}

        {isMobile && touchState.showBrightnessIndicator && (
          <motion.div
            className="absolute top-1/2 left-8 transform -translate-y-1/2 bg-black/80 text-white p-4 rounded-lg z-30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex flex-col items-center">
              <div className="text-2xl">☀️</div>
              <div className="mt-2 text-sm">{Math.round(playerState.brightness)}%</div>
            </div>
          </motion.div>
        )}

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
                  className="w-full h-auto animate-pulse"
                  priority
                  unoptimized
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

        {/* Video Container */}
        <div 
          className="w-full h-full flex items-center justify-center"
          onClick={handleVideoClick}
          onDoubleClick={handleVideoDoubleClick}
        >
          <video
            ref={videoRef}
            className="video-js vjs-default-skin"
            style={{ 
              filter: `brightness(${playerState.brightness}%)`,
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              display: 'block',
              visibility: 'visible'
            }}
            crossOrigin="anonymous"
            data-setup="{}"
          />
        </div>

        {/* Settings Menu */}
        {showSettingsMenu && (
          <motion.div
            ref={settingsMenuRef}
            className={`absolute bg-gray-800/95 text-white rounded-lg shadow-xl z-30 ${
              isMobile 
                ? 'bottom-20 left-4 right-4 max-h-[60vh]' 
                : 'bottom-24 right-5 w-auto min-w-[320px] max-w-sm'
            }`}
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
                  className={`px-3 py-3 text-sm font-medium focus:outline-none transition-colors duration-150 ${
                    isMobile ? 'min-h-[44px]' : ''
                  } ${
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
              className={`p-4 overflow-y-auto ${
                isMobile ? 'max-h-[40vh]' : 'max-h-[300px]'
              }`}
            >
              {activeSettingsTab === "Speed" && (
                <div className="space-y-2">
                  <div className="text-gray-400 text-xs mb-3 font-semibold">
                    Playback Speed
                  </div>
                  <div className="flex flex-col space-y-2">
                    {playbackSpeeds.map((speed) => (
                      <button
                        key={`speed-${speed}`}
                        onClick={() => handleSpeedChange(speed)}
                        className={`text-left text-sm px-4 py-3 rounded w-full transition-colors ${
                          isMobile ? 'min-h-[44px]' : 'py-2'
                        } ${
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
              )}
              {activeSettingsTab === "Settings" && (
                <div className="space-y-2">
                  <div className="text-gray-400 text-xs mb-3 font-semibold">
                    Aspect Ratio
                  </div>
                  <div className="flex flex-col space-y-2">
                    {aspectRatioModes.map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setAspectRatioMode(mode);
                          setShowSettingsMenu(false);
                        }}
                        className={`text-left text-sm px-4 py-3 rounded w-full transition-colors ${
                          isMobile ? 'min-h-[44px]' : 'py-2'
                        } ${
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
              )}
              {activeSettingsTab === "Subtitles" && (
                <div>
                  <p className="text-green-300 text-sm">#TODO</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Desktop keyboard shortcuts help */}
        {!isMobile && playerState.showControls && (
          <div className="absolute top-4 right-4 z-20 text-white text-xs bg-black/50 rounded px-2 py-1 opacity-50 hover:opacity-100 transition-opacity">
            Space: Play/Pause | ↑↓: Volume | F: Fullscreen | M: Mute
          </div>
        )}

        {/* Video Controls Container */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent z-20 ${
            isMobile ? 'p-4 pb-safe' : 'p-4'
          }`}
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: playerState.showControls ? 0 : 20,
            opacity: playerState.showControls ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Progress bar */}
          <div className={`flex items-center ${isMobile ? 'mb-4' : 'mb-3'}`}>
            <span className={`text-white text-xs mr-2 w-12 text-right ${isMobile ? 'text-sm' : ''}`}>
              {formatTime(playerState.currentTime)}
            </span>
            <div className={`relative w-full mx-2 group flex items-center ${isMobile ? 'h-6' : 'h-4'}`}>
              {/* Buffer progress bar */}
              <div
                className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-600 rounded-full w-full ${
                  isMobile ? 'h-1.5' : 'h-1'
                }`}
              />
              <div
                className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-500 rounded-full ${
                  isMobile ? 'h-1.5' : 'h-1'
                }`}
                style={{ width: `${playerState.bufferProgress}%` }}
              />
              {/* Seek bar */}
              <input
                type="range"
                min="0"
                max="100"
                value={playerState.progress}
                onChange={handleProgressChange}
                className={`w-full bg-transparent rounded-lg appearance-none cursor-pointer accent-red-600 z-10 ${
                  isMobile ? 'h-6' : 'h-4'
                }`}
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${playerState.progress}%, transparent ${playerState.progress}%, transparent 100%)`,
                }}
              />
            </div>
            <span className={`text-white text-xs ml-2 w-12 ${isMobile ? 'text-sm' : ''}`}>
              {formatTime(playerState.duration)}
            </span>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className={`flex items-center ${isMobile ? 'space-x-4' : 'space-x-2 sm:space-x-3'}`}>
              <button
                onClick={togglePlay}
                className={`text-white hover:text-gray-300 transition-colors ${
                  isMobile ? 'p-2' : ''
                }`}
                aria-label={playerState.isPlaying ? "Pause" : "Play"}
              >
                {playerState.isPlaying ? (
                  <RiPauseLargeFill size={isMobile ? 32 : 28} />
                ) : (
                  <RiPlayLargeLine size={isMobile ? 32 : 28} />
                )}
              </button>

              <button
                onClick={() => seek(-10)}
                className={`text-white hover:text-gray-300 transition-colors ${
                  isMobile ? 'p-2' : ''
                }`}
                aria-label="Seek backward 10 seconds"
              >
                <RiReplay10Line size={isMobile ? 32 : 28} />
              </button>

              <button
                onClick={() => seek(10)}
                className={`text-white hover:text-gray-300 transition-colors ${
                  isMobile ? 'p-2' : ''
                }`}
                aria-label="Seek forward 10 seconds"
              >
                <RiForward10Line size={isMobile ? 32 : 28} />
              </button>

              {/* Volume Control - Desktop only */}
              {!isMobile && (
                <div className="flex items-center group ml-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-gray-300 transition-colors mr-2"
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
                    className="w-20 h-1.5 rounded-lg appearance-none cursor-pointer accent-red-600 bg-gray-600"
                    aria-label="Volume"
                  />
                  <span className="text-white text-xs ml-2 w-8 text-center">
                    {Math.round(playerState.volume * 100)}
                  </span>
                </div>
              )}
            </div>

            {/* Title - Responsive */}
            <div className="flex-grow text-center px-2 sm:px-4 overflow-hidden">
              <h3 className={`text-white font-medium truncate ${
                isMobile ? 'text-sm' : 'text-sm sm:text-base'
              }`}>
                {title || ""}
              </h3>
            </div>

            {/* Right Controls */}
            <div className={`flex items-center ${isMobile ? 'space-x-4' : 'space-x-2 sm:space-x-3'}`}>
              {quality && (
                <div className={`text-white text-xs bg-black/30 px-2 py-1 rounded ${
                  isMobile ? 'hidden' : 'hidden sm:block'
                }`}>
                  {quality}
                </div>
              )}

              <button
                id="video-settings-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettingsMenu((prev) => {
                    if (!prev) setActiveSettingsTab("Settings");
                    return !prev;
                  });
                }}
                className={`text-white hover:text-gray-300 transition-colors ${
                  isMobile ? 'p-2' : ''
                }`}
                aria-label="Settings"
              >
                <RiSettingsLine size={isMobile ? 32 : 24} />
              </button>

              <button
                onClick={toggleFullscreen}
                className={`text-white hover:text-gray-300 transition-colors ${
                  isMobile ? 'p-2' : ''
                }`}
                aria-label={playerState.isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {playerState.isFullscreen ? (
                  <RiFullscreenExitLine size={isMobile ? 32 : 24} />
                ) : (
                  <RiFullscreenLine size={isMobile ? 32 : 24} />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;
