import Link from 'next/link';
import Image from 'next/image';
import type { Place, Category } from '@/lib/types';

interface PlaceCardProps {
  place: Place & { category?: Category };
  compact?: boolean;
}

export default function PlaceCard({ place, compact = false }: PlaceCardProps) {
  if (compact) {
    return (
      <Link href={`/places/${place.id}`}>
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
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
            <h3 className="font-semibold text-gray-900 truncate">{place.name}</h3>
            <p className="text-sm text-gray-500 truncate">{place.address}</p>
            {place.category && (
              <span
                className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full text-white"
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
        <div className="relative h-48">
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
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{place.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{place.address}</p>
          <p className="text-sm text-gray-600 line-clamp-2">{place.description}</p>
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
