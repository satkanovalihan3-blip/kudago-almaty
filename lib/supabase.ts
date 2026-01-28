import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Place, Event, Category } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client only if valid URL is provided
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseUrl.startsWith('http')) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Check if Supabase is configured
const isConfigured = () => supabase !== null;

// Places
export async function getPlaces(categoryId?: number) {
  if (!isConfigured()) return [];

  let query = supabase!
    .from('places')
    .select('*, category:categories(*)');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query.order('is_featured', { ascending: false });

  if (error) {
    console.error('Error fetching places:', error);
    return [];
  }
  return data as (Place & { category: Category })[];
}

export async function getPlace(id: string) {
  if (!isConfigured()) return null;

  const { data, error } = await supabase!
    .from('places')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching place:', error);
    return null;
  }
  return data as Place & { category: Category };
}

export async function searchPlaces(query: string) {
  if (!isConfigured()) return [];

  const { data, error } = await supabase!
    .from('places')
    .select('*, category:categories(*)')
    .ilike('name', `%${query}%`);

  if (error) {
    console.error('Error searching places:', error);
    return [];
  }
  return data as (Place & { category: Category })[];
}

// Events
export async function getEvents(dateFilter?: string) {
  if (!isConfigured()) return [];

  let query = supabase!
    .from('events')
    .select('*, place:places(*, category:categories(*))');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  // Find next weekend
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  const saturday = new Date(today);
  saturday.setDate(saturday.getDate() + daysUntilSaturday);
  const monday = new Date(saturday);
  monday.setDate(monday.getDate() + 2);

  switch (dateFilter) {
    case 'today':
      query = query
        .gte('date_start', today.toISOString())
        .lt('date_start', tomorrow.toISOString());
      break;
    case 'tomorrow':
      query = query
        .gte('date_start', tomorrow.toISOString())
        .lt('date_start', dayAfterTomorrow.toISOString());
      break;
    case 'weekend':
      query = query
        .gte('date_start', saturday.toISOString())
        .lt('date_start', monday.toISOString());
      break;
  }

  const { data, error } = await query.order('date_start', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  return data as (Event & { place: Place & { category: Category } })[];
}

export async function getEvent(id: string) {
  if (!isConfigured()) return null;

  const { data, error } = await supabase!
    .from('events')
    .select('*, place:places(*, category:categories(*))')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }
  return data as Event & { place: Place & { category: Category } };
}

export async function getEventsByPlace(placeId: string) {
  if (!isConfigured()) return [];

  const { data, error } = await supabase!
    .from('events')
    .select('*')
    .eq('place_id', placeId)
    .gte('date_end', new Date().toISOString())
    .order('date_start', { ascending: true });

  if (error) {
    console.error('Error fetching events by place:', error);
    return [];
  }
  return data as Event[];
}

// Categories
export async function getCategories() {
  if (!isConfigured()) return [];

  const { data, error } = await supabase!
    .from('categories')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data as Category[];
}
