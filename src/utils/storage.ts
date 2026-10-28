import {
  Student,
  Batch,
  TestItem,
  ReferralEnquiry,
  DailyAttendance,
  TuitionCentreInfo,
} from '../types';
import {
  INITIAL_BATCHES,
  INITIAL_STUDENTS,
  INITIAL_TESTS,
  INITIAL_REFERRALS,
  INITIAL_CENTRE_INFO,
  INITIAL_HOMEWORK,
} from '../data/initialData';

const STORAGE_KEYS = {
  STUDENTS: 'tuitiondesk_students_v1',
  BATCHES: 'tuitiondesk_batches_v1',
  TESTS: 'tuitiondesk_tests_v1',
  REFERRALS: 'tuitiondesk_referrals_v1',
  ATTENDANCE: 'tuitiondesk_attendance_v1',
  CENTRE: 'tuitiondesk_centre_v1',
  HOMEWORK: 'tuitiondesk_homework_v1',
};

export function loadStoredData() {
  let students: Student[] = INITIAL_STUDENTS;
  let batches: Batch[] = INITIAL_BATCHES;
  let tests: TestItem[] = INITIAL_TESTS;
  let referrals: ReferralEnquiry[] = INITIAL_REFERRALS;
  let centreInfo: TuitionCentreInfo = INITIAL_CENTRE_INFO;
  let homework = INITIAL_HOMEWORK;
  let attendanceHistory: Record<string, DailyAttendance> = {};

  try {
    const storedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (storedStudents) students = JSON.parse(storedStudents);

    const storedBatches = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (storedBatches) batches = JSON.parse(storedBatches);

    const storedTests = localStorage.getItem(STORAGE_KEYS.TESTS);
    if (storedTests) tests = JSON.parse(storedTests);

    const storedReferrals = localStorage.getItem(STORAGE_KEYS.REFERRALS);
    if (storedReferrals) referrals = JSON.parse(storedReferrals);

    const storedCentre = localStorage.getItem(STORAGE_KEYS.CENTRE);
    if (storedCentre) centreInfo = JSON.parse(storedCentre);

    const storedHomework = localStorage.getItem(STORAGE_KEYS.HOMEWORK);
    if (storedHomework) homework = JSON.parse(storedHomework);

    const storedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (storedAttendance) attendanceHistory = JSON.parse(storedAttendance);
  } catch (e) {
    console.error('Failed to parse stored TuitionDesk data, using initial data', e);
  }

  return {
    students,
    batches,
    tests,
    referrals,
    centreInfo,
    homework,
    attendanceHistory,
  };
}

export function saveStudents(students: Student[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to localStorage', e);
  }
}

export function saveTests(tests: TestItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(tests));
  } catch (e) {
    console.error('Failed to save tests to localStorage', e);
  }
}

export function saveReferrals(referrals: ReferralEnquiry[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals));
  } catch (e) {
    console.error('Failed to save referrals to localStorage', e);
  }
}

export function saveAttendance(attendance: Record<string, DailyAttendance>) {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  } catch (e) {
    console.error('Failed to save attendance to localStorage', e);
  }
}

export function resetToDefaults() {
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.BATCHES);
  localStorage.removeItem(STORAGE_KEYS.TESTS);
  localStorage.removeItem(STORAGE_KEYS.REFERRALS);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.CENTRE);
  localStorage.removeItem(STORAGE_KEYS.HOMEWORK);
}
