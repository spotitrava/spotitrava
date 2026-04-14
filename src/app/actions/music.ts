"use server";

import { listMusicFiles, getFolderMetadata, makeFolderPublic } from '@/lib/drive';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Utilitário para extrair ID do link do Google Drive
function extractFolderId(urlOrId: string): string | null {
  if (!urlOrId.includes('/')) return urlOrId; // Se já passou só o ID
  
  // Exemplo: https://drive.google.com/drive/folders/1abc123...?usp=sharing
  const match = urlOrId.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export async function syncArtistFolderAction(accessToken: string, folderUrl: string) {
  try {
    const folderId = extractFolderId(folderUrl);
    if (!folderId) {
      throw new Error("URL inválida. Selecione o link da pasta do Google Drive (deve conter /folders/...).");
    }

    // 1. Pega os metadados da pasta (Nome do Artista = Nome da pasta)
    const folderMetadata = await getFolderMetadata(accessToken, folderId);
    if (!folderMetadata || !folderMetadata.name) {
      throw new Error("Não foi possível encontrar a pasta ou você não tem acesso.");
    }
    const artistName = folderMetadata.name;

    // 2. Torna a pasta pública para leitura no Google Drive 
    //    Isso permite que o Player HTML5 (<audio>) consiga baixar as partes do MP3 sem bloqueio.
    await makeFolderPublic(accessToken, folderId);

    // 3. Escaneia TODAS as músicas só dessa pasta
    const driveFiles = await listMusicFiles(accessToken, folderId);
    
    if (!driveFiles || driveFiles.length === 0) return { success: true, count: 0, artist: artistName };

    // 4. Prepara para ir pro banco de dados com URLs acessíveis por link
    const tracks = driveFiles.map((file) => ({
      id: file.id,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extensões .mp3 .wav etc
      audio_url: `https://drive.google.com/uc?export=download&id=${file.id}`,
      cover_url: file.thumbnailLink || null,
      file_id: file.id,
      artist: artistName,   
      album: 'Lançamento',  
    }));

    // 5. Salva no banco
    const { error: tracksError } = await supabaseAdmin
      .from('tracks')
      .upsert(tracks, { onConflict: 'id' });

    if (tracksError) throw tracksError;

    return { success: true, count: tracks.length, artist: artistName };
  } catch (error) {
    console.error('Error syncing artist folder:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function syncMusicAction(accessToken: string, userId: string) {
  try {
    // Sincronização solta de arquivos raiz (sem pasta / legado)
    const driveFiles = await listMusicFiles(accessToken);
    
    if (!driveFiles || driveFiles.length === 0) return { success: true, count: 0 };

    const tracks = driveFiles.map((file) => ({
      id: file.id,
      title: file.name.replace(/\.[^/.]+$/, ""),
      audio_url: `https://drive.google.com/uc?export=download&id=${file.id}`,
      cover_url: file.thumbnailLink || null,
      file_id: file.id,
      artist: 'Sincronizados Avulsos',
      album: 'Vários',
    }));

    const { error: tracksError } = await supabaseAdmin
      .from('tracks')
      .upsert(tracks, { onConflict: 'id' });

    if (tracksError) throw tracksError;

    return { success: true, count: tracks.length };
  } catch (error) {
    console.error('Error syncing music:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function addYouTubeTrackAction(url: string) {
  try {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    const videoId = match ? match[1] : null;
    
    if (!videoId) {
      throw new Error("URL do YouTube inválida.");
    }

    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    
    if (!res.ok) {
      throw new Error("Não foi possível obter informações do vídeo do YouTube.");
    }
    
    const data = await res.json();

    const track = {
      id: `yt_${videoId}`,
      title: data.title,
      artist: data.author_name,
      album: 'YouTube',
      audio_url: url, // React-player can play the raw YouTube URL
      cover_url: data.thumbnail_url,
      file_id: `yt:${videoId}`,
    };

    const { error } = await supabaseAdmin
      .from('tracks')
      .upsert(track, { onConflict: 'id' });

    if (error) throw error;

    return { success: true, track };
  } catch (error) {
    console.error('Error adding YouTube track:', error);
    return { success: false, error: (error as Error).message };
  }
}
