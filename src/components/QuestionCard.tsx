import React, { useState } from 'react';
import { IGCSEQuestion, QuestionAttemptState } from '../types/math';
import { MathView } from './MathView';
import { CurvePlot } from './CurvePlot';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Award,
} from 'lucide-react';
import { triggerHappyAnimation } from '../utils/confetti';
import { calculateTrialScore } from '../utils/storage';

interface QuestionCardProps {
  question: IGCSEQuestion;
  attemptState?: QuestionAttemptState;
  onAnswerTrial?: (questionId: number, optionIndex: number) => void;
  showSolution?: boolean;
  isPrintMode?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  attemptState,
  onAnswerTrial,
  showSolution = false,
  isPrintMode = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(showSolution);

  const optionLetters = ['A', 'B', 'C', 'D'] as const;

  const difficultyColors = {
    Simple: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Middle: 'bg-amber-50 text-amber-700 border-amber-200',
    Hard: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const attemptsCount = attemptState?.attemptsCount || 0;
  const isCorrect = attemptState?.status === 'correct';
  const isExhausted = attemptState?.status === 'exhausted' || (attemptsCount >= 4 && !isCorrect);
  const score = attemptState?.score || 0;
  const history = attemptState?.history || [];

  const handleOptionClick = (idx: number) => {
    if (isPrintMode || isCorrect || isExhausted) return;

    if (onAnswerTrial) {
      onAnswerTrial(question.id, idx);
      // If this option is correct, trigger happy celebration!
      if (idx === question.correctIndex) {
        triggerHappyAnimation();
      }
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border p-5 shadow-xs transition-all hover:shadow-md print:shadow-none print:border-slate-300 print:p-3 print:mb-4 print:break-inside-avoid relative overflow-hidden ${
        isCorrect
          ? 'border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/20'
          : isExhausted
          ? 'border-rose-300 bg-rose-50/20'
          : question.difficulty === 'Hard'
          ? 'border-slate-200 ring-1 ring-rose-100'
          : 'border-slate-200'
      }`}
      id={`q-${question.id}`}
    >
      {/* Top Question Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-lg font-mono font-bold flex items-center justify-center text-sm print:w-6 print:h-6 print:text-xs transition-colors ${
              isCorrect
                ? 'bg-emerald-600 text-white'
                : isExhausted
                ? 'bg-rose-600 text-white'
                : 'bg-blue-900 text-white'
            }`}
          >
            {question.id}
          </span>
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
            {question.subtopic}
          </span>
          <span className="text-slate-500 hidden sm:inline text-[11px] truncate max-w-xs">
            {question.subtopicTitle}
          </span>
        </div>

        {/* Status / Trial & Score Badge */}
        <div className="flex items-center gap-2">
          {!isPrintMode && (
            <div className="flex items-center gap-1.5 font-mono">
              {isCorrect ? (
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 text-[11px] animate-in zoom-in-95 duration-200">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  +{score.toFixed(1)} Pts (Trial {attemptsCount})
                </span>
              ) : isExhausted ? (
                <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 text-[11px]">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  0 Pts (4 Trials Used)
                </span>
              ) : attemptsCount > 0 ? (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                  Trial {attemptsCount}/4 • Next: {attemptsCount < 2 ? '2.5' : '2.0'} pts
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium">
                  Up to 2.5 Pts
                </span>
              )}
            </div>
          )}

          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[11px] font-medium">
            {question.category}
          </span>
          <span
            className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${
              difficultyColors[question.difficulty]
            }`}
          >
            {question.difficulty}
          </span>
        </div>
      </div>

      {/* Question Content */}
      <div className="space-y-4">
        <div className="text-slate-900 text-base leading-relaxed print:text-sm font-sans">
          <MathView content={question.questionText} />
        </div>

        {/* Diagram if available */}
        {question.diagram && (
          <div className="my-3 flex justify-center print:my-2">
            <CurvePlot spec={question.diagram} width={360} height={260} />
          </div>
        )}

        {/* MCQ Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
          {question.options.map((option, idx) => {
            const isOptionSelected = attemptState?.selectedOption === idx;
            const wasPreviouslyTried = history.includes(idx);
            const isThisOptionCorrect = idx === question.correctIndex;

            let buttonStyles = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

            if (isCorrect && isThisOptionCorrect) {
              buttonStyles = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium ring-2 ring-emerald-400';
            } else if ((isExhausted || showSolution) && isThisOptionCorrect) {
              buttonStyles = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium ring-1 ring-emerald-300';
            } else if (isOptionSelected && !isThisOptionCorrect) {
              buttonStyles = 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-300';
            } else if (wasPreviouslyTried && !isThisOptionCorrect) {
              buttonStyles = 'border-slate-200 bg-slate-100 text-slate-400 opacity-60 line-through';
            }

            return (
              <button
                key={`opt-${idx}`}
                type="button"
                onClick={() => handleOptionClick(idx)}
                disabled={isPrintMode || isCorrect || isExhausted}
                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all text-sm cursor-pointer disabled:cursor-default ${buttonStyles} print:border-slate-300 print:p-2 print:bg-white`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                    (isCorrect || isExhausted || showSolution) && isThisOptionCorrect
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isOptionSelected && !isThisOptionCorrect
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {optionLetters[idx]}
                </div>
                <div className="flex-1 pt-0.5">
                  <MathView content={option} />
                </div>
                {((isCorrect || showSolution) && isThisOptionCorrect) && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 animate-in zoom-in-75" />
                )}
              </button>
            );
          })}
        </div>

        {/* Happy Celebration Notification Banner when student answers correctly */}
        {isCorrect && !isPrintMode && (
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
              <span className="font-bold">
                Brilliant! Correct Answer (Option {question.correctLetter})!
              </span>
              <span className="text-emerald-700">
                You earned <strong>+{score.toFixed(1)} points</strong> on trial {attemptsCount} of 4.
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
              +{score.toFixed(1)} / 2.5 PTS
            </span>
          </div>
        )}

        {/* Feedback message for incorrect attempt */}
        {!isCorrect && attemptsCount > 0 && !isExhausted && !isPrintMode && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Trial {attemptsCount} was not correct. Try another option! You have{' '}
                <strong>{4 - attemptsCount} trials remaining</strong> (Next trial: {attemptsCount < 2 ? '2.5' : '2.0'} pts).
              </span>
            </div>
          </div>
        )}

        {/* Exhausted trials notice */}
        {isExhausted && !isCorrect && !isPrintMode && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                All 4 trials used. The correct answer is <strong>Option {question.correctLetter}</strong> (0 points).
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Teacher / Solution Controls */}
      {!isPrintMode && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-medium transition-colors cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Hide Worked Solution' : 'View Cambridge Worked Solution & Mark Scheme'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {(isCorrect || isExhausted || showSolution) && (
            <span className="text-slate-500 font-mono text-[11px]">
              Key: Option {question.correctLetter}
            </span>
          )}
        </div>
      )}

      {/* Collapsible Worked Solution Box */}
      {(isExpanded || (isPrintMode && showSolution)) && (
        <div className="mt-3 bg-emerald-50/60 border border-emerald-200 rounded-lg p-3.5 text-xs text-emerald-950 space-y-2 print:bg-slate-50 print:border-slate-300 print:text-[11px]">
          <div className="flex items-center gap-2 font-bold text-emerald-900 print:text-slate-900">
            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] uppercase font-mono">
              Key: Option {question.correctLetter}
            </span>
            <span>Cambridge 0580 Mark Scheme: {question.markingGuide}</span>
          </div>

          <div className="leading-relaxed pl-1 text-slate-800">
            <span className="font-semibold text-emerald-900">Step-by-Step Working: </span>
            <MathView content={question.explanation} inline={false} />
          </div>
        </div>
      )}
    </div>
  );
};
