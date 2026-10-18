import React, { useState, useEffect } from 'react';
import { IGCSEQuestion, QuestionAttemptState } from '../types/math';
import { QuestionCard } from './QuestionCard';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  RotateCcw,
  Trophy,
  Award,
  FileDown,
  Sparkles,
  BarChart,
} from 'lucide-react';
import { calculateTrialScore } from '../utils/storage';
import { triggerHappyAnimation } from '../utils/confetti';

interface StudentInteractiveModeProps {
  questions: IGCSEQuestion[];
  initialAttempts?: Record<number, QuestionAttemptState>;
  onSyncAttempts?: (attempts: Record<number, QuestionAttemptState>) => void;
  onOpenPdfModal?: () => void;
  onExit: () => void;
}

export const StudentInteractiveMode: React.FC<StudentInteractiveModeProps> = ({
  questions,
  initialAttempts = {},
  onSyncAttempts,
  onOpenPdfModal,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState<Record<number, QuestionAttemptState>>(initialAttempts);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(75 * 60); // 1 hour 15 minutes
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sync if initial attempts change from outside
  useEffect(() => {
    if (initialAttempts && Object.keys(initialAttempts).length > 0) {
      setAttempts((prev) => ({
        ...initialAttempts,
        ...prev,
      }));
    }
  }, [initialAttempts]);

  useEffect(() => {
    if (!isTimerActive || isSubmitted || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive, isSubmitted, secondsLeft]);

  const currentQ = questions[currentIndex];

  const handleAnswerTrial = (questionId: number, optIndex: number) => {
    if (isSubmitted) return;
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    setAttempts((prev) => {
      const existing = prev[questionId] || {
        questionId,
        selectedOption: null,
        attemptsCount: 0,
        status: 'unanswered',
        score: 0,
        history: [],
      };

      if (existing.status === 'correct') return prev;

      const newAttemptsCount = existing.attemptsCount + 1;
      const isCorrect = optIndex === question.correctIndex;
      const newHistory = [...existing.history, optIndex];

      let newStatus: QuestionAttemptState['status'] = 'incorrect';
      let earnedScore = 0;

      if (isCorrect) {
        newStatus = 'correct';
        earnedScore = calculateTrialScore(newAttemptsCount);
      } else if (newAttemptsCount >= 4) {
        newStatus = 'exhausted';
        earnedScore = 0;
      }

      const updated = {
        ...prev,
        [questionId]: {
          questionId,
          selectedOption: optIndex,
          attemptsCount: newAttemptsCount,
          status: newStatus,
          score: earnedScore,
          history: newHistory,
        },
      };

      if (onSyncAttempts) {
        onSyncAttempts(updated);
      }

      return updated;
    });
  };

  const handleFinishAndGrade = () => {
    setIsSubmitted(true);
    setIsTimerActive(false);
    triggerHappyAnimation();
  };

  const toggleFlag = (qId: number) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate scores
  let totalScore = 0;
  let correctCount = 0;
  let answeredCount = 0;
  let trial1Or2Count = 0;
  let trial3Or4Count = 0;

  questions.forEach((q) => {
    const att = attempts[q.id];
    if (att) {
      if (att.attemptsCount > 0) answeredCount++;
      if (att.status === 'correct') {
        correctCount++;
        if (att.attemptsCount <= 2) trial1Or2Count++;
        else trial3Or4Count++;
      }
      totalScore += att.score;
    }
  });

  const getGrade = (pts: number) => {
    if (pts >= 90) return { grade: 'Grade 9 (A*)', desc: 'Outstanding Mastery', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (pts >= 80) return { grade: 'Grade 8 (A)', desc: 'Excellent Understanding', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (pts >= 70) return { grade: 'Grade 7 (A-)', desc: 'Very Good Comprehension', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (pts >= 60) return { grade: 'Grade 6 (B)', desc: 'Solid Extended Level', color: 'text-sky-700 bg-sky-50 border-sky-200' };
    if (pts >= 50) return { grade: 'Grade 5 (C)', desc: 'Good Core Competence', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { grade: 'Below Grade 5', desc: 'Needs Additional Practice', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  return (
    <div className="space-y-6">
      {/* Top Test Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit to Digital Worksheet
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-3 py-1 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Score: {totalScore.toFixed(1)} / 100 PTS</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-semibold text-slate-800">
            <Clock className="w-4 h-4 text-blue-700" />
            <span>{formatTime(secondsLeft)}</span>
          </div>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleFinishAndGrade}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-all shadow-sm hover:shadow cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Finish & Grade Exam</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {onOpenPdfModal && (
                <button
                  type="button"
                  onClick={onOpenPdfModal}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download Graded PDF</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setAttempts({});
                  setFlaggedQuestions({});
                  setIsSubmitted(false);
                  setSecondsLeft(75 * 60);
                  setIsTimerActive(true);
                  setCurrentIndex(0);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Exam
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submitted Results Banner */}
      {isSubmitted && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-800 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 flex items-center justify-center md:justify-start gap-1.5 font-bold">
                <Trophy className="w-4 h-4 text-amber-300" />
                OFFICIAL ASSESSMENT RESULT
              </div>
              <h3 className="text-3xl font-bold font-serif tracking-tight">
                Total Score: <span className="text-emerald-400">{totalScore.toFixed(1)}</span> / 100 PTS
              </h3>
              <p className="text-xs text-blue-200 max-w-md">
                You correctly answered <strong>{correctCount} of 40</strong> questions.
                ({trial1Or2Count} solved in Trial 1–2 for 2.5 pts each; {trial3Or4Count} solved in Trial 3–4 for 2.0 pts each).
              </p>

              {onOpenPdfModal && (
                <div className="pt-2 flex justify-center md:justify-start">
                  <button
                    type="button"
                    onClick={onOpenPdfModal}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
                  >
                    <FileDown className="w-4 h-4 text-slate-950" />
                    Download Graded PDF Assessment Paper
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-center">
              <div className="bg-white/10 rounded-2xl px-5 py-3.5 backdrop-blur-md border border-white/20 shadow-inner">
                <div className="text-[11px] text-blue-200 uppercase font-mono tracking-wider">Marks %</div>
                <div className="text-3xl font-bold font-mono mt-0.5">{totalScore.toFixed(1)}%</div>
                <div className="text-[11px] text-emerald-300 font-medium">{correctCount}/40 Correct</div>
              </div>

              <div className="bg-white rounded-2xl px-5 py-3.5 text-slate-900 shadow-xl border border-slate-100">
                <div className="text-[11px] text-slate-500 uppercase font-mono tracking-wider">Cambridge Grade</div>
                <div className="text-2xl font-bold text-blue-900 mt-0.5">{getGrade(totalScore).grade}</div>
                <div className="text-[11px] text-slate-500 font-medium">{getGrade(totalScore).desc}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Single Question View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <QuestionCard
            question={currentQ}
            attemptState={attempts[currentQ.id]}
            onAnswerTrial={handleAnswerTrial}
            showSolution={isSubmitted}
          />

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              type="button"
              onClick={() => toggleFlag(currentQ.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                flaggedQuestions[currentQ.id]
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${flaggedQuestions[currentQ.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{flaggedQuestions[currentQ.id] ? 'Flagged for Review' : 'Flag Question'}</span>
            </button>

            <button
              type="button"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Question Navigator */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Question Navigator (40)
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {answeredCount} / 40 Answered
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const att = attempts[q.id];
              const isAnswered = att && att.attemptsCount > 0;
              const isFlagged = flaggedQuestions[q.id];
              const isCorrect = att?.status === 'correct';
              const isWrong = att?.status === 'exhausted' || (isSubmitted && isAnswered && !isCorrect);

              let btnClass = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
              if (isCorrect) {
                btnClass = 'bg-emerald-500 text-white border-emerald-600 font-bold';
              } else if (isWrong) {
                btnClass = 'bg-rose-500 text-white border-rose-600 font-bold';
              } else if (isAnswered) {
                btnClass = 'bg-blue-900 text-white border-blue-900';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative h-8 rounded text-xs font-mono font-semibold border flex items-center justify-center transition-all cursor-pointer ${btnClass} ${
                    isCurrent ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                  }`}
                >
                  {q.id}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-1 ring-white" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-3 text-[11px] space-y-1.5 text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
              <span>Correct (+2.5 or +2.0 pts)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-900 shrink-0" />
              <span>In Progress / Trials</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 shrink-0" />
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
