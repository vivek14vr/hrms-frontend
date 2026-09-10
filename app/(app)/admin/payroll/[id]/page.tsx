'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PaymentStatus } from '@/lib/types';
import { api } from '@/lib/api';
import { SalarySlipView } from '@/components/salary-slip-view';
import { Button, Card, ErrorState, FormField, Input, LoadingSkeleton, Select } from '@/components/ui';

const moneyFields = [
  ['basicSalary', 'Basic salary'],
  ['houseRentAllowance', 'House rent allowance'],
  ['transportAllowance', 'Transport allowance'],
  ['performanceBonus', 'Performance bonus'],
  ['providentFund', 'Provident fund'],
  ['professionalTax', 'Professional tax'],
  ['incomeTax', 'Income tax'],
  ['otherDeductions', 'Other deductions'],
] as const;

export default function AdminSalarySlipPage() {
  const { id } = useParams<{ id: string }>();
  const client = useQueryClient();
  const slip = useQuery({ queryKey: ['salary-slip', id], queryFn: () => api.salarySlip(id), enabled: Boolean(id) });
  const update = useMutation({
    mutationFn: (body: unknown) => api.updateSalarySlip(id, body),
    onSuccess: (data) => {
      client.setQueryData(['salary-slip', id], data);
      client.invalidateQueries({ queryKey: ['salary-slips'] });
      toast.success('Salary slip updated');
    },
    onError: (error) => toast.error(error.message),
  });

  if (slip.isLoading) return <LoadingSkeleton rows={8} />;
  if (slip.isError || !slip.data) return <ErrorState message={slip.error?.message ?? 'Salary slip not found'} retry={() => slip.refetch()} />;

  const current = slip.data;
  return (
    <div>
      <Link href="/admin/payroll" className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-[#777982] hover:text-[#ff725c]"><ArrowLeft className="h-4 w-4" />Back to payroll</Link>
      <Card className="mb-5 p-5 sm:p-7">
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff725c]">Payroll editor</p>
          <h1 className="font-display text-2xl">Update {current.employee ? `${current.employee.firstName} ${current.employee.lastName}` : 'salary slip'}</h1>
          <p className="mt-1 text-xs text-[#85878d]">Amounts are recalculated into gross salary, deductions, and net pay.</p>
        </div>
        <form
          key={current.updatedAt}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const paymentStatus = String(data.get('paymentStatus')) as PaymentStatus;
            update.mutate({
              ...Object.fromEntries(moneyFields.map(([name]) => [name, Number(data.get(name))])),
              paymentStatus,
              paymentDate: paymentStatus === 'PAID' ? String(data.get('paymentDate') || new Date().toISOString()) : null,
            });
          }}
        >
          {moneyFields.map(([name, label]) => (
            <FormField key={name} label={label}>
              <Input name={name} type="number" min="0" step="0.01" defaultValue={current[name]} required />
            </FormField>
          ))}
          <FormField label="Payment status">
            <Select name="paymentStatus" defaultValue={current.paymentStatus}>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
            </Select>
          </FormField>
          <FormField label="Payment date">
            <Input name="paymentDate" type="date" defaultValue={current.paymentDate ? format(new Date(current.paymentDate), 'yyyy-MM-dd') : ''} />
          </FormField>
          <div className="flex items-end sm:col-span-2 lg:col-span-4">
            <Button type="submit" disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save salary slip'}</Button>
          </div>
        </form>
      </Card>
      <SalarySlipView slip={current} />
    </div>
  );
}
