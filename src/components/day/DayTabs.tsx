'use client';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DAY_ORDER, labelForDay, DayKey } from '@/lib/day';
import { useDayFilter } from './DayFilterContext';

export default function DayTabs() {
  const { day, setDay } = useDayFilter();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Sync with URL on mount
  useEffect(() => {
    if (!searchParams) return;
    const dayParam = searchParams.get('day');
    if (dayParam && DAY_ORDER.includes(dayParam as DayKey)) {
      setDay(dayParam as DayKey);
    }
  }, [searchParams]);

  // Update URL when day changes
  const handleDayChange = (newDay: DayKey) => {
    setDay(newDay);
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('day', newDay);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border p-3 bg-white shadow-sm">
      <span className="text-sm font-semibold mr-2 text-gray-700">Day</span>
      {DAY_ORDER.map(d => (
        <button
          key={d}
          onClick={() => handleDayChange(d)}
          className={`rounded-full px-3 py-1 text-sm border transition-colors uppercase ${
            day === d 
              ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {d === "today" ? "today" : d}
        </button>
      ))}
    </div>
  );
}
