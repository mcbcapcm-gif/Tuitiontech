import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Check,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
  Send,
  ExternalLink,
} from 'lucide-react';
import { Batch, Student, DailyAttendance, AttendanceStatus, TuitionCentreInfo } from '../types';
import { openWhatsApp, generateAbsentAlertText, copyToClipboard } from '../utils/whatsapp';

interface AttendanceTabProps {
  batches: Batch[];
  students: Student[];
  centreInfo: TuitionCentreInfo;
  attendanceHistory: Record<string, DailyAttendance>;
  onSaveAttendance: (attendance: DailyAttendance) => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  batches,
  students,
  centreInfo,
  attendanceHistory,
  onSaveAttendance,
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || 'class-10');
  
  // Today's date YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const batchStudents = students.filter((s) => s.batchId === selectedBatchId);

  // Key for storage: date_batchId
  const recordKey = `${selectedDate}_${selectedBatchId}`;
  const existingRecord = attendanceHistory[recordKey];

  // Local state for attendance toggles for this batch and date
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>(() => {
    if (existingRecord?.records) {
      return { ...existingRecord.records };
    }
    // Default: all Present
    const map: Record<string, AttendanceStatus> = {};
    batchStudents.forEach((s) => {
      map[s.id] = 'P';
    });
    return map;
  });

  // Track if alerts drawer is open
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [absenteesList, setAbsenteesList] = useState<Student[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Update attendance map if batch changes
  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    const key = `${selectedDate}_${batchId}`;
    const record = attendanceHistory[key];
    const newStudents = students.filter((s) => s.batchId === batchId);

    if (record?.records) {
      setAttendanceMap({ ...record.records });
    } else {
      const map: Record<string, AttendanceStatus> = {};
      newStudents.forEach((s) => {
        map[s.id] = 'P';
      });
      setAttendanceMap(map);
    }
    setSaveSuccessMsg(null);
  };

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    const map: Record<string, AttendanceStatus> = {};
    batchStudents.forEach((s) => {
      map[s.id] = 'P';
    });
    setAttendanceMap(map);
  };

  // Compute present, absent, late counts
  const presentCount = batchStudents.filter((s) => (attendanceMap[s.id] || 'P') === 'P').length;
  const absentCount = batchStudents.filter((s) => attendanceMap[s.id] === 'A').length;
  const lateCount = batchStudents.filter((s) => attendanceMap[s.id] === 'L').length;

  // Save attendance & trigger absent alerts flow
  const handleSaveAndSendAlerts = () => {
    const currentAbsentees = batchStudents.filter((s) => attendanceMap[s.id] === 'A');

    const newRecord: DailyAttendance = {
      date: selectedDate,
      batchId: selectedBatch.id,
      records: attendanceMap,
      savedAt: new Date().toISOString(),
      alertsSent: currentAbsentees.length > 0,
    };

    onSaveAttendance(newRecord);

    if (currentAbsentees.length > 0) {
      setAbsenteesList(currentAbsentees);
      setIsAlertDrawerOpen(true);
      setSaveSuccessMsg(`Saved! ${currentAbsentees.length} absent students detected.`);
    } else {
      setSaveSuccessMsg('Attendance saved successfully! 100% Present today 🎉');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  const handleSendAbsentAlertWhatsApp = (student: Student) => {
    const text = generateAbsentAlertText({
      studentName: student.name,
      parentName: student.parentName,
      batchName: selectedBatch.name,
      date: new Date(selectedDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
      }),
      centreName: centreInfo.name,
      timing: selectedBatch.timing,
    });

    openWhatsApp(student.parentPhone, text);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Date & Batch Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {/* Date Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              {new Date(selectedDate).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            {selectedDate === todayStr && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                Today
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Batch Chips (Horizontal Scrolling) */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {batches.map((batch) => {
            const isSelected = batch.id === selectedBatchId;
            return (
              <button
                key={batch.id}
                onClick={() => handleBatchChange(batch.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[44px] transition-all flex flex-col items-start ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <span>{batch.grade}</span>
                <span
                  className={`text-[10px] font-normal ${
                    isSelected ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {batch.timing}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Batch Attendance Live Counter */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-700 font-medium">
            Total: <strong>{batchStudents.length}</strong>
          </span>
          <span className="text-emerald-700 font-semibold">
            Present: <strong>{presentCount}</strong>
          </span>
          <span className="text-rose-600 font-semibold">
            Absent: <strong>{absentCount}</strong>
          </span>
          {lateCount > 0 && (
            <span className="text-amber-600 font-semibold">
              Late: <strong>{lateCount}</strong>
            </span>
          )}
        </div>

        <button
          onClick={handleMarkAllPresent}
          className="text-emerald-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-emerald-50 transition-colors min-h-[36px]"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark All P</span>
        </button>
      </div>

      {/* Success Notification if any */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Students Attendance Roster */}
      <div className="space-y-2.5">
        {batchStudents.map((student) => {
          const currentStatus = attendanceMap[student.id] || 'P';

          return (
            <div
              key={student.id}
              className={`bg-white p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-xs ${
                currentStatus === 'A'
                  ? 'border-rose-300 bg-rose-50/30'
                  : currentStatus === 'L'
                  ? 'border-amber-300 bg-amber-50/30'
                  : 'border-slate-200'
              }`}
            >
              {/* Student Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {student.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {student.rollNumber}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {student.parentName} · Overall: {student.attendancePercent}%
                </div>
              </div>

              {/* Big Ergonomic P / A / L Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Present Button */}
                <button
                  type="button"
                  onClick={() => setStudentStatus(student.id, 'P')}
                  className={`w-11 h-11 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                    currentStatus === 'P'
                      ? 'bg-emerald-600 text-white shadow-sm scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  aria-label={`Mark ${student.name} Present`}
                >
                  P
                </button>

                {/* Absent Button */}
                <button
                  type="button"
                  onClick={() => setStudentStatus(student.id, 'A')}
                  className={`w-11 h-11 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                    currentStatus === 'A'
                      ? 'bg-rose-600 text-white shadow-sm scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  aria-label={`Mark ${student.name} Absent`}
                >
                  A
                </button>

                {/* Late Button */}
                <button
                  type="button"
                  onClick={() => setStudentStatus(student.id, 'L')}
                  className={`w-11 h-11 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                    currentStatus === 'L'
                      ? 'bg-amber-500 text-white shadow-sm scale-105'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                  aria-label={`Mark ${student.name} Late`}
                >
                  L
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Save Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-xs z-30">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSaveAndSendAlerts}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-[0.99] flex items-center justify-center gap-2 min-h-[48px]"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Save & Send Absent Alert to Parents ({absentCount} Absent)</span>
          </button>
        </div>
      </div>

      {/* Absent Alerts Dispatch Drawer/Modal */}
      {isAlertDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Send Absent Alerts to Parents
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {absenteesList.length} student(s) absent today
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAlertDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <p className="text-xs text-slate-600">
                TuitionDesk generated personalized absent alerts. Tap each parent to send immediately on WhatsApp:
              </p>

              {absenteesList.map((student) => (
                <div
                  key={student.id}
                  className="p-3 bg-white border border-rose-200 rounded-xl space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {student.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Parent: {student.parentName} ({student.parentPhone})
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      Absent
                    </span>
                  </div>

                  {/* Message Preview */}
                  <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 font-mono italic">
                    "⚠️ Attendance Alert: {student.name} was marked ABSENT today ({selectedDate}) for {selectedBatch.name}..."
                  </div>

                  {/* Send WhatsApp Button */}
                  <button
                    onClick={() => handleSendAbsentAlertWhatsApp(student)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>Send WhatsApp Alert</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setIsAlertDrawerOpen(false)}
                className="w-full py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl min-h-[44px]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
