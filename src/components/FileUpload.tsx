import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Database } from 'lucide-react';
import { FileService } from '../services/fileService';

interface FileUploadProps {
  onUploadComplete?: (data: any[], type: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'TRANSACTION' | 'METADATA'>('TRANSACTION');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('IDLE');
      setErrorMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus('IDLE');
    setErrorMessage(null);

    try {
      const csvContent = await FileService.readFile(selectedFile);
      
      let data: any[] = [];
      if (uploadType === 'TRANSACTION') {
        data = FileService.parseCSV(csvContent, FileService.mapToTransactionLog);
      } else {
        data = FileService.parseCSV(csvContent, FileService.mapToProblemMetadata);
      }

      if (data.length === 0) {
        throw new Error('CSV 파일이 비어 있거나 형식이 잘못되었습니다.');
      }

      // Simulate database upload
      await FileService.uploadToDatabase(data, uploadType === 'TRANSACTION' ? 'transaction_logs' : 'problem_metadata');

      setUploadStatus('SUCCESS');
      if (onUploadComplete) onUploadComplete(data, uploadType);
      
      // Reset after success
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload Error:', err);
      setUploadStatus('ERROR');
      setErrorMessage(err instanceof Error ? err.message : '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass p-10 rounded-[48px] relative overflow-hidden">
      <div className="absolute inset-0 apex-grid opacity-5"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-apex-accent/20 flex items-center justify-center text-apex-accent">
              <Upload size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tighter uppercase">데이터 업로드</h2>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">CSV 파일을 통한 데이터베이스 동기화</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setUploadType('TRANSACTION')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                uploadType === 'TRANSACTION' ? 'bg-apex-accent text-apex-black' : 'bg-white/5 text-white/40 border border-white/5'
              }`}
            >
              학습 로그
            </button>
            <button 
              onClick={() => setUploadType('METADATA')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                uploadType === 'METADATA' ? 'bg-apex-accent text-apex-black' : 'bg-white/5 text-white/40 border border-white/5'
              }`}
            >
              문항 메타데이터
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={16} className="text-apex-accent" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">파일 선택</h3>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`h-64 rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                selectedFile ? 'bg-apex-accent/10 border-apex-accent/50 text-apex-accent' : 'bg-white/5 border-white/10 text-white/20 hover:border-white/20'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".csv"
              />
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${selectedFile ? 'bg-apex-accent/20' : 'bg-white/5'}`}>
                <Upload size={32} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold tracking-tight mb-1">
                  {selectedFile ? selectedFile.name : 'CSV 파일을 드래그하거나 클릭하여 선택'}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '최대 10MB 지원'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <Database size={16} className="text-apex-accent" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">업로드 상태</h3>
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] h-48 flex flex-col justify-center">
              {uploadStatus === 'IDLE' && !isUploading && (
                <div className="text-center opacity-40">
                  <Database size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">준비 완료</p>
                </div>
              )}

              {isUploading && (
                <div className="text-center text-apex-accent">
                  <Loader2 size={48} className="mx-auto mb-4 animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">데이터베이스 동기화 중...</p>
                </div>
              )}

              {uploadStatus === 'SUCCESS' && (
                <div className="text-center text-apex-accent">
                  <CheckCircle2 size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">업로드 성공</p>
                </div>
              )}

              {uploadStatus === 'ERROR' && (
                <div className="text-center text-red-500">
                  <AlertCircle size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">{errorMessage || '업로드 실패'}</p>
                </div>
              )}
            </div>

            <button 
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full py-6 bg-white text-apex-black rounded-3xl font-black uppercase tracking-[0.3em] text-xs hover:bg-apex-accent transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
              데이터베이스 업로드 시작
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
