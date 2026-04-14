"use client";

import React, { useState } from 'react';
import { X, FolderPlus, Loader2, Link as LinkIcon, AlertCircle, PlaySquare, HardDrive } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { syncArtistFolderAction, addYouTubeTrackAction } from '@/app/actions/music';

interface AddMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMusicModal = ({ isOpen, onClose }: AddMusicModalProps) => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'drive' | 'youtube'>('drive');
  const [url, setUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      if (activeTab === 'drive') {
        if (!session?.provider_token) {
          throw new Error('Erro de autenticação para o Drive. Faça login novamente.');
        }
        const result = await syncArtistFolderAction(session.provider_token, url);
        if (result.success) {
          setSuccess(`✅ ${result.artist} sincronizado com sucesso! ${result.count} músicas adicionadas.`);
          finishSync();
        } else {
          setError(result.error || 'Erro desconhecido ao sincronizar drive.');
        }
      } else {
        // YouTube sync
        const result = await addYouTubeTrackAction(url);
        if (result.success && result.track) {
          setSuccess(`✅ Música "${result.track.title}" adicionada com sucesso!`);
          finishSync();
        } else {
          setError(result.error || 'Erro desconhecido ao adicionar música do YouTube.');
        }
      }
    } catch (err) {
      setError((err as Error).message || 'Erro ao processar a sincronização.');
    } finally {
      setIsSyncing(false);
    }
  };

  const finishSync = () => {
    setUrl('');
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#181818] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-spotify-green/20 rounded-full flex items-center justify-center text-spotify-green">
              <FolderPlus className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Adicionar Músicas</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          <button
            type="button"
            onClick={() => { setActiveTab('drive'); setError(null); setSuccess(null); setUrl(''); }}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'drive' ? 'text-spotify-green border-b-2 border-spotify-green' : 'text-white/40 hover:text-white'
            }`}
          >
            <HardDrive className="w-4 h-4" /> Drive
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('youtube'); setError(null); setSuccess(null); setUrl(''); }}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'youtube' ? 'text-red-500 border-b-2 border-red-500' : 'text-white/40 hover:text-white'
            }`}
          >
            <PlaySquare className="w-4 h-4" /> YouTube
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSync} className="p-6 space-y-4">
          <p className="text-sm text-white/50 leading-relaxed min-h-[40px]">
            {activeTab === 'drive' 
              ? 'Mapeie uma pasta do artista no seu Google Drive. (Requer pasta compartilhada)' 
              : 'Cole o link de uma música do YouTube. Ela será adicionada como arquivo avulso.'}
          </p>
          
          <div className="relative group">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${activeTab === 'youtube' ? 'group-focus-within:text-red-500' : 'group-focus-within:text-spotify-green'} text-white/20`}>
              <LinkIcon className="w-4 h-4" />
            </div>
            <input 
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={activeTab === 'drive' ? "https://drive.google.com/drive/folders/..." : "https://www.youtube.com/watch?v=..."}
              className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:bg-white/10 ${
                activeTab === 'youtube' ? 'focus:border-red-500' : 'focus:border-spotify-green'
              }`}
              disabled={isSyncing}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-500 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className={`p-3 rounded-lg text-xs animate-in slide-in-from-top-2 ${activeTab === 'youtube' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-spotify-green/10 border border-spotify-green/20 text-spotify-green'}`}>
              {success}
            </div>
          )}

          <button 
            type="submit"
            disabled={isSyncing || !url}
            className={`w-full py-3 text-black font-black rounded-full hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed ${
              activeTab === 'youtube' ? 'bg-white' : 'bg-spotify-green'
            }`}
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {activeTab === 'drive' ? 'Sincronizando...' : 'Adicionando...'}
              </>
            ) : (
              activeTab === 'drive' ? 'Começar Mapeamento' : 'Adicionar Música'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/5 text-center px-6">
          <p className="text-[10px] text-white/30 font-medium">
            {activeTab === 'drive' 
              ? 'O nome da pasta no Drive será usado como o nome do Artista.' 
              : 'Informações como Título e Capa serão extraídas automaticamente do vídeo.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddMusicModal;
