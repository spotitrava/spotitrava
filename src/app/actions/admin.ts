"use server";

import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

const ADMIN_EMAIL = 'spotitrava@gmail.com';

// Middleware-like check for server actions
async function verifyAdmin(email: string | undefined) {
  if (email !== ADMIN_EMAIL) {
    throw new Error('Não autorizado. Acesso exclusivo para o administrador.');
  }
}

export async function updateTrackAction(email: string | undefined, trackId: string, data: { title?: string, artist?: string, album?: string }) {
  await verifyAdmin(email);

  try {
    const { error } = await supabaseAdmin
      .from('tracks')
      .update(data)
      .eq('id', trackId);

    if (error) throw error;
    
    revalidatePath('/admin/tracks');
    revalidatePath('/library');
    return { success: true };
  } catch (err) {
    console.error('Error updating track:', err);
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteTrackAction(email: string | undefined, trackId: string) {
  await verifyAdmin(email);

  try {
    const { error } = await supabaseAdmin
      .from('tracks')
      .delete()
      .eq('id', trackId);

    if (error) throw error;
    
    revalidatePath('/admin/tracks');
    revalidatePath('/library');
    return { success: true };
  } catch (err) {
    console.error('Error deleting track:', err);
    return { success: false, error: (err as Error).message };
  }
}

export async function getAdminStats(email: string | undefined) {
  await verifyAdmin(email);

  try {
    const { count: tracksCount } = await supabaseAdmin.from('tracks').select('*', { count: 'exact', head: true });
    
    // Simplistic artist count
    const { data: artistData } = await supabaseAdmin.from('tracks').select('artist');
    const uniqueArtists = new Set(artistData?.map(t => t.artist)).size;

    return {
      success: true,
      stats: {
        totalTracks: tracksCount || 0,
        totalArtists: uniqueArtists || 0,
      }
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
