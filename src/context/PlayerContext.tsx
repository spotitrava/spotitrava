"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  audio_url: string;
  cover_url: string | null;
  file_id?: string;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  progress: number;
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'track' | 'queue';
  playTrack: (track: Track, tracks?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setQueue: (tracks: Track[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Helper: extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
  return match ? match[1] : null;
}

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]); // For un-shuffling
  
  // Audio state
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'track' | 'queue'>('off');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const [ytApiReady, setYtApiReady] = useState(false);

  const isYouTube = currentTrack?.file_id?.startsWith('yt:') || false;

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).YT && (window as any).YT.Player) {
      setYtApiReady(true);
      return;
    }
    
    // Check if script already loading
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const checkReady = setInterval(() => {
        if ((window as any).YT && (window as any).YT.Player) {
          setYtApiReady(true);
          clearInterval(checkReady);
        }
      }, 200);
      return () => clearInterval(checkReady);
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    (window as any).onYouTubeIframeAPIReady = () => {
      console.log("✅ YouTube IFrame API ready");
      setYtApiReady(true);
    };
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length === 0 || !currentTrack) return;

    if (repeatMode === 'track') {
       seek(0);
       setIsPlaying(true);
       return;
    }

    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    let nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === 'queue') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setCurrentTrack(queue[nextIndex]);
    setIsPlaying(true);
  }, [queue, currentTrack, repeatMode]);

  const prevTrack = useCallback(() => {
    if (queue.length === 0 || !currentTrack) return;

    // If more than 3 seconds in, restart the track
    if (currentTime > 3) {
      seek(0);
      return;
    }

    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    let prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      if (repeatMode === 'queue') {
        prevIndex = queue.length - 1;
      } else {
        seek(0);
        return;
      }
    }

    setCurrentTrack(queue[prevIndex]);
    setIsPlaying(true);
  }, [queue, currentTrack, currentTime, repeatMode]);

  // Setup native audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
      const audio = audioRef.current;

      audio.onended = () => {
        nextTrack();
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };

      audio.onwaiting = () => setIsBuffering(true);
      audio.onplaying = () => setIsBuffering(false);
      audio.oncanplay = () => setIsBuffering(false);
      audio.onerror = (e) => {
        console.error("Audio element error:", e);
        setIsBuffering(false);
      };
    }
  }, [nextTrack]);

  // Clean up YouTube progress interval
  const clearYtInterval = useCallback(() => {
    if (ytIntervalRef.current) {
      clearInterval(ytIntervalRef.current);
      ytIntervalRef.current = null;
    }
  }, []);

  // Start YouTube progress tracking
  const startYtProgressTracking = useCallback(() => {
    clearYtInterval();
    ytIntervalRef.current = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        const ct = ytPlayerRef.current.getCurrentTime();
        const dur = ytPlayerRef.current.getDuration();
        setCurrentTime(ct);
        setDuration(dur);
        if (dur > 0) {
          setProgress((ct / dur) * 100);
        }
      }
    }, 500);
  }, [clearYtInterval]);

  // Handle YouTube track changes
  useEffect(() => {
    if (!isYouTube || !currentTrack || !ytApiReady) return;

    // Pause native audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const videoId = extractYouTubeVideoId(currentTrack.audio_url);
    if (!videoId) {
      console.error("Could not extract YouTube video ID from:", currentTrack.audio_url);
      return;
    }

    console.log("🎵 YouTube mode - loading video:", videoId);

    // If player already exists, load new video
    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      ytPlayerRef.current.loadVideoById(videoId);
      startYtProgressTracking();
      return;
    }

    // Create new player
    if (!ytContainerRef.current) return;
    
    // Clear container
    ytContainerRef.current.innerHTML = '<div id="yt-player-element"></div>';

    ytPlayerRef.current = new (window as any).YT.Player('yt-player-element', {
      height: '1',
      width: '1',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: (event: any) => {
          console.log("✅ YouTube Player ready");
          event.target.setVolume(volume * 100);
          if (isPlaying) {
            event.target.playVideo();
          }
          startYtProgressTracking();
        },
        onStateChange: (event: any) => {
          const YT = (window as any).YT;
          switch (event.data) {
            case YT.PlayerState.PLAYING:
              setIsPlaying(true);
              setIsBuffering(false);
              startYtProgressTracking();
              break;
            case YT.PlayerState.PAUSED:
              setIsPlaying(false);
              break;
            case YT.PlayerState.BUFFERING:
              setIsBuffering(true);
              break;
            case YT.PlayerState.ENDED:
              nextTrack();
              break;
          }
        },
        onError: (event: any) => {
          console.error("YouTube Player error:", event.data);
          setIsBuffering(false);
          setIsPlaying(false);
          nextTrack(); // Try next track on error
        },
      },
    });

    return () => {
      clearYtInterval();
    };
  }, [currentTrack, ytApiReady, isYouTube, nextTrack]);

  // Handle native audio track changes
  useEffect(() => {
    if (!currentTrack || isYouTube || !audioRef.current) return;
    
    // Pause YouTube if it was playing
    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      ytPlayerRef.current.pauseVideo();
      clearYtInterval();
    }

    console.log("🎵 Drive mode - setting up audio for:", currentTrack.title);
    
    let finalUrl = currentTrack.audio_url;
    
    if (session?.provider_token) {
      finalUrl = `/api/proxy/audio?fileId=${currentTrack.id}&token=${session.provider_token}`;
    }
    
    if (audioRef.current.src !== window.location.origin + finalUrl && audioRef.current.src !== finalUrl) {
      audioRef.current.src = finalUrl;
      audioRef.current.load();
    }

    if (isPlaying) {
      audioRef.current.play().catch(e => {
        console.error("Playback error for URL:", finalUrl, e);
      });
    }
  }, [currentTrack, isPlaying, session, isYouTube]);

  // Sync play/pause state to YouTube player
  useEffect(() => {
    if (!isYouTube || !ytPlayerRef.current || typeof ytPlayerRef.current.getPlayerState !== 'function') return;
    
    const YT = (window as any).YT;
    if (!YT) return;
    
    const state = ytPlayerRef.current.getPlayerState();
    
    if (isPlaying && state !== YT.PlayerState.PLAYING) {
      ytPlayerRef.current.playVideo();
      startYtProgressTracking();
    } else if (!isPlaying && state === YT.PlayerState.PLAYING) {
      ytPlayerRef.current.pauseVideo();
      clearYtInterval();
    }
  }, [isPlaying, isYouTube]);

  // Sync volume to YouTube player
  useEffect(() => {
    if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      ytPlayerRef.current.setVolume(volume * 100);
    }
  }, [volume, isYouTube]);

  const togglePlay = () => {
    if (isYouTube) {
      setIsPlaying(prev => !prev);
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback error:", e));
      }
      setIsPlaying(prev => !prev);
    }
  };

  const playTrack = (track: Track, newQueue?: Track[]) => {
    if (newQueue) {
      setOriginalQueue(newQueue);
      if (isShuffle) {
        const shuffled = [...newQueue].sort(() => Math.random() - 0.5);
        setQueueState(shuffled);
      } else {
        setQueueState(newQueue);
      }
    }
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const newState = !prev;
      if (newState) {
        // Shuffle current queue
        const shuffled = [...queue].sort(() => Math.random() - 0.5);
        setQueueState(shuffled);
      } else {
        // Restore original queue
        setQueueState(originalQueue);
      }
      return newState;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'queue';
      if (prev === 'queue') return 'track';
      return 'off';
    });
  };

  const setQueue = (tracks: Track[]) => {
    setOriginalQueue(tracks);
    if (isShuffle) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setQueueState(shuffled);
    } else {
      setQueueState(tracks);
    }
  };

  const seek = (time: number) => {
    if (isYouTube && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      ytPlayerRef.current.seekTo(time, true);
      setCurrentTime(time);
    } else if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (!isYouTube && audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  return (
    <PlayerContext.Provider value={{ 
      currentTrack, 
      isPlaying, 
      queue, 
      progress, 
      currentTime, 
      duration, 
      isBuffering,
      volume,
      isShuffle,
      repeatMode,
      playTrack, 
      togglePlay, 
      nextTrack, 
      prevTrack,
      toggleShuffle,
      toggleRepeat,
      seek,
      setVolume,
      setQueue
    }}>
      {children}
      {/* Hidden container for YouTube IFrame player */}
      <div 
        ref={ytContainerRef}
        style={{ 
          position: 'fixed', 
          top: '-9999px', 
          left: '-9999px', 
          width: '1px', 
          height: '1px', 
          overflow: 'hidden',
          pointerEvents: 'none' 
        }}
      >
        <div id="yt-player-element"></div>
      </div>
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
