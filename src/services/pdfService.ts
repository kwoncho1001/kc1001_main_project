import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ExamScoringResponse } from '../types/ability';
import { QuestionStat } from './examScorerService';

export interface ReportData {
  studentName: string;
  examTitle: string;
  date: string;
  scoring: ExamScoringResponse;
  questionStats: QuestionStat[];
  teacherComment?: string;
}

export class PdfService {
  /**
   * Generates a PDF report for a student's exam performance.
   */
  static generateReport(data: ReportData): void {
    const doc = new jsPDF();
    const { studentName, examTitle, date, scoring, questionStats, teacherComment } = data;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // apex-accent color
    doc.text('학습 성취도 보고서', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`시험명: ${examTitle}`, 20, 40);
    doc.text(`학생명: ${studentName}`, 20, 50);
    doc.text(`일시: ${date}`, 20, 60);

    // Scoring Summary
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('종합 성적', 20, 80);
    
    const summaryData = [
      ['항목', '결과'],
      ['총점', `${scoring.totalScore.toFixed(1)} / 100`],
      ['석차', `${scoring.rank} / ${scoring.totalCandidates}`],
      ['백분위', `${((1 - scoring.rank / scoring.totalCandidates) * 100).toFixed(1)}%`]
    ];

    (doc as any).autoTable({
      startY: 85,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });

    // Question Breakdown
    const lastY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(16);
    doc.text('문항별 분석', 20, lastY + 20);

    const tableHeaders = ['문항 번호', '오답률', '난이도 평가'];
    const tableBody = questionStats.map(stat => [
      stat.questionId,
      `${(stat.errorRate * 100).toFixed(1)}%`,
      stat.errorRate > 0.7 ? '매우 어려움' : stat.errorRate > 0.4 ? '보통' : '쉬움'
    ]);

    (doc as any).autoTable({
      startY: lastY + 25,
      head: [tableHeaders],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    // Teacher Comment
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    if (teacherComment) {
      doc.setFontSize(14);
      doc.text('선생님 의견', 20, finalY + 20);
      doc.setFontSize(12);
      doc.setTextColor(80);
      const splitComment = doc.splitTextToSize(teacherComment, 170);
      doc.text(splitComment, 20, finalY + 30);
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`APEX NETWORK - ${date}`, 105, 285, { align: 'center' });
      doc.text(`페이지 ${i} / ${pageCount}`, 190, 285, { align: 'right' });
    }

    // Save PDF
    doc.save(`${studentName}_${examTitle}_보고서.pdf`);
  }
}
