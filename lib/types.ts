import { z } from 'zod';

export const UserRole = z.enum(['ADMIN', 'HR_MANAGER', 'EMPLOYEE']);
export type UserRole = z.infer<typeof UserRole>;
export const EmploymentStatus = z.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED']);
export type EmploymentStatus = z.infer<typeof EmploymentStatus>;
export const EmploymentType = z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']);
export type EmploymentType = z.infer<typeof EmploymentType>;
export const AttendanceStatus = z.enum(['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'WORK_FROM_HOME']);
export type AttendanceStatus = z.infer<typeof AttendanceStatus>;
export const AttendanceCorrectionStatus = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export type AttendanceCorrectionStatus = z.infer<typeof AttendanceCorrectionStatus>;
export const PaymentStatus = z.enum(['PAID', 'PENDING', 'PROCESSING']);
export type PaymentStatus = z.infer<typeof PaymentStatus>;
export const PayrollRunStatus = z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'PROCESSED', 'PAID']);
export type PayrollRunStatus = z.infer<typeof PayrollRunStatus>;
export const LeaveRequestStatus = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);
export type LeaveRequestStatus = z.infer<typeof LeaveRequestStatus>;

export interface User {
  id: string; name: string; email: string; role: UserRole; employeeId?: string | null;
  isActive: boolean; createdAt: string; updatedAt: string;
  employee?: Pick<Employee, 'id' | 'firstName' | 'lastName' | 'employeeCode' | 'department' | 'designation'> | null;
}
export interface Employee {
  id: string; employeeCode: string; firstName: string; lastName: string; email: string; phone?: string | null;
  avatarUrl?: string | null; department: string; designation: string; employmentType: EmploymentType;
  employmentStatus: EmploymentStatus; joiningDate: string; managerName?: string | null; location?: string | null;
  dateOfBirth?: string | null; address?: string | null; emergencyContactName?: string | null;
  emergencyContactPhone?: string | null; baseSalary: number; createdAt: string; updatedAt: string;
  manager?: Pick<Employee, 'id' | 'employeeCode' | 'firstName' | 'lastName' | 'department' | 'designation'> | null;
  schedule?: WorkSchedule | null;
  user?: User | null;
}
export interface CompensationHistory { id: string; employeeId: string; effectiveFrom: string; baseSalary: number; reason?: string | null; createdAt: string; }
export interface WorkSchedule {
  id: string; name: string; timezone: string; workWeek: string; shiftStart: string; shiftEnd: string;
  graceMinutes: number; overtimeAfterMinutes: number; active: boolean; createdAt?: string; updatedAt?: string;
}
export interface AttendanceRecord {
  id: string; employeeId: string; date: string; checkIn?: string | null; checkOut?: string | null;
  workHours?: number | null; overtimeHours?: number | null; status: AttendanceStatus; notes?: string | null; employee?: Employee;
}
export interface AttendanceSummary {
  month: number; year: number; total: number; expectedWorkingDays?: number; present: number; absent: number; late: number;
  leave: number; workFromHome: number; attendancePercentage: number;
}
export interface AttendanceCorrection {
  id: string; employeeId: string; date: string; checkIn?: string | null; checkOut?: string | null;
  workHours?: number | null; status: AttendanceStatus; reason: string;
  requestStatus: AttendanceCorrectionStatus; reviewNotes?: string | null;
  reviewedById?: string | null; reviewedAt?: string | null; createdAt: string; updatedAt: string;
  employee?: Pick<Employee, 'id' | 'firstName' | 'lastName' | 'employeeCode' | 'department' | 'designation'>;
  reviewedBy?: Pick<User, 'id' | 'name' | 'email'> | null;
}
export interface SalarySlip {
  id: string; employeeId: string; month: number; year: number; basicSalary: number;
  houseRentAllowance: number; transportAllowance: number; performanceBonus: number;
  providentFund: number; professionalTax: number; incomeTax: number; otherDeductions: number;
  grossSalary: number; totalDeductions: number; netSalary: number; paymentStatus: PaymentStatus;
  paymentDate?: string | null; createdAt: string; updatedAt: string; employee?: Employee;
}
export interface PayrollRun {
  id: string; month: number; year: number; status: PayrollRunStatus; totalGross: number;
  totalDeductions: number; totalNet: number; slipCount: number; createdAt: string; updatedAt: string;
  approvedById?: string | null; processedAt?: string | null; paidAt?: string | null;
  createdBy?: Pick<User, 'id' | 'name' | 'email'> | null; approvedBy?: Pick<User, 'id' | 'name' | 'email'> | null;
}
export interface LeaveType { id: string; code: string; name: string; paid: boolean; annualAllowance: number; active: boolean; }
export interface LeaveBalance { id: string; employeeId: string; leaveTypeId: string; year: number; allocated: number; used: number; leaveType: LeaveType; employee?: Pick<Employee, 'id' | 'firstName' | 'lastName' | 'employeeCode'>; }
export interface LeaveRequest { id: string; employeeId: string; leaveTypeId: string; startDate: string; endDate: string; days: number; reason: string; status: LeaveRequestStatus; reviewedById?: string | null; reviewedAt?: string | null; reviewNotes?: string | null; createdAt: string; updatedAt: string; leaveType: Pick<LeaveType, 'id' | 'code' | 'name' | 'paid' | 'annualAllowance'>; employee?: Pick<Employee, 'id' | 'firstName' | 'lastName' | 'employeeCode' | 'department' | 'designation'>; reviewedBy?: Pick<User, 'id' | 'name' | 'email'> | null; }
export interface WorkspaceSettings { id: string; name: string; timezone: string; currency: string; workWeek: string; shiftStart: string; shiftEnd: string; graceMinutes: number; overtimeAfterMinutes: number; createdAt: string; updatedAt: string; }
export interface PasswordResetLink { resetUrl: string; expiresAt: string; }
export interface Holiday { id: string; name: string; date: string; active: boolean; createdAt: string; updatedAt: string; }
export interface DashboardSummary {
  totalEmployees: number; activeEmployees: number; employeesOnLeave: number; expectedWorkingDays?: number; attendancePercentage: number;
  monthlyPayrollTotal: number; pendingPayroll: number;
}
export interface DashboardActivity { id: string; type: string; title: string; description: string; time: string; tone: string; }
export interface AuthResponse { user: User; employee?: Employee | null; }
export interface AuthSession { id: string; userAgent?: string | null; ipAddress?: string | null; createdAt: string; lastUsedAt?: string | null; expiresAt: string; isCurrent: boolean; }

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8), portal: z.enum(['admin', 'employee']).optional() });
export type LoginInput = z.infer<typeof loginSchema>;
export const employeeSchema = z.object({
  firstName: z.string().min(1), lastName: z.string().min(1), email: z.string().email(), phone: z.string().optional(),
  department: z.string().min(1), designation: z.string().min(1), employmentType: EmploymentType,
  employmentStatus: EmploymentStatus, joiningDate: z.string(), managerName: z.string().optional(),
  managerId: z.string().optional(), location: z.string().optional(), dateOfBirth: z.union([z.string(), z.literal('')]).optional(), avatarUrl: z.union([z.string().url(), z.literal('')]).optional(),
  address: z.string().optional(), emergencyContactName: z.string().optional(), emergencyContactPhone: z.string().optional(), scheduleId: z.string().optional(), baseSalary: z.coerce.number().positive(),
});
