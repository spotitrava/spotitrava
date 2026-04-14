import Link from 'next/link';
import { Home, Search, Library, PlusSquare, Heart, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  const { user, signInWithGoogle, isLoading } = useAuth();
  return (
    <aside className="w-64 bg-black flex flex-col h-full border-r border-white/5">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-spotify-green flex items-center gap-2">
          <span className="text-3xl">☄️</span> Spotitrava
        </h1>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <Link href="/" className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors group">
          <Home className="w-5 h-5 group-hover:text-spotify-green" />
          Início
        </Link>
        <Link href="/search" className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors group">
          <Search className="w-5 h-5 group-hover:text-spotify-green" />
          Buscar
        </Link>
        <Link href="/library" className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors group">
          <Library className="w-5 h-5 group-hover:text-spotify-green" />
          Sua Biblioteca
        </Link>

        <div className="pt-8 pb-4">
          <h2 className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
            Playlists
          </h2>
        </div>

        <button className="w-full flex items-center gap-4 px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors group">
          <div className="w-6 h-6 bg-white/10 flex items-center justify-center rounded-sm">
            <PlusSquare className="w-4 h-4" />
          </div>
          Criar Playlist
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors group">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-700 to-indigo-300 flex items-center justify-center rounded-sm">
            <Heart className="w-4 h-4 text-white fill-current" />
          </div>
          Músicas Curtidas
        </button>

        {user?.email === 'spotitrava@gmail.com' && (
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-add-music'))}
            className="w-full flex items-center gap-4 px-4 py-3 text-sm font-medium text-spotify-green hover:bg-white/10 rounded-lg transition-colors group mt-4 border border-spotify-green/20"
          >
            <div className="w-6 h-6 bg-spotify-green flex items-center justify-center rounded-sm">
              <PlusSquare className="w-4 h-4 text-black" />
            </div>
            Adicionar Músicas
          </button>
        )}
      </nav>

      <div className="p-4 border-t border-white/5">
        {!user ? (
          <button 
            onClick={signInWithGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-spotify-green text-black font-bold py-3 rounded-full hover:scale-105 transition-all text-sm disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            Entrar com Google
          </button>
        ) : (
          <div className="glass p-3 rounded-xl">
            <p className="text-[10px] text-white/40 uppercase font-bold mb-2">Google Drive</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-spotify-green rounded-full animate-pulse" />
              <p className="text-xs font-medium truncate">Sincronizado</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
