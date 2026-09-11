'use client';

import { Check, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useLeaveRequests } from '@/lib/queries';
import type { LeaveRequestStatus } from '@/lib/types';
import { Button, Card, EmptyState, ErrorState, LoadingSkeleton, PageHeader, StatusBadge } from '@/components/ui';

export default function AdminLeavePage() {
  const requests = useLeaveRequests();
  const client = useQueryClient();
  const review = useMutation({ mutationFn: ({ id, status }: { id: string; status: LeaveRequestStatus }) => api.reviewLeaveRequest(id, { status }), onSuccess: () => { toast.success('Leave request reviewed'); client.invalidateQueries({ queryKey: ['leave-requests'] }); client.invalidateQueries({ queryKey: ['leave-balances'] }); }, onError: (error) => toast.error(error.message) });
  if (requests.isLoading) return <LoadingSkeleton rows={8} />;
  if (requests.isError) return <ErrorState message={requests.error.message} retry={() => requests.refetch()} />;
  const pending = requests.data?.filter((request) => request.status === 'PENDING') ?? [];
  const historical = requests.data?.filter((request) => request.status !== 'PENDING') ?? [];
  return <div><PageHeader eyebrow="People operations" title="Leave approvals" description="Review employee leave requests and keep balances accurate." /><Card className="mb-5 overflow-hidden"><div className="border-b border-[#e8e4dc] p-5 sm:p-6"><h2 className="font-display text-xl">Pending requests</h2></div>{pending.length ? <div className="divide-y divide-[#f0ede8]">{pending.map((request) => <div key={request.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : 'Employee'}</p><StatusBadge status={request.leaveType.name} /></div><p className="mt-1 text-xs text-[#85878d]">{request.leaveType.name} · {format(new Date(request.startDate), 'd MMM yyyy')} – {format(new Date(request.endDate), 'd MMM yyyy')} · {request.days} day{request.days === 1 ? '' : 's'}</p><p className="mt-1 text-xs text-[#85878d]">{request.reason}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" disabled={review.isPending} onClick={() => review.mutate({ id: request.id, status: 'REJECTED' })}><X className="h-4 w-4" />Reject</Button><Button size="sm" disabled={review.isPending} onClick={() => review.mutate({ id: request.id, status: 'APPROVED' })}><Check className="h-4 w-4" />Approve</Button></div></div>)}</div> : <div className="p-5"><EmptyState title="No pending requests" description="New employee requests will appear here." /></div>}</Card><Card className="overflow-hidden"><div className="border-b border-[#e8e4dc] p-5 sm:p-6"><h2 className="font-display text-xl">History</h2></div>{historical.length ? <div className="divide-y divide-[#f0ede8]">{historical.map((request) => <div key={request.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold">{request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : 'Employee'} · {request.leaveType.name}</p><p className="mt-1 text-xs text-[#85878d]">{format(new Date(request.startDate), 'd MMM yyyy')} – {format(new Date(request.endDate), 'd MMM yyyy')} · {request.days} day{request.days === 1 ? '' : 's'}</p></div><StatusBadge status={request.status} /></div>)}</div> : <div className="p-5"><EmptyState title="No reviewed requests" /></div>}</Card></div>;
}
