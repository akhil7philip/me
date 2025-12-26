"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { RecordPlayer } from '@/components/record-player';

interface ArticleMusicPlayerProps {
  musicUrl?: string | null;
  musicArtistName?: string | null;
  musicSongName?: string | null;
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
  musicUrl, 
  musicArtistName, 
  musicSongName,
  className, 
  variant = 'fixed' 
}: ArticleMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]); // Volume as percentage (0-100)
  const [userPreference, setUserPreference] = useState<boolean | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);

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

    const shouldAutoPlay = userPreference !== false; // Auto-play by default unless explicitly disabled

    if (isYouTube && youtubeVideoId) {
      // For YouTube, we'll use iframe embed
      if (shouldAutoPlay) {
        // YouTube iframe will handle autoplay
        setIsPlaying(true);
      }
    } else if (audioRef.current) {
      // Load the audio source for non-YouTube URLs
      audioRef.current.load();

      if (shouldAutoPlay) {
        // Small delay to ensure audio is loaded, especially in preview mode
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
          }
        }, 100);

        return () => clearTimeout(playTimeout);
      }
    }
  }, [musicUrl, userPreference, isYouTube, youtubeVideoId]);

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

  // Don't render if no music URL is provided
  if (!musicUrl) return null;

  const positionClasses = variant === 'fixed' 
    ? "fixed top-1 left-0 right-0 z-40"
    : "relative w-full";

  const youtubeEmbedUrl = youtubeVideoId 
    ? `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=${isPlaying ? 1 : 0}&loop=1&playlist=${youtubeVideoId}&controls=0&modestbranding=1&enablejsapi=1`
    : null;

  // Format credits
  const creditsText = musicArtistName && musicSongName
    ? `${musicSongName} by ${musicArtistName}`
    : musicArtistName
    ? `by ${musicArtistName}`
    : musicSongName
    ? musicSongName
    : 'Background Music';

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
                <span className="truncate">{creditsText}</span>
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
          loop
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
          onEnded={() => setIsPlaying(false)}
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

