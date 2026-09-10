import { z } from 'zod';

export const UserRole = z.enum(['ADMIN', 'HR_MANAGER', 'EMPLOYEE']);
export type UserRole = z.infer<typeof UserRole>;
export const EmploymentStatus = z.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED']);
export type EmploymentStatus = z.infer<typeof EmploymentStatus>;
export const EmploymentType = z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']);
export type EmploymentType = z.infer<typeof EmploymentType>;
export const AttendanceStatus = z.enum(['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'WORK_FROM_HOME']);
export type AttendanceStatus = z.infer<typeof AttendanceStatus>;
export const PaymentStatus = z.enum(['PAID', 'PENDING', 'PROCESSING']);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

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
  user?: User | null;
}
export interface AttendanceRecord {
  id: string; employeeId: string; date: string; checkIn?: string | null; checkOut?: string | null;
  workHours?: number | null; status: AttendanceStatus; notes?: string | null; employee?: Employee;
}
export interface SalarySlip {
  id: string; employeeId: string; month: number; year: number; basicSalary: number;
  houseRentAllowance: number; transportAllowance: number; performanceBonus: number;
  providentFund: number; professionalTax: number; incomeTax: number; otherDeductions: number;
  grossSalary: number; totalDeductions: number; netSalary: number; paymentStatus: PaymentStatus;
  paymentDate?: string | null; createdAt: string; updatedAt: string; employee?: Employee;
}
export interface DashboardSummary {
  totalEmployees: number; activeEmployees: number; employeesOnLeave: number; attendancePercentage: number;
  monthlyPayrollTotal: number; pendingPayroll: number;
}
export interface DashboardActivity { id: string; type: string; title: string; description: string; time: string; tone: string; }
export interface AuthResponse { user: User; employee?: Employee | null; }

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8), portal: z.enum(['admin', 'employee']).optional() });
export type LoginInput = z.infer<typeof loginSchema>;
export const employeeSchema = z.object({
  firstName: z.string().min(1), lastName: z.string().min(1), email: z.string().email(), phone: z.string().optional(),
  department: z.string().min(1), designation: z.string().min(1), employmentType: EmploymentType,
  employmentStatus: EmploymentStatus, joiningDate: z.string(), managerName: z.string().optional(),
  location: z.string().optional(), baseSalary: z.coerce.number().positive(),
});
