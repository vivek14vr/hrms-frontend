'use client';

import { CalendarDays, Send, X } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { api, formatMoney } from '@/lib/api';
import { useLeaveBalances, useLeaveRequests, useLeaveTypes } from '@/lib/queries';
import { Button, Card, EmptyState, ErrorState, FormField, Input, LoadingSkeleton, PageHeader, Select, StatusBadge } from '@/components/ui';

export default function LeavePage() {
  const types = useLeaveTypes();
  const requests = useLeaveRequests();
  const balances = useLeaveBalances();
  const client = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      await api.createLeaveRequest({ leaveTypeId: String(form.get('leaveTypeId')), startDate: String(form.get('startDate')), endDate: String(form.get('endDate')), reason: String(form.get('reason')) });
      event.currentTarget.reset();
      await client.invalidateQueries({ queryKey: ['leave-requests'] });
      await client.invalidateQueries({ queryKey: ['leave-balances'] });
      toast.success('Leave request submitted');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to submit leave request'); } finally { setSaving(false); }
  };
  const cancel = async (id: string) => {
    setCancellingId(id);
    try {
      await api.cancelLeaveRequest(id);
      await client.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave request cancelled');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to cancel leave request'); } finally { setCancellingId(null); }
  };
  if (types.isLoading || requests.isLoading || balances.isLoading) return <LoadingSkeleton rows={8} />;
  if (types.isError || requests.isError || balances.isError) return <ErrorState message={types.error?.message ?? requests.error?.message ?? balances.error?.message} retry={() => { types.refetch(); requests.refetch(); balances.refetch(); }} />;
  return <div><PageHeader eyebrow="Employee self-service" title="My leave" description="Request time away and keep track of your available balance." /><div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{balances.data?.map((balance) => <Card key={balance.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold">{balance.leaveType.name}</p><p className="mt-1 text-xs text-[#85878d]">{balance.leaveType.paid ? 'Paid leave' : 'Unpaid leave'}</p></div><CalendarDays className="h-5 w-5 text-[#ff725c]" /></div><p className="mt-5 font-display text-2xl">{Math.max(0, balance.allocated - balance.used)} <span className="font-sans text-xs font-semibold text-[#85878d]">days left</span></p><p className="mt-1 text-xs text-[#85878d]">{balance.used} used of {balance.allocated}</p></Card>)}</div><div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><Card className="p-5 sm:p-6"><h2 className="font-display text-xl">Request leave</h2><p className="mt-1 text-xs text-[#85878d]">Weekends are excluded automatically.</p><form className="mt-5 space-y-4" onSubmit={submit}><FormField label="Leave type"><Select name="leaveTypeId" required><option value="">Choose leave type</option>{types.data?.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</Select></FormField><div className="grid gap-4 sm:grid-cols-2"><FormField label="Start date"><Input name="startDate" type="date" required /></FormField><FormField label="End date"><Input name="endDate" type="date" required /></FormField></div><FormField label="Reason"><Input name="reason" minLength={3} maxLength={500} required placeholder="Add a short reason" /></FormField><Button type="submit" disabled={saving}><Send className="h-4 w-4" />{saving ? 'Submitting…' : 'Submit request'}</Button></form></Card><Card className="overflow-hidden"><div className="border-b border-[#e8e4dc] p-5 sm:p-6"><h2 className="font-display text-xl">Request history</h2></div>{requests.data?.length ? <div className="divide-y divide-[#f0ede8]">{requests.data.map((request) => <div key={request.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold">{request.leaveType.name}</p><p className="mt-1 text-xs text-[#85878d]">{format(new Date(request.startDate), 'd MMM yyyy')} – {format(new Date(request.endDate), 'd MMM yyyy')} · {request.days} day{request.days === 1 ? '' : 's'}</p><p className="mt-1 text-xs text-[#85878d]">{request.reason}</p></div><div className="flex items-center gap-3"><StatusBadge status={request.status} />{(request.status === 'PENDING' || request.status === 'APPROVED') && <Button type="button" size="sm" variant="outline" disabled={cancellingId === request.id} onClick={() => cancel(request.id)}><X className="h-4 w-4" />{cancellingId === request.id ? 'Cancelling…' : 'Cancel'}</Button>}</div></div>)}</div> : <div className="p-5"><EmptyState title="No leave requests" description="Your submitted requests will appear here." /></div>}</Card></div></div>;
}
