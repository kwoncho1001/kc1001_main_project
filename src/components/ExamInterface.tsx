import React, { useState, useEffect, useRef } from 'react';
import { DigitalLearningCanvas } from './canvas/DigitalLearningCanvas';

interface Problem {
  id: string;
  type: 'multiple' | 'subjective';
  options?: string[];
}

interface Answer {
  problemId: string;
  value: string;
  timeSpent: number;
}

export const ExamInterface: React.FC<{ problems: Problem[] }> = ({ problems }) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [startTime, setStartTime] = useState(Date.now());
  const timerRef = useRef<number>(0);

  const currentProblem = problems[currentProblemIndex];

  useEffect(() => {
    // Record time spent on previous problem when index changes
    const now = Date.now();
    const timeSpent = now - startTime;
    
    setAnswers(prev => ({
      ...prev,
      [problems[currentProblemIndex - 1]?.id]: {
        problemId: problems[currentProblemIndex - 1]?.id,
        value: prev[problems[currentProblemIndex - 1]?.id]?.value || '',
        timeSpent: (prev[problems[currentProblemIndex - 1]?.id]?.timeSpent || 0) + timeSpent
      }
    }));

    setStartTime(now);
  }, [currentProblemIndex]);

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentProblem.id]: {
        ...prev[currentProblem.id],
        problemId: currentProblem.id,
        value,
        timeSpent: prev[currentProblem.id]?.timeSpent || 0
      }
    }));
    localStorage.setItem('exam_answers', JSON.stringify(answers));
  };

  const handleSubmit = () => {
    console.log('Submitting answers:', answers);
    // Add API call here
  };

  return (
    <div className="flex w-full h-screen p-4 gap-4">
      <div className="flex-1 relative">
        <h2 className="text-xl font-bold mb-2">Problem {currentProblemIndex + 1}</h2>
        <div className="w-full h-[calc(100%-40px)] border rounded-xl overflow-hidden shadow-inner bg-gray-50">
          <DigitalLearningCanvas />
        </div>
      </div>
      <div className="w-64 border-l pl-4">
        <h2 className="text-xl font-bold mb-4">Answer Panel</h2>
        {currentProblem.type === 'multiple' ? (
          <div className="flex flex-col gap-2">
            {currentProblem.options?.map(opt => (
              <button 
                key={opt}
                className={`p-2 border rounded ${answers[currentProblem.id]?.value === opt ? 'bg-blue-500 text-white' : ''}`}
                onClick={() => handleAnswerChange(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <input 
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter answer"
            value={answers[currentProblem.id]?.value || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
          />
        )}
        <div className="mt-4 flex gap-2">
          <button disabled={currentProblemIndex === 0} onClick={() => setCurrentProblemIndex(i => i - 1)}>Prev</button>
          <button disabled={currentProblemIndex === problems.length - 1} onClick={() => setCurrentProblemIndex(i => i + 1)}>Next</button>
        </div>
        <button className="mt-4 w-full bg-green-500 text-white p-2 rounded" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};
