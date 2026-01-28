'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getEvent } from '@/lib/supabase';
import { categories as hardcodedCategories } from '@/lib/categories';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('ru-RU', options);
}

function formatPrice(price: number | null): string {
  if (price === null) return 'Бесплатно';
  return `${price.toLocaleString('ru-RU')} ₸`;
}

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id),
    enabled: !!id,
  });

  const enrichedEvent = event
    ? {
        ...event,
        place: event.place
          ? {
              ...event.place,
              category:
                event.place.category || hardcodedCategories.find((c) => c.id === event.place.category_id),
            }
          : undefined,
      }
    : null;

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

  if (error || !enrichedEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Событие не найдено</h1>
          <p className="text-gray-500 mb-4">К сожалению, это событие не существует или было удалено</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  const handleBuyTicket = () => {
    if (enrichedEvent.ticket_url) {
      window.open(enrichedEvent.ticket_url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
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
          <h1 className="font-semibold text-gray-900 truncate">{enrichedEvent.name}</h1>
        </div>
      </header>

      {/* Photo */}
      <div className="relative h-64 md:h-80">
        {enrichedEvent.photos?.[0] ? (
          <Image
            src={enrichedEvent.photos[0]}
            alt={enrichedEvent.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-6xl">🎉</span>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="text-sm font-medium">{formatDate(enrichedEvent.date_start)}</span>
        </div>
        <div
          className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium ${
            enrichedEvent.price === null
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          {formatPrice(enrichedEvent.price)}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Title & Description */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{enrichedEvent.name}</h2>
          <p className="text-gray-600 leading-relaxed">{enrichedEvent.description}</p>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-sm text-gray-500">Дата и время</p>
              <p className="text-gray-900">{formatDate(enrichedEvent.date_start)}</p>
              {enrichedEvent.date_end !== enrichedEvent.date_start && (
                <p className="text-sm text-gray-500 mt-1">
                  до {formatDate(enrichedEvent.date_end)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Place */}
        {enrichedEvent.place && (
          <Link href={`/places/${enrichedEvent.place.id}`}>
            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  {enrichedEvent.place.photos?.[0] ? (
                    <Image
                      src={enrichedEvent.place.photos[0]}
                      alt={enrichedEvent.place.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl">{enrichedEvent.place.category?.icon || '📍'}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Место проведения</p>
                  <p className="font-semibold text-gray-900">{enrichedEvent.place.name}</p>
                  <p className="text-sm text-gray-500">{enrichedEvent.place.address}</p>
                </div>
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
                  className="text-gray-400"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </Link>
        )}

        {/* Price & Tickets */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Стоимость</p>
              <p
                className={`text-xl font-bold ${
                  enrichedEvent.price === null ? 'text-green-600' : 'text-gray-900'
                }`}
              >
                {formatPrice(enrichedEvent.price)}
              </p>
            </div>
            {enrichedEvent.ticket_url && (
              <button
                onClick={handleBuyTicket}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                Купить билет
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button (Mobile) */}
      {enrichedEvent.ticket_url && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:hidden">
          <button
            onClick={handleBuyTicket}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Купить билет за {formatPrice(enrichedEvent.price)}
          </button>
        </div>
      )}
    </div>
  );
}
