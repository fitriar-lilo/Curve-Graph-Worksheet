import React, { useState } from 'react';
import { IGCSEQuestion } from '../types/math';
import { MathView } from './MathView';
import { CurvePlot } from './CurvePlot';
import { ArrowLeft, ArrowRight, Eye, EyeOff, X, Maximize2, CheckCircle2 } from 'lucide-react';

interface TeacherProjectorModeProps {
  questions: IGCSEQuestion[];
  onClose: () => void;
}

export const TeacherProjectorMode: React.FC<TeacherProjectorModeProps> = ({
  questions,
  onClose,
}) => {
  const [index, setIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const q = questions[index];
  const optionLetters = ['A', 'B', 'C', 'D'] as const;

  const handleNext = () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setShowSolution(false);
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);
      setShowSolution(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-y-auto">
      {/* Top Projector Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="bg-blue-600 text-white font-mono font-bold px-3 py-1 rounded text-sm">
            Question {q.id} of {questions.length}
          </span>
          <span className="text-slate-300 font-mono text-sm hidden sm:inline">
            Topic {q.subtopic}: {q.subtopicTitle}
          </span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">
            {q.difficulty} • {q.category}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowSolution(!showSolution)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              showSolution
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showSolution ? 'Hide Solution' : 'Reveal Answer & Mark Scheme'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Exit Projector Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Projector Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-8 flex flex-col justify-center space-y-6">
        {/* Question Prompt */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="text-xl md:text-2xl font-serif text-slate-100 leading-relaxed">
            <MathView content={q.questionText} className="text-white" />
          </div>

          {/* Diagram if present */}
          {q.diagram && (
            <div className="mt-6 flex justify-center bg-white rounded-xl p-4 w-fit mx-auto shadow-inner">
              <CurvePlot spec={q.diagram} width={420} height={300} />
            </div>
          )}
        </div>

        {/* MCQ Options in Big Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.options.map((option, optIdx) => {
            const isCorrect = optIdx === q.correctIndex;
            return (
              <div
                key={`proj-opt-${optIdx}`}
                className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
                  showSolution && isCorrect
                    ? 'border-emerald-500 bg-emerald-950/60 ring-2 ring-emerald-500 text-white'
                    : 'border-slate-800 bg-slate-900/60 text-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-base shrink-0 border ${
                    showSolution && isCorrect
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {optionLetters[optIdx]}
                </div>
                <div className="text-lg pt-0.5">
                  <MathView content={option} className="text-slate-100" />
                </div>
                {showSolution && isCorrect && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 ml-auto shrink-0 mt-0.5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Revealed Solution & Cambridge Mark Scheme */}
        {showSolution && (
          <div className="bg-emerald-950/70 border border-emerald-500/60 rounded-xl p-5 text-emerald-100 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
              <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-mono text-xs">
                Answer: Option {q.correctLetter}
              </span>
              <span>Cambridge 0580 Mark Scheme: {q.markingGuide}</span>
            </div>
            <div className="text-sm leading-relaxed pl-1 text-emerald-200">
              <span className="font-semibold text-emerald-300">Worked Explanation: </span>
              <MathView content={q.explanation} className="text-emerald-100" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <button
          type="button"
          disabled={index === 0}
          onClick={handlePrev}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous Question
        </button>

        <div className="text-xs font-mono text-slate-400">
          Use buttons or projector view for interactive classroom teaching
        </div>

        <button
          type="button"
          disabled={index === questions.length - 1}
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Next Question
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
