'use client';

import { CalendarPlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useHolidays } from '@/lib/queries';
import { Button, Card, EmptyState, FormField, Input, Spinner } from '@/components/ui';

export function HolidaySettings() {
  const year = new Date().getFullYear();
  const holidays = useHolidays(year);
  const client = useQueryClient();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const create = useMutation({ mutationFn: api.createHoliday, onSuccess: () => { setName(''); setDate(''); client.invalidateQueries({ queryKey: ['holidays', year] }); toast.success('Holiday added'); }, onError: (error) => toast.error(error.message) });
  const remove = useMutation({ mutationFn: api.deleteHoliday, onSuccess: () => { client.invalidateQueries({ queryKey: ['holidays', year] }); toast.success('Holiday removed'); }, onError: (error) => toast.error(error.message) });
  return <Card className="mt-5 p-5 sm:p-7"><div className="mb-6 flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0d9] text-[#a15b00]"><CalendarPlus className="h-5 w-5" /></div><div><h2 className="font-display text-xl">Holiday calendar</h2><p className="mt-1 text-xs text-[#85878d]">Working-day calculations exclude these {year} dates.</p></div></div><form className="grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end" onSubmit={(event) => { event.preventDefault(); create.mutate({ name, date }); }}><FormField label="Holiday name"><Input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={120} placeholder="Company holiday" /></FormField><FormField label="Date"><Input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></FormField><Button type="submit" disabled={create.isPending}>{create.isPending ? <Spinner /> : <CalendarPlus className="h-4 w-4" />}{create.isPending ? 'Adding…' : 'Add holiday'}</Button></form><div className="mt-6">{holidays.isLoading ? <Spinner /> : holidays.isError ? <p className="text-sm text-[#c24b3d]">{holidays.error.message}</p> : holidays.data?.length ? <div className="divide-y divide-[#f0ede8] rounded-xl border border-[#eeeae2]">{holidays.data.map((holiday) => <div key={holiday.id} className="flex items-center justify-between gap-4 px-4 py-3"><div><p className="text-sm font-semibold">{holiday.name}</p><p className="text-xs text-[#85878d]">{format(new Date(holiday.date), 'EEEE, d MMMM yyyy')}</p></div><Button type="button" variant="danger" size="sm" disabled={remove.isPending} onClick={() => remove.mutate(holiday.id)}><Trash2 className="h-4 w-4" />Remove</Button></div>)}</div> : <EmptyState title="No holidays added" description="Add organization holidays to keep attendance and leave calculations accurate." />}</div></Card>;
}
