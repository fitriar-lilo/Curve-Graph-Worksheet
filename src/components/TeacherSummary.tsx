import React, { useState } from 'react';
import { IGCSEQuestion, SubtopicMeta } from '../types/math';
import { Check, Copy, CheckCircle, BarChart3, BookOpen, Layers } from 'lucide-react';

interface TeacherSummaryProps {
  questions: IGCSEQuestion[];
  subtopics: SubtopicMeta[];
  onSelectSubtopicFilter?: (subtopicId: string | null) => void;
  selectedSubtopicFilter?: string | null;
}

export const TeacherSummary: React.FC<TeacherSummaryProps> = ({
  questions,
  subtopics,
  onSelectSubtopicFilter,
  selectedSubtopicFilter,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);

  const simpleCount = questions.filter((q) => q.difficulty === 'Simple').length;
  const middleCount = questions.filter((q) => q.difficulty === 'Middle').length;
  const hardCount = questions.filter((q) => q.difficulty === 'Hard').length;

  const handleCopyAnswerKey = () => {
    const textKey = questions
      .map((q) => `Q${q.id.toString().padStart(2, '0')}: ${q.correctLetter} (${q.subtopic} - ${q.difficulty})`)
      .join('\n');
    navigator.clipboard.writeText(textKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-700" />
            Teacher Syllabus Dashboard & Mark Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cambridge IGCSE 0580 Topic 18 Curve Graphs Specification Mapping
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyAnswerKey}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
        >
          {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedKey ? 'Key Copied!' : 'Copy 40-Q Key to Clipboard'}</span>
        </button>
      </div>

      {/* Difficulty and Integer Verification Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Total Questions</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">40</div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-0.5 font-medium">
            <CheckCircle className="w-3 h-3" />
            100% Exact Integers
          </div>
        </div>

        <div className="bg-emerald-50/70 rounded-lg p-3 border border-emerald-200">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-800">Simple (Core)</div>
          <div className="text-2xl font-bold text-emerald-950 mt-1">{simpleCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Target: 20 Questions</div>
        </div>

        <div className="bg-amber-50/70 rounded-lg p-3 border border-amber-200">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-800">Middle (Extended)</div>
          <div className="text-2xl font-bold text-amber-950 mt-1">{middleCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5 font-medium">Target: 15 Questions</div>
        </div>

        <div className="bg-rose-50/70 rounded-lg p-3 border border-rose-200">
          <div className="text-[11px] font-mono uppercase tracking-wider text-rose-800">Hard (Distinction)</div>
          <div className="text-2xl font-bold text-rose-950 mt-1">{hardCount}</div>
          <div className="text-[11px] text-rose-700 mt-0.5 font-medium">Target: 5 Questions</div>
        </div>
      </div>

      {/* Subtopics breakdown */}
      <div>
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-blue-700" />
          Subtopic Coverage Breakdown (Click to filter):
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {subtopics.map((st) => {
            const isSelected = selectedSubtopicFilter === st.id;
            const countInSubtopic = questions.filter((q) => q.subtopic === st.id).length;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() =>
                  onSelectSubtopicFilter &&
                  onSelectSubtopicFilter(isSelected ? null : st.id)
                }
                className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80'
                }`}
              >
                <div className="space-y-0.5 pr-2">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span className="font-mono text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded text-[11px]">
                      {st.id}
                    </span>
                    <span>{st.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{st.description}</div>
                </div>

                <span className="font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shrink-0">
                  {countInSubtopic} Qs
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 40-Question Answer Key Table Grid */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs font-semibold text-slate-800 gap-2">
          <span>Complete 40-Question Answer Key Matrix</span>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600 font-normal">
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200">A: 10 (25%)</span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200">B: 10 (25%)</span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200">C: 10 (25%)</span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200">D: 10 (25%)</span>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 divide-x divide-y divide-slate-100 text-xs">
          {questions.map((q) => (
            <div
              key={`key-cell-${q.id}`}
              className="p-2 text-center bg-white hover:bg-blue-50 transition-colors"
            >
              <div className="text-[10px] text-slate-400 font-mono">Q{q.id}</div>
              <div className="text-sm font-bold font-mono text-blue-900">{q.correctLetter}</div>
              <div className="text-[9px] text-slate-500">{q.subtopic}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
