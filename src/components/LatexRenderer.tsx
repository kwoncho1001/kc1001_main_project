import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ 
  formula, 
  displayMode = false,
  className = ''
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(formula, containerRef.current, {
          throwOnError: false,
          displayMode: displayMode,
          strict: false,
          trust: true
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
      }
    }
  }, [formula, displayMode]);

  return (
    <span 
      ref={containerRef} 
      className={`latex-renderer ${className}`}
    />
  );
};
