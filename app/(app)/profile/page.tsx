'use client';

import { Save } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useSession } from '@/lib/queries';
import type { Employee } from '@/lib/types';
import { SessionManagement } from '@/components/session-management';
import { Avatar, Button, Card, ErrorState, FormField, Input, LoadingSkeleton, PageHeader } from '@/components/ui';

function ProfileEditor({ employee }: { employee: Employee }) {
  const client = useQueryClient();
  const [form, setForm] = useState({ phone: employee.phone ?? '', avatarUrl: employee.avatarUrl ?? '', address: employee.address ?? '', emergencyContactName: employee.emergencyContactName ?? '', emergencyContactPhone: employee.emergencyContactPhone ?? '' });
  const [saving, setSaving] = useState(false);
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const optionalText = (value: string) => value.trim() || undefined;
      await api.updateMyProfile({ phone: optionalText(form.phone), avatarUrl: optionalText(form.avatarUrl), address: optionalText(form.address), emergencyContactName: optionalText(form.emergencyContactName), emergencyContactPhone: optionalText(form.emergencyContactPhone) });
      await client.invalidateQueries({ queryKey: ['session'] });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };
  return <div><PageHeader eyebrow="Employee self-service" title="My profile" description="Keep your contact and emergency details up to date." action={<Button type="submit" form="my-profile" disabled={saving}><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save changes'}</Button>} /><form id="my-profile" onSubmit={submit} className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><Card className="flex h-fit flex-col items-center p-6 text-center"><Avatar name={`${employee.firstName} ${employee.lastName}`} src={form.avatarUrl} size="lg" /><h2 className="mt-4 font-display text-xl">{employee.firstName} {employee.lastName}</h2><p className="mt-1 text-sm text-[#777982]">{employee.designation}</p><p className="mt-3 text-xs font-bold uppercase tracking-[0.13em] text-[#a0a1a6]">{employee.employeeCode}</p><p className="mt-5 text-xs leading-5 text-[#85878d]">Your name, work email, job details, and salary information are managed by HR.</p></Card><Card className="p-5 sm:p-7"><h2 className="mb-5 font-display text-xl">Contact details</h2><div className="grid gap-4 sm:grid-cols-2"><FormField label="Phone"><Input type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} /></FormField><FormField label="Avatar URL"><Input type="url" placeholder="https://…" value={form.avatarUrl} onChange={(event) => update('avatarUrl', event.target.value)} /></FormField><FormField label="Address"><Input value={form.address} onChange={(event) => update('address', event.target.value)} /></FormField><div className="sm:col-span-2 border-t border-[#eeeae4] pt-4"><p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#898b91]">Emergency contact</p><div className="grid gap-4 sm:grid-cols-2"><FormField label="Contact name"><Input value={form.emergencyContactName} onChange={(event) => update('emergencyContactName', event.target.value)} /></FormField><FormField label="Contact phone"><Input type="tel" value={form.emergencyContactPhone} onChange={(event) => update('emergencyContactPhone', event.target.value)} /></FormField></div></div></div></Card></form></div>;
}

export default function ProfilePage() {
  const { data, isLoading, isError } = useSession();
  if (isLoading) return <LoadingSkeleton rows={6} />;
  if (isError || !data?.employee) return <ErrorState message="Your employee profile is not available." />;
  return <div className="space-y-5"><ProfileEditor employee={data.employee} /><SessionManagement /></div>;
}
