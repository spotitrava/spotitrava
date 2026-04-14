"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from "@/components/Sidebar";
import BottomPlayer from "@/components/BottomPlayer";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { LogOut, ShieldCheck, Menu, X as CloseIcon } from "lucide-react";
import AddMusicModal from './AddMusicModal';

const Header = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  const { user, session, signOut, signInWithGoogle } = useAuth();
  
  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 bg-black/95 md:bg-black/20 backdrop-blur-md">
      {/* Left side: Navigation or Logo */}
      <div className="flex items-center gap-4">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2">
           <svg viewBox="0 0 24 24" className="w-8 h-8 fill-spotify-green"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.508 17.304c-.216.36-.672.468-1.032.252-2.844-1.74-6.432-2.136-10.656-1.164-.408.096-.828-.156-.924-.564-.096-.408.156-.828.564-.924 4.62-1.056 8.592-.588 11.784 1.368.36.216.48.672.264 1.032zm1.476-3.264c-.276.444-.852.588-1.296.312-3.252-2-8.196-2.58-12.036-1.416-.504.156-1.032-.132-1.188-.636s.132-1.032.636-1.188c4.392-1.332 9.852-.672 13.572 1.62.444.276.588.852.312 1.296zm.132-3.444C13.296 8.28 6.552 8.064 2.664 9.24a1.016 1.016 0 01-1.236-.72c-.18-.54.12-1.128.66-1.308 4.476-1.356 11.916-1.104 16.548 1.656.492.288.66.924.36 1.416-.288.492-.924.66-1.416.36z"/></svg>
           <span className="text-white font-bold text-lg tracking-tight">Spotify</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4">
          <button className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors">
            <span className="text-white">{"<"}</span>
          </button>
          <button className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors opacity-50 cursor-not-allowed">
            <span className="text-white">{">"}</span>
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {user?.email === 'spotitrava@gmail.com' && (
          <Link 
            href="/admin" 
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg"
          >
            <ShieldCheck className="w-4 h-4" />
            Painel Admin
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile Actions */}
            <button 
              onClick={onToggleSidebar}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <Menu className="w-7 h-7" />
            </button>

            {/* User Profile - Desktop and Mobile (partial flex) */}
            <button className="flex items-center gap-2 p-1 pr-3 md:pr-4 rounded-full bg-black/80 hover:bg-black/60 transition-all group">
              {user.user_metadata.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="User" className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 bg-spotify-green rounded-full flex items-center justify-center text-xs font-bold text-black group-hover:scale-110 transition-transform">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <span className="hidden md:inline text-sm font-bold truncate max-w-[100px]">{user.user_metadata.full_name || user.email}</span>
            </button>
            <button 
              onClick={signOut}
              className="hidden md:block p-2 text-white/40 hover:text-white transition-colors"
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsAddMusicOpen(true);
    window.addEventListener('open-add-music', handleOpenModal);
    return () => window.removeEventListener('open-add-music', handleOpenModal);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AuthProvider>
      <PlayerProvider>
        <AddMusicModal 
          isOpen={isAddMusicOpen} 
          onClose={() => setIsAddMusicOpen(false)} 
        />
        <div className="flex h-screen overflow-hidden bg-black">
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar Wrapper */}
          <div className={`
            fixed inset-y-0 left-0 z-[70] w-72 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            {/* Close button for mobile sidebar */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white md:hidden"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            <Sidebar />
          </div>

          <main className="flex-1 relative overflow-y-auto gradient-bg pb-32">
            <Header onToggleSidebar={toggleSidebar} />
            <div className="p-4 md:p-8">
              {children}
            </div>
            {/* Extra padding for mobile bottom nav + player */}
            <div className="h-20 md:hidden" />
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
              <span className="text-[10px] mt-1 font-medium text-center">Sua Biblioteca</span>
            </Link>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-add-music'))}
              className="flex flex-col items-center justify-center p-2 text-white/50 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              <span className="text-[10px] mt-1 font-medium text-center">Adicionar</span>
            </button>
          </div>
        </div>
      </PlayerProvider>
    </AuthProvider>
  );
}
