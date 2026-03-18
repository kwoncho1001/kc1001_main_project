import { useState } from 'react';
import { PdfService, ReportData } from '../services/pdfService';

export const usePdfGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generates and downloads a PDF report.
   */
  const generateReport = async (data: ReportData) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Simulate a small delay for better user experience
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      PdfService.generateReport(data);
      
      setIsGenerating(false);
      return true;
    } catch (err) {
      console.error('PDF Generation Error:', err);
      setError(err instanceof Error ? err.message : 'PDF 생성 중 오류가 발생했습니다.');
      setIsGenerating(false);
      return false;
    }
  };

  return {
    generateReport,
    isGenerating,
    error
  };
};
