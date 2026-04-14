"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { usePlayer, Track } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import { Play, Clock, MoreHorizontal } from 'lucide-react';

export default function LibraryPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { user } = useAuth();

  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  useEffect(() => {
    fetchTracks();
  }, [user]);

  const fetchTracks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTracks(data || []);
    } catch (err) {
      console.error('Error fetching tracks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueArtists = Array.from(new Set(tracks.map(t => t.artist)));

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-10 w-48 bg-white/5 rounded-md mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-48 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Visualização Detalhada do Artista (Tracks)
  if (selectedArtist) {
    const artistTracks = tracks.filter(t => t.artist === selectedArtist);
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <button onClick={() => setSelectedArtist(null)} className="text-sm font-bold text-white/50 hover:text-white mb-4 flex items-center gap-2">
          ← Voltar para Artistas
        </button>
        
        <div className="flex items-end gap-6 mb-8">
          <div className="w-40 h-40 bg-spotify-green shadow-xl flex items-center justify-center text-7xl rounded-full">
            🎤
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider">Artista</span>
            <h1 className="text-6xl font-black">{selectedArtist}</h1>
            <span className="text-white/70">{artistTracks.length} músicas mapeadas</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8 mb-8">
          <button 
            onClick={() => artistTracks[0] && playTrack(artistTracks[0])}
            className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          >
            <Play className="w-8 h-8 text-black fill-current ml-1" />
          </button>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-white/40 text-xs font-bold uppercase tracking-widest mb-4">
            <span>#</span>
            <span>Título</span>
            <span>Álbum</span>
            <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
          </div>
          <div className="flex flex-col">
            {artistTracks.map((track, i) => (
              <div 
                key={track.id}
                onClick={() => playTrack(track)}
                className={`grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 rounded-md hover:bg-white/10 group cursor-pointer transition-colors items-center ${currentTrack?.id === track.id ? 'bg-white/5' : ''}`}
              >
                <div className="flex items-center justify-center relative">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="w-3 h-3 bg-spotify-green rounded-full animate-bounce" />
                  ) : (
                    <span className={`text-sm ${currentTrack?.id === track.id ? 'text-spotify-green' : 'text-white/40 group-hover:hidden'}`}>
                      {i + 1}
                    </span>
                  )}
                  <Play className={`w-3 h-3 text-white fill-current hidden group-hover:block ${currentTrack?.id === track.id ? 'text-spotify-green' : ''}`} />
                </div>
                
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-white/5 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {track.cover_url ? <img src={track.cover_url} alt="" className="w-full h-full object-cover" /> : "💿"}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className={`font-medium truncate ${currentTrack?.id === track.id ? 'text-spotify-green' : 'text-white'}`}>
                      {track.title}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-white/40 group-hover:text-white/70 truncate">
                  {track.album}
                </div>

                <div className="flex items-center justify-end gap-4 text-white/40">
                  <span className="text-xs group-hover:text-white/70">3:45</span>
                  <MoreHorizontal className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Visualização de Artistas (Jellyfin Style)
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-5xl font-black mb-2">Artistas</h1>
        <p className="text-white/40">Sua biblioteca sincronizada de pastas musicais.</p>
      </div>

      {uniqueArtists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <p className="text-lg">Nenhum artista mapeado.</p>
          <p className="text-sm mb-6">Peça ao Admin para mapear pastas do Google Drive.</p>
          
          {user?.email === 'spotitrava@gmail.com' && (
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-add-music'))}
              className="px-6 py-3 bg-spotify-green text-black font-bold rounded-full hover:scale-105 transition-all"
            >
              Adicionar Artista Agora
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {uniqueArtists.map((artistName) => {
            const tracksCount = tracks.filter(t => t.artist === artistName).length;
            // Pega o cover da primeira música do artista (se houver) para representar a pasta dele
            const artistCover = tracks.find(t => t.artist === artistName && t.cover_url)?.cover_url;
            
            return (
              <div 
                key={artistName}
                onClick={() => setSelectedArtist(artistName)}
                className="group relative bg-[#181818] hover:bg-[#282828] p-4 rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center text-center gap-4 hover:shadow-2xl"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg bg-[#333] flex items-center justify-center text-5xl">
                  {artistCover ? (
                    <img src={artistCover} alt={artistName} className="w-full h-full object-cover" />
                  ) : (
                    "🎤"
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1 truncate w-full px-2" title={artistName}>{artistName}</h3>
                  <p className="text-xs text-white/50">{tracksCount} músicas</p>
                </div>
                <div className="absolute right-4 bottom-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  <div className="w-12 h-12 bg-spotify-green rounded-full shadow-xl flex items-center justify-center hover:scale-105 hover:bg-green-400">
                    <Play className="w-6 h-6 text-black fill-current ml-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
