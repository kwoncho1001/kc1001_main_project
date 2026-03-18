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
    <div className="card p-10 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-5"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
              <Upload size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold heading-tight uppercase">데이터 업로드</h2>
              <p className="text-micro text-muted-foreground">CSV 파일을 통한 데이터베이스 동기화</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setUploadType('TRANSACTION')}
              className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                uploadType === 'TRANSACTION' ? 'bg-accent text-white shadow-lg' : 'bg-background/50 text-muted-foreground border border-border'
              }`}
            >
              학습 로그
            </button>
            <button 
              onClick={() => setUploadType('METADATA')}
              className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                uploadType === 'METADATA' ? 'bg-accent text-white shadow-lg' : 'bg-background/50 text-muted-foreground border border-border'
              }`}
            >
              문항 메타데이터
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={16} className="text-accent" />
              <h3 className="text-micro text-muted-foreground">파일 선택</h3>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`h-64 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                selectedFile ? 'bg-accent/5 border-accent/50 text-accent' : 'bg-background/50 border-border text-muted-foreground hover:border-accent/30'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".csv"
              />
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${selectedFile ? 'bg-accent/10' : 'bg-background/50'}`}>
                <Upload size={32} />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-bold tracking-tight mb-1 text-foreground">
                  {selectedFile ? selectedFile.name : 'CSV 파일을 드래그하거나 클릭하여 선택'}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '최대 10MB 지원'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <Database size={16} className="text-accent" />
              <h3 className="text-micro text-muted-foreground">업로드 상태</h3>
            </div>

            <div className="p-8 bg-background/50 border border-border rounded-[32px] h-48 flex flex-col justify-center">
              {uploadStatus === 'IDLE' && !isUploading && (
                <div className="text-center opacity-40">
                  <Database size={48} className="mx-auto mb-4" />
                  <p className="text-micro">준비 완료</p>
                </div>
              )}

              {isUploading && (
                <div className="text-center text-accent">
                  <Loader2 size={48} className="mx-auto mb-4 animate-spin" />
                  <p className="text-micro">데이터베이스 동기화 중...</p>
                </div>
              )}

              {uploadStatus === 'SUCCESS' && (
                <div className="text-center text-accent">
                  <CheckCircle2 size={48} className="mx-auto mb-4" />
                  <p className="text-micro">업로드 성공</p>
                </div>
              )}

              {uploadStatus === 'ERROR' && (
                <div className="text-center text-red-500">
                  <AlertCircle size={48} className="mx-auto mb-4" />
                  <p className="text-micro">{errorMessage || '업로드 실패'}</p>
                </div>
              )}
            </div>

            <button 
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full py-6 accent-gradient text-white rounded-3xl font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
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
