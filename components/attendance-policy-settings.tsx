'use client';

import { Clock3, Save } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { WorkspaceSettings } from '@/lib/types';
import { Button, Card, FormField, Input } from './ui';

type AttendancePolicyForm = Pick<WorkspaceSettings, 'shiftStart' | 'shiftEnd' | 'graceMinutes' | 'overtimeAfterMinutes'>;

export function AttendancePolicySettings({ settings }: { settings: WorkspaceSettings }) {
  const client = useQueryClient();
  const [form, setForm] = useState<AttendancePolicyForm>({ shiftStart: settings.shiftStart, shiftEnd: settings.shiftEnd, graceMinutes: settings.graceMinutes, overtimeAfterMinutes: settings.overtimeAfterMinutes });
  const update = useMutation({ mutationFn: () => api.updateSettings(form), onSuccess: (data) => { client.setQueryData(['settings'], data); toast.success('Attendance policy saved'); }, onError: (error) => toast.error(error.message) });
  const setField = <K extends keyof AttendancePolicyForm>(field: K, value: AttendancePolicyForm[K]) => setForm((current) => ({ ...current, [field]: value }));

  return <Card className="p-5 sm:p-7"><div className="mb-6 flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0d9] text-[#a15b00]"><Clock3 className="h-5 w-5" /></div><div><h2 className="font-display text-xl">Attendance policy</h2><p className="mt-1 text-xs text-[#85878d]">Clock-ins after the shift grace period are marked late automatically.</p></div></div><form className="grid gap-5 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); update.mutate(); }}><FormField label="Shift starts"><Input type="time" value={form.shiftStart} onChange={(event) => setField('shiftStart', event.target.value)} required /></FormField><FormField label="Shift ends"><Input type="time" value={form.shiftEnd} onChange={(event) => setField('shiftEnd', event.target.value)} required /></FormField><FormField label="Grace period (minutes)"><Input type="number" min={0} max={240} value={form.graceMinutes} onChange={(event) => setField('graceMinutes', Number(event.target.value))} required /></FormField><FormField label="Overtime after (minutes)"><Input type="number" min={1} max={1440} value={form.overtimeAfterMinutes} onChange={(event) => setField('overtimeAfterMinutes', Number(event.target.value))} required /></FormField><div className="sm:col-span-2"><Button type="submit" disabled={update.isPending}><Save className="h-4 w-4" />{update.isPending ? 'Saving…' : 'Save attendance policy'}</Button></div></form></Card>;
}
