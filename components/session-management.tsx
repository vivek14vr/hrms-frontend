'use client';

import { MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useSessions } from '@/lib/queries';
import { Badge, Button, Card, ErrorState, EmptyState, LoadingSkeleton } from './ui';

function deviceName(userAgent?: string | null) {
  if (!userAgent) return 'Unknown browser or device';
  if (/iphone|ipad/i.test(userAgent)) return 'iPhone or iPad';
  if (/android/i.test(userAgent)) return 'Android device';
  if (/windows/i.test(userAgent)) return 'Windows device';
  if (/macintosh|mac os/i.test(userAgent)) return 'Mac device';
  if (/linux/i.test(userAgent)) return 'Linux device';
  return 'Web browser';
}

export function SessionManagement() {
  const sessions = useSessions();
  const client = useQueryClient();
  const router = useRouter();
  const revoke = useMutation({
    mutationFn: api.revokeSession,
    onSuccess: (_result, id) => {
      const current = sessions.data?.find((session) => session.id === id)?.isCurrent;
      if (current) {
        client.clear();
        router.replace('/login');
        return;
      }
      client.invalidateQueries({ queryKey: ['auth-sessions'] });
      toast.success('Session revoked');
    },
    onError: (error) => toast.error(error.message),
  });

  if (sessions.isLoading) return <LoadingSkeleton rows={2} />;
  if (sessions.isError) return <ErrorState message={sessions.error.message} retry={() => sessions.refetch()} />;

  return <Card className="p-5 sm:p-6"><div className="mb-5 flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f7f2] text-[#238773]"><ShieldCheck className="h-5 w-5" /></div><div><h2 className="font-display text-xl">Active sessions</h2><p className="mt-1 text-xs text-[#85878d]">Review signed-in devices and revoke access you no longer recognize.</p></div></div>{sessions.data?.length ? <div className="space-y-3">{sessions.data.map((session) => <div key={session.id} className="flex flex-col gap-3 rounded-xl border border-[#eeeae2] bg-[#fffdf9] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0efec] text-[#6d7078]"><MonitorSmartphone className="h-4 w-4" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{deviceName(session.userAgent)}</p>{session.isCurrent && <Badge tone="green">Current device</Badge>}</div><p className="mt-1 text-xs text-[#85878d]">{session.ipAddress ?? 'IP unavailable'} · Last used {formatDistanceToNow(new Date(session.lastUsedAt ?? session.createdAt), { addSuffix: true })}</p></div></div><Button type="button" size="sm" variant="danger" disabled={revoke.isPending} onClick={() => revoke.mutate(session.id)}>Revoke</Button></div>)}</div> : <EmptyState title="No active sessions" description="Your current sign-in will appear here." />}</Card>;
}
