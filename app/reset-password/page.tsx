'use client';

import { CheckCircle2, LockKeyhole, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button, Card, FormField, Input, Spinner } from '@/components/ui';

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="flex min-h-dvh items-center justify-center bg-[#fffdf9] px-5 py-10"><Card className="w-full max-w-[440px] p-8 text-center text-sm text-[#777982]">Loading secure password setup…</Card></main>}><ResetPasswordForm /></Suspense>;
}

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return toast.error('This password setup link is missing its token');
    if (password !== confirmation) return toast.error('Passwords do not match');
    setSaving(true);
    try { await api.completePasswordReset({ token, password }); setComplete(true); toast.success('Password updated'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to update password'); } finally { setSaving(false); }
  };
  return <main className="flex min-h-dvh items-center justify-center bg-[#fffdf9] px-5 py-10"><Card className="w-full max-w-[440px] p-6 sm:p-8"><div className="mb-8 flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff725c] text-white shadow-[0_4px_0_#c84535]"><Sparkles className="h-[18px] w-[18px]" /></span><span className="text-[19px] font-black tracking-tight">PeopleOS</span></div>{complete ? <div className="text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-[#208154]" /><h1 className="mt-4 font-display text-3xl">Password updated</h1><p className="mt-3 text-sm text-[#777982]">Your active sessions were revoked. Sign in again with your new password.</p><Link href="/login" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#ff725c] px-4 text-sm font-semibold text-white">Return to sign in</Link></div> : <><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ff725c]">Account security</p><h1 className="font-display text-3xl">Set a new password</h1><p className="mt-3 text-sm leading-6 text-[#777982]">Use the one-time link provided by your PeopleOS administrator. The link expires after one hour.</p><form className="mt-7 space-y-5" onSubmit={submit}><FormField label="New password"><div className="relative"><LockKeyhole className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9b9da2]" /><Input required minLength={12} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="12+ characters, mixed case and symbols" className="pl-10" /></div></FormField><FormField label="Confirm password"><Input required minLength={12} type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></FormField><Button type="submit" size="lg" className="w-full" disabled={saving || !token}>{saving ? <><Spinner />Updating…</> : 'Update password'}</Button></form></>}</Card></main>;
}
