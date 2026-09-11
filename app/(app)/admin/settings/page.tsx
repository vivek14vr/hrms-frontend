'use client';

import { CheckCircle2, Globe2, LockKeyhole, Save, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useSettings } from '@/lib/queries';
import type { WorkspaceSettings } from '@/lib/types';
import { HolidaySettings } from '@/components/holiday-settings';
import { SessionManagement } from '@/components/session-management';
import { AttendancePolicySettings } from '@/components/attendance-policy-settings';
import { ScheduleSettings } from '@/components/schedule-settings';
import { Button, Card, ErrorState, FormField, Input, LoadingSkeleton, PageHeader, Select } from '@/components/ui';

type SettingsForm = Pick<WorkspaceSettings, 'name' | 'timezone' | 'currency' | 'workWeek'>;

export default function SettingsPage() {
  const settings = useSettings();
  if (settings.isLoading) return <LoadingSkeleton rows={6} />;
  if (settings.isError) return <ErrorState message={settings.error.message} retry={() => settings.refetch()} />;
  if (!settings.data) return <ErrorState message="Workspace settings are unavailable." retry={() => settings.refetch()} />;
  return <div className="space-y-5"><SettingsEditor key={settings.data.updatedAt} settings={settings.data} /><AttendancePolicySettings settings={settings.data} /><ScheduleSettings /><SessionManagement /></div>;
}

function SettingsEditor({ settings }: { settings: WorkspaceSettings }) {
  const client = useQueryClient();
  const [form, setForm] = useState<SettingsForm>(() => ({ name: settings.name, timezone: settings.timezone, currency: settings.currency, workWeek: settings.workWeek }));
  const [saved, setSaved] = useState(false);
  const update = useMutation({ mutationFn: () => api.updateSettings(form), onSuccess: (data) => { client.setQueryData(['settings'], data); setSaved(true); toast.success('Settings saved'); }, onError: (error) => toast.error(error.message) });
  const setField = <K extends keyof SettingsForm>(field: K, value: SettingsForm[K]) => { setSaved(false); setForm((current) => ({ ...current, [field]: value })); };
  return <div><PageHeader eyebrow="Workspace" title="Settings" description="Set the defaults that make PeopleOS feel like your company." action={<Button type="submit" form="workspace-settings-form" disabled={update.isPending}><Save className="h-4 w-4" />{update.isPending ? 'Saving…' : 'Save changes'}</Button>} /><div className="grid gap-5 xl:grid-cols-[1fr_0.7fr]"><Card className="p-5 sm:p-7"><div className="mb-6 flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eee9ff] text-[#7050b9]"><SlidersHorizontal className="h-5 w-5" /></div><div><h2 className="font-display text-xl">Workspace defaults</h2><p className="mt-1 text-xs text-[#85878d]">These values are stored centrally and used by the workspace.</p></div></div><form id="workspace-settings-form" className="space-y-5" onSubmit={(event) => { event.preventDefault(); update.mutate(); }}><FormField label="Workspace name"><Input value={form.name} onChange={(event) => setField('name', event.target.value)} required maxLength={120} /></FormField><div className="grid gap-5 sm:grid-cols-2"><FormField label="Timezone"><Select value={form.timezone} onChange={(event) => setField('timezone', event.target.value)}><option>Asia/Kolkata</option><option>Europe/London</option><option>America/New_York</option><option>Asia/Singapore</option></Select></FormField><FormField label="Currency"><Select value={form.currency} onChange={(event) => setField('currency', event.target.value)}><option value="INR">INR · ₹</option><option value="USD">USD · $</option><option value="GBP">GBP · £</option></Select></FormField></div><FormField label="Work week"><Select value={form.workWeek} onChange={(event) => setField('workWeek', event.target.value)}><option>Monday – Friday</option><option>Sunday – Thursday</option><option>Monday – Saturday</option></Select></FormField></form>{saved && <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#208154]"><CheckCircle2 className="h-4 w-4" />Changes saved to this workspace.</p>}</Card><div className="space-y-5"><Card className="bg-[#1f2229] p-6 text-white"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#d8f25d] text-[#1f2229]"><LockKeyhole className="h-5 w-5" /></div><h2 className="font-display text-2xl">Security posture</h2><p className="mt-2 text-sm leading-6 text-[#a8aab0]">Sessions expire after 15 minutes and refresh securely for up to 7 days.</p><div className="mt-5 space-y-2 text-xs text-[#d8d9dc]"><p>✓ HttpOnly authentication cookies</p><p>✓ Role and ownership checks</p><p>✓ Rate-limited authentication routes</p></div></Card><Card className="p-6"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f7f2] text-[#238773]"><Globe2 className="h-5 w-5" /></div><h2 className="font-display text-xl">API connection</h2><p className="mt-2 text-xs leading-5 text-[#85878d]">Connected to the local PeopleOS API. Swagger documentation is available at <code className="rounded bg-[#f3f1ec] px-1">/docs</code>.</p></Card></div></div><HolidaySettings /></div>;
}
