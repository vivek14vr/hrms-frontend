'use client';

import { CalendarCheck2, Download, Pencil, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AttendanceRecord } from '@peopleos/types';
import { api } from '@/lib/api';
import { useAttendance, useDepartments, useEmployees } from '@/lib/queries';
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

export default function AdminAttendancePage() {
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const params = new URLSearchParams({ limit: '50', dateFrom: date, dateTo: date });
  if (department) params.set('department', department);
  if (status) params.set('status', status);
  const records = useAttendance(params);
  const employees = useEmployees(new URLSearchParams('limit=100'));
  const departments = useDepartments();
  const client = useQueryClient();
  const create = useMutation({
    mutationFn: api.createAttendance,
    onSuccess: () => {
      toast.success('Attendance marked');
      client.invalidateQueries({ queryKey: ['attendance'] });
      setShowForm(false);
    },
    onError: (error) => toast.error(error.message),
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => api.updateAttendance(id, body),
    onSuccess: () => {
      toast.success('Attendance updated');
      client.invalidateQueries({ queryKey: ['attendance'] });
      setEditingRecord(null);
      setShowForm(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const exportCsv = async () => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const response = await fetch(`${base}/attendance/export?${params}`, { credentials: 'include' });
    if (!response.ok) {
      toast.error('Could not export attendance');
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'peopleos-attendance.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openCreate = () => {
    setEditingRecord(null);
    setShowForm(true);
  };
  const openEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  return (
    <div>
      <PageHeader
        eyebrow="People time"
        title="Attendance"
        description="Review time records, spot exceptions, and keep corrections moving."
        action={<div className="flex gap-2"><Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" />Export CSV</Button><Button onClick={openCreate}><Plus className="h-4 w-4" />Mark attendance</Button></div>}
      />

      {showForm && (
        <Card className="mb-5 border-[#ff725c]/30 bg-[#fffaf1] p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl">{editingRecord ? 'Edit attendance' : 'Mark attendance'}</h2>
              <p className="text-xs text-[#85878d]">Record a punch or an approved status for any employee.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingRecord(null); }}>Cancel</Button>
          </div>
          <form
            key={editingRecord?.id ?? 'new-attendance'}
            className="grid gap-4 md:grid-cols-5"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const day = String(form.get('date'));
              const checkInValue = String(form.get('checkIn') ?? '');
              const checkOutValue = String(form.get('checkOut') ?? '');
              const body = {
                employeeId: String(form.get('employeeId')),
                date: day,
                status: String(form.get('status')),
                checkIn: checkInValue ? `${day}T${checkInValue}:00` : undefined,
                checkOut: checkOutValue ? `${day}T${checkOutValue}:00` : undefined,
                workHours: Number(form.get('workHours')) || 0,
              };
              if (editingRecord) update.mutate({ id: editingRecord.id, body });
              else create.mutate(body);
            }}
          >
            <FormField label="Employee">
              <Select name="employeeId" required defaultValue={editingRecord?.employeeId ?? ''} disabled={Boolean(editingRecord)}>
                <option value="">Choose employee</option>
                {(employees.data?.items ?? []).map((person) => <option key={person.id} value={person.id}>{person.firstName} {person.lastName}</option>)}
              </Select>
            </FormField>
            <FormField label="Date"><Input name="date" type="date" required defaultValue={editingRecord ? format(new Date(editingRecord.date), 'yyyy-MM-dd') : date} /></FormField>
            <FormField label="Status">
              <Select name="status" defaultValue={editingRecord?.status ?? 'PRESENT'}>
                <option value="PRESENT">Present</option><option value="LATE">Late</option><option value="ABSENT">Absent</option><option value="LEAVE">Leave</option><option value="WORK_FROM_HOME">Work from home</option>
              </Select>
            </FormField>
            <FormField label="Check-in"><Input name="checkIn" type="time" defaultValue={editingRecord?.checkIn ? format(new Date(editingRecord.checkIn), 'HH:mm') : '09:00'} /></FormField>
            <FormField label="Check-out"><Input name="checkOut" type="time" defaultValue={editingRecord?.checkOut ? format(new Date(editingRecord.checkOut), 'HH:mm') : '18:00'} /></FormField>
            <FormField label="Work hours"><Input name="workHours" type="number" min="0" max="24" step="0.25" defaultValue={editingRecord?.workHours ?? 8} /></FormField>
            <div className="flex items-end md:col-span-4"><Button type="submit" disabled={create.isPending || update.isPending} className="w-full sm:w-auto">{create.isPending || update.isPending ? 'Saving…' : editingRecord ? 'Save changes' : 'Save record'}</Button></div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#e8e4dc] p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm font-bold"><CalendarCheck2 className="h-4 w-4 text-[#ff725c]" />Daily records</div>
          <Input aria-label="Filter by date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="sm:ml-auto sm:w-44" />
          <Select aria-label="Filter by department" value={department} onChange={(event) => setDepartment(event.target.value)} className="sm:w-48"><option value="">All departments</option>{(departments.data ?? []).map((item) => <option key={item}>{item}</option>)}</Select>
          <Select aria-label="Filter by attendance status" value={status} onChange={(event) => setStatus(event.target.value)} className="sm:w-40"><option value="">All statuses</option><option value="PRESENT">Present</option><option value="LATE">Late</option><option value="ABSENT">Absent</option><option value="LEAVE">Leave</option><option value="WORK_FROM_HOME">WFH</option></Select>
        </div>
        {records.isLoading ? <div className="p-6"><Spinner /></div> : records.isError ? <div className="p-5"><ErrorState message={records.error.message} retry={() => records.refetch()} /></div> : records.data?.items.length ? (
          <DataTableShell>
            <TableHeader><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Check-in</th><th className="px-5 py-3">Check-out</th><th className="px-5 py-3">Hours</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Edit</th></TableHeader>
            <tbody className="divide-y divide-[#f0ede8]">{records.data.items.map((record) => <tr key={record.id}><TableCell><p className="text-sm font-bold">{record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'Employee'}</p><p className="text-xs text-[#85878d]">{record.employee?.department}</p></TableCell><TableCell className="text-sm">{format(new Date(record.date), 'd MMM yyyy')}</TableCell><TableCell className="text-sm text-[#777982]">{record.checkIn ? format(new Date(record.checkIn), 'h:mm a') : '—'}</TableCell><TableCell className="text-sm text-[#777982]">{record.checkOut ? format(new Date(record.checkOut), 'h:mm a') : '—'}</TableCell><TableCell className="tabular-nums text-sm font-semibold">{record.workHours ?? '—'}</TableCell><TableCell><StatusBadge status={record.status} /></TableCell><TableCell className="text-right"><button aria-label={`Edit attendance for ${record.employee?.firstName ?? 'employee'}`} onClick={() => openEdit(record)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#777982] hover:bg-[#f3f1ec]"><Pencil className="h-4 w-4" /></button></TableCell></tr>)}</tbody>
          </DataTableShell>
        ) : <div className="p-5"><EmptyState title="No attendance records" description="No records match this date and filter combination." /></div>}
      </Card>
    </div>
  );
}
