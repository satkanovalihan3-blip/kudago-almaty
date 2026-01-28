'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Place, Category } from '@/lib/types';

interface SimilarPlacesProps {
  places: (Place & { category?: Category })[];
  currentPlaceId: string;
}

// Star rating component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function SimilarPlaces({ places, currentPlaceId }: SimilarPlacesProps) {
  // Filter out current place and limit to 4
  const similarPlaces = places
    .filter((p) => p.id !== currentPlaceId)
    .slice(0, 4);

  if (similarPlaces.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Похожие места</h3>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {similarPlaces.map((place) => {
            // Generate demo rating based on place id
            const rating = place.rating ?? (4 + (parseInt(place.id.slice(-2), 16) % 10) / 10);
            const reviewsCount = place.reviews_count ?? (10 + (parseInt(place.id.slice(-4), 16) % 90));

            return (
              <Link key={place.id} href={`/places/${place.id}`}>
                <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-24">
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
                    {place.category && (
                      <div
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        style={{ backgroundColor: place.category.color }}
                      >
                        {place.category.icon}
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{place.name}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <StarRating rating={rating} />
                      <span className="text-xs text-gray-500">{rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({reviewsCount})</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
