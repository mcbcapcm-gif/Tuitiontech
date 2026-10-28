import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  Share2,
  Plus,
  MessageCircle,
  Users,
  ChevronDown,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { TestItem, Batch, Student, TuitionCentreInfo } from '../types';
import { openWhatsApp, generateTestReportText } from '../utils/whatsapp';

interface TestsTabProps {
  tests: TestItem[];
  batches: Batch[];
  students: Student[];
  centreInfo: TuitionCentreInfo;
  onAddTest: (newTest: TestItem) => void;
}

export const TestsTab: React.FC<TestsTabProps> = ({
  tests,
  batches,
  students,
  centreInfo,
  onAddTest,
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>('class-10');
  
  // Tests belonging to this batch
  const batchTests = tests.filter((t) => t.batchId === selectedBatchId);
  const latestTest = batchTests[batchTests.length - 1] || tests[0];

  const [selectedTestId, setSelectedTestId] = useState<string>(
    latestTest?.id || ''
  );
  const [selectedChartStudentId, setSelectedChartStudentId] = useState<string>('all'); // 'all' for batch avg or studentId

  const [isAddTestOpen, setIsAddTestOpen] = useState(false);

  // Form state for new test
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newMaxMarks, setNewMaxMarks] = useState(50);
  const [newScores, setNewScores] = useState<Record<string, number>>({});

  const batchStudents = students.filter((s) => s.batchId === selectedBatchId);
  const currentTest = tests.find((t) => t.id === selectedTestId) || latestTest;

  // Compute ranks for the current test
  const rankedStudents = batchStudents
    .map((student) => {
      const score = currentTest?.scores?.[student.id] ?? 0;
      return {
        ...student,
        score,
        percentage: currentTest ? Math.round((score / currentTest.maxMarks) * 100) : 0,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const batchAvg =
    rankedStudents.length > 0
      ? rankedStudents.reduce((sum, s) => sum + s.score, 0) / rankedStudents.length
      : 0;

  // Last 6 tests for the bar chart
  const last6Tests = batchTests.slice(-6);

  // Handle WhatsApp Share for a student
  const handleShareWhatsApp = (studentRankItem: typeof rankedStudents[0]) => {
    if (!currentTest) return;
    const batch = batches.find((b) => b.id === selectedBatchId);

    const text = generateTestReportText({
      studentName: studentRankItem.name,
      parentName: studentRankItem.parentName,
      batchName: batch?.name || selectedBatchId,
      testTitle: currentTest.title,
      subject: currentTest.subject,
      score: studentRankItem.score,
      maxMarks: currentTest.maxMarks,
      rank: studentRankItem.rank,
      totalStudents: rankedStudents.length,
      batchAverage: batchAvg,
      centreName: centreInfo.name,
    });

    openWhatsApp(studentRankItem.parentPhone, text);
  };

  // Submit new test
  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTest: TestItem = {
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      batchId: selectedBatchId as any,
      date: new Date().toISOString().split('T')[0],
      maxMarks: Number(newMaxMarks),
      scores: newScores,
    };

    onAddTest(newTest);
    setSelectedTestId(newTest.id);
    setIsAddTestOpen(false);
    setNewTitle('');
    setNewScores({});
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Batch & Action Header */}
      <div className="flex items-center justify-between gap-2">
        {/* Batch Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          {batches.map((batch) => (
            <button
              key={batch.id}
              onClick={() => {
                setSelectedBatchId(batch.id);
                const bTests = tests.filter((t) => t.batchId === batch.id);
                if (bTests.length > 0) {
                  setSelectedTestId(bTests[bTests.length - 1].id);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[36px] transition-colors ${
                selectedBatchId === batch.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {batch.grade}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            // Prep scores default
            const initialMap: Record<string, number> = {};
            batchStudents.forEach((s) => {
              initialMap[s.id] = Math.round(newMaxMarks * 0.8);
            });
            setNewScores(initialMap);
            setIsAddTestOpen(true);
          }}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shrink-0 min-h-[36px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Test</span>
        </button>
      </div>

      {/* Test Selector Dropdown */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            Selected Test Evaluation
          </span>
          <select
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-900 focus:outline-none truncate pr-2 mt-0.5 cursor-pointer"
          >
            {batchTests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.subject} - {t.maxMarks}M)
              </option>
            ))}
          </select>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block">Class Average</span>
          <span className="text-xs font-extrabold text-emerald-700 tabular-nums">
            {batchAvg.toFixed(1)} / {currentTest?.maxMarks || 50}
          </span>
        </div>
      </div>

      {/* 6-TEST PERFORMANCE BAR CHART */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Performance Over Last 6 Tests
              </h3>
            </div>
            <p className="text-[11px] text-slate-500">
              Historical progression & trend analysis
            </p>
          </div>

          {/* Student Filter for Chart */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">View:</span>
            <select
              value={selectedChartStudentId}
              onChange={(e) => setSelectedChartStudentId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="all">Class Average</option>
              {batchStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SVG Bar Chart */}
        <div className="pt-2">
          {last6Tests.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No test history recorded yet for this batch.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-2 items-end h-36 pt-4 pb-2 border-b border-slate-100">
                {last6Tests.map((t, idx) => {
                  let scoreVal = 0;
                  if (selectedChartStudentId === 'all') {
                    // Average score
                    const scoresArray = Object.values(t.scores);
                    scoreVal =
                      scoresArray.length > 0
                        ? scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length
                        : 0;
                  } else {
                    scoreVal = t.scores[selectedChartStudentId] || 0;
                  }

                  const percent = Math.min(
                    100,
                    Math.round((scoreVal / t.maxMarks) * 100)
                  );
                  const isCurrent = t.id === selectedTestId;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTestId(t.id)}
                      className="flex flex-col items-center h-full justify-end group cursor-pointer"
                      title={`${t.title}: ${scoreVal.toFixed(1)} / ${t.maxMarks} (${percent}%)`}
                    >
                      {/* Score Value Tooltip above bar */}
                      <span
                        className={`text-[10px] font-bold tabular-nums mb-1 transition-transform group-hover:-translate-y-0.5 ${
                          isCurrent ? 'text-emerald-700' : 'text-slate-600'
                        }`}
                      >
                        {scoreVal.toFixed(0)}
                      </span>

                      {/* Bar Container */}
                      <div className="w-full bg-slate-100 rounded-t-lg h-24 flex items-end overflow-hidden p-0.5">
                        <div
                          style={{ height: `${percent}%` }}
                          className={`w-full rounded-t-md transition-all duration-500 ${
                            isCurrent
                              ? 'bg-emerald-600 shadow-xs'
                              : percent >= 80
                              ? 'bg-slate-800 group-hover:bg-emerald-500'
                              : 'bg-slate-400 group-hover:bg-slate-600'
                          }`}
                        />
                      </div>

                      {/* Bar Bottom Label */}
                      <span
                        className={`text-[9px] font-semibold mt-1.5 truncate max-w-full text-center ${
                          isCurrent ? 'text-emerald-700 font-bold' : 'text-slate-400'
                        }`}
                      >
                        T{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend & Details */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                <span>T1 to T{last6Tests.length} (Recent Tests)</span>
                <span className="font-medium text-slate-600">
                  {selectedChartStudentId === 'all'
                    ? 'Showing Batch Mean %'
                    : `Showing: ${
                        batchStudents.find((s) => s.id === selectedChartStudentId)?.name
                      }`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ranks & Scoreboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Rankings & Weekly Scoreboard
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            {rankedStudents.length} Students Ranked
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {rankedStudents.map((item) => {
            const isTop3 = item.rank <= 3;
            return (
              <div
                key={item.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                {/* Left: Rank Badge + Student Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 ${
                      item.rank === 1
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : item.rank === 2
                        ? 'bg-slate-200 text-slate-800'
                        : item.rank === 3
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    #{item.rank}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Parent: {item.parentName.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Right: Marks + WhatsApp Share Button */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 tabular-nums">
                      {item.score}
                      <span className="text-[10px] font-normal text-slate-400">
                        /{currentTest?.maxMarks || 50}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold ${
                        item.percentage >= 85
                          ? 'text-emerald-700'
                          : item.percentage >= 70
                          ? 'text-slate-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  </div>

                  {/* WhatsApp Share Report Button */}
                  <button
                    onClick={() => handleShareWhatsApp(item)}
                    className="p-2 sm:px-3 sm:py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 min-h-[38px]"
                    title="Send Report Card to Parent on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Test Modal */}
      {isAddTestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Add New Test & Enter Marks
              </h3>
              <button
                onClick={() => setIsAddTestOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="p-4 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Test Title / Topic
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Test 7: Circles & Surface Areas"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Subject
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={newMaxMarks}
                    onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Enter Marks for each student in batch */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block">
                  Student Marks (out of {newMaxMarks})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {batchStudents.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs"
                    >
                      <span className="font-semibold text-slate-800">{s.name}</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max={newMaxMarks}
                          value={newScores[s.id] ?? ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setNewScores((prev) => ({
                              ...prev,
                              [s.id]: val,
                            }));
                          }}
                          className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold text-xs"
                        />
                        <span className="text-slate-400">/{newMaxMarks}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md min-h-[44px]"
                >
                  Save Test & Calculate Ranks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
