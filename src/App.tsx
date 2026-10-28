/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { FeesTab } from './components/FeesTab';
import { AttendanceTab } from './components/AttendanceTab';
import { TestsTab } from './components/TestsTab';
import { ParentViewTab } from './components/ParentViewTab';
import { OwnerDashboardTab } from './components/OwnerDashboardTab';
import { PitchPlaybookModal } from './components/PitchPlaybookModal';
import { UpiPaymentModal } from './components/UpiPaymentModal';
import { ActiveTab, Student, DailyAttendance, TestItem, ReferralEnquiry } from './types';
import {
  loadStoredData,
  saveStudents,
  saveTests,
  saveReferrals,
  saveAttendance,
  resetToDefaults,
} from './utils/storage';

export default function App() {
  const [data, setData] = useState(loadStoredData);
  const [activeTab, setActiveTab] = useState<ActiveTab>('fees');
  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [selectedUpiStudent, setSelectedUpiStudent] = useState<Student | null>(null);
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Auto-detect screen width on mount
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobileFrame(false);
    }
  }, []);

  const pendingStudentsCount = data.students.filter(
    (s) => s.feeStatus === 'pending' || s.feeStatus === 'overdue'
  ).length;

  // Mark fee paid handler
  const handleMarkPaid = (studentId: string, amount: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updatedStudents = data.students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          feeStatus: 'paid' as const,
          pendingAmount: 0,
          daysLate: 0,
          lastPaymentDate: todayStr,
        };
      }
      return s;
    });

    setData((prev) => ({
      ...prev,
      students: updatedStudents,
    }));
    saveStudents(updatedStudents);
  };

  // Save attendance handler
  const handleSaveAttendance = (record: DailyAttendance) => {
    const key = `${record.date}_${record.batchId}`;
    const newHistory = {
      ...data.attendanceHistory,
      [key]: record,
    };

    // Update students recent attendance & attendance percentage
    const updatedStudents = data.students.map((s) => {
      const studentStatus = record.records[s.id];
      if (studentStatus && s.batchId === record.batchId) {
        const newRecent = [studentStatus, ...(s.recentAttendance.slice(0, 5))];
        const presentCount = newRecent.filter((x) => x === 'P').length;
        const newPercent = Math.round((presentCount / newRecent.length) * 100);
        return {
          ...s,
          recentAttendance: newRecent,
          attendancePercent: newPercent,
        };
      }
      return s;
    });

    setData((prev) => ({
      ...prev,
      attendanceHistory: newHistory,
      students: updatedStudents,
    }));

    saveAttendance(newHistory);
    saveStudents(updatedStudents);
  };

  // Add new test handler
  const handleAddTest = (newTest: TestItem) => {
    const updatedTests = [...data.tests, newTest];
    setData((prev) => ({
      ...prev,
      tests: updatedTests,
    }));
    saveTests(updatedTests);
  };

  // Add referral enquiry
  const handleAddReferral = (newRef: ReferralEnquiry) => {
    const updatedRefs = [newRef, ...data.referrals];
    setData((prev) => ({
      ...prev,
      referrals: updatedRefs,
    }));
    saveReferrals(updatedRefs);
  };

  // Update referral status
  const handleUpdateReferralStatus = (id: string, status: ReferralEnquiry['status']) => {
    const updatedRefs = data.referrals.map((r) =>
      r.id === id ? { ...r, status } : r
    );
    setData((prev) => ({
      ...prev,
      referrals: updatedRefs,
    }));
    saveReferrals(updatedRefs);
  };

  // Add student
  const handleAddStudent = (newStudent: Student) => {
    const updatedStudents = [...data.students, newStudent];
    setData((prev) => ({
      ...prev,
      students: updatedStudents,
    }));
    saveStudents(updatedStudents);
  };

  // Toggle homework item
  const handleToggleHomework = (hwId: string) => {
    const updatedHw = data.homework.map((hw) =>
      hw.id === hwId ? { ...hw, isDone: !hw.isDone } : hw
    );
    setData((prev) => ({
      ...prev,
      homework: updatedHw,
    }));
  };

  // Reset to default sample data
  const handleResetData = () => {
    if (window.confirm('Reset TuitionDesk to initial sample data?')) {
      resetToDefaults();
      setData(loadStoredData());
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center">
      {/* Container wrapper: either mobile phone bezel frame or expanded layout */}
      <div
        className={`w-full transition-all duration-300 min-h-screen flex flex-col bg-slate-50 relative ${
          isMobileFrame
            ? 'max-w-md shadow-2xl border-x border-slate-300/80 my-0 md:my-4 md:rounded-3xl md:overflow-hidden md:min-h-[844px]'
            : 'max-w-4xl shadow-sm'
        }`}
      >
        {/* App Top Bar */}
        <Header
          centreInfo={data.centreInfo}
          isMobileFrame={isMobileFrame}
          onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
          onOpenPitch={() => setIsPitchOpen(true)}
          onResetData={handleResetData}
        />

        {/* Main Content Area per Tab */}
        <main className="flex-1 p-3.5 sm:p-4 overflow-y-auto">
          {activeTab === 'fees' && (
            <FeesTab
              students={data.students}
              batches={data.batches}
              centreInfo={data.centreInfo}
              onMarkPaid={handleMarkPaid}
              onOpenUpiModal={(student) => setSelectedUpiStudent(student)}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceTab
              batches={data.batches}
              students={data.students}
              centreInfo={data.centreInfo}
              attendanceHistory={data.attendanceHistory}
              onSaveAttendance={handleSaveAttendance}
            />
          )}

          {activeTab === 'tests' && (
            <TestsTab
              tests={data.tests}
              batches={data.batches}
              students={data.students}
              centreInfo={data.centreInfo}
              onAddTest={handleAddTest}
            />
          )}

          {activeTab === 'parent' && (
            <ParentViewTab
              students={data.students}
              batches={data.batches}
              tests={data.tests}
              centreInfo={data.centreInfo}
              homework={data.homework}
              onToggleHomework={handleToggleHomework}
              onOpenUpiModal={(student) => setSelectedUpiStudent(student)}
            />
          )}

          {activeTab === 'owner' && (
            <OwnerDashboardTab
              students={data.students}
              batches={data.batches}
              referrals={data.referrals}
              centreInfo={data.centreInfo}
              onOpenPitch={() => setIsPitchOpen(true)}
              onAddReferral={handleAddReferral}
              onUpdateReferralStatus={handleUpdateReferralStatus}
              onAddStudent={handleAddStudent}
            />
          )}
        </main>

        {/* Fixed Ergonomic 5-Tab Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingFeesCount={pendingStudentsCount}
        />
      </div>

      {/* UPI Payment Modal Sheet */}
      {selectedUpiStudent && (
        <UpiPaymentModal
          isOpen={!!selectedUpiStudent}
          onClose={() => setSelectedUpiStudent(null)}
          studentName={selectedUpiStudent.name}
          amount={
            selectedUpiStudent.pendingAmount > 0
              ? selectedUpiStudent.pendingAmount
              : selectedUpiStudent.monthlyFee
          }
          rollNumber={selectedUpiStudent.rollNumber}
          batchName={
            data.batches.find((b) => b.id === selectedUpiStudent.batchId)?.name ||
            selectedUpiStudent.batchId
          }
          centreInfo={data.centreInfo}
          onPaymentSuccess={(amount) => {
            handleMarkPaid(selectedUpiStudent.id, amount);
          }}
        />
      )}

      {/* Owner Pitch Playbook Modal */}
      <PitchPlaybookModal
        isOpen={isPitchOpen}
        onClose={() => setIsPitchOpen(false)}
      />
    </div>
  );
}
