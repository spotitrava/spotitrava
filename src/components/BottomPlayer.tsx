import React, { useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  Volume2, 
  Maximize2, 
  ListMusic,
  Loader2
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const BottomPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    prevTrack, 
    progress, 
    currentTime, 
    duration, 
    seek,
    isBuffering,
    volume,
    setVolume
  } = usePlayer();

  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && duration) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      seek(percentage * duration);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeRef.current) {
      const rect = volumeRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      setVolume(percentage);
    }
  };

  return (
    <div className="h-16 md:h-24 bg-black/95 backdrop-blur-xl border-t border-white/5 px-3 md:px-4 flex items-center justify-between z-50 relative">
      
      {/* Mobile Top Progress Bar */}
      <div 
        className="absolute top-0 left-0 w-full h-[2px] bg-white/10 md:hidden cursor-pointer"
        onClick={handleSeek}
      >
        <div 
           className="h-full bg-spotify-green relative" 
           style={{ width: `${progress}%` }}
        />
      </div>

      {/* Current Track Info */}
      <div className="flex items-center gap-3 w-[70%] md:w-[30%]">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-white/5 rounded-md overflow-hidden group flex-shrink-0 relative flex items-center justify-center text-xl md:text-2xl">
          {currentTrack?.cover_url ? (
            <img src={currentTrack.cover_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            "💿"
          )}
        </div>
        <div className="flex flex-col justify-center overflow-hidden min-w-0 pr-2">
          <h3 className="text-sm font-semibold truncate hover:underline cursor-pointer">
            {currentTrack?.title || "Selecione uma música"}
          </h3>
          <p className="text-xs text-white/50 truncate hover:underline cursor-pointer">
            {currentTrack?.artist || "Google Drive Library"}
          </p>
        </div>
      </div>

      {/* Main Controls - Desktop Only */}
      <div className="hidden md:flex flex-col items-center gap-2 max-w-[40%] w-full">
        <div className="flex items-center gap-6">
          <button className="text-white/40 hover:text-white transition-colors">
            <Shuffle className="w-4 h-4" />
          </button>
          <button 
            onClick={prevTrack}
            className="text-white/70 hover:text-white transition-colors"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isBuffering ? (
              <Loader2 className="w-5 h-5 text-black animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 text-black fill-current" />
            ) : (
              <Play className="w-5 h-5 text-black fill-current ml-1" />
            )}
          </button>
          <button 
            onClick={nextTrack}
            className="text-white/70 hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button className="text-white/40 hover:text-white transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        
        {/* Progress Bar - Desktop */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] text-white/40 min-w-[35px] text-right">
            {formatTime(currentTime)}
          </span>
          <div 
            ref={progressRef}
            onClick={handleSeek}
            className="flex-1 h-1 bg-white/10 rounded-full group relative cursor-pointer"
          >
            <div 
              className="absolute left-0 top-0 h-full bg-spotify-green rounded-full group-hover:bg-green-400" 
              style={{ width: `${progress}%` }}
            />
            <div 
              className="absolute w-3 h-3 bg-white rounded-full -top-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progress}%`, marginLeft: '-6px' }}
            />
          </div>
          <span className="text-[10px] text-white/40 min-w-[35px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center justify-end gap-3 w-[30%]">
        
        {/* Mobile controls */}
        <div className="flex items-center justify-end gap-4 w-full md:hidden">
          <button 
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-8 h-8 flex items-center justify-center disabled:opacity-50"
          >
            {isBuffering ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-white fill-current" />
            ) : (
              <Play className="w-6 h-6 text-white fill-current ml-1" />
            )}
          </button>
        </div>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center justify-end gap-3 w-full">
            <button className="text-white/40 hover:text-white/70 transition-colors">
            <ListMusic className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 w-32 group">
            <Volume2 className="w-4 h-4 text-white/40 group-hover:text-white/70" />
            <div 
                ref={volumeRef}
                onClick={handleVolumeChange}
                className="flex-1 h-1 bg-white/10 rounded-full relative cursor-pointer"
            >
                <div 
                className="absolute left-0 top-0 h-full bg-white/50 rounded-full group-hover:bg-spotify-green" 
                style={{ width: `${volume * 100}%` }}
                />
            </div>
            </div>
            <button className="text-white/40 hover:text-white/70 transition-colors">
            <Maximize2 className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default BottomPlayer;
