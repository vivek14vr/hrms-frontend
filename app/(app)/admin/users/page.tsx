'use client';

import { KeyRound, Plus, ShieldCheck, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useEmployees, useUsers } from '@/lib/queries';
import {
  Avatar,
  Button,
  Card,
  DataTableShell,
  EmptyState,
  FormField,
  Input,
  PageHeader,
  Select,
  Spinner,
  StatusBadge,
  TableCell,
  TableHeader,
} from '@/components/ui';

const demoResetPassword = 'Welcome@123';

export default function AdminUsersPage() {
  const users = useUsers();
  const employees = useEmployees(new URLSearchParams('limit=100'));
  const [showForm, setShowForm] = useState(false);
  const client = useQueryClient();
  const create = useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      toast.success('User created');
      client.invalidateQueries({ queryKey: ['users'] });
      setShowForm(false);
    },
    onError: (error) => toast.error(error.message),
  });
  const status = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.updateUserStatus(id, isActive),
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? 'User activated' : 'User deactivated');
      client.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => toast.error(error.message),
  });
  const reset = useMutation({
    mutationFn: (id: string) => api.updateUser(id, { password: demoResetPassword }),
    onSuccess: () => toast.success(`Password reset to ${demoResetPassword}`),
    onError: (error) => toast.error(error.message),
  });
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate({
      name: String(form.get('name')),
      email: String(form.get('email')),
      password: String(form.get('password')),
      role: String(form.get('role')),
      employeeId: form.get('employeeId') ? String(form.get('employeeId')) : undefined,
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Access control"
        title="Users & access"
        description="Keep account access intentional, review roles, and make onboarding simple."
        action={<Button onClick={() => setShowForm((value) => !value)}><Plus className="h-4 w-4" />Create user</Button>}
      />

      {showForm && (
        <Card className="mb-5 border-[#ff725c]/30 bg-[#fffaf1] p-5">
          <div className="mb-4">
            <h2 className="font-display text-xl">Create application user</h2>
            <p className="text-xs text-[#85878d]">Link employee accounts when you want them to access their own workspace.</p>
          </div>
          <form className="grid gap-4 md:grid-cols-3" onSubmit={submit}>
            <FormField label="Name"><Input name="name" required /></FormField>
            <FormField label="Email"><Input name="email" type="email" required /></FormField>
            <FormField label="Temporary password"><Input name="password" minLength={8} required defaultValue={demoResetPassword} /></FormField>
            <FormField label="Role">
              <Select name="role" defaultValue="EMPLOYEE">
                <option value="EMPLOYEE">Employee</option>
                <option value="HR_MANAGER">HR manager</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </FormField>
            <FormField label="Link employee record">
              <Select name="employeeId">
                <option value="">No linked employee</option>
                {(employees.data?.items ?? []).map((person) => <option key={person.id} value={person.id}>{person.firstName} {person.lastName}</option>)}
              </Select>
            </FormField>
            <div className="flex items-end"><Button type="submit" disabled={create.isPending} className="w-full">{create.isPending ? 'Creating…' : 'Create user'}</Button></div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        {users.isLoading ? <div className="p-6"><Spinner /></div> : users.isError ? <div className="p-6 text-sm text-[#c24b3d]">{users.error.message}</div> : users.data?.length ? (
          <DataTableShell>
            <TableHeader>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Linked employee</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </TableHeader>
            <tbody className="divide-y divide-[#f0ede8]">
              {users.data.map((user) => (
                <tr key={user.id}>
                  <TableCell><div className="flex items-center gap-3"><Avatar name={user.name} size="sm" /><div><p className="text-sm font-bold">{user.name}</p><p className="text-xs text-[#85878d]">{user.email}</p></div></div></TableCell>
                  <TableCell><StatusBadge status={user.role} /></TableCell>
                  <TableCell className="text-sm text-[#777982]">{user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : '—'}</TableCell>
                  <TableCell><StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" disabled={reset.isPending} onClick={() => reset.mutate(user.id)}>Reset password</Button>
                      <Button variant="outline" size="sm" disabled={status.isPending} onClick={() => status.mutate({ id: user.id, isActive: !user.isActive })}>{user.isActive ? 'Deactivate' : 'Activate'}</Button>
                    </div>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </DataTableShell>
        ) : <div className="p-5"><EmptyState title="No users yet" description="Create an account for someone on your team." /></div>}
      </Card>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <AccessNote icon={<ShieldCheck />} title="Role aware" copy="Admin and HR manager workspaces stay separate from employee data." />
        <AccessNote icon={<KeyRound />} title="Secure by default" copy="Sessions use expiring HttpOnly cookies, never local storage." />
        <AccessNote icon={<UsersRound />} title="Linked profiles" copy="Connect an account to an employee record for private self-service." />
      </div>
    </div>
  );
}

function AccessNote({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <Card className="p-4"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#eee9ff] text-[#7050b9] [&>svg]:h-4 [&>svg]:w-4">{icon}</div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-[#85878d]">{copy}</p></Card>;
}
