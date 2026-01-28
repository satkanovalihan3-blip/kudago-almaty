import Link from 'next/link';
import Image from 'next/image';
import type { Event, Place, Category } from '@/lib/types';

interface EventCardProps {
  event: Event & { place?: Place & { category?: Category } };
  compact?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('ru-RU', options);
}

function formatPrice(price: number | null): string {
  if (price === null) return 'Бесплатно';
  return `${price.toLocaleString('ru-RU')} ₸`;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  if (compact) {
    return (
      <Link href={`/events/${event.id}`}>
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            {event.photos?.[0] ? (
              <Image
                src={event.photos[0]}
                alt={event.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{event.name}</h3>
            <p className="text-sm text-gray-500">{formatDate(event.date_start)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm font-medium ${event.price === null ? 'text-green-600' : 'text-blue-600'}`}>
                {formatPrice(event.price)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <div className="relative h-48">
          {event.photos?.[0] ? (
            <Image
              src={event.photos[0]}
              alt={event.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
          )}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-medium">{formatDate(event.date_start)}</span>
          </div>
          <div
            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${
              event.price === null
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {formatPrice(event.price)}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{event.name}</h3>
          {event.place && (
            <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
              <span>{event.place.category?.icon || '📍'}</span>
              {event.place.name}
            </p>
          )}
          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
        </div>
      </div>
    </Link>
  );
}
