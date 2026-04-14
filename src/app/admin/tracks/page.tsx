"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { updateTrackAction, deleteTrackAction } from '@/app/actions/admin';
import { Edit2, Trash2, Save, X, ExternalLink } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  audio_url: string;
  cover_url: string | null;
}

export default function ManageTracks() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', artist: '', album: '' });

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('tracks').select('*').order('created_at', { ascending: false });
    setTracks(data || []);
    setIsLoading(false);
  };

  const startEdit = (track: Track) => {
    setEditingId(track.id);
    setEditForm({ title: track.title, artist: track.artist, album: track.album });
  };

  const handleUpdate = async (id: string) => {
    const result = await updateTrackAction(user?.email, id, editForm);
    if (result.success) {
      setEditingId(null);
      fetchTracks();
    } else {
      alert("Erro ao atualizar: " + result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta música?")) {
      const result = await deleteTrackAction(user?.email, id);
      if (result.success) {
        fetchTracks();
      } else {
        alert("Erro ao excluir: " + result.error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black">Gerenciar Músicas</h2>
        <div className="text-sm text-white/40">{tracks.length} músicas cadastradas</div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-xs font-bold uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-6 py-4">Título</th>
              <th className="px-6 py-4">Artista</th>
              <th className="px-6 py-4">Álbum</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-6 py-4 h-16 bg-white/5" />
                </tr>
              ))
            ) : tracks.map((track) => (
              <tr key={track.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  {editingId === track.id ? (
                    <input 
                      className="bg-white/10 border border-white/20 rounded px-2 py-1 w-full text-sm"
                      value={editForm.title}
                      onChange={e => setEditForm({...editForm, title: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {track.cover_url ? <img src={track.cover_url} className="w-full h-full object-cover" /> : "💿"}
                      </div>
                      <span className="font-medium">{track.title}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === track.id ? (
                    <input 
                      className="bg-white/10 border border-white/20 rounded px-2 py-1 w-full text-sm"
                      value={editForm.artist}
                      onChange={e => setEditForm({...editForm, artist: e.target.value})}
                    />
                  ) : (
                    <span className="text-white/60">{track.artist}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === track.id ? (
                    <input 
                      className="bg-white/10 border border-white/20 rounded px-2 py-1 w-full text-sm"
                      value={editForm.album}
                      onChange={e => setEditForm({...editForm, album: e.target.value})}
                    />
                  ) : (
                    <span className="text-white/60">{track.album}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === track.id ? (
                      <>
                        <button onClick={() => handleUpdate(track.id)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-full">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(track)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(track.id)} className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-full">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <a href={track.audio_url} target="_blank" className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
