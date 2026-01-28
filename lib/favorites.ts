import { createClient } from '@supabase/supabase-js';
import type { Place, Category } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Favorite = {
  id: string;
  user_id: string;
  place_id: string;
  created_at: string;
  place?: Place & { category?: Category };
};

// Get user's favorites
export async function getUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      place:places(*, category:categories(*))
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
  return data as Favorite[];
}

// Add to favorites
export async function addToFavorites(userId: string, placeId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      place_id: placeId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Favorite;
}

// Remove from favorites
export async function removeFromFavorites(userId: string, placeId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);

  if (error) throw error;
}

// Check if place is in favorites
export async function isFavorite(userId: string, placeId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('place_id', placeId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking favorite:', error);
    return false;
  }
  return !!data;
}

// Toggle favorite
export async function toggleFavorite(userId: string, placeId: string) {
  const isCurrentlyFavorite = await isFavorite(userId, placeId);

  if (isCurrentlyFavorite) {
    await removeFromFavorites(userId, placeId);
    return false;
  } else {
    await addToFavorites(userId, placeId);
    return true;
  }
}
