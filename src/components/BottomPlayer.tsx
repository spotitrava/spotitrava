import React, { useRef, useState } from 'react';
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
  Loader2,
  ChevronDown,
  Heart,
  Share2
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

  const [isExpanded, setIsExpanded] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressRefMobile = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && duration) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      seek(percentage * duration);
    }
  };

  const handleSeekMobile = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRefMobile.current && duration) {
      const rect = progressRefMobile.current.getBoundingClientRect();
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

  if (!currentTrack) return null;

  return (
    <>
      {/* FULL SCREEN PLAYER (Mobile Focused) */}
      <div 
        className={`fixed inset-0 bg-gradient-to-b from-[#404040] to-black z-[100] flex flex-col px-6 py-8 transition-transform duration-300 md:hidden ${isExpanded ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => setIsExpanded(false)} className="text-white hover:opacity-70 transition-opacity">
            <ChevronDown className="w-8 h-8" />
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-white">
            Tocando do Drive
          </span>
          <button className="text-white hover:opacity-70 transition-opacity">
            <MoreHorizontalIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Big Album Art */}
        <div className="flex-1 max-h-[400px] flex items-center justify-center mb-8">
          <div className="w-full aspect-square bg-[#282828] rounded-md shadow-2xl relative overflow-hidden">
             {currentTrack.cover_url ? (
               <img src={currentTrack.cover_url} alt="Cover layout" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-7xl">💿</div>
             )}
          </div>
        </div>

        {/* Title and Artist + Heart */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col overflow-hidden max-w-[80%]">
            <h2 className="text-2xl font-bold text-white truncate">{currentTrack.title}</h2>
            <p className="text-base text-white/70 truncate">{currentTrack.artist}</p>
          </div>
          <button className="text-white hover:scale-110 transition-transform">
            <Heart className="w-7 h-7" />
          </button>
        </div>

        {/* Big Progress Bar */}
        <div className="flex flex-col gap-2 mb-6">
          <div 
            ref={progressRefMobile}
            onClick={handleSeekMobile}
            className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer relative group"
          >
            <div className="absolute left-0 top-0 h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
            <div 
              className="absolute w-3 h-3 bg-white rounded-full -top-[3px] shadow-lg opacity-100 transition-opacity"
              style={{ left: `${progress}%`, marginLeft: '-6px' }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-white/50 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Big Play Controls */}
        <div className="flex items-center justify-between px-2 mb-8">
          <button className="text-white hover:text-spotify-green transition-colors">
            <Shuffle className="w-6 h-6" />
          </button>
          <button onClick={prevTrack} className="text-white hover:text-white/70 transition-colors">
            <SkipBack className="w-10 h-10 fill-current" />
          </button>
          <button onClick={togglePlay} className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-xl">
             {isBuffering ? (
                <Loader2 className="w-8 h-8 animate-spin" />
             ) : isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
             ) : (
                <Play className="w-8 h-8 fill-current ml-2" />
             )}
          </button>
          <button onClick={nextTrack} className="text-white hover:text-white/70 transition-colors">
            <SkipForward className="w-10 h-10 fill-current" />
          </button>
          <button className="text-white hover:text-spotify-green transition-colors">
            <Repeat className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-between text-white/70 px-2 pb-6">
           <button><MonitorSpeakerIcon className="w-5 h-5"/></button>
           <button><Share2 className="w-5 h-5"/></button>
        </div>
      </div>


      {/* COMPACT PLAYER (Desktop and Mobile Mini) */}
      <div 
        className={`h-16 md:h-24 bg-black/95 backdrop-blur-xl border-t border-white/5 px-3 md:px-4 flex items-center justify-between z-50 fixed bottom-[56px] md:bottom-0 left-0 right-0 ${isExpanded ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : ''}`}
      >
        
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
        <div 
          className="flex items-center gap-3 w-[80%] md:w-[30%] cursor-pointer md:cursor-auto"
          onClick={() => {
            if (window.innerWidth < 768) setIsExpanded(true);
          }}
        >
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
            <p className="text-xs text-spotify-green/80 md:text-white/50 truncate hover:underline cursor-pointer">
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
                className="absolute left-0 top-0 h-full bg-spotify-white hover:bg-spotify-green rounded-full group-hover:bg-green-400" 
                style={{ width: `${progress}%`, backgroundColor: 'white' }}
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
        <div className="flex items-center justify-end gap-3 w-[20%] md:w-[30%]">
          
          {/* Mobile controls */}
          <div className="flex items-center justify-end gap-4 w-full md:hidden">
            <button 
              onClick={togglePlay}
              disabled={!currentTrack}
              className="w-8 h-8 flex items-center justify-center disabled:opacity-50 hover:scale-110 active:scale-95 transition-transform"
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
    </>
  );
};

const MoreHorizontalIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
);
const MonitorSpeakerIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><circle cx="12" cy="14" r="4"/><path d="M12 6h.01"/></svg>
);

export default BottomPlayer;
