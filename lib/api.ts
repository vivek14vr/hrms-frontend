import type { AttendanceCorrection, AttendanceCorrectionStatus, AttendanceSummary, AuthResponse, AuthSession, AttendanceRecord, CompensationHistory, DashboardActivity, DashboardSummary, Employee, Holiday, LeaveBalance, LeaveRequest, LeaveRequestStatus, LeaveType, PasswordResetLink, PayrollRun, PayrollRunStatus, SalarySlip, User, WorkspaceSettings, WorkSchedule } from './types';

export type Page<T> = { items: T[]; total: number; page: number; limit: number; totalPages: number };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const CSRF_HEADER = 'X-CSRF-Token';
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
let csrfToken: string | undefined;

type ErrorBody = { message?: string | string[] };

async function errorMessage(response: Response) {
  const body = await response.json().catch(() => ({} as ErrorBody));
  return Array.isArray(body.message) ? body.message[0] : body.message ?? 'Something went wrong';
}

async function ensureCsrfToken() {
  if (csrfToken) return;
  const response = await fetch(`${API_URL}/auth/csrf`, { credentials: 'include', cache: 'no-store' });
  if (!response.ok) throw new Error(await errorMessage(response));
  const body = await response.json() as { csrfToken?: string };
  if (!body.csrfToken) throw new Error('Unable to establish a secure session');
  csrfToken = body.csrfToken;
}

async function request<T>(path: string, init: RequestInit = {}, allowRefresh = true): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  if (UNSAFE_METHODS.has(method)) await ensureCsrfToken();

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (csrfToken) headers.set(CSRF_HEADER, csrfToken);

  const response = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: 'include', cache: 'no-store' });
  const canRefresh = path !== '/auth/login' && path !== '/auth/refresh' && path !== '/auth/csrf' && path !== '/auth/logout';
  if (!response.ok) {
    if (response.status === 401 && allowRefresh && canRefresh) {
      try {
        await request<AuthResponse>('/auth/refresh', { method: 'POST' }, false);
        return request<T>(path, init, false);
      } catch {
        // Fall through to the original response so the caller gets a consistent error.
      }
    }
    throw new Error(await errorMessage(response));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  login: (body: { email: string; password: string; portal?: 'admin' | 'employee' }) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request<AuthResponse>('/auth/me'),
  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  refresh: () => request<AuthResponse>('/auth/refresh', { method: 'POST' }),
  sessions: () => request<AuthSession[]>('/auth/sessions'),
  revokeSession: (id: string) => request<{ success: boolean }>(`/auth/sessions/${id}`, { method: 'DELETE' }),
  schedules: (includeInactive = false) => request<WorkSchedule[]>(`/schedules${includeInactive ? '?includeInactive=true' : ''}`),
  createSchedule: (body: Omit<WorkSchedule, 'id' | 'createdAt' | 'updatedAt'>) => request<WorkSchedule>('/schedules', { method: 'POST', body: JSON.stringify(body) }),
  updateSchedule: (id: string, body: Partial<Omit<WorkSchedule, 'id' | 'createdAt' | 'updatedAt'>>) => request<WorkSchedule>(`/schedules/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteSchedule: (id: string) => request<WorkSchedule>(`/schedules/${id}`, { method: 'DELETE' }),
  summary: () => request<DashboardSummary>('/dashboard/summary'),
  attendanceTrend: () => request<{ month: string; attendance: number }[]>('/dashboard/attendance-trend'),
  departmentHeadcount: () => request<{ department: string; count: number }[]>('/dashboard/department-headcount'),
  recentActivity: () => request<DashboardActivity[]>('/dashboard/recent-activity'),
  employees: (params: URLSearchParams) => request<Page<Employee>>(`/employees?${params}`),
  departments: () => request<string[]>('/employees/departments'),
  employee: (id: string) => request<Employee>(`/employees/${id}`),
  compensationHistory: (id: string) => request<CompensationHistory[]>(`/employees/${id}/compensation-history`),
  addCompensationHistory: (id: string, body: { effectiveFrom: string; baseSalary: number; reason?: string }) => request<CompensationHistory>(`/employees/${id}/compensation-history`, { method: 'POST', body: JSON.stringify(body) }),
  updateMyProfile: (body: unknown) => request<Employee>('/employees/me', { method: 'PATCH', body: JSON.stringify(body) }),
  createEmployee: (body: unknown) => request<Employee>('/employees', { method: 'POST', body: JSON.stringify(body) }),
  updateEmployee: (id: string, body: unknown) => request<Employee>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deactivateEmployee: (id: string) => request<{ success: boolean }>(`/employees/${id}`, { method: 'DELETE' }),
  attendance: (params: URLSearchParams) => request<Page<AttendanceRecord>>(`/attendance?${params}`),
  attendanceSummary: (month?: number, year?: number) => request<AttendanceSummary>(`/attendance/summary?month=${month ?? ''}&year=${year ?? ''}`),
  clockIn: () => request<AttendanceRecord>('/attendance/clock-in', { method: 'POST' }),
  clockOut: () => request<AttendanceRecord>('/attendance/clock-out', { method: 'POST' }),
  attendanceCorrections: (status?: AttendanceCorrectionStatus) => request<AttendanceCorrection[]>(`/attendance/corrections${status ? `?status=${status}` : ''}`),
  createAttendanceCorrection: (body: unknown) => request<AttendanceCorrection>('/attendance/corrections', { method: 'POST', body: JSON.stringify(body) }),
  reviewAttendanceCorrection: (id: string, body: unknown) => request<AttendanceCorrection | { request: AttendanceCorrection; attendance: AttendanceRecord }>(`/attendance/corrections/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  createAttendance: (body: unknown) => request<AttendanceRecord>('/attendance', { method: 'POST', body: JSON.stringify(body) }),
  updateAttendance: (id: string, body: unknown) => request<AttendanceRecord>(`/attendance/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  salarySlips: (params: URLSearchParams) => request<Page<SalarySlip>>(`/salary-slips?${params}`),
  employeeSalarySlips: (id: string) => request<SalarySlip[]>(`/employees/${id}/salary-slips`),
  salarySlip: (id: string) => request<SalarySlip>(`/salary-slips/${id}`),
  createSalarySlip: (id: string, body: unknown) => request<SalarySlip>(`/employees/${id}/salary-slips`, { method: 'POST', body: JSON.stringify(body) }),
  updateSalarySlip: (id: string, body: unknown) => request<SalarySlip>(`/salary-slips/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  payrollRuns: () => request<PayrollRun[]>('/payroll-runs'),
  createPayrollRun: (body: { month: number; year: number }) => request<PayrollRun>('/payroll-runs', { method: 'POST', body: JSON.stringify(body) }),
  updatePayrollRunStatus: (id: string, status: PayrollRunStatus) => request<PayrollRun>(`/payroll-runs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  leaveTypes: () => request<LeaveType[]>('/leave-types'),
  leaveRequests: (status?: LeaveRequestStatus) => request<LeaveRequest[]>(`/leave-requests${status ? `?status=${status}` : ''}`),
  createLeaveRequest: (body: unknown) => request<LeaveRequest>('/leave-requests', { method: 'POST', body: JSON.stringify(body) }),
  cancelLeaveRequest: (id: string) => request<LeaveRequest>(`/leave-requests/${id}/cancel`, { method: 'PATCH' }),
  leaveBalances: (year?: number) => request<LeaveBalance[]>(`/leave-balances?year=${year ?? new Date().getFullYear()}`),
  reviewLeaveRequest: (id: string, body: { status: LeaveRequestStatus; reviewNotes?: string }) => request<LeaveRequest>(`/leave-requests/${id}/review`, { method: 'PATCH', body: JSON.stringify(body) }),
  settings: () => request<WorkspaceSettings>('/settings'),
  updateSettings: (body: Partial<Pick<WorkspaceSettings, 'name' | 'timezone' | 'currency' | 'workWeek' | 'shiftStart' | 'shiftEnd' | 'graceMinutes' | 'overtimeAfterMinutes'>>) => request<WorkspaceSettings>('/settings', { method: 'PATCH', body: JSON.stringify(body) }),
  createPasswordResetLink: (id: string) => request<PasswordResetLink>(`/users/${id}/password-reset`, { method: 'POST' }),
  completePasswordReset: (body: { token: string; password: string }) => request<{ success: boolean }>('/auth/password-reset/complete', { method: 'POST', body: JSON.stringify(body) }),
  holidays: (year?: number) => request<Holiday[]>(`/holidays${year ? `?year=${year}` : ''}`),
  createHoliday: (body: { name: string; date: string }) => request<Holiday>('/holidays', { method: 'POST', body: JSON.stringify(body) }),
  deleteHoliday: (id: string) => request<{ success: boolean }>(`/holidays/${id}`, { method: 'DELETE' }),
  users: () => request<User[]>('/users'),
  createUser: (body: unknown) => request<User>('/users', { method: 'POST', body: JSON.stringify(body) }),
  updateUser: (id: string, body: unknown) => request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  updateUserStatus: (id: string, isActive: boolean) => request<User>(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
};

export function updateUser(id: string, body: unknown) { return api.updateUser(id, body); }
export function formatMoney(value: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value); }
