import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  text: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by $$ ... $$ first, then $ ... $
  const blockRegex = /\$\$([\s\S]*?)\$\$/g;
  
  const blocks = text.split(blockRegex);
  
  return (
    <div className={`math-renderer whitespace-pre-wrap ${className}`}>
      {blocks.map((block, i) => {
        // Even indices are text/inline math, odd indices are block math
        if (i % 2 === 1) {
          return <BlockMath key={i} math={block} />;
        }
        
        // Process inline math $ ... $
        const inlineRegex = /\$([\s\S]*?)\$/g;
        const inlines = block.split(inlineRegex);
        
        return (
          <span key={i}>
            {inlines.map((inline, j) => {
              if (j % 2 === 1) {
                return <InlineMath key={j} math={inline} />;
              }
              return <span key={j}>{inline}</span>;
            })}
          </span>
        );
      })}
    </div>
  );
};
