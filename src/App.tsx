import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { IGCSE_QUESTIONS, SUBTOPICS } from './data/igcseQuestions';
import { ExamHeader } from './components/ExamHeader';
import { QuestionCard } from './components/QuestionCard';
import { TeacherSummary } from './components/TeacherSummary';
import { StudentInteractiveMode } from './components/StudentInteractiveMode';
import { TeacherProjectorMode } from './components/TeacherProjectorMode';
import { PdfExportModal } from './components/PdfExportModal';
import { SubtopicId, DifficultyLevel, QuestionAttemptState, StudentProgress } from './types/math';
import {
  saveStudentProgress,
  loadStudentProgress,
  clearStudentProgress,
  calculateTrialScore,
} from './utils/storage';
import { triggerHappyAnimation } from './utils/confetti';
import {
  FileDown,
  Printer,
  Sparkles,
  Search,
  Filter,
  Eye,
  EyeOff,
  Presentation,
  Play,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Award,
  BookOpen,
  Save,
  CheckCircle2,
  Trophy,
  ArrowDown,
} from 'lucide-react';

export default function App() {
  // Candidate / School info
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('');
  const [centreNumber, setCentreNumber] = useState('');
  const [candidateNumber, setCandidateNumber] = useState('');

  // Mode States
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [showAllSolutions, setShowAllSolutions] = useState(false);
  const [isWorksheetFinished, setIsWorksheetFinished] = useState(false);

  // Student Attempt States per question
  const [attempts, setAttempts] = useState<Record<number, QuestionAttemptState>>({});
  const [lastSavedAt, setLastSavedAt] = useState<string>('');
  const [restoredBanner, setRestoredBanner] = useState<boolean>(false);

  // Filter States
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const saved = loadStudentProgress();
    if (saved) {
      if (saved.studentName) setStudentName(saved.studentName);
      if (saved.className) setClassName(saved.className);
      if (saved.centreNumber) setCentreNumber(saved.centreNumber);
      if (saved.candidateNumber) setCandidateNumber(saved.candidateNumber);
      if (saved.attempts && Object.keys(saved.attempts).length > 0) {
        setAttempts(saved.attempts);
        setRestoredBanner(true);
      }
      if (saved.lastSavedAt) setLastSavedAt(saved.lastSavedAt);
    }
  }, []);

  // 2. Auto-save helper
  const triggerAutoSave = useCallback(
    (newAttempts?: Record<number, QuestionAttemptState>) => {
      const currentAttempts = newAttempts || attempts;
      const progressData: StudentProgress = {
        studentName,
        className,
        candidateNumber,
        centreNumber,
        attempts: currentAttempts,
        lastSavedAt: new Date().toISOString(),
        timeSpentSeconds: 0,
      };
      saveStudentProgress(progressData);
      setLastSavedAt(progressData.lastSavedAt);
    },
    [studentName, className, candidateNumber, centreNumber, attempts]
  );

  // Auto-save when personal details change
  useEffect(() => {
    const timeout = setTimeout(() => {
      triggerAutoSave();
    }, 600);
    return () => clearTimeout(timeout);
  }, [studentName, className, centreNumber, candidateNumber, triggerAutoSave]);

  // 3. Handle Question Attempt (Trial Scoring Logic)
  const handleAnswerTrial = (questionId: number, optionIndex: number) => {
    const question = IGCSE_QUESTIONS.find((q) => q.id === questionId);
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

      // If already correct, do not modify
      if (existing.status === 'correct') return prev;

      const newAttemptsCount = existing.attemptsCount + 1;
      const isCorrect = optionIndex === question.correctIndex;
      const newHistory = [...existing.history, optionIndex];

      let newStatus: QuestionAttemptState['status'] = 'incorrect';
      let earnedScore = 0;

      if (isCorrect) {
        newStatus = 'correct';
        earnedScore = calculateTrialScore(newAttemptsCount);
      } else if (newAttemptsCount >= 4) {
        newStatus = 'exhausted';
        earnedScore = 0;
      }

      const updatedAttempt: QuestionAttemptState = {
        questionId,
        selectedOption: optionIndex,
        attemptsCount: newAttemptsCount,
        status: newStatus,
        score: earnedScore,
        history: newHistory,
      };

      const updatedAttempts = {
        ...prev,
        [questionId]: updatedAttempt,
      };

      // Trigger immediate auto-save
      triggerAutoSave(updatedAttempts);

      return updatedAttempts;
    });
  };

  // 4. Calculate Total Score and Metrics
  const { totalScore, answeredCount, correctCount, trial1Or2Count, trial3Or4Count, exhaustedCount } = useMemo(() => {
    let score = 0;
    let answered = 0;
    let correct = 0;
    let t12 = 0;
    let t34 = 0;
    let exh = 0;

    Object.values(attempts).forEach((att) => {
      score += att.score;
      if (att.attemptsCount > 0) answered++;
      if (att.status === 'correct') {
        correct++;
        if (att.attemptsCount <= 2) t12++;
        else t34++;
      }
      if (att.status === 'exhausted') {
        exh++;
      }
    });

    return {
      totalScore: score,
      answeredCount: answered,
      correctCount: correct,
      trial1Or2Count: t12,
      trial3Or4Count: t34,
      exhaustedCount: exh,
    };
  }, [attempts]);

  const getCambridgeGrade = (pts: number) => {
    if (pts >= 90) return { grade: 'Grade 9 (A*)', desc: 'Outstanding Mastery', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (pts >= 80) return { grade: 'Grade 8 (A)', desc: 'Excellent Understanding', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (pts >= 70) return { grade: 'Grade 7 (A-)', desc: 'Very Good Comprehension', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (pts >= 60) return { grade: 'Grade 6 (B)', desc: 'Solid Extended Level', badge: 'bg-sky-50 text-sky-700 border-sky-200' };
    if (pts >= 50) return { grade: 'Grade 5 (C)', desc: 'Good Core Competence', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { grade: 'Below Grade 5', desc: 'Needs Additional Practice', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const handleFinishWorksheet = () => {
    setIsWorksheetFinished(true);
    triggerHappyAnimation();
    setTimeout(() => {
      const el = document.getElementById('end-of-worksheet-score');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return IGCSE_QUESTIONS.filter((q) => {
      if (selectedSubtopic && q.subtopic !== selectedSubtopic) return false;
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchText = q.questionText.toLowerCase().includes(query);
        const matchSubtopic = q.subtopicTitle.toLowerCase().includes(query);
        const matchCategory = q.category.toLowerCase().includes(query);
        const matchOptions = q.options.some((opt) => opt.toLowerCase().includes(query));
        if (!matchText && !matchSubtopic && !matchCategory && !matchOptions) return false;
      }
      return true;
    });
  }, [selectedSubtopic, selectedDifficulty, searchQuery]);

  const handleResetFilters = () => {
    setSelectedSubtopic(null);
    setSelectedDifficulty('All');
    setSearchQuery('');
  };

  const handleResetProgress = () => {
    clearStudentProgress();
    setAttempts({});
    setRestoredBanner(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans print:bg-white print:p-0">
      {/* Top Navigation Bar (Hidden during print) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white font-serif font-bold text-xl flex items-center justify-center shadow-xs">
              0580
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Cambridge IGCSE™ Mathematics 0580
                </h1>
                <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Topic 18 Curve Graphs
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Digital Worksheet • 40 MCQs • Score: 2.5 pts (Trial 1-2), 2.0 pts (Trial 3-4) • Auto-Saved
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download PDF Button */}
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF File</span>
            </button>

            {/* Print / Save as PDF */}
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Print directly or save as vector PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Vector PDF</span>
            </button>

            {/* Interactive Exam Mode */}
            <button
              type="button"
              onClick={() => setIsInteractiveMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Timed Exam Mode</span>
            </button>

            {/* Projector Mode for Classroom */}
            <button
              type="button"
              onClick={() => setIsProjectorMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Classroom Projector Mode"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Projector</span>
            </button>

            {/* Teacher Master Solution Toggle */}
            <button
              type="button"
              onClick={() => setShowAllSolutions(!showAllSolutions)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                showAllSolutions
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {showAllSolutions ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{showAllSolutions ? 'Hide All Solutions' : 'Show All Solutions'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 print:p-0 print:max-w-none">
        {/* Progress Restored Banner */}
        {restoredBanner && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900 print:hidden animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Welcome back!</strong> Your worksheet progress was automatically restored from your previous session ({answeredCount} questions answered, score: {totalScore.toFixed(1)} / 100 PTS).
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRestoredBanner(false)}
              className="text-emerald-700 hover:text-emerald-950 font-semibold text-xs ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* If Timed Exam Simulator Mode Active */}
        {isInteractiveMode ? (
          <StudentInteractiveMode
            questions={IGCSE_QUESTIONS}
            initialAttempts={attempts}
            onSyncAttempts={(updated) => {
              setAttempts(updated);
              triggerAutoSave(updated);
            }}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onExit={() => setIsInteractiveMode(false)}
          />
        ) : (
          <>
            {/* Cambridge Exam Paper Official Header with Student Name Space */}
            <ExamHeader
              studentName={studentName}
              setStudentName={setStudentName}
              className={className}
              setClassName={setClassName}
              centreNumber={centreNumber}
              setCentreNumber={setCentreNumber}
              candidateNumber={candidateNumber}
              setCandidateNumber={setCandidateNumber}
              totalScore={totalScore}
              answeredCount={answeredCount}
              lastSavedAt={lastSavedAt}
              onResetProgress={handleResetProgress}
              isMarkSchemeMode={showAllSolutions}
            />

            {/* Teacher Dashboard Summary Section (Collapsible/Visible) */}
            <div className="print:hidden">
              <TeacherSummary
                questions={IGCSE_QUESTIONS}
                subtopics={SUBTOPICS}
                selectedSubtopicFilter={selectedSubtopic}
                onSelectSubtopicFilter={setSelectedSubtopic}
              />
            </div>

            {/* Interactive Filters Bar (Screen only) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs print:hidden space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search formula or concept (e.g. bacteria, asymptote, ratio, tangent, dy/dx)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Difficulty Filter */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto text-xs">
                  {(['All', 'Simple', 'Middle', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                        selectedDifficulty === diff
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {diff}
                      {diff === 'All' && ' (40)'}
                      {diff === 'Simple' && ' (20)'}
                      {diff === 'Middle' && ' (15)'}
                      {diff === 'Hard' && ' (5)'}
                    </button>
                  ))}
                </div>

                {/* Reset Filters */}
                {(selectedSubtopic || selectedDifficulty !== 'All' || searchQuery) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-medium px-2 py-1 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Subtopic Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Subtopics:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSubtopic(null)}
                  className={`px-2.5 py-1 rounded-md shrink-0 transition-colors cursor-pointer font-medium ${
                    selectedSubtopic === null
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Subtopics (18.1–18.7)
                </button>
                {SUBTOPICS.map((st) => (
                  <button
                    key={`pill-${st.id}`}
                    type="button"
                    onClick={() => setSelectedSubtopic(selectedSubtopic === st.id ? null : st.id)}
                    className={`px-2.5 py-1 rounded-md shrink-0 transition-colors cursor-pointer font-medium ${
                      selectedSubtopic === st.id
                        ? 'bg-blue-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.id} ({st.totalQuestions})
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Results Counter */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 print:hidden">
              <div>
                Showing <strong className="text-slate-900">{filteredQuestions.length}</strong> of 40 questions
                {selectedSubtopic && <span> • Filtered by Subtopic {selectedSubtopic}</span>}
                {selectedDifficulty !== 'All' && <span> • Difficulty: {selectedDifficulty}</span>}
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  ✓ {correctCount} Correct
                </span>
                <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                  {totalScore.toFixed(1)} / 100 PTS
                </span>
              </div>
            </div>

            {/* Questions Stack */}
            <div className="space-y-4 print:space-y-4">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((question) => (
                  <QuestionCard
                    key={`question-${question.id}`}
                    question={question}
                    attemptState={attempts[question.id]}
                    onAnswerTrial={handleAnswerTrial}
                    showSolution={showAllSolutions}
                  />
                ))
              ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                  <p className="text-slate-500 text-sm">No questions match your current filter criteria.</p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-3 px-4 py-2 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Dedicated End-of-Worksheet Total Score & Grade Section */}
            <div
              id="end-of-worksheet-score"
              className="bg-white rounded-2xl border-2 border-blue-900 shadow-md p-6 sm:p-8 space-y-6 print:border-slate-800 animate-in fade-in"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-blue-900 flex items-center gap-1.5 font-bold">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    CAMBRIDGE IGCSE 0580 • WORKSHEET ASSESSMENT SUMMARY
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">
                    End of Worksheet Score & Performance Record
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Topic 18 Curve Graphs (40 Multiple Choice Questions • 100 Max Points)
                  </p>
                </div>

                {/* Score Pill Header */}
                <div className="flex items-center gap-3 bg-emerald-50 border-2 border-emerald-400 rounded-xl px-5 py-3 shadow-xs">
                  <div>
                    <div className="text-[10px] uppercase font-mono font-bold text-emerald-800">Final Score</div>
                    <div className="text-3xl font-bold font-mono text-emerald-950">
                      {totalScore.toFixed(1)} <span className="text-base text-emerald-700">/ 100</span>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-emerald-200 mx-1" />
                  <div>
                    <div className="text-[10px] uppercase font-mono font-bold text-emerald-800">Cambridge Grade</div>
                    <div className="text-base font-bold text-blue-900">
                      {getCambridgeGrade(totalScore).grade}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px] font-medium uppercase font-mono">Questions Completed</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{answeredCount} / 40</div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {40 - answeredCount === 0 ? 'All 40 Completed!' : `${40 - answeredCount} remaining`}
                  </span>
                </div>

                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                  <span className="text-emerald-800 block text-[11px] font-medium uppercase font-mono">Trial 1–2 Mastery</span>
                  <div className="text-2xl font-bold text-emerald-950 mt-1">{trial1Or2Count} Qs</div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    +{(trial1Or2Count * 2.5).toFixed(1)} pts (2.5 pts each)
                  </span>
                </div>

                <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                  <span className="text-amber-800 block text-[11px] font-medium uppercase font-mono">Trial 3–4 Perseverance</span>
                  <div className="text-2xl font-bold text-amber-950 mt-1">{trial3Or4Count} Qs</div>
                  <span className="text-[11px] text-amber-700 font-medium">
                    +{(trial3Or4Count * 2.0).toFixed(1)} pts (2.0 pts each)
                  </span>
                </div>

                <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
                  <span className="text-blue-800 block text-[11px] font-medium uppercase font-mono">Success Rate</span>
                  <div className="text-2xl font-bold text-blue-950 mt-1">
                    {answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0}%
                  </div>
                  <span className="text-[11px] text-blue-700 font-medium">
                    {correctCount} of 40 Correct
                  </span>
                </div>
              </div>

              {/* Score Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Score Progress ({totalScore.toFixed(1)} / 100 PTS)</span>
                  <span className="font-mono text-blue-900">{totalScore.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-blue-700 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, totalScore))}%` }}
                  />
                </div>
              </div>

              {/* End of Worksheet Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  {!isWorksheetFinished ? (
                    <button
                      type="button"
                      onClick={handleFinishWorksheet}
                      className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Finish & Grade Worksheet</span>
                    </button>
                  ) : (
                    <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Worksheet Finished & Graded!</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsPdfModalOpen(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download Graded PDF File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAllSolutions(!showAllSolutions)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {showAllSolutions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showAllSolutions ? 'Hide Cambridge Solutions' : 'Reveal All 40 Solutions & Mark Schemes'}</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  Cambridge IGCSE 0580 • 100 PTS Scale
                </div>
              </div>
            </div>

            {/* Print Only: Candidate OMR Answer Grid at End of Worksheet */}
            <div className="hidden print:block pt-6 break-before-page">
              <div className="border-2 border-slate-900 rounded-xl p-5">
                <h3 className="text-center font-serif font-bold text-base mb-1">
                  CAMBRIDGE IGCSE MATHEMATICS 0580 — MULTIPLE CHOICE ANSWER SHEET
                </h3>
                <p className="text-center text-xs text-slate-600 mb-4">
                  Fill in one bubble [ A ] [ B ] [ C ] [ D ] for each question.
                </p>

                <div className="grid grid-cols-4 gap-4 text-xs font-mono">
                  {[0, 1, 2, 3].map((colIdx) => (
                    <div key={`omr-col-${colIdx}`} className="space-y-2 border-r border-slate-200 pr-3 last:border-none">
                      {Array.from({ length: 10 }).map((_, rowIdx) => {
                        const qNum = colIdx * 10 + rowIdx + 1;
                        return (
                          <div key={`omr-q-${qNum}`} className="flex items-center justify-between border-b border-slate-100 pb-1">
                            <span className="font-bold text-slate-800">Q{qNum.toString().padStart(2, '0')}:</span>
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <span>( A )</span>
                              <span>( B )</span>
                              <span>( C )</span>
                              <span>( D )</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Floating Quick Score Pill at Bottom of Viewport (Screen only) */}
      {!isInteractiveMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl border border-slate-700 flex items-center gap-2.5 sm:gap-3 text-xs print:hidden animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap">Score: {totalScore.toFixed(1)} / 100 PTS</span>
          </div>

          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 font-mono hidden sm:inline whitespace-nowrap">
            {answeredCount}/40 Answered
          </span>

          <button
            type="button"
            onClick={handleFinishWorksheet}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1 rounded-full transition-all text-[11px] flex items-center gap-1 cursor-pointer active:scale-95 whitespace-nowrap shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Finish & Grade</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-2.5 py-1 rounded-full transition-all text-[11px] flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      )}

      {/* Classroom Projector Mode Modal */}
      {isProjectorMode && (
        <TeacherProjectorMode
          questions={filteredQuestions.length > 0 ? filteredQuestions : IGCSE_QUESTIONS}
          onClose={() => setIsProjectorMode(false)}
        />
      )}

      {/* PDF Export Options Modal */}
      {isPdfModalOpen && (
        <PdfExportModal
          questions={IGCSE_QUESTIONS}
          studentName={studentName}
          setStudentName={setStudentName}
          className={className}
          setClassName={setClassName}
          centreNumber={centreNumber}
          setCentreNumber={setCentreNumber}
          candidateNumber={candidateNumber}
          setCandidateNumber={setCandidateNumber}
          attempts={attempts}
          totalScore={totalScore}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}
    </div>
  );
}
