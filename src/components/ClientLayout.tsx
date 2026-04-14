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

          <main className="flex-1 relative overflow-y-auto gradient-bg pb-32">
            <Header />
            <div className="p-4 md:p-8">
              {children}
            </div>
            {/* Extra padding for mobile bottom nav + player */}
            <div className="h-16 md:hidden" />
          </main>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col">
          <BottomPlayer />

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden h-14 bg-black border-t border-white/10 flex items-center justify-around px-2">
            <Link href="/" className="flex flex-col items-center justify-center p-2 text-white/50 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span className="text-[10px] mt-1 font-medium">Início</span>
            </Link>
            <Link href="/search" className="flex flex-col items-center justify-center p-2 text-white/50 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span className="text-[10px] mt-1 font-medium">Buscar</span>
            </Link>
            <Link href="/library" className="flex flex-col items-center justify-center p-2 text-white/50 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>
              <span className="text-[10px] mt-1 font-medium">Biblioteca</span>
            </Link>
          </div>
        </div>
      </PlayerProvider>
    </AuthProvider>
  );
}
