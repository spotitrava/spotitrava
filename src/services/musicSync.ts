import { listMusicFiles, DriveFile } from '@/lib/drive';
import { supabase } from '@/lib/supabase';

export const syncDriveWithSupabase = async (accessToken: string, userId: string) => {
  try {
    // 1. Fetch files from Google Drive
    const driveFiles = await listMusicFiles(accessToken);
    
    if (!driveFiles || driveFiles.length === 0) return [];

    // 2. Prepare tracks for Supabase
    const tracks = driveFiles.map((file: DriveFile) => ({
      id: file.id,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      audio_url: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
      cover_url: file.thumbnailLink || null,
      file_id: file.id,
      artist: 'Artista Desconhecido',
      album: 'Álbum Desconhecido',
    }));

    // 3. Upsert tracks into Supabase 'tracks' table
    const { error: tracksError } = await supabase
      .from('tracks')
      .upsert(tracks, { onConflict: 'id' });

    if (tracksError) throw tracksError;

    // 4. Update user profile or library state if needed
    // (Optional: Link tracks to user favorites etc)

    return tracks;
  } catch (error) {
    console.error('Error syncing music:', error);
    throw error;
  }
};
