'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import type { DayKey } from '@/lib/day';

type Ctx = { day: DayKey; setDay: (d: DayKey) => void };
const DayFilterCtx = createContext<Ctx | undefined>(undefined);

export function DayFilterProvider({ children }: { children: ReactNode }) {
  const [day, setDay] = useState<DayKey>('today');
  return <DayFilterCtx.Provider value={{ day, setDay }}>{children}</DayFilterCtx.Provider>;
}

export function useDayFilter() {
  const ctx = useContext(DayFilterCtx);
  if (!ctx) throw new Error('useDayFilter must be used within DayFilterProvider');
  return ctx;
}
