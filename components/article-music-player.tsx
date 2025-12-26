"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Music, ChevronLeft, ChevronRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { RecordPlayer } from '@/components/record-player';

interface Song {
  link: string;
  song_name?: string;
  artist?: string;
}

interface ArticleMusicPlayerProps {
  musicPlaylist?: Song[] | null;
  className?: string;
  variant?: 'fixed' | 'relative';
}

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Check if URL is a YouTube link
function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

export function ArticleMusicPlayer({ 
  musicPlaylist,
  className, 
  variant = 'fixed' 
}: ArticleMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement>(null);
  const wasPlayingRef = useRef(false); // Track if we were playing before song change
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]); // Volume as percentage (0-100)
  const [userPreference, setUserPreference] = useState<boolean | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);

  // Get current song from playlist
  const currentSong = musicPlaylist && musicPlaylist.length > 0 
    ? musicPlaylist[currentSongIndex] 
    : null;
  const musicUrl = currentSong?.link || null;

  // Check if URL is YouTube and extract video ID
  useEffect(() => {
    if (!musicUrl) {
      setIsYouTube(false);
      setYoutubeVideoId(null);
      return;
    }

    const youtubeId = extractYouTubeId(musicUrl);
    if (youtubeId) {
      setIsYouTube(true);
      setYoutubeVideoId(youtubeId);
    } else {
      setIsYouTube(false);
      setYoutubeVideoId(null);
    }
  }, [musicUrl]);

  // Load user preference and volume from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem('article-music-enabled');
      if (savedPreference !== null) {
        setUserPreference(savedPreference === 'true');
      }
      
      const savedVolume = localStorage.getItem('article-music-volume');
      if (savedVolume !== null) {
        const vol = parseInt(savedVolume, 10);
        if (!isNaN(vol) && vol >= 0 && vol <= 100) {
          setVolume([vol]);
        }
      }
    }
  }, []);

  // Apply volume to audio element
  useEffect(() => {
    if (!isYouTube && audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
      localStorage.setItem('article-music-volume', volume[0].toString());
    }
  }, [volume, isYouTube]);

  // Initialize audio and auto-play if music URL is provided
  useEffect(() => {
    if (!musicUrl) return;

    const shouldAutoPlay = userPreference !== false || wasPlayingRef.current; // Auto-play by default or if we were playing

    if (isYouTube && youtubeVideoId) {
      // For YouTube, update iframe embed
      if (youtubeIframeRef.current) {
        youtubeIframeRef.current.src = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=${shouldAutoPlay ? 1 : 0}&loop=1&playlist=${youtubeVideoId}&controls=0&modestbranding=1&enablejsapi=1`;
      }
      if (shouldAutoPlay) {
        setIsPlaying(true);
        wasPlayingRef.current = false; // Reset after using it
      }
    } else if (audioRef.current) {
      // Load the audio source for non-YouTube URLs
      audioRef.current.load();

      if (shouldAutoPlay) {
        // Small delay to ensure audio is loaded
        const playTimeout = setTimeout(() => {
          if (audioRef.current) {
            // Attempt to play (may fail due to browser autoplay policies)
            audioRef.current.play().catch((error) => {
              // Autoplay was prevented - user interaction required
              console.log('Autoplay prevented:', error);
              setIsPlaying(false);
              setAudioError(false);
            });
            setIsPlaying(true);
            wasPlayingRef.current = false; // Reset after using it
          }
        }, 100);

        return () => clearTimeout(playTimeout);
      }
    }
  }, [musicUrl, userPreference, isYouTube, youtubeVideoId, currentSongIndex]);

  // Move to next song
  const playNextSong = () => {
    if (!musicPlaylist || musicPlaylist.length === 0) return;
    
    wasPlayingRef.current = isPlaying; // Remember playing state
    const nextIndex = (currentSongIndex + 1) % musicPlaylist.length;
    setCurrentSongIndex(nextIndex);
  };

  // Move to previous song
  const playPreviousSong = () => {
    if (!musicPlaylist || musicPlaylist.length === 0) return;
    
    wasPlayingRef.current = isPlaying; // Remember playing state
    const prevIndex = currentSongIndex === 0 
      ? musicPlaylist.length - 1 
      : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
  };

  const togglePlayPause = () => {
    if (isYouTube && youtubeVideoId) {
      // For YouTube, control via iframe
      if (isPlaying) {
        // Pause YouTube by reloading iframe without autoplay
        if (youtubeIframeRef.current) {
          youtubeIframeRef.current.src = `https://www.youtube.com/embed/${youtubeVideoId}?loop=1&playlist=${youtubeVideoId}&controls=0&modestbranding=1&enablejsapi=1`;
        }
        setIsPlaying(false);
        localStorage.setItem('article-music-enabled', 'false');
        setUserPreference(false);
      } else {
        // Play YouTube by reloading iframe with autoplay
        if (youtubeIframeRef.current) {
          youtubeIframeRef.current.src = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&loop=1&playlist=${youtubeVideoId}&controls=0&modestbranding=1&enablejsapi=1`;
        }
        setIsPlaying(true);
        localStorage.setItem('article-music-enabled', 'true');
        setUserPreference(true);
      }
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem('article-music-enabled', 'false');
      setUserPreference(false);
    } else {
      setAudioError(false);
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
        setAudioError(true);
        setIsPlaying(false);
      });
      setIsPlaying(true);
      localStorage.setItem('article-music-enabled', 'true');
      setUserPreference(true);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
  };

  // Don't render if no playlist or empty playlist
  if (!musicPlaylist || musicPlaylist.length === 0 || !musicUrl) return null;

  const positionClasses = variant === 'fixed' 
    ? "fixed top-1 left-0 right-0 z-40"
    : "relative w-full";

  const youtubeEmbedUrl = youtubeVideoId 
    ? `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=${isPlaying ? 1 : 0}&loop=1&playlist=${youtubeVideoId}&controls=0&modestbranding=1&enablejsapi=1`
    : null;

  // Format credits for current song
  const creditsText = currentSong
    ? currentSong.song_name && currentSong.artist
      ? `${currentSong.song_name} by ${currentSong.artist}`
      : currentSong.artist
      ? `by ${currentSong.artist}`
      : currentSong.song_name
      ? currentSong.song_name
      : 'Background Music'
    : 'Background Music';

  // Show playlist info if multiple songs
  const playlistInfo = musicPlaylist && musicPlaylist.length > 1
    ? ` (${currentSongIndex + 1}/${musicPlaylist.length})`
    : '';

  return (
    <>
      <div
        className={cn(
          positionClasses,
          "bg-background/80 backdrop-blur-sm border-b border-border",
          className
        )}
      >
        <div className={cn(
          variant === 'fixed' ? "container mx-auto px-4 py-3" : "px-4 py-3",
          "flex items-center justify-between gap-4"
        )}>
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Record Player */}
            <div className="flex-shrink-0">
              <RecordPlayer isPlaying={isPlaying} />
            </div>

            {/* Previous Song Button */}
            {musicPlaylist && musicPlaylist.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={playPreviousSong}
                className="flex-shrink-0"
                aria-label="Previous song"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}

            {/* Play/Pause Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayPause}
              className="gap-2 flex-shrink-0"
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
            >
              {isPlaying ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <span className="text-sm whitespace-nowrap">
                {isPlaying ? 'Playing' : 'Paused'}
              </span>
            </Button>

            {/* Next Song Button */}
            {musicPlaylist && musicPlaylist.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={playNextSong}
                className="flex-shrink-0"
                aria-label="Next song"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            {/* Volume Control */}
            {!isYouTube && (
              <div className="flex items-center gap-2 flex-shrink-0 w-24">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  min={0}
                  step={1}
                  className="flex-1"
                  aria-label="Volume"
                />
              </div>
            )}
            
            {/* Credits */}
            <div className="flex items-center gap-2 text-xs ml-auto flex-shrink-0 min-w-0">
              {audioError && !isYouTube && (
                <span className="text-destructive text-xs whitespace-nowrap">Audio error - check URL</span>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Music className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{creditsText}{playlistInfo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Audio element for non-YouTube URLs */}
      {!isYouTube && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop={musicPlaylist && musicPlaylist.length === 1}
          preload="auto"
          onCanPlay={() => {
            setAudioReady(true);
            setAudioError(false);
          }}
          onLoadedData={() => {
            setAudioReady(true);
            setAudioError(false);
          }}
          onPlay={() => {
            setIsPlaying(true);
            setAudioError(false);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            // Auto-play next song if there are more songs
            if (musicPlaylist && musicPlaylist.length > 1) {
              playNextSong();
            }
          }}
          onError={(e) => {
            console.error('Audio error:', e);
            setAudioError(true);
            setIsPlaying(false);
            setAudioReady(false);
          }}
        />
      )}
      
      {/* YouTube embed (hidden, plays audio only) */}
      {isYouTube && youtubeEmbedUrl && (
        <iframe
          ref={youtubeIframeRef}
          src={youtubeEmbedUrl}
          className="absolute opacity-0 pointer-events-none w-1 h-1"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Background Music"
          style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}
        />
      )}
    </>
  );
}

