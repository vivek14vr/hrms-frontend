'use client';

import { Eye, Plus, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PaymentStatus } from '@/lib/types';
import { api, formatMoney } from '@/lib/api';
import { useDepartments, useEmployees, useSalarySlips } from '@/lib/queries';
import {
  Button,
  Card,
  DataTableShell,
  EmptyState,
  ErrorState,
  FormField,
  Input,
  PageHeader,
  Select,
  Spinner,
  StatusBadge,
  TableCell,
  TableHeader,
} from '@/components/ui';

export default function AdminPayrollPage() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const params = new URLSearchParams({ month, year, limit: '50' });
  if (status) params.set('paymentStatus', status);
  if (department) params.set('department', department);

  const slips = useSalarySlips(params);
  const employees = useEmployees(new URLSearchParams('limit=100'));
  const departments = useDepartments();
  const client = useQueryClient();
  const create = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => api.createSalarySlip(id, body),
    onSuccess: () => {
      toast.success('Salary slip created');
      client.invalidateQueries({ queryKey: ['salary-slips'] });
      setShowForm(false);
    },
    onError: (error) => toast.error(error.message),
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: PaymentStatus }) =>
      api.updateSalarySlip(id, {
        paymentStatus,
        paymentDate: paymentStatus === 'PAID' ? new Date().toISOString() : null,
      }),
    onSuccess: () => {
      toast.success('Payment status updated');
      client.invalidateQueries({ queryKey: ['salary-slips'] });
      client.invalidateQueries({ queryKey: ['salary-slip'] });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Compensation"
        title="Payroll"
        description="Build confidence in every pay cycle, from gross pay to the last deduction."
        action={
          <Button onClick={() => setShowForm((value) => !value)}>
            <Plus className="h-4 w-4" />
            Create salary slip
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-5 border-[#ff725c]/30 bg-[#fffaf1] p-5">
          <div className="mb-4">
            <h2 className="font-display text-xl">Create salary slip</h2>
            <p className="text-xs text-[#85878d]">Default allowances and deductions are calculated from base salary.</p>
          </div>
          <form
            className="grid gap-4 md:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              create.mutate({
                id: String(data.get('employeeId')),
                body: {
                  month: Number(data.get('month')),
                  year: Number(data.get('year')),
                  basicSalary: Number(data.get('basicSalary')),
                  paymentStatus: 'PENDING',
                },
              });
            }}
          >
            <FormField label="Employee">
              <Select name="employeeId" required>
                <option value="">Choose employee</option>
                {(employees.data?.items ?? []).map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Month">
              <Select name="month" defaultValue={month}>
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {format(new Date(2020, index, 1), 'MMMM')}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Year">
              <Input name="year" type="number" defaultValue={year} />
            </FormField>
            <FormField label="Basic salary (INR)">
              <Input name="basicSalary" type="number" min="1" required placeholder="98000" />
            </FormField>
            <div className="md:col-span-4">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Creating…' : 'Create pending slip'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#e8e4dc] p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm font-bold">
            <WalletCards className="h-4 w-4 text-[#ff725c]" />
            Salary slips
          </div>
          <Select aria-label="Filter by month" value={month} onChange={(event) => setMonth(event.target.value)} className="sm:ml-auto sm:w-36">
            <option value="">All months</option>
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {format(new Date(2020, index, 1), 'MMM')}
              </option>
            ))}
          </Select>
          <Input aria-label="Filter by year" value={year} onChange={(event) => setYear(event.target.value)} className="sm:w-24" />
          <Select aria-label="Filter payroll by department" value={department} onChange={(event) => setDepartment(event.target.value)} className="sm:w-44">
            <option value="">All departments</option>
            {(departments.data ?? []).map((item) => <option key={item}>{item}</option>)}
          </Select>
          <Select aria-label="Filter by payment status" value={status} onChange={(event) => setStatus(event.target.value)} className="sm:w-36">
            <option value="">All statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
          </Select>
        </div>

        {slips.isLoading ? (
          <div className="p-6"><Spinner /></div>
        ) : slips.isError ? (
          <div className="p-5"><ErrorState message={slips.error.message} retry={() => slips.refetch()} /></div>
        ) : slips.data?.items.length ? (
          <DataTableShell>
            <TableHeader>
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Period</th>
              <th className="px-5 py-3">Gross</th>
              <th className="px-5 py-3">Deductions</th>
              <th className="px-5 py-3">Net pay</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">View</th>
            </TableHeader>
            <tbody className="divide-y divide-[#f0ede8]">
              {slips.data.items.map((slip) => (
                <tr key={slip.id}>
                  <TableCell>
                    <p className="text-sm font-bold">{slip.employee ? `${slip.employee.firstName} ${slip.employee.lastName}` : 'Employee'}</p>
                    <p className="text-xs text-[#85878d]">{slip.employee?.department}</p>
                  </TableCell>
                  <TableCell className="text-sm">{format(new Date(slip.year, slip.month - 1, 1), 'MMM yyyy')}</TableCell>
                  <TableCell className="tabular-nums text-sm">{formatMoney(slip.grossSalary)}</TableCell>
                  <TableCell className="tabular-nums text-sm text-[#777982]">{formatMoney(slip.totalDeductions)}</TableCell>
                  <TableCell className="tabular-nums text-sm font-bold">{formatMoney(slip.netSalary)}</TableCell>
                  <TableCell>
                    <Select
                      aria-label={`Update payment status for ${slip.employee?.firstName ?? 'employee'}`}
                      value={slip.paymentStatus}
                      disabled={updateStatus.isPending}
                      onChange={(event) => updateStatus.mutate({ id: slip.id, paymentStatus: event.target.value as PaymentStatus })}
                      className="h-8 w-32 text-xs"
                    >
                      <option value="PAID">Paid</option>
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                    </Select>
                    <StatusBadge status={slip.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/payroll/${slip.id}`} aria-label="View salary slip" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#777982] hover:bg-[#f3f1ec]">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </DataTableShell>
        ) : (
          <div className="p-5"><EmptyState title="No salary slips found" description="Create a slip or adjust the payroll filters." /></div>
        )}
      </Card>
    </div>
  );
}
