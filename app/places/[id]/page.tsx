'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getPlace, getEventsByPlace } from '@/lib/supabase';
import { categories as hardcodedCategories } from '@/lib/categories';
import EventCard from '@/components/EventCard';

const MiniMap = dynamic(
  () =>
    import('@/components/Map').then((mod) => {
      const MiniMapWrapper = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
        const place = {
          id: 'current',
          name: '',
          description: '',
          category_id: 1,
          latitude,
          longitude,
          address: '',
          phone: null,
          working_hours: null,
          photos: [],
          is_featured: false,
          created_at: '',
          category: hardcodedCategories[0],
        };
        return <mod.default places={[place]} selectedPlaceId="current" />;
      };
      MiniMapWrapper.displayName = 'MiniMapWrapper';
      return MiniMapWrapper;
    }),
  { ssr: false }
);

export default function PlacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: place, isLoading, error } = useQuery({
    queryKey: ['place', id],
    queryFn: () => getPlace(id),
    enabled: !!id,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events', 'place', id],
    queryFn: () => getEventsByPlace(id),
    enabled: !!id,
  });

  const enrichedPlace = place
    ? {
        ...place,
        category: place.category || hardcodedCategories.find((c) => c.id === place.category_id),
      }
    : null;

  const handleBuildRoute = () => {
    if (!place) return;

    // Try 2GIS first, fallback to Google Maps
    const twoGisUrl = `https://2gis.kz/almaty/directions/points/${place.longitude}%2C${place.latitude}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

    // Check if 2GIS is likely available (mobile or has the app)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.open(twoGisUrl, '_blank');
    } else {
      window.open(googleMapsUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200" />
          <div className="max-w-3xl mx-auto p-4 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !enrichedPlace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Место не найдено</h1>
          <p className="text-gray-500 mb-4">К сожалению, это место не существует или было удалено</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="font-semibold text-gray-900 truncate">{enrichedPlace.name}</h1>
        </div>
      </header>

      {/* Photo */}
      <div className="relative h-64 md:h-80">
        {enrichedPlace.photos?.[0] ? (
          <Image
            src={enrichedPlace.photos[0]}
            alt={enrichedPlace.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-6xl">{enrichedPlace.category?.icon || '📍'}</span>
          </div>
        )}
        {enrichedPlace.is_featured && (
          <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-sm font-semibold px-3 py-1.5 rounded-full">
            ⭐ Рекомендуем
          </div>
        )}
        {enrichedPlace.category && (
          <div
            className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: enrichedPlace.category.color }}
          >
            {enrichedPlace.category.icon} {enrichedPlace.category.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Title & Description */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{enrichedPlace.name}</h2>
          <p className="text-gray-600 leading-relaxed">{enrichedPlace.description}</p>
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-sm text-gray-500">Адрес</p>
              <p className="text-gray-900">{enrichedPlace.address}</p>
            </div>
          </div>

          {enrichedPlace.phone && (
            <div className="flex items-start gap-3">
              <span className="text-xl">📞</span>
              <div>
                <p className="text-sm text-gray-500">Телефон</p>
                <a href={`tel:${enrichedPlace.phone}`} className="text-blue-600 hover:underline">
                  {enrichedPlace.phone}
                </a>
              </div>
            </div>
          )}

          {enrichedPlace.working_hours && (
            <div className="flex items-start gap-3">
              <span className="text-xl">🕐</span>
              <div>
                <p className="text-sm text-gray-500">Часы работы</p>
                <p className="text-gray-900">{enrichedPlace.working_hours}</p>
              </div>
            </div>
          )}
        </div>

        {/* Mini Map */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="h-48">
            <MiniMap latitude={enrichedPlace.latitude} longitude={enrichedPlace.longitude} />
          </div>
          <button
            onClick={handleBuildRoute}
            className="w-full py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            Построить маршрут
          </button>
        </div>

        {/* Events */}
        {events.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">События в этом месте</h3>
            <div className="space-y-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} compact />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:hidden">
        <button
          onClick={handleBuildRoute}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          Построить маршрут
        </button>
      </div>
    </div>
  );
}
