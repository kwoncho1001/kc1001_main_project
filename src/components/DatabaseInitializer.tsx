import React, { useState } from 'react';
import { Database, Play, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { QuestionService } from '../services/questionService';
import { FirebaseService } from '../services/firebaseService';
import { auth } from '../firebase';
import { HierarchyService } from '../services/hierarchyService';

export const DatabaseInitializer: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInitialize = async () => {
    setStatus('loading');
    setMessage('데이터베이스 초기화 중...');

    try {
      // 0. Bootstrap Teacher
      if (auth.currentUser) {
        setMessage('교사 권한 등록 중...');
        await FirebaseService.saveTeacher(auth.currentUser.uid, auth.currentUser.email || '');
      }

      // 1. Seed Sample Questions
      setMessage('샘플 문항 생성 중...');
      const sampleQuestions = [
        {
          id: 'q1',
          content: 'f(x) = x^2 + 2x + 1 일 때, f\'(1)의 값을 구하시오.',
          answer: '4',
          difficulty: 2,
          fieldId: 'f1',
          subjectId: 's1',
          majorUnitId: 'm1',
          minorUnitId: 'n1',
          tagId: 't1',
          tags: ['미분', '기초'],
          createdAt: Date.now()
        },
        {
          id: 'q2',
          content: '\\int_{0}^{1} (3x^2 + 2x) dx 의 값을 구하시오.',
          answer: '2',
          difficulty: 3,
          fieldId: 'f1',
          subjectId: 's1',
          majorUnitId: 'm1',
          minorUnitId: 'n1',
          tagId: 't2',
          tags: ['적분', '기초'],
          createdAt: Date.now()
        },
        {
          id: 'q3',
          content: '\\lim_{x \\to 0} \\frac{\\sin x}{x} 의 값을 구하시오.',
          answer: '1',
          difficulty: 1,
          fieldId: 'f1',
          subjectId: 's1',
          majorUnitId: 'm1',
          minorUnitId: 'n1',
          tagId: 't3',
          tags: ['극한', '기초'],
          createdAt: Date.now()
        }
      ];

      for (const q of sampleQuestions) {
        await QuestionService.saveQuestion(q);
      }

      setStatus('success');
      setMessage('데이터베이스 초기화가 완료되었습니다. 이제 실제 데이터를 사용할 수 있습니다.');
    } catch (error) {
      console.error('Initialization error:', error);
      setStatus('error');
      setMessage('초기화 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
    }
  };

  return (
    <div className="card p-10 relative overflow-hidden max-w-2xl mx-auto">
      <div className="absolute inset-0 grid-pattern opacity-5"></div>
      <div className="relative z-10 text-center">
        <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20 mx-auto mb-8 shadow-xl">
          <Database size={40} />
        </div>
        <h2 className="text-3xl font-bold heading-tight uppercase mb-4">데이터베이스 초기화</h2>
        <p className="text-muted-foreground font-medium mb-12">
          프로그램을 실제 학원에서 사용하기 위해 필요한 초기 데이터(계통도, 샘플 문항 등)를 데이터베이스에 등록합니다.
        </p>

        {status === 'idle' && (
          <button 
            onClick={handleInitialize}
            className="px-12 py-5 accent-gradient text-white font-bold uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all flex items-center gap-3 mx-auto shadow-xl"
          >
            <Play size={20} fill="currentColor" />
            초기화 시작
          </button>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-2 border-accent/20 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-micro text-accent animate-pulse">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2 border border-green-500/20 shadow-lg">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-lg font-bold text-green-500">{message}</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 text-micro text-muted-foreground hover:text-foreground transition-colors"
            >
              다시 실행하기
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2 border border-red-500/20 shadow-lg">
              <AlertCircle size={32} />
            </div>
            <p className="text-lg font-bold text-red-500">{message}</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 px-10 py-4 card border-border text-micro text-foreground hover:bg-white/5 transition-all"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
