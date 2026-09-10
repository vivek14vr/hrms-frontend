'use client';
import { CalendarDays } from 'lucide-react';
import { Input } from './ui';
export function DateRangePicker({ from, to, onFromChange, onToChange }: { from?: string; to?: string; onFromChange?: (value: string) => void; onToChange?: (value: string) => void }) { return <div className="flex flex-wrap items-center gap-2"><CalendarDays className="h-4 w-4 text-[#8d8f95]" /><Input aria-label="From date" type="date" value={from ?? ''} onChange={(event) => onFromChange?.(event.target.value)} className="min-w-36" /><span className="text-xs text-[#9a9ba0]">to</span><Input aria-label="To date" type="date" value={to ?? ''} onChange={(event) => onToChange?.(event.target.value)} className="min-w-36" /></div>; }
