export type BatchId = 'class-10' | 'class-9' | 'class-12' | 'class-8';

export interface Batch {
  id: BatchId;
  name: string;
  grade: string;
  subjects: string;
  timing: string;
  days: string;
  totalStudents: number;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  batchId: BatchId;
  studentPhone: string;
  parentName: string;
  parentPhone: string;
  monthlyFee: number;
  feeStatus: 'paid' | 'pending' | 'overdue';
  pendingAmount: number;
  daysLate: number;
  dueDate: string;
  lastPaymentDate?: string;
  attendancePercent: number;
  recentAttendance: ('P' | 'A' | 'L')[];
}

export type AttendanceStatus = 'P' | 'A' | 'L';

export interface DailyAttendance {
  date: string; // YYYY-MM-DD
  batchId: BatchId;
  records: Record<string, AttendanceStatus>; // studentId -> 'P' | 'A' | 'L'
  savedAt?: string;
  alertsSent?: boolean;
}

export interface TestScore {
  studentId: string;
  score: number;
  remarks?: string;
}

export interface TestItem {
  id: string;
  title: string;
  subject: string;
  batchId: BatchId;
  date: string;
  maxMarks: number;
  scores: Record<string, number>; // studentId -> score
}

export interface ReferralEnquiry {
  id: string;
  parentName: string;
  studentName: string;
  targetClass: string;
  phone: string;
  referredBy: string;
  date: string;
  status: 'new' | 'demo_scheduled' | 'trial_done' | 'enrolled';
  notes: string;
}

export interface TuitionCentreInfo {
  name: string;
  tagline: string;
  ownerName: string;
  phone: string;
  address: string;
  upiId: string;
  upiName: string;
}

export type ActiveTab = 'fees' | 'attendance' | 'tests' | 'parent' | 'owner';
