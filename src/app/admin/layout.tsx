"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Music, ArrowLeft, ShieldCheck } from 'lucide-react';

const ADMIN_EMAIL = 'spotitrava@gmail.com';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-spotify-dark">
        <div className="w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotify-dark flex flex-col">
      <header className="h-20 bg-black/40 border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold">Voltar ao App</span>
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-spotify-green" />
            <h1 className="text-xl font-black tracking-tighter uppercase">Admin Panel</h1>
          </div>
        </div>

        <nav className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-sm hover:text-spotify-green transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/admin/tracks" className="flex items-center gap-2 font-bold text-sm hover:text-spotify-green transition-colors">
            <Music className="w-4 h-4" />
            Gerenciar Músicas
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
