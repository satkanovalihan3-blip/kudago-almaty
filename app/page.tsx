'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getPlaces, searchPlaces, getEvents } from '@/lib/supabase';
import { categories as hardcodedCategories } from '@/lib/categories';
import type { Place, Category, DateFilter as DateFilterType } from '@/lib/types';
import CategoryFilter from '@/components/CategoryFilter';
import DateFilter from '@/components/DateFilter';
import SearchBar from '@/components/SearchBar';
import PlaceCard from '@/components/PlaceCard';
import EventCard from '@/components/EventCard';
import BottomSheet from '@/components/BottomSheet';

// Dynamic import for Map to avoid SSR issues with Mapbox
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Загрузка карты...</div>
    </div>
  ),
});

type ViewMode = 'places' | 'events';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('places');

  // Fetch places
  const { data: places = [], isLoading: isLoadingPlaces } = useQuery({
    queryKey: ['places', selectedCategory],
    queryFn: () => getPlaces(selectedCategory || undefined),
  });

  // Search places
  const { data: searchResults = [] } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => searchPlaces(searchQuery),
    enabled: searchQuery.length > 2,
  });

  // Fetch events
  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['events', dateFilter],
    queryFn: () => getEvents(dateFilter === 'all' ? undefined : dateFilter),
  });

  // Use search results if searching, otherwise use filtered places
  const displayedPlaces = useMemo(() => {
    if (searchQuery.length > 2) {
      return searchResults;
    }
    return places;
  }, [searchQuery, searchResults, places]);

  // Handle category with hardcoded data enrichment
  const enrichedPlaces = useMemo(() => {
    return displayedPlaces.map(place => ({
      ...place,
      category: place.category || hardcodedCategories.find(c => c.id === place.category_id),
    }));
  }, [displayedPlaces]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query) {
      setSelectedCategory(null);
    }
  }, []);

  const handlePlaceSelect = useCallback((place: Place & { category: Category }) => {
    setSelectedPlace(place.id);
  }, []);

  return (
    <main className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-[400px] lg:w-[450px] flex-col bg-white border-r border-gray-200">
        {/* Header */}
        <header className="p-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📍</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">KudaGo</h1>
              <p className="text-xs text-gray-500">Алматы</p>
            </div>
          </Link>
        </header>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* View Toggle */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setViewMode('places')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'places'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📍 Места
            </button>
            <button
              onClick={() => setViewMode('events')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'events'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎉 События
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-100">
          {viewMode === 'places' ? (
            <CategoryFilter
              categories={hardcodedCategories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          ) : (
            <DateFilter selected={dateFilter} onSelect={setDateFilter} />
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {viewMode === 'places' ? (
            isLoadingPlaces ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-xl" />
                ))}
              </div>
            ) : enrichedPlaces.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'Ничего не найдено' : 'Нет мест в этой категории'}
              </div>
            ) : (
              enrichedPlaces.map((place) => (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlace(place.id)}
                  className={`cursor-pointer transition-all ${
                    selectedPlace === place.id ? 'ring-2 ring-blue-500 rounded-xl' : ''
                  }`}
                >
                  <PlaceCard place={place as Place & { category: Category }} compact />
                </div>
              ))
            )
          ) : isLoadingEvents ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Нет событий в выбранный период
            </div>
          ) : (
            events.map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))
          )}
        </div>
      </aside>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          places={enrichedPlaces as (Place & { category: Category })[]}
          onPlaceSelect={handlePlaceSelect}
          selectedPlaceId={selectedPlace}
        />

        {/* Mobile Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 md:hidden z-10">
          <div className="bg-white rounded-2xl shadow-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📍</span>
              </div>
              <span className="font-bold text-gray-900">KudaGo Almaty</span>
            </div>
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <BottomSheet>
        {/* Mobile View Toggle */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-3">
          <button
            onClick={() => setViewMode('places')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'places'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📍 Места
          </button>
          <button
            onClick={() => setViewMode('events')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'events'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎉 События
          </button>
        </div>

        {/* Mobile Filters */}
        <div className="mb-3">
          {viewMode === 'places' ? (
            <CategoryFilter
              categories={hardcodedCategories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          ) : (
            <DateFilter selected={dateFilter} onSelect={setDateFilter} />
          )}
        </div>

        {/* Mobile List */}
        <div className="space-y-3">
          {viewMode === 'places'
            ? enrichedPlaces.slice(0, 10).map((place) => (
                <PlaceCard key={place.id} place={place as Place & { category: Category }} compact />
              ))
            : events.slice(0, 10).map((event) => (
                <EventCard key={event.id} event={event} compact />
              ))}
        </div>
      </BottomSheet>
    </main>
  );
}
