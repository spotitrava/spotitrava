"use client";

import React from 'react';
import { Play } from 'lucide-react';

const categories = [
  { title: "Músicas Curtidas", color: "from-indigo-900", icon: "❤️" },
  { title: "Sincronizado", color: "from-green-900", icon: "☁️" },
  { title: "Recentes", color: "from-gray-800", icon: "🕒" },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-bold mb-6">Boa tarde</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div 
              key={i} 
              className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-all rounded-md overflow-hidden cursor-pointer relative"
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl shadow-lg`}>
                {cat.icon}
              </div>
              <p className="font-bold">{cat.title}</p>
              <div className="absolute right-4 w-12 h-12 bg-spotify-green rounded-full shadow-2xl flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <Play className="w-6 h-6 text-black fill-current ml-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold hover:underline cursor-pointer">Sua Biblioteca do Drive</h2>
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest hover:underline cursor-pointer">Mostrar tudo</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className="glass p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
            >
              <div className="aspect-square bg-white/5 rounded-lg mb-4 shadow-2xl flex items-center justify-center text-4xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                💿
                <div className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full shadow-2xl flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                  <Play className="w-6 h-6 text-black fill-current ml-1" />
                </div>
              </div>
              <h3 className="font-bold truncate mb-1">Playlist do Google Drive</h3>
              <p className="text-sm text-white/40 line-clamp-2">Suas músicas sincronizadas da pasta SPOTITRAVA_MUSICAS.</p>
            </div>
          ))}
        </div>
      </section>
      
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold hover:underline cursor-pointer">Feito para você</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className="glass p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150"
            >
              <div className="aspect-square bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg mb-4 shadow-2xl flex items-center justify-center text-4xl relative overflow-hidden border border-white/5">
                🎵
                <div className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full shadow-2xl flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <Play className="w-6 h-6 text-black fill-current ml-1" />
                </div>
              </div>
              <h3 className="font-bold truncate mb-1">Descobertas da Semana</h3>
              <p className="text-sm text-white/40 truncate">Novas músicas baseadas no seu gosto.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
