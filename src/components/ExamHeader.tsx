import React, { useState } from 'react';
import { Award, Clock, BookOpen, User, Hash, School, CheckCircle2, RotateCcw } from 'lucide-react';

interface ExamHeaderProps {
  studentName: string;
  setStudentName: (val: string) => void;
  className: string;
  setClassName: (val: string) => void;
  centreNumber: string;
  setCentreNumber: (val: string) => void;
  candidateNumber: string;
  setCandidateNumber: (val: string) => void;
  totalScore: number;
  answeredCount: number;
  lastSavedAt?: string;
  onResetProgress?: () => void;
  isMarkSchemeMode?: boolean;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  studentName,
  setStudentName,
  className,
  setClassName,
  centreNumber,
  setCentreNumber,
  candidateNumber,
  setCandidateNumber,
  totalScore,
  answeredCount,
  lastSavedAt,
  onResetProgress,
  isMarkSchemeMode = false,
}) => {
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const formattedTime = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-sm text-slate-900 mb-6 print:border-slate-800 print:p-4 print:mb-4">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-300 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-900 flex items-center justify-center text-white font-serif font-bold text-2xl shadow-xs print:w-10 print:h-10 print:text-xl shrink-0">
            C
          </div>
          <div>
            <div className="text-[11px] font-mono tracking-widest text-slate-500 uppercase">
              Cambridge Assessment International Education
            </div>
            <h1 className="text-xl font-serif font-bold text-slate-900 tracking-tight print:text-lg">
              Cambridge IGCSE™ Mathematics (0580)
            </h1>
            <div className="text-xs text-blue-900 font-semibold font-sans">
              Digital Worksheet: Topic 18 Curve Graphs (18.1 – 18.7)
            </div>
          </div>
        </div>

        {/* Live Score and Progress Widget */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="bg-emerald-50 text-emerald-950 px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1.5 font-bold shadow-xs">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Score: {totalScore.toFixed(1)} / 100 PTS</span>
          </div>

          <div className="bg-blue-50 text-blue-900 px-3 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5 font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
            <span>{answeredCount} / 40 Answered</span>
          </div>

          {formattedTime && (
            <div className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 text-[11px] print:hidden">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Auto-saved {formattedTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Details Input Space */}
      {!isMarkSchemeMode && (
        <div className="pt-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Student Identification & Class (Auto-saved)
            </span>
            {onResetProgress && (
              <div className="flex items-center gap-1.5 print:hidden">
                {isConfirmingReset ? (
                  <div className="flex items-center gap-1 text-[11px] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg text-rose-800">
                    <span>Reset all progress?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onResetProgress();
                        setIsConfirmingReset(false);
                      }}
                      className="font-bold underline hover:text-rose-950 px-1 cursor-pointer"
                    >
                      Yes, Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingReset(false)}
                      className="text-slate-500 hover:text-slate-700 px-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingReset(true)}
                    className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Worksheet Progress
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4 text-xs">
            {/* Student Name */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none">
              <User className="w-4 h-4 text-blue-800 shrink-0 print:hidden" />
              <div className="w-full">
                <span className="block text-[10px] uppercase font-bold text-slate-500">Student Name</span>
                <input
                  type="text"
                  placeholder="Enter your full name..."
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-900 font-semibold w-full text-xs print:placeholder-transparent"
                />
              </div>
            </div>

            {/* Class / Section */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none">
              <School className="w-4 h-4 text-blue-800 shrink-0 print:hidden" />
              <div className="w-full">
                <span className="block text-[10px] uppercase font-bold text-slate-500">Class / Grade</span>
                <input
                  type="text"
                  placeholder="e.g. Grade 10-A"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-900 font-semibold w-full text-xs print:placeholder-transparent"
                />
              </div>
            </div>

            {/* Centre Number */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none">
              <Hash className="w-4 h-4 text-slate-500 shrink-0 print:hidden" />
              <div className="w-full">
                <span className="block text-[10px] uppercase font-bold text-slate-500">Centre Number</span>
                <input
                  type="text"
                  placeholder="e.g. ID012"
                  value={centreNumber}
                  onChange={(e) => setCentreNumber(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-900 font-semibold font-mono uppercase w-full text-xs print:placeholder-transparent"
                  maxLength={8}
                />
              </div>
            </div>

            {/* Candidate Number */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 print:bg-transparent print:border-b print:border-t-0 print:border-x-0 print:rounded-none">
              <Hash className="w-4 h-4 text-slate-500 shrink-0 print:hidden" />
              <div className="w-full">
                <span className="block text-[10px] uppercase font-bold text-slate-500">Candidate No.</span>
                <input
                  type="text"
                  placeholder="e.g. 0042"
                  value={candidateNumber}
                  onChange={(e) => setCandidateNumber(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-900 font-semibold font-mono uppercase w-full text-xs print:placeholder-transparent"
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions & Scoring Rules Banner */}
      <div className="mt-3 bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs leading-relaxed text-blue-950 print:bg-slate-50 print:text-[10px] print:p-2">
        <span className="font-bold text-blue-900">SCORING & INSTRUCTIONS: </span>
        Total marks = 100 points (40 questions).
        <strong className="text-emerald-800"> 2.5 points </strong> for correct answer in Trial 1 or Trial 2;
        <strong className="text-amber-800"> 2.0 points </strong> for correct answer in Trial 3 or Trial 4.
        All answers and work auto-save instantly — you can exit and continue anytime.
      </div>
    </div>
  );
};
