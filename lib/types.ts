export interface Category {
  id: number;
  name: string;
  name_kz: string;
  icon: string;
  color: string;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  category_id: number;
  latitude: number;
  longitude: number;
  address: string;
  phone: string | null;
  working_hours: string | null;
  photos: string[];
  is_featured: boolean;
  created_at: string;
  category?: Category;
}

export interface Event {
  id: string;
  place_id: string;
  name: string;
  description: string;
  date_start: string;
  date_end: string;
  price: number | null;
  ticket_url: string | null;
  photos: string[];
  created_at: string;
  place?: Place;
}

export type DateFilter = 'all' | 'today' | 'tomorrow' | 'weekend';

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}
