'use client';

import { Clock3, Plus, Power } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useSchedules } from '@/lib/queries';
import type { WorkSchedule } from '@/lib/types';
import { Button, Card, FormField, Input, LoadingSkeleton, Select } from './ui';

type ScheduleForm = Omit<WorkSchedule, 'id' | 'createdAt' | 'updatedAt'>;

const initialForm: ScheduleForm = { name: '', timezone: 'Asia/Kolkata', workWeek: 'Monday – Friday', shiftStart: '09:00', shiftEnd: '18:00', graceMinutes: 15, overtimeAfterMinutes: 480, active: true };

export function ScheduleSettings() {
  const client = useQueryClient();
  const schedules = useSchedules(true);
  const [form, setForm] = useState<ScheduleForm>(initialForm);
  const create = useMutation({ mutationFn: () => api.createSchedule(form), onSuccess: () => { client.invalidateQueries({ queryKey: ['schedules'] }); setForm(initialForm); toast.success('Work schedule created'); }, onError: (error) => toast.error(error.message) });
  const toggle = useMutation({ mutationFn: (schedule: WorkSchedule) => api.updateSchedule(schedule.id, { active: !schedule.active }), onSuccess: () => { client.invalidateQueries({ queryKey: ['schedules'] }); toast.success('Schedule status updated'); }, onError: (error) => toast.error(error.message) });
  const setField = <K extends keyof ScheduleForm>(field: K, value: ScheduleForm[K]) => setForm((current) => ({ ...current, [field]: value }));

  return <Card className="p-5 sm:p-7">
    <div className="mb-6 flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0eb] text-[#d85844]"><Clock3 className="h-5 w-5" /></div><div><h2 className="font-display text-xl">Work schedules</h2><p className="mt-1 text-xs text-[#85878d]">Create shift policies and assign them to employees from their work details.</p></div></div>
    <form className="grid gap-4 rounded-2xl border border-[#eeeae4] bg-[#fcfbf8] p-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}>
      <FormField label="Schedule name"><Input value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="India standard shift" required maxLength={100} /></FormField>
      <FormField label="Timezone"><Select value={form.timezone} onChange={(event) => setField('timezone', event.target.value)}><option>Asia/Kolkata</option><option>Asia/Singapore</option><option>Europe/London</option><option>America/New_York</option></Select></FormField>
      <FormField label="Work week"><Select value={form.workWeek} onChange={(event) => setField('workWeek', event.target.value)}><option>Monday – Friday</option><option>Sunday – Thursday</option><option>Monday – Saturday</option></Select></FormField>
      <FormField label="Shift start"><Input type="time" value={form.shiftStart} onChange={(event) => setField('shiftStart', event.target.value)} required /></FormField>
      <FormField label="Shift end"><Input type="time" value={form.shiftEnd} onChange={(event) => setField('shiftEnd', event.target.value)} required /></FormField>
      <FormField label="Grace minutes"><Input type="number" min="0" max="240" value={form.graceMinutes} onChange={(event) => setField('graceMinutes', Number(event.target.value))} required /></FormField>
      <FormField label="Overtime after (minutes)"><Input type="number" min="1" max="1440" value={form.overtimeAfterMinutes} onChange={(event) => setField('overtimeAfterMinutes', Number(event.target.value))} required /></FormField>
      <div className="flex items-end"><Button type="submit" disabled={create.isPending}><Plus className="h-4 w-4" />{create.isPending ? 'Adding…' : 'Add schedule'}</Button></div>
    </form>
    {schedules.isLoading ? <LoadingSkeleton rows={2} /> : schedules.isError ? <p className="mt-5 text-sm text-[#b5473b]">Unable to load work schedules: {schedules.error.message}</p> : <div className="mt-5 divide-y divide-[#eeeae4]">{(schedules.data ?? []).map((schedule) => <div key={schedule.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold text-[#25272c]">{schedule.name} {!schedule.active && <span className="ml-2 rounded-full bg-[#f0efec] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#898b91]">Inactive</span>}</p><p className="mt-1 text-xs text-[#85878d]">{schedule.shiftStart}–{schedule.shiftEnd} · {schedule.timezone} · {schedule.workWeek} · {schedule.graceMinutes}m grace</p></div><Button type="button" variant="outline" onClick={() => toggle.mutate(schedule)} disabled={toggle.isPending}><Power className="h-4 w-4" />{schedule.active ? 'Deactivate' : 'Reactivate'}</Button></div>)}</div>}
  </Card>;
}
