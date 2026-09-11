'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { employeeSchema } from '@/lib/types';
import { useDepartments, useEmployees, useSchedules } from '@/lib/queries';
import type { Employee } from '@/lib/types';
import { Button, Card, FormField, Input, PageHeader, Select } from './ui';

type FormValues = {
  firstName: string; lastName: string; email: string; phone?: string; department: string; designation: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'; employmentStatus: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'TERMINATED';
  joiningDate: string; dateOfBirth?: string; avatarUrl?: string; managerName?: string; location?: string; address?: string;
  emergencyContactName?: string; emergencyContactPhone?: string; baseSalary: number; managerId?: string;
  scheduleId?: string;
};

const valuesFromEmployee = (employee: Employee): FormValues => ({
  firstName: employee.firstName, lastName: employee.lastName, email: employee.email, phone: employee.phone ?? '',
  department: employee.department, designation: employee.designation, employmentType: employee.employmentType,
  employmentStatus: employee.employmentStatus, joiningDate: employee.joiningDate.slice(0, 10), dateOfBirth: employee.dateOfBirth?.slice(0, 10) ?? '',
  avatarUrl: employee.avatarUrl ?? '', managerName: employee.managerName ?? '', location: employee.location ?? '', address: employee.address ?? '',
  emergencyContactName: employee.emergencyContactName ?? '', emergencyContactPhone: employee.emergencyContactPhone ?? '', baseSalary: employee.baseSalary,
  scheduleId: employee.schedule?.id ?? '',
  managerId: employee.manager?.id ?? '',
});

export function EmployeeForm({ employee }: { employee?: Employee }) {
  const edit = Boolean(employee);
  const router = useRouter();
  const departments = useDepartments();
  const schedules = useSchedules(true);
  const managers = useEmployees(new URLSearchParams({ status: 'ACTIVE', page: '1', limit: '100' }));
  const form = useForm<FormValues>({ resolver: zodResolver(employeeSchema), defaultValues: employee ? valuesFromEmployee(employee) : { employmentType: 'FULL_TIME', employmentStatus: 'ACTIVE', joiningDate: new Date().toISOString().slice(0, 10), baseSalary: 0 } });
  useEffect(() => { if (employee) form.reset(valuesFromEmployee(employee)); }, [employee, form]);
  const submit = form.handleSubmit((values) => {
    const optionalText = (value?: string) => value?.trim() || undefined;
    const payload = { ...values, phone: optionalText(values.phone), dateOfBirth: optionalText(values.dateOfBirth), avatarUrl: optionalText(values.avatarUrl), managerName: optionalText(values.managerName), location: optionalText(values.location), address: optionalText(values.address), emergencyContactName: optionalText(values.emergencyContactName), emergencyContactPhone: optionalText(values.emergencyContactPhone), scheduleId: optionalText(values.scheduleId), managerId: optionalText(values.managerId) };
    const mutation = edit ? api.updateEmployee(employee!.id, payload) : api.createEmployee(payload);
    mutation.then(() => { toast.success(edit ? 'Employee updated' : 'Employee added'); router.push('/admin/employees'); }).catch((error) => toast.error(error.message));
  });
  return <div>
    <Link href="/admin/employees" className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-[#777982] hover:text-[#ff725c]"><ArrowLeft className="h-4 w-4" />Back to employees</Link>
    <PageHeader eyebrow={edit ? 'Edit people record' : 'New people record'} title={edit ? `${employee?.firstName} ${employee?.lastName}` : 'Add an employee'} description="Add the details your team needs to work well together." action={<Button onClick={submit} disabled={form.formState.isSubmitting}><Save className="h-4 w-4" />{form.formState.isSubmitting ? 'Saving…' : 'Save employee'}</Button>} />
    <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="p-5 sm:p-7"><h2 className="mb-5 font-display text-xl">Personal details</h2><div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name *" error={form.formState.errors.firstName?.message}><Input {...form.register('firstName')} /></FormField>
        <FormField label="Last name *" error={form.formState.errors.lastName?.message}><Input {...form.register('lastName')} /></FormField>
        <FormField label="Work email *" error={form.formState.errors.email?.message}><Input type="email" {...form.register('email')} /></FormField>
        <FormField label="Phone"><Input type="tel" {...form.register('phone')} /></FormField>
        <FormField label="Date of birth"><Input type="date" {...form.register('dateOfBirth')} /></FormField>
        <FormField label="Avatar URL" error={form.formState.errors.avatarUrl?.message}><Input type="url" placeholder="https://…" {...form.register('avatarUrl')} /></FormField>
        <FormField label="Location"><Input placeholder="Bengaluru" {...form.register('location')} /></FormField>
        <FormField label="Manager"><Select {...form.register('managerId')}><option value="">No manager</option>{(managers.data?.items ?? []).filter((manager) => manager.id !== employee?.id).map((manager) => <option key={manager.id} value={manager.id}>{manager.firstName} {manager.lastName} · {manager.designation}</option>)}</Select></FormField>
        <FormField label="Address"><Input placeholder="Home address" {...form.register('address')} /></FormField>
      </div></Card>
      <Card className="p-5 sm:p-7"><h2 className="mb-5 font-display text-xl">Work details</h2><div className="space-y-4">
        <FormField label="Department *" error={form.formState.errors.department?.message}><Select {...form.register('department')}><option value="">Choose department</option>{(departments.data ?? ['Engineering', 'Product', 'Design', 'Marketing', 'Finance', 'Human Resources']).map((item) => <option key={item}>{item}</option>)}</Select></FormField>
        <FormField label="Designation *" error={form.formState.errors.designation?.message}><Input placeholder="e.g. Product Designer" {...form.register('designation')} /></FormField>
        <FormField label="Employment type"><Select {...form.register('employmentType')}><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option><option value="CONTRACT">Contract</option></Select></FormField>
        <FormField label="Status"><Select {...form.register('employmentStatus')}><option value="ACTIVE">Active</option><option value="ON_LEAVE">On leave</option><option value="INACTIVE">Inactive</option><option value="TERMINATED">Terminated</option></Select></FormField>
        <FormField label="Work schedule"><Select {...form.register('scheduleId')}><option value="">Use workspace default</option>{(schedules.data ?? []).map((schedule) => <option key={schedule.id} value={schedule.id} disabled={!schedule.active}>{schedule.name}{schedule.active ? '' : ' (inactive)'} · {schedule.shiftStart}–{schedule.shiftEnd}</option>)}</Select></FormField>
        <FormField label="Joining date" error={form.formState.errors.joiningDate?.message}><Input type="date" {...form.register('joiningDate')} /></FormField>
        <FormField label="Annual base salary (INR)" error={form.formState.errors.baseSalary?.message}><Input type="number" min="1" {...form.register('baseSalary', { valueAsNumber: true })} /></FormField>
        <div className="border-t border-[#eeeae4] pt-4"><p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#898b91]">Emergency contact</p><div className="space-y-4"><FormField label="Contact name"><Input {...form.register('emergencyContactName')} /></FormField><FormField label="Contact phone"><Input type="tel" {...form.register('emergencyContactPhone')} /></FormField></div></div>
      </div></Card>
    </form>
  </div>;
}
