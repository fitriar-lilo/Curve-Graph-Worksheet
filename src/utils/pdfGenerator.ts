import { jsPDF } from 'jspdf';
import { IGCSEQuestion, QuestionAttemptState } from '../types/math';

interface GeneratePdfOptions {
  includeSolutions?: boolean;
  studentName?: string;
  className?: string;
  centreNumber?: string;
  candidateNumber?: string;
  attempts?: Record<number, QuestionAttemptState>;
  totalScore?: number;
}

export function generateIgcsePdf(
  questions: IGCSEQuestion[],
  options: GeneratePdfOptions = {}
): void {
  const {
    includeSolutions = false,
    studentName = '',
    className = '',
    centreNumber = '',
    candidateNumber = '',
    attempts = {},
    totalScore = 0,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addNewPage = () => {
    doc.addPage();
    y = margin;
    renderPageHeader();
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 12) {
      addNewPage();
    }
  };

  const renderPageHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Cambridge Assessment International Education — Cambridge IGCSE™ Mathematics 0580', margin, 12);
    doc.text(
      includeSolutions ? 'TEACHER MARK SCHEME & SOLUTIONS' : 'DIGITAL WORKSHEET & STUDENT SUBMISSION',
      pageWidth - margin,
      12,
      { align: 'right' }
    );
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  // --- FIRST PAGE: EXAM COVER HEADER ---
  renderPageHeader();
  y = 22;

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('CAMBRIDGE INTERNATIONAL EXAMINATIONS', pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('International General Certificate of Secondary Education (0580)', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138);
  doc.text('TOPIC 18: CURVE GRAPHS & CALCULUS (18.1 – 18.7)', pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Score & Student Credentials Box
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text('CANDIDATE INFORMATION & ASSESSMENT RECORD', margin + 4, y + 6);

  // Score Badge in Header Box
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(pageWidth - margin - 48, y + 3, 44, 9, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text(`Score: ${totalScore.toFixed(1)} / 100 PTS`, pageWidth - margin - 26, y + 8.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  doc.text(`STUDENT NAME: ${studentName || '_______________________________________'}`, margin + 4, y + 14);
  doc.text(`CLASS / GRADE: ${className || '__________'}`, margin + 105, y + 14);
  doc.text(`CENTRE NUMBER: ${centreNumber || '__________'}`, margin + 4, y + 22);
  doc.text(`CANDIDATE NUMBER: ${candidateNumber || '__________'}`, margin + 55, y + 22);
  doc.text(`TOTAL QUESTIONS: 40 MCQs`, margin + 105, y + 22);

  y += 32;

  // Instructions & Scoring Rules Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 20, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('SCORING MATRIX & INSTRUCTIONS:', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('• 2.5 Points awarded for correct answer on 1st or 2nd trial.', margin + 4, y + 10);
  doc.text('• 2.0 Points awarded for correct answer on 3rd or 4th trial. Max total score = 100 points.', margin + 4, y + 14);
  doc.text('• All values, coordinates, roots, and gradients throughout this worksheet use exact integers.', margin + 4, y + 18);

  y += 24;

  // --- RENDER QUESTIONS ---
  questions.forEach((q) => {
    const attempt = attempts[q.id];
    const userSelectedIdx = attempt?.selectedOption ?? null;
    const isUserCorrect = attempt?.status === 'correct';
    const trialsTaken = attempt?.attemptsCount || 0;
    const earnedScore = attempt?.score || 0;

    // Clean LaTeX syntax for PDF text
    const cleanText = q.questionText
      .replace(/\\\(/g, '')
      .replace(/\\\)/g, '')
      .replace(/\$/g, '')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
      .replace(/\\cdot/g, '·')
      .replace(/\\times/g, '×')
      .replace(/\\pm/g, '±')
      .replace(/\\Delta/g, 'Δ');

    const cleanExplanation = q.explanation
      .replace(/\\\(/g, '')
      .replace(/\\\)/g, '')
      .replace(/\$/g, '')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
      .replace(/\\implies/g, '=>')
      .replace(/\\cdot/g, '·')
      .replace(/\\pm/g, '±');

    // Estimate height
    const qLines = doc.splitTextToSize(cleanText, contentWidth - 14);
    let estimatedH = 12 + qLines.length * 4.5 + 24;
    if (includeSolutions) estimatedH += 22;

    checkPageBreak(estimatedH);

    // Question Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text(`Question ${q.id}  [${q.subtopic}: ${q.subtopicTitle}]`, margin + 2, y + 5);

    // Performance badge on this question
    if (attempt && attempt.attemptsCount > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      if (isUserCorrect) {
        doc.setTextColor(22, 101, 52);
        doc.text(`[✓ Solved in Trial ${trialsTaken}: +${earnedScore.toFixed(1)} pts]`, pageWidth - margin - 2, y + 5, { align: 'right' });
      } else {
        doc.setTextColor(220, 38, 38);
        doc.text(`[✗ 0 pts earned (${trialsTaken} trials)]`, pageWidth - margin - 2, y + 5, { align: 'right' });
      }
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`[${q.difficulty} — Max 2.5 pts]`, pageWidth - margin - 2, y + 5, { align: 'right' });
    }

    y += 10;

    // Question Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(qLines, margin + 4, y);
    y += qLines.length * 4.5 + 3;

    if (q.diagram) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('(Coordinate diagram provided in digital worksheet)', margin + 4, y);
      y += 4.5;
    }

    // Options A, B, C, D in a 2x2 grid
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const colWidth = (contentWidth - 8) / 2;
    const optionLetters = ['A', 'B', 'C', 'D'] as const;

    q.options.forEach((opt, optIdx) => {
      const cleanOpt = opt
        .replace(/\$/g, '')
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
        .replace(/\\cdot/g, '·');

      const col = optIdx % 2;
      const row = Math.floor(optIdx / 2);
      const optX = margin + 4 + col * colWidth;
      const optY = y + row * 6;

      const isKey = optIdx === q.correctIndex;
      const isSelectedByUser = userSelectedIdx === optIdx;

      if ((includeSolutions || isUserCorrect) && isKey) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 101, 52);
        doc.setFillColor(220, 252, 231);
        doc.rect(optX - 1, optY - 3.5, colWidth - 4, 5, 'F');
      } else if (isSelectedByUser && !isKey) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(220, 38, 38);
        doc.setFillColor(254, 226, 226);
        doc.rect(optX - 1, optY - 3.5, colWidth - 4, 5, 'F');
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
      }

      const markSymbol = isSelectedByUser ? (isKey ? ' [✓]' : ' [✗]') : ` [ ${optionLetters[optIdx]} ]`;
      doc.text(`${markSymbol}  ${cleanOpt}`, optX, optY);
    });

    y += 14;

    // Solution details (if teacher mode or solutions included)
    if (includeSolutions) {
      doc.setDrawColor(187, 247, 208);
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin + 3, y - 2, contentWidth - 6, 18, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(22, 101, 52);
      doc.text(`Correct Answer: ${q.correctLetter}   |   ${q.markingGuide}`, margin + 5, y + 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(21, 128, 61);
      const explLines = doc.splitTextToSize(`Working: ${cleanExplanation}`, contentWidth - 14);
      doc.text(explLines, margin + 5, y + 8);

      y += 20;
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  });

  // --- FINAL PAGE: 40-QUESTION COMPLETE ANSWER KEY & RESULTS TABLE ---
  addNewPage();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('IGCSE 0580 TOPIC 18: 40-QUESTION MASTER MATRIX', pageWidth / 2, y, { align: 'center' });
  y += 7;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Fair proportion answer keys (10 A, 10 B, 10 C, 10 D) with student trial records.', pageWidth / 2, y, { align: 'center' });
  y += 9;

  const cols = 4;
  const rows = 10;
  const gridColWidth = contentWidth / cols;
  const startGridY = y;

  for (let c = 0; c < cols; c++) {
    doc.setFillColor(30, 58, 138);
    doc.rect(margin + c * gridColWidth, startGridY, gridColWidth - 2, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Q#   Key   Status / Pts`, margin + c * gridColWidth + 3, startGridY + 4.2);

    for (let r = 0; r < rows; r++) {
      const qNum = c * rows + r + 1;
      const qItem = questions.find((item) => item.id === qNum);
      if (!qItem) continue;

      const attempt = attempts[qItem.id];
      const cellY = startGridY + 7 + r * 6.5;
      const isEven = r % 2 === 0;

      doc.setFillColor(isEven ? 248 : 255, isEven ? 250 : 255, isEven ? 252 : 255);
      doc.rect(margin + c * gridColWidth, cellY - 4.5, gridColWidth - 2, 6.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin + c * gridColWidth, cellY - 4.5, gridColWidth - 2, 6.5, 'S');

      // Question ID
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(`Q${qItem.id}`, margin + c * gridColWidth + 2, cellY);

      // Key Badge
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(margin + c * gridColWidth + 11, cellY - 3.8, 6, 4.8, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52);
      doc.text(qItem.correctLetter, margin + c * gridColWidth + 12.8, cellY);

      // Student performance record
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      if (attempt && attempt.status === 'correct') {
        doc.setTextColor(22, 101, 52);
        doc.text(`+${attempt.score.toFixed(1)}pt (T${attempt.attemptsCount})`, margin + c * gridColWidth + 20, cellY);
      } else if (attempt && attempt.attemptsCount > 0) {
        doc.setTextColor(220, 38, 38);
        doc.text(`0.0pt (T${attempt.attemptsCount})`, margin + c * gridColWidth + 20, cellY);
      } else {
        doc.setTextColor(148, 163, 184);
        doc.text(`Unanswered`, margin + c * gridColWidth + 20, cellY);
      }
    }
  }

  // Page Numbers
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Cambridge IGCSE 0580 • Curve Graphs (Topic 18) • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const filename = includeSolutions
    ? `IGCSE_0580_Topic18_Teacher_Mark_Scheme.pdf`
    : `IGCSE_0580_Topic18_${(studentName || 'Student').replace(/\s+/g, '_')}_Worksheet.pdf`;

  doc.save(filename);
}
