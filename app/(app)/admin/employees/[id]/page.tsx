'use client';
import { useParams } from 'next/navigation';
import { EmployeeForm } from '@/components/employee-form';
import { ErrorState, LoadingSkeleton } from '@/components/ui';
import { useEmployee } from '@/lib/queries';
export default function EditEmployeePage() { const { id } = useParams<{ id: string }>(); const employee = useEmployee(id); if (employee.isLoading) return <LoadingSkeleton rows={8} />; if (employee.isError || !employee.data) return <ErrorState message={employee.error?.message ?? 'Employee not found'} retry={() => employee.refetch()} />; return <EmployeeForm employee={employee.data} />; }
