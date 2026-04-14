"use client";

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePlayer, Track } from '@/context/PlayerContext';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { playTrack } = usePlayer();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,artist.ilike.%${searchTerm}%,album.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-black" />
        </div>
        <input 
          type="text"
          placeholder="O que você deseja ouvir?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white text-black py-3 pl-12 pr-4 rounded-full font-medium placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-spotify-green transition-all"
        />
      </div>

      <section>
        {searchTerm ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Resultados para "{searchTerm}"</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.length > 0 ? (
                results.map((track) => (
                  <div 
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className="flex items-center gap-4 bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-white/5 rounded-md flex items-center justify-center text-2xl relative overflow-hidden">
                      {track.cover_url ? (
                        <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        "💿"
                      )}
                      <div className="absolute inset-0 bg-black/40 items-center justify-center flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-bold truncate">{track.title}</span>
                      <span className="text-xs text-white/40 truncate">{track.artist}</span>
                    </div>
                  </div>
                ))
              ) : (
                !isSearching && <p className="text-white/40">Nenhum resultado encontrado.</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">Navegar por tudo</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {['Pop', 'Hip-Hop', 'Rock', 'Ambient', 'Sertanejo'].map((genre, i) => (
                <div 
                  key={i} 
                  className={`aspect-square p-4 rounded-xl flex items-start justify-start cursor-pointer transition-transform hover:scale-105 relative overflow-hidden bg-gradient-to-br ${i % 2 === 0 ? 'from-purple-600 to-indigo-900' : 'from-pink-600 to-rose-900'}`}
                >
                  <span className="text-2xl font-black">{genre}</span>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-lg rotate-12 shadow-2xl" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
