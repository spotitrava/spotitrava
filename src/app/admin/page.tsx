"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAdminStats } from '@/app/actions/admin';
import { Music, Users, Database, Zap } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalTracks: 0, totalArtists: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const result = await getAdminStats(user?.email);
      if (result.success && result.stats) {
        setStats(result.stats);
      }
      setIsLoading(false);
    }
    if (user?.email) fetchStats();
  }, [user]);

  const cards = [
    { title: "Total de Músicas", value: stats.totalTracks, icon: Music, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total de Artistas", value: stats.totalArtists, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Armazenamento", value: "Google Drive", icon: Database, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Status do Sistema", value: "Online", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black mb-2">Bem-vindo, Admin</h2>
        <p className="text-white/40">Visão geral da sua biblioteca de músicas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="glass p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/40 mb-1">{card.title}</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-black tabular-nums">{card.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-2xl border border-white/5">
          <h3 className="text-xl font-bold mb-6">Mapear Pasta do Artista</h3>
          <p className="text-sm text-white/50 mb-4">
            Cole o link da pasta do Google Drive (ex: "O Rappa") para mapear o artista.
          </p>
          <div className="flex flex-col gap-3">
            <input 
              id="folder-input"
              type="text" 
              placeholder="https://drive.google.com/drive/folders/..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-spotify-green transition-colors"
            />
            <button 
              onClick={async () => {
                const input = document.getElementById('folder-input') as HTMLInputElement;
                const url = input?.value;
                if (!url) return alert('Cole o link primeiro.');
                
                // Hack para pegar a session e token. Numa app real você passaria o context certinho
                const sessionStr = localStorage.getItem('sb-bijibricegsvsnfjewhh-auth-token');
                if (!sessionStr) return alert('Você não está logado.');
                const session = JSON.parse(sessionStr);
                
                const btn = document.getElementById('sync-btn');
                if(btn) btn.innerHTML = 'Sincronizando...';
                
                try {
                  const { syncArtistFolderAction } = await import('@/app/actions/music');
                  const result = await syncArtistFolderAction(session.provider_token, url);
                  
                  if (result.success) {
                    alert(`✅ Sincronizado: ${result.artist}\n${result.count} músicas adicionadas.`);
                    input.value = '';
                    window.location.reload();
                  } else {
                    alert(`Erro: ${result.error}`);
                  }
                } catch (e) {
                  alert('Erro crítico');
                } finally {
                  if(btn) btn.innerHTML = 'Mapear e Sincronizar';
                }
              }}
              id="sync-btn"
              className="w-full px-6 py-3 bg-spotify-green text-black font-bold rounded-lg hover:scale-[1.02] transition-transform"
            >
              Mapear e Sincronizar
            </button>
          </div>

        </div>
        
        <div className="glass p-8 rounded-2xl border border-white/5">
          <h3 className="text-xl font-bold mb-6">Informação de Segurança</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            Painel restrito apenas para o administrador. Todas as ações de edição e deleção são registradas no banco de dados. 
            Mantenha sua conta do Google segura para proteger a biblioteca.
          </p>
        </div>
      </div>
    </div>
  );
}
