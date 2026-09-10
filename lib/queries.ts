'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { UserRole } from './types';
export function useSession() { return useQuery({ queryKey: ['session'], queryFn: api.me, retry: false }); }
export function useLogin() { const client = useQueryClient(); return useMutation({ mutationFn: api.login, onSuccess: (data) => client.setQueryData(['session'], data) }); }
export function useLogout() { const client = useQueryClient(); return useMutation({ mutationFn: api.logout, onSuccess: () => { client.clear(); if (typeof window !== 'undefined') window.location.href = '/login'; } }); }
export function useDashboard() { return useQuery({ queryKey: ['dashboard', 'summary'], queryFn: api.summary }); }
export function useTrend() { return useQuery({ queryKey: ['dashboard', 'trend'], queryFn: api.attendanceTrend }); }
export function useHeadcount(enabled = true) { return useQuery({ queryKey: ['dashboard', 'headcount'], queryFn: api.departmentHeadcount, enabled }); }
export function useActivity() { return useQuery({ queryKey: ['dashboard', 'activity'], queryFn: api.recentActivity }); }
export function useEmployee(id: string) { return useQuery({ queryKey: ['employee', id], queryFn: () => api.employee(id), enabled: Boolean(id) }); }
export function useEmployees(params: URLSearchParams, enabled = true) { return useQuery({ queryKey: ['employees', params.toString()], queryFn: () => api.employees(params), enabled }); }
export function useAttendance(params: URLSearchParams, enabled = true) { return useQuery({ queryKey: ['attendance', params.toString()], queryFn: () => api.attendance(params), enabled }); }
export function useAttendanceSummary() { return useQuery({ queryKey: ['attendance', 'summary'], queryFn: () => api.attendanceSummary() }); }
export function useSalarySlips(params: URLSearchParams, enabled = true) { return useQuery({ queryKey: ['salary-slips', params.toString()], queryFn: () => api.salarySlips(params), enabled }); }
export function useEmployeeSalarySlips(id: string) { return useQuery({ queryKey: ['salary-slips', id], queryFn: () => api.employeeSalarySlips(id), enabled: Boolean(id) }); }
export function useUsers(enabled = true) { return useQuery({ queryKey: ['users'], queryFn: api.users, enabled }); }
export function useDepartments() { return useQuery({ queryKey: ['departments'], queryFn: api.departments }); }
export function roleCanManage(role?: UserRole) { return role === 'ADMIN' || role === 'HR_MANAGER'; }
