"use client";

import React, { useEffect, useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePlayer, Track } from '@/context/PlayerContext';

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

  const trendingTracks = tracks.slice(0, 6);
  
  // Get unique artists with their first available cover
  const popularArtists = Array.from(new Set(tracks.map(t => t.artist)))
    .slice(0, 6)
    .map(artistName => {
      const artistTrack = tracks.find(t => t.artist === artistName && t.cover_url);
      return {
        name: artistName,
        cover_url: artistTrack?.cover_url || null
      };
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-spotify-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Músicas em alta */}
      <section>
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Músicas em alta</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {trendingTracks.map((track) => (
            <div 
              key={track.id} 
              onClick={() => playTrack(track, tracks)}
              className="group cursor-pointer transition-all duration-300"
            >
              <div className="aspect-square bg-[#282828] rounded-md mb-3 shadow-lg relative overflow-hidden group-hover:shadow-2xl transition-shadow">
                {track.cover_url ? (
                  <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">💿</div>
                )}
                <div className="absolute bottom-2 right-2 w-10 h-10 bg-spotify-green rounded-full shadow-2xl flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                </div>
              </div>
              <h3 className="font-bold text-[15px] leading-tight text-white truncate mb-1 group-hover:underline">{track.title}</h3>
              <p className="text-sm text-white/50 truncate">{track.artist}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Artistas populares */}
      <section>
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Artistas populares</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {popularArtists.map((artist, i) => (
            <div 
              key={i} 
              className="group cursor-pointer transition-all duration-300"
              onClick={() => {
                // Navigate to library or filter by artist in the future
                window.location.href = `/library?artist=${encodeURIComponent(artist.name)}`;
              }}
            >
              <div className="aspect-square bg-[#282828] rounded-full mb-3 shadow-lg relative overflow-hidden group-hover:shadow-2xl transition-shadow">
                {artist.cover_url ? (
                  <img src={artist.cover_url} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🎤</div>
                )}
                <div className="absolute bottom-2 right-2 w-10 h-10 bg-spotify-green rounded-full shadow-2xl flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                </div>
              </div>
              <h3 className="font-bold text-[15px] text-white truncate text-center group-hover:underline">{artist.name}</h3>
              <p className="text-sm text-white/50 text-center">Artista</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

