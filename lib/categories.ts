// Hardcoded categories for initial use (before Supabase is set up)
import type { Category } from './types';

export const categories: Category[] = [
  { id: 1, name: 'Активный отдых', name_kz: 'Белсенді демалыс', icon: '🏔️', color: '#10B981' },
  { id: 2, name: 'Рестораны и кафе', name_kz: 'Мейрамханалар мен кафелер', icon: '🍽️', color: '#F59E0B' },
  { id: 3, name: 'Бары и клубы', name_kz: 'Барлар мен клубтар', icon: '🍸', color: '#8B5CF6' },
  { id: 4, name: 'Культура', name_kz: 'Мәдениет', icon: '🎭', color: '#EC4899' },
  { id: 5, name: 'Спорт', name_kz: 'Спорт', icon: '⚽', color: '#3B82F6' },
  { id: 6, name: 'Детям', name_kz: 'Балаларға', icon: '🎈', color: '#F97316' },
  { id: 7, name: 'Природа', name_kz: 'Табиғат', icon: '🌲', color: '#22C55E' },
];
