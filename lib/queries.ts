'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from './api';
import type { AttendanceCorrectionStatus, LeaveRequestStatus, UserRole } from './types';
export function useSession() { return useQuery({ queryKey: ['session'], queryFn: api.me, retry: false }); }
export function useLogin() { const client = useQueryClient(); return useMutation({ mutationFn: api.login, onSuccess: (data) => client.setQueryData(['session'], data) }); }
export function useLogout() { const client = useQueryClient(); const router = useRouter(); return useMutation({ mutationFn: api.logout, onSuccess: () => { client.clear(); router.replace('/login'); } }); }
export function useSessions() { return useQuery({ queryKey: ['auth-sessions'], queryFn: api.sessions }); }
export function useSchedules(includeInactive = false) { return useQuery({ queryKey: ['schedules', includeInactive], queryFn: () => api.schedules(includeInactive) }); }
export function useDashboard() { return useQuery({ queryKey: ['dashboard', 'summary'], queryFn: api.summary }); }
export function useTrend() { return useQuery({ queryKey: ['dashboard', 'trend'], queryFn: api.attendanceTrend }); }
export function useHeadcount(enabled = true) { return useQuery({ queryKey: ['dashboard', 'headcount'], queryFn: api.departmentHeadcount, enabled }); }
export function useActivity() { return useQuery({ queryKey: ['dashboard', 'activity'], queryFn: api.recentActivity }); }
export function useEmployee(id: string) { return useQuery({ queryKey: ['employee', id], queryFn: () => api.employee(id), enabled: Boolean(id) }); }
export function useCompensationHistory(id: string) { return useQuery({ queryKey: ['compensation-history', id], queryFn: () => api.compensationHistory(id), enabled: Boolean(id) }); }
export function useEmployees(params: URLSearchParams, enabled = true) { return useQuery({ queryKey: ['employees', params.toString()], queryFn: () => api.employees(params), enabled }); }
export function useAttendance(params: URLSearchParams, enabled = true) { return useQuery({ queryKey: ['attendance', params.toString()], queryFn: () => api.attendance(params), enabled }); }
export function useAttendanceSummary() { return useQuery({ queryKey: ['attendance', 'summary'], queryFn: () => api.attendanceSummary() }); }
export function useAttendanceCorrections(status?: AttendanceCorrectionStatus) { return useQuery({ queryKey: ['attendance', 'corrections', status ?? 'all'], queryFn: () => api.attendanceCorrections(status) }); }
export function useSalarySlips(params: URLSearchParams, enabled = true) { return useQuery({ queryKey: ['salary-slips', params.toString()], queryFn: () => api.salarySlips(params), enabled }); }
export function useEmployeeSalarySlips(id: string) { return useQuery({ queryKey: ['salary-slips', id], queryFn: () => api.employeeSalarySlips(id), enabled: Boolean(id) }); }
export function usePayrollRuns() { return useQuery({ queryKey: ['payroll-runs'], queryFn: api.payrollRuns }); }
export function useLeaveTypes() { return useQuery({ queryKey: ['leave-types'], queryFn: api.leaveTypes }); }
export function useLeaveRequests(status?: LeaveRequestStatus) { return useQuery({ queryKey: ['leave-requests', status ?? 'all'], queryFn: () => api.leaveRequests(status) }); }
export function useLeaveBalances(year?: number) { return useQuery({ queryKey: ['leave-balances', year ?? new Date().getFullYear()], queryFn: () => api.leaveBalances(year) }); }
export function useSettings() { return useQuery({ queryKey: ['settings'], queryFn: api.settings }); }
export function useHolidays(year?: number) { return useQuery({ queryKey: ['holidays', year ?? new Date().getFullYear()], queryFn: () => api.holidays(year) }); }
export function useUsers(enabled = true) { return useQuery({ queryKey: ['users'], queryFn: api.users, enabled }); }
export function useDepartments() { return useQuery({ queryKey: ['departments'], queryFn: api.departments }); }
export function roleCanManage(role?: UserRole) { return role === 'ADMIN' || role === 'HR_MANAGER'; }
