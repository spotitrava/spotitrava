"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from "@/components/Sidebar";
import BottomPlayer from "@/components/BottomPlayer";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { syncMusicAction } from "@/app/actions/music";
import AddMusicModal from './AddMusicModal';

const Header = () => {
  const { user, session, signOut, signInWithGoogle } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (session?.provider_token && user) {
      setIsSyncing(true);
      try {
        const result = await syncMusicAction(session.provider_token, user.id);
        if (result.success) {
          alert(`Sincronização concluída! ${result.count} músicas encontradas.`);
        } else {
          alert(`Erro: ${result.error}`);
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao sincronizar músicas.");
      } finally {
        setIsSyncing(false);
      }
    } else if (!user) {
      alert("Por favor, faça login com Google primeiro.");
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-40 bg-black/20 backdrop-blur-md">
      <div className="flex gap-4">
        <button className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors">
          <span className="text-white">{"<"}</span>
        </button>
        <button className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors opacity-50 cursor-not-allowed">
          <span className="text-white">{">"}</span>
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm bg-white text-black hover:scale-105 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Drive'}
          </button>
        )}
        
        {user?.email === 'spotitrava@gmail.com' && (
          <Link 
            href="/admin" 
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg"
          >
            <ShieldCheck className="w-4 h-4" />
            Painel Admin
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 p-1 pr-4 rounded-full bg-black/80 hover:bg-black/60 transition-all group">
              {user.user_metadata.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="User" className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 bg-spotify-green rounded-full flex items-center justify-center text-xs font-bold text-black group-hover:scale-110 transition-transform">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm font-bold truncate max-w-[100px]">{user.user_metadata.full_name || user.email}</span>
            </button>
            <button 
              onClick={signOut}
              className="p-2 text-white/40 hover:text-white transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button 
            onClick={signInWithGoogle}
            className="px-8 py-3 rounded-full font-bold text-sm bg-white text-black hover:scale-105 transition-all"
          >
            Entrar
          </button>
        )}
      </div>
    </header>
  );
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsAddMusicOpen(true);
    window.addEventListener('open-add-music', handleOpenModal);
    return () => window.removeEventListener('open-add-music', handleOpenModal);
  }, []);

  return (
    <AuthProvider>
      <PlayerProvider>
        <AddMusicModal 
          isOpen={isAddMusicOpen} 
          onClose={() => setIsAddMusicOpen(false)} 
        />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />

          <main className="flex-1 relative overflow-y-auto gradient-bg">
            <Header />
            <div className="p-8">
              {children}
            </div>
            <div className="h-32" />
          </main>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomPlayer />
        </div>
      </PlayerProvider>
    </AuthProvider>
  );
}
