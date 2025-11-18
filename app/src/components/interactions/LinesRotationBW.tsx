import React, { useEffect, useRef } from 'react';

export interface LinesRotationBWConfig {
  gridRowHeight?: number;
  gridColWidth?: number;
  spinSpeed?: number;
  easeOutDelay?: number;
  lineThickness?: number;
  lineColor?: string;
  lineWidth?: number;
  lineHeight?: number;
  backgroundColor?: string;
}

interface LineState {
  currentRotation: number;
  isActive: boolean;
  animationFrameId: number | null;
  lastTime: number;
}

export const LinesRotationBW: React.FC<LinesRotationBWConfig> = ({
  gridRowHeight = 80,
  gridColWidth = 9,
  spinSpeed = 10000,
  easeOutDelay = 2000,
  lineThickness = 1.2,
  lineColor = '#000000',
  lineWidth = 1,
  lineHeight = 45,
  backgroundColor = '#ffffff',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineStatesRef = useRef<Map<HTMLDivElement, LineState>>(new Map());
  const lineTimeoutsRef = useRef<Map<HTMLDivElement, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const gridContainer = containerRef.current;
    if (!gridContainer) return;

    const clearAllLineAnimations = () => {
      lineStatesRef.current.forEach((state) => {
        if (state.animationFrameId) {
          cancelAnimationFrame(state.animationFrameId);
        }
        state.isActive = false;
        state.animationFrameId = null;
      });
      lineTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      lineTimeoutsRef.current.clear();
      lineStatesRef.current.clear();
    };

    const populateGrid = () => {
      clearAllLineAnimations();
      gridContainer.innerHTML = '';

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const rowsThatFit = Math.floor(viewportHeight / gridRowHeight);
      const colsThatFit = Math.ceil(viewportWidth / gridColWidth);

      const numLinesToCreate = rowsThatFit * colsThatFit;

      for (let i = 0; i < numLinesToCreate; i++) {
        const line = document.createElement('div') as HTMLDivElement;
        line.className = 'line';
        
        const before = document.createElement('div');
        before.style.backgroundColor = lineColor;
        before.style.width = `${lineWidth}px`;
        before.style.height = `${lineHeight}px`;
        line.appendChild(before);
        
        gridContainer.appendChild(line);

        const state: LineState = {
          currentRotation: 0,
          isActive: false,
          animationFrameId: null,
          lastTime: performance.now(),
        };
        lineStatesRef.current.set(line, state);

        line.addEventListener('mouseover', () => {
          if (lineTimeoutsRef.current.has(line)) {
            clearTimeout(lineTimeoutsRef.current.get(line)!);
            lineTimeoutsRef.current.delete(line);
          }

          const state = lineStatesRef.current.get(line);
          if (!state || state.isActive) return;

          state.isActive = true;
          state.lastTime = performance.now();
          
          const animateLineSpin = (currentTime: number) => {
            if (!state.isActive) {
              state.animationFrameId = null;
              return;
            }

            const deltaTime = currentTime - state.lastTime;
            state.currentRotation += spinSpeed * (deltaTime / 1000);
            state.currentRotation %= 360;

            line.style.transform = `rotate(${state.currentRotation}deg) scaleX(${lineThickness})`;

            state.lastTime = currentTime;
            state.animationFrameId = requestAnimationFrame(animateLineSpin);
          };
          state.animationFrameId = requestAnimationFrame(animateLineSpin);
        });

        line.addEventListener('mouseout', () => {
          const state = lineStatesRef.current.get(line);
          if (!state || !state.isActive) return;

          state.isActive = false;
          if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
          }

          // Keep the current rotation, then after delay, smoothly return to 0
          const timeoutId = setTimeout(() => {
            line.style.transform = `rotate(0deg) scaleX(${lineThickness})`;
            lineTimeoutsRef.current.delete(line);
          }, easeOutDelay);

          lineTimeoutsRef.current.set(line, timeoutId);
        });
      }
    };

    populateGrid();

    const handleResize = () => {
      setTimeout(populateGrid, 200);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearAllLineAnimations();
      window.removeEventListener('resize', handleResize);
    };
  }, [gridRowHeight, gridColWidth, spinSpeed, easeOutDelay, lineThickness, lineColor, lineWidth, lineHeight]);

  return (
    <div className="w-full h-full" style={{ backgroundColor }}>
      <style>{`
        .line {
          width: 100px;
          height: 100px;
          margin-left: -40px;
          margin-right: -40px;
          margin-top: -10px;
          margin-bottom: -10px;
          transform-origin: center center;
          transition: transform 1s ease-out;
          transform: rotate(0deg) scaleX(${lineThickness});
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
      <div
        ref={containerRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(20px, 1fr))',
          gridTemplateRows: 'repeat(auto-fill, minmax(45px, 1fr))',
          width: '100vw',
          height: '100vh',
          boxSizing: 'border-box',
          padding: '0px',
          overflow: 'hidden',
          marginTop: '-5px',
        }}
      />
    </div>
  );
};

