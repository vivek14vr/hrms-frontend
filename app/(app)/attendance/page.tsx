'use client';

import { CalendarCheck2, Check, ChevronLeft, ChevronRight, Clock3, House } from 'lucide-react';
import { format, getMonth, getYear } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAttendance, useAttendanceCorrections, useAttendanceSummary } from '@/lib/queries';
import { AttendanceCalendar, AttendanceList } from '@/components/attendance-calendar';
import { Button, Card, ErrorState, FormField, Input, LoadingSkeleton, PageHeader, Select, StatCard, StatusBadge } from '@/components/ui';

export default function EmployeeAttendancePage() {
  const [month, setMonth] = useState(new Date());
  const params = new URLSearchParams({ dateFrom: format(new Date(getYear(month), getMonth(month), 1), 'yyyy-MM-dd'), dateTo: format(new Date(getYear(month), getMonth(month) + 1, 0), 'yyyy-MM-dd'), limit: '100' });
  const records = useAttendance(params);
  const summary = useAttendanceSummary();
  const corrections = useAttendanceCorrections();
  const client = useQueryClient();
  const [showCorrection, setShowCorrection] = useState(false);
  const correction = useMutation({
    mutationFn: api.createAttendanceCorrection,
    onSuccess: () => { toast.success('Correction request submitted'); client.invalidateQueries({ queryKey: ['attendance', 'corrections'] }); setShowCorrection(false); },
    onError: (error) => toast.error(error.message),
  });
  const clock = useMutation({
    mutationFn: (action: 'in' | 'out') => action === 'in' ? api.clockIn() : api.clockOut(),
    onSuccess: (_, action) => { toast.success(action === 'in' ? 'Clocked in' : 'Clocked out'); client.invalidateQueries({ queryKey: ['attendance'] }); },
    onError: (error) => toast.error(error.message),
  });

  if (records.isLoading || summary.isLoading) return <LoadingSkeleton rows={8} />;
  if (records.isError) return <ErrorState message={records.error.message} retry={() => records.refetch()} />;
  const data = records.data?.items ?? [];
  const today = format(new Date(), 'yyyy-MM-dd');
  const viewingCurrentMonth = getMonth(month) === getMonth(new Date()) && getYear(month) === getYear(new Date());
  const todayRecord = viewingCurrentMonth ? data.find((record) => format(new Date(record.date), 'yyyy-MM-dd') === today) : undefined;
  const clockedIn = Boolean(todayRecord?.checkIn);
  const clockedOut = Boolean(todayRecord?.checkOut);
  const clockAction = clockedIn && !clockedOut ? 'out' : 'in';

  return <div><PageHeader eyebrow="My time" title="Attendance" description="Clock your workday and keep an accurate record of your time." action={<div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setShowCorrection((value) => !value)}>Request correction</Button><Button onClick={() => clock.mutate(clockAction)} disabled={clock.isPending || clockedOut}>{clock.isPending ? 'Saving…' : clockedOut ? 'Day complete' : clockAction === 'out' ? 'Clock out' : 'Clock in'}</Button></div>} /><div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Present" value={summary.data?.present ?? 0} hint="Days this month" icon={<CalendarCheck2 className="h-5 w-5" />} accent="coral" /><StatCard label="Late arrivals" value={summary.data?.late ?? 0} hint="Needs your attention" icon={<Clock3 className="h-5 w-5" />} accent="coral" /><StatCard label="On leave" value={summary.data?.leave ?? 0} hint="Approved time off" icon={<House className="h-5 w-5" />} accent="lavender" /><StatCard label="Attendance rate" value={`${summary.data?.attendancePercentage ?? 0}%`} hint="Working days recorded" icon={<Check className="h-5 w-5" />} accent="lime" /></div>{showCorrection && <Card className="mb-5 border-[#ff725c]/30 bg-[#fffaf1] p-5"><div className="mb-4"><h2 className="font-display text-xl">Request an attendance correction</h2><p className="mt-1 text-xs text-[#85878d]">Your manager or HR will review this request before it changes your record.</p></div><form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const day = String(form.get('date')); const checkIn = String(form.get('checkIn') ?? ''); const checkOut = String(form.get('checkOut') ?? ''); correction.mutate({ date: day, status: String(form.get('status')), checkIn: checkIn ? `${day}T${checkIn}:00` : undefined, checkOut: checkOut ? `${day}T${checkOut}:00` : undefined, workHours: String(form.get('workHours') ?? '') ? Number(form.get('workHours')) : undefined, reason: String(form.get('reason')) }); }}><FormField label="Date"><Input name="date" type="date" required defaultValue={today} /></FormField><FormField label="Status"><Select name="status" defaultValue="PRESENT"><option value="PRESENT">Present</option><option value="LATE">Late</option><option value="ABSENT">Absent</option><option value="LEAVE">Leave</option><option value="WORK_FROM_HOME">Work from home</option></Select></FormField><FormField label="Check-in"><Input name="checkIn" type="time" /></FormField><FormField label="Check-out"><Input name="checkOut" type="time" /></FormField><FormField label="Work hours"><Input name="workHours" type="number" min="0" max="24" step="0.25" /></FormField><FormField label="Reason"><Input name="reason" required minLength={3} placeholder="Missed punch or approved leave" /></FormField><div className="flex items-end sm:col-span-2 lg:col-span-4"><Button type="submit" disabled={correction.isPending}>{correction.isPending ? 'Submitting…' : 'Submit request'}</Button></div></form></Card>}{corrections.data?.length ? <Card className="mb-5 p-5"><div className="mb-4"><p className="text-xs font-bold uppercase tracking-[0.13em] text-[#ff725c]">Correction history</p><h2 className="mt-1 font-display text-xl">Requests and decisions</h2></div><div className="space-y-2">{corrections.data.slice(0, 5).map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#eeeae4] px-4 py-3"><div><p className="text-sm font-bold">{format(new Date(item.date), 'd MMM yyyy')} · {item.status.replaceAll('_', ' ').toLowerCase()}</p><p className="mt-1 text-xs text-[#85878d]">{item.reason}</p></div><StatusBadge status={item.requestStatus} /></div>)}</div></Card> : null}<div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]"><Card className="p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[#ff725c]">Monthly view</p><h2 className="mt-1 font-display text-xl">{format(month, 'MMMM yyyy')}</h2></div><div className="flex gap-1"><button aria-label="Previous month" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e4dc] bg-white hover:bg-[#fffaf1]" onClick={() => setMonth(new Date(getYear(month), getMonth(month) - 1, 1))}><ChevronLeft className="h-4 w-4" /></button><button aria-label="Next month" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e4dc] bg-white hover:bg-[#fffaf1]" onClick={() => setMonth(new Date(getYear(month), getMonth(month) + 1, 1))}><ChevronRight className="h-4 w-4" /></button></div></div><AttendanceCalendar records={data} month={month} /></Card><Card className="p-5 sm:p-6"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.13em] text-[#ff725c]">Timeline</p><h2 className="mt-1 font-display text-xl">Recent records</h2></div><AttendanceList records={data.slice(0, 8)} /></Card></div></div>;
}
