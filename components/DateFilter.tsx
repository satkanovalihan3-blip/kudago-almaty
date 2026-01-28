'use client';

import type { DateFilter as DateFilterType } from '@/lib/types';

interface DateFilterProps {
  selected: DateFilterType;
  onSelect: (filter: DateFilterType) => void;
}

const filters: { value: DateFilterType; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'today', label: 'Сегодня' },
  { value: 'tomorrow', label: 'Завтра' },
  { value: 'weekend', label: 'Выходные' },
];

export default function DateFilter({ selected, onSelect }: DateFilterProps) {
  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onSelect(filter.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selected === filter.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
