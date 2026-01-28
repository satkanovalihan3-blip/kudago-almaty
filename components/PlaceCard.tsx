'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Place, Category } from '@/lib/types';

interface PlaceCardProps {
  place: Place & { category?: Category };
  compact?: boolean;
  userLocation?: [number, number] | null;
}

// Calculate distance between two points in km
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} м`;
  }
  return `${km.toFixed(1)} км`;
}

// Star rating component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const starSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className={`${starSize} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {hasHalfStar && (
        <svg className={`${starSize} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#halfGrad)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className={`${starSize} text-gray-300`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function PlaceCard({ place, compact = false, userLocation }: PlaceCardProps) {
  // Calculate distance if user location is available
  const distance = userLocation
    ? calculateDistance(userLocation[1], userLocation[0], place.latitude, place.longitude)
    : null;

  // Use rating from DB or generate a demo rating based on place id
  const rating = place.rating ?? (4 + (parseInt(place.id.slice(-2), 16) % 10) / 10);
  const reviewsCount = place.reviews_count ?? (10 + (parseInt(place.id.slice(-4), 16) % 90));

  if (compact) {
    return (
      <Link href={`/places/${place.id}`}>
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            {place.photos?.[0] ? (
              <Image
                src={place.photos[0]}
                alt={place.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl">{place.category?.icon || '📍'}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{place.name}</h3>
              {distance !== null && (
                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                  📍 {formatDistance(distance)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={rating} size="sm" />
              <span className="text-xs text-gray-500">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({reviewsCount})</span>
            </div>
            <p className="text-sm text-gray-500 truncate mt-1">{place.address}</p>
            {place.category && (
              <span
                className="inline-block mt-1.5 px-2 py-0.5 text-xs rounded-full text-white"
                style={{ backgroundColor: place.category.color }}
              >
                {place.category.icon} {place.category.name}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/places/${place.id}`}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <div className="relative h-56">
          {place.photos?.[0] ? (
            <Image
              src={place.photos[0]}
              alt={place.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-4xl">{place.category?.icon || '📍'}</span>
            </div>
          )}
          {place.is_featured && (
            <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded-full">
              ⭐ Рекомендуем
            </div>
          )}
          {place.category && (
            <div
              className="absolute top-3 right-3 px-2 py-1 rounded-full text-white text-xs font-medium"
              style={{ backgroundColor: place.category.color }}
            >
              {place.category.icon} {place.category.name}
            </div>
          )}
          {distance !== null && (
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
              📍 {formatDistance(distance)}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg text-gray-900">{place.name}</h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={rating} size="md" />
            <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
            <span className="text-sm text-gray-400">({reviewsCount} отзывов)</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">{place.address}</p>
          <p className="text-sm text-gray-600 line-clamp-2 mt-2">{place.description}</p>
          {place.working_hours && (
            <p className="mt-2 text-xs text-gray-400">
              🕐 {place.working_hours}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
