'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getPlace, getEventsByPlace, getPlaces } from '@/lib/supabase';
import { categories as hardcodedCategories } from '@/lib/categories';
import EventCard from '@/components/EventCard';
import PhotoGallery from '@/components/PhotoGallery';
import ReviewsSection from '@/components/ReviewsSection';
import SimilarPlaces from '@/components/SimilarPlaces';

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
          rating: null,
          reviews_count: 0,
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

// Star rating display
function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClasses} ${
            star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

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

  // Get similar places (same category)
  const { data: allPlaces = [] } = useQuery({
    queryKey: ['places', place?.category_id],
    queryFn: () => getPlaces(place?.category_id),
    enabled: !!place?.category_id,
  });

  const enrichedPlace = place
    ? {
        ...place,
        category: place.category || hardcodedCategories.find((c) => c.id === place.category_id),
      }
    : null;

  const enrichedSimilarPlaces = allPlaces.map((p) => ({
    ...p,
    category: p.category || hardcodedCategories.find((c) => c.id === p.category_id),
  }));

  // Generate demo rating based on place id
  const rating = enrichedPlace?.rating ?? (4 + (parseInt(id.slice(-2), 16) % 10) / 10);
  const reviewsCount = enrichedPlace?.reviews_count ?? (10 + (parseInt(id.slice(-4), 16) % 90));

  const handleBuildRoute = () => {
    if (!place) return;

    // Try 2GIS first, fallback to Google Maps
    const twoGisUrl = `https://2gis.kz/almaty/directions/points/${place.longitude}%2C${place.latitude}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

    // Check if mobile
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
          <div className="h-72 bg-gray-200" />
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

  // Add more demo photos for gallery
  const photos = enrichedPlace.photos?.length
    ? [
        ...enrichedPlace.photos,
        'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800',
        'https://images.unsplash.com/photo-1533929736562-6c5ef5cbcbf9?w=800',
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
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
          <h1 className="font-semibold text-gray-900 truncate flex-1">{enrichedPlace.name}</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      </header>

      {/* Photo Gallery */}
      <PhotoGallery photos={photos} alt={enrichedPlace.name} />

      {/* Category & Featured badges */}
      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-10">
        <div className="flex gap-2">
          {enrichedPlace.is_featured && (
            <div className="bg-yellow-400 text-yellow-900 text-sm font-semibold px-3 py-1.5 rounded-full shadow-lg">
              ⭐ Рекомендуем
            </div>
          )}
          {enrichedPlace.category && (
            <div
              className="px-3 py-1.5 rounded-full text-white text-sm font-medium shadow-lg"
              style={{ backgroundColor: enrichedPlace.category.color }}
            >
              {enrichedPlace.category.icon} {enrichedPlace.category.name}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Title, Rating & Description */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{enrichedPlace.name}</h2>
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={rating} />
            <span className="font-medium text-gray-700">{rating.toFixed(1)}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">{reviewsCount} отзывов</span>
          </div>
          <p className="text-gray-600 leading-relaxed">{enrichedPlace.description}</p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleBuildRoute}
            className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            Маршрут
          </button>
          <button className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Сохранить
          </button>
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">📍</span>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Адрес</p>
              <p className="text-gray-900">{enrichedPlace.address}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(enrichedPlace.address);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>

          {enrichedPlace.phone && (
            <div className="flex items-start gap-3">
              <span className="text-xl">📞</span>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Телефон</p>
                <a href={`tel:${enrichedPlace.phone}`} className="text-blue-600 hover:underline">
                  {enrichedPlace.phone}
                </a>
              </div>
              <a
                href={`tel:${enrichedPlace.phone}`}
                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>
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
        </div>

        {/* Reviews Section */}
        <ReviewsSection
          rating={rating}
          reviewsCount={reviewsCount}
          placeName={enrichedPlace.name}
        />

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

        {/* Similar Places */}
        <SimilarPlaces places={enrichedSimilarPlaces} currentPlaceId={id} />
      </div>

      {/* Fixed Bottom Button (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:hidden">
        <button
          onClick={handleBuildRoute}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          Построить маршрут
        </button>
      </div>
    </div>
  );
}
