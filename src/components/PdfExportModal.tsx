import React, { useState } from 'react';
import { IGCSEQuestion, QuestionAttemptState } from '../types/math';
import { generateIgcsePdf } from '../utils/pdfGenerator';
import { FileText, Download, Printer, CheckCircle, X, Sparkles, Award } from 'lucide-react';

interface PdfExportModalProps {
  questions: IGCSEQuestion[];
  studentName: string;
  setStudentName: (val: string) => void;
  className: string;
  setClassName: (val: string) => void;
  centreNumber: string;
  setCentreNumber: (val: string) => void;
  candidateNumber: string;
  setCandidateNumber: (val: string) => void;
  attempts?: Record<number, QuestionAttemptState>;
  totalScore?: number;
  onClose: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  questions,
  studentName,
  setStudentName,
  className,
  setClassName,
  centreNumber,
  setCentreNumber,
  candidateNumber,
  setCandidateNumber,
  attempts = {},
  totalScore = 0,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownloadStudentPdf = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateIgcsePdf(questions, {
        includeSolutions: false,
        studentName,
        className,
        centreNumber,
        candidateNumber,
        attempts,
        totalScore,
      });
      setIsGenerating(false);
      setDownloadSuccess('Student Question Paper & Submission PDF downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    }, 200);
  };

  const handleDownloadTeacherMarkSchemePdf = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateIgcsePdf(questions, {
        includeSolutions: true,
        studentName,
        className,
        centreNumber,
        candidateNumber,
        attempts,
        totalScore,
      });
      setIsGenerating(false);
      setDownloadSuccess('Teacher Mark Scheme & Solutions PDF downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    }, 200);
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-blue-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg">Download Cambridge 0580 PDF</h3>
              <p className="text-xs text-blue-200 font-sans">
                Topic 18 Curve Graphs (40 Multiple Choice Questions)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Candidate Customization Box */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Candidate Information & Score Record:
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Current Score: {totalScore.toFixed(1)} / 100 PTS
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Class / Grade
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grade 10-A"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Centre Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. ID012"
                  value={centreNumber}
                  onChange={(e) => setCentreNumber(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono uppercase focus:outline-blue-500"
                  maxLength={8}
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Candidate Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0042"
                  value={candidateNumber}
                  onChange={(e) => setCandidateNumber(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono uppercase focus:outline-blue-500"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          {/* Download Options */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Choose PDF Export Format:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Student Question Paper */}
              <button
                type="button"
                onClick={handleDownloadStudentPdf}
                disabled={isGenerating}
                className="flex flex-col text-left p-4 rounded-xl border-2 border-blue-900 bg-blue-50/50 hover:bg-blue-50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Download className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                    STUDENT COPY
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900">
                  Student Question Paper PDF
                </div>
                <div className="text-[11px] text-slate-600 mt-1 leading-normal">
                  Clean 40-question exam booklet with candidate details, instructions, MCQ options, and answer grid.
                </div>
              </button>

              {/* Option 2: Teacher Mark Scheme & Worked Solutions */}
              <button
                type="button"
                onClick={handleDownloadTeacherMarkSchemePdf}
                disabled={isGenerating}
                className="flex flex-col text-left p-4 rounded-xl border-2 border-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <CheckCircle className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    TEACHER COPY
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900">
                  Mark Scheme & Solutions PDF
                </div>
                <div className="text-[11px] text-slate-600 mt-1 leading-normal">
                  Complete teacher master file with answer keys, Cambridge marks (M1, A1, B1), and step-by-step workings.
                </div>
              </button>
            </div>

            {/* Option 3: Browser High-Resolution Vector Print */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBrowserPrint}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print / Save as PDF (Crisp Vector SVG & LaTeX Equations)</span>
              </button>
              <div className="text-[10px] text-center text-slate-500 mt-1">
                Tip: In the print dialog, select "Save as PDF" for crystal-clear vector coordinate graphs.
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Cambridge IGCSE 0580 • 40 Questions
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
