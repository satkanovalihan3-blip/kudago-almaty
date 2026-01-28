'use client';

import { useState } from 'react';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  text: string;
  created_at: string;
  avatar?: string;
}

interface ReviewsSectionProps {
  reviews?: Review[];
  rating: number;
  reviewsCount: number;
  placeName: string;
}

// Star rating display component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
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

// Demo reviews data
const demoReviews: Review[] = [
  {
    id: '1',
    user_name: 'Алия К.',
    rating: 5,
    text: 'Отличное место! Очень понравилась атмосфера и обслуживание. Обязательно вернусь сюда снова.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    user_name: 'Тимур М.',
    rating: 4,
    text: 'Хорошее место для семейного отдыха. Детям очень понравилось!',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    user_name: 'Динара С.',
    rating: 5,
    text: 'Прекрасные виды и отличный сервис. Рекомендую всем!',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дней назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;

  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export default function ReviewsSection({
  reviews = demoReviews,
  rating,
  reviewsCount,
  placeName,
}: ReviewsSectionProps) {
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Rating distribution (demo)
  const ratingDistribution = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 10 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Отзывы</h3>
      </div>

      {/* Rating Summary */}
      <div className="p-4 flex gap-6 border-b border-gray-100">
        {/* Average rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">{rating.toFixed(1)}</div>
          <StarRating rating={Math.round(rating)} size="md" />
          <div className="text-sm text-gray-500 mt-1">{reviewsCount} отзывов</div>
        </div>

        {/* Rating bars */}
        <div className="flex-1 space-y-1.5">
          {ratingDistribution.map(({ stars, percentage }) => (
            <div key={stars} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-3">{stars}</span>
              <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8">{percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-100">
        {reviews.slice(0, 3).map((review) => (
          <div key={review.id} className="p-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                {review.user_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">{review.user_name}</span>
                  <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                </div>
                <div className="mt-0.5">
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="mt-2 text-sm text-gray-600">{review.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Write Review CTA */}
      {!showWriteReview ? (
        <div className="p-4 bg-gray-50">
          <button
            onClick={() => setShowWriteReview(true)}
            className="w-full py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Написать отзыв
          </button>
        </div>
      ) : (
        <div className="p-4 bg-gray-50">
          <div className="bg-white rounded-xl p-4 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Ваша оценка</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setUserRating(star)}
                    className="p-1"
                  >
                    <svg
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || userRating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder={`Расскажите о вашем опыте в ${placeName}...`}
              className="w-full h-24 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowWriteReview(false)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
