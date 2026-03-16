/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { ExamInterface } from './components/ExamInterface';

const problems = [
  { id: 'p1', type: 'multiple', options: ['A', 'B', 'C', 'D'] },
  { id: 'p2', type: 'subjective' },
];

export default function App() {
  return (
    <div className="w-screen h-screen">
      <ExamInterface problems={problems as any} />
    </div>
  );
}
