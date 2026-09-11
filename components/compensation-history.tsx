'use client';

import { format } from 'date-fns';
import { History } from 'lucide-react';
import { useCompensationHistory } from '@/lib/queries';
import { formatMoney } from '@/lib/api';
import { Card, EmptyState, ErrorState, LoadingSkeleton } from './ui';

export function CompensationHistory({ employeeId }: { employeeId: string }) {
  const history = useCompensationHistory(employeeId);
  return <Card className="p-5 sm:p-6"><div className="mb-5 flex items-start gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff9c7] text-[#657200]"><History className="h-4 w-4" /></div><div><h2 className="font-display text-xl">Compensation history</h2><p className="mt-1 text-xs text-[#85878d]">Effective-dated base salary records for this employee.</p></div></div>{history.isLoading ? <LoadingSkeleton rows={3} /> : history.isError ? <ErrorState message={history.error.message} retry={() => history.refetch()} /> : history.data?.length ? <div className="divide-y divide-[#eeeae4]">{history.data.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-semibold">{format(new Date(item.effectiveFrom), 'd MMM yyyy')}</p><p className="text-xs text-[#85878d]">{item.reason ?? 'Compensation change'}</p></div><p className="text-sm font-bold tabular-nums">{formatMoney(item.baseSalary)}</p></div>)}</div> : <EmptyState title="No compensation history" description="Salary changes will appear here once recorded." />}</Card>;
}
