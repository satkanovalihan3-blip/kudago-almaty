import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Review = {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  text: string | null;
  photos: string[];
  created_at: string;
  updated_at: string;
  profile?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};

// Get reviews for a place
export async function getPlaceReviews(placeId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profile:profiles(username, full_name, avatar_url)
    `)
    .eq('place_id', placeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  return data as Review[];
}

// Create a review
export async function createReview(
  placeId: string,
  userId: string,
  rating: number,
  text?: string,
  photos?: string[]
) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      place_id: placeId,
      user_id: userId,
      rating,
      text: text || null,
      photos: photos || [],
    })
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

// Update a review
export async function updateReview(
  reviewId: string,
  rating: number,
  text?: string,
  photos?: string[]
) {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      rating,
      text: text || null,
      photos: photos || [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

// Delete a review
export async function deleteReview(reviewId: string) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
}

// Check if user has reviewed a place
export async function getUserReview(placeId: string, userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('place_id', placeId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user review:', error);
    return null;
  }
  return data as Review | null;
}
