import React, { useEffect, useRef } from 'react';
import {
  getPointerPosition,
  addPointerDownListener,
  addPointerUpListener,
  addPointerMoveListener,
  removePointerDownListener,
  removePointerUpListener,
  removePointerMoveListener,
  addPointerEnterListener,
  addPointerLeaveListener,
} from '../../utils/touchSupport';
import { adjustRadiusGrowthRate } from '../../utils/deviceDetection';

export interface LinesPianoColorConfig {
  gridRowHeight?: number;
  gridColWidth?: number;
  minRadius?: number;
  maxRadius?: number;
  radiusGrowthRate?: number;
  activeColor?: string;
  growingColor?: string;
  lineWidth?: number;
  lineHeight?: number;
  activeWidth?: number;
  backgroundColor?: string;
  growDuration?: number;
  shrinkDuration?: number;
  shrinkDelay?: number;
}

interface LineState {
  lineElement: HTMLDivElement;
  isActive: boolean;
  isGrowing: boolean;
  shouldShrinkAfterGrowth: boolean;
  activationTime: number;
  growTimeout: number | null;
}

export const LinesPianoColor: React.FC<LinesPianoColorConfig> = ({
  gridRowHeight = 45,
  gridColWidth = 20,
  minRadius = 50,
  maxRadius = 500,
  radiusGrowthRate = 100,
  activeColor = '#C880FD',
  growingColor = '#F03D2A',
  lineWidth = 1.2,
  lineHeight = 45,
  activeWidth = 10,
  backgroundColor = '#0E0E0E',
  growDuration = 1000,
  shrinkDuration = 1500,
  shrinkDelay = 1200,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const lineStatesRef = useRef<Map<HTMLDivElement, LineState>>(new Map());
  const lineTimeoutsRef = useRef<Map<HTMLDivElement, number>>(new Map());
  const isMouseDownRef = useRef(false);
  const affectionRadiusRef = useRef(minRadius);
  const radiusGrowthIntervalRef = useRef<number | null>(null);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  const getLineCenter = (line: HTMLDivElement) => {
    const rect = line.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  useEffect(() => {
    const gridContainer = containerRef.current;
    if (!gridContainer) return;

    // Create and inject dynamic CSS styles
    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      document.head.appendChild(styleRef.current);
    }
    
    styleRef.current.textContent = `
      .piano-color-line {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .piano-color-line::before {
        content: '';
        background-color: transparent;
        width: ${lineWidth}px;
        height: ${lineHeight}px;
        transition: width ${shrinkDuration / 1000}s ease-out, background-color ${shrinkDuration / 1000}s linear;
      }

      .piano-color-line.active::before {
        background-color: ${activeColor};
        width: ${activeWidth}px;
        transition: width ${growDuration / 1000}s ease-out, background-color ${shrinkDuration / 1000}s linear;
      }

      .piano-color-line.active.growing::before {
        background-color: ${growingColor};
      }
    `;

    const clearAllLineAnimations = () => {
      lineStatesRef.current.forEach((state) => {
        state.isActive = false;
        state.isGrowing = false;
        state.shouldShrinkAfterGrowth = false;
        if (state.lineElement) {
          state.lineElement.classList.remove('active', 'growing');
        }
      });
      lineTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      lineTimeoutsRef.current.clear();
      lineStatesRef.current.clear();
    };

    const activateLinesInRadius = () => {
      if (!isMouseDownRef.current) return;

      const currentTime = performance.now();

      lineStatesRef.current.forEach((state, line) => {
        const center = getLineCenter(line);
        const distance = getDistance(
          mouseXRef.current,
          mouseYRef.current,
          center.x,
          center.y
        );

        if (distance <= affectionRadiusRef.current) {
          if (!state.isActive) {
            state.isActive = true;
            state.isGrowing = true;
            state.shouldShrinkAfterGrowth = false;
            state.activationTime = currentTime;
            line.classList.add('active');

            if (lineTimeoutsRef.current.has(line)) {
              clearTimeout(lineTimeoutsRef.current.get(line)!);
              lineTimeoutsRef.current.delete(line);
            }

            state.growTimeout = window.setTimeout(() => {
              state.isGrowing = false;
              line.classList.add('growing');

              if (state.shouldShrinkAfterGrowth) {
                state.shouldShrinkAfterGrowth = false;
                const timeoutId = window.setTimeout(() => {
                  line.classList.remove('active', 'growing');
                  state.isActive = false;
                  lineTimeoutsRef.current.delete(line);
                }, shrinkDelay);
                lineTimeoutsRef.current.set(line, timeoutId);
              }
            }, growDuration);
          }
        }
      });
    };

    const populateGrid = () => {
      clearAllLineAnimations();
      gridContainer.innerHTML = '';

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const rowsThatFit = Math.ceil(viewportHeight / gridRowHeight);
      const colsThatFit = Math.ceil(viewportWidth / gridColWidth);
      const numLinesToCreate = rowsThatFit * colsThatFit;

      for (let i = 0; i < numLinesToCreate; i++) {
        const line = document.createElement('div');
        line.className = 'piano-color-line';
        gridContainer.appendChild(line);

        lineStatesRef.current.set(line, {
          lineElement: line,
          isActive: false,
          isGrowing: false,
          shouldShrinkAfterGrowth: false,
          activationTime: 0,
          growTimeout: null,
        });

        const handleLineEnter = () => {
          if (isMouseDownRef.current) return;

          const state = lineStatesRef.current.get(line)!;

          if (state.isGrowing && !state.isActive) {
            return;
          }

          if (lineTimeoutsRef.current.has(line)) {
            clearTimeout(lineTimeoutsRef.current.get(line)!);
            lineTimeoutsRef.current.delete(line);
          }

          if (!state.isActive) {
            state.isActive = true;
            state.isGrowing = true;
            state.shouldShrinkAfterGrowth = false;
            line.classList.add('active');

            setTimeout(() => {
              state.isGrowing = false;
              line.classList.add('growing');

              if (state.shouldShrinkAfterGrowth) {
                state.shouldShrinkAfterGrowth = false;
                const timeoutId = window.setTimeout(() => {
                  line.classList.remove('active', 'growing');
                  state.isActive = false;
                  lineTimeoutsRef.current.delete(line);
                }, shrinkDelay);
                lineTimeoutsRef.current.set(line, timeoutId);
              }
            }, growDuration);
          }
        };

        const handleLineLeave = () => {
          if (isMouseDownRef.current) return;

          const state = lineStatesRef.current.get(line)!;

          if (state.isGrowing) {
            state.shouldShrinkAfterGrowth = true;
            return;
          }

          if (state.isActive) {
            if (lineTimeoutsRef.current.has(line)) {
              clearTimeout(lineTimeoutsRef.current.get(line)!);
              lineTimeoutsRef.current.delete(line);
            }

            const timeoutId = window.setTimeout(() => {
              line.classList.remove('active', 'growing');
              state.isActive = false;
              lineTimeoutsRef.current.delete(line);
            }, shrinkDelay);

            lineTimeoutsRef.current.set(line, timeoutId);
          }
        };

        addPointerEnterListener(line, handleLineEnter);
        addPointerLeaveListener(line, handleLineLeave);
      }
    };

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        e.preventDefault();
      }
      isMouseDownRef.current = true;
      const pos = getPointerPosition(e);
      mouseXRef.current = pos.clientX;
      mouseYRef.current = pos.clientY;
      affectionRadiusRef.current = minRadius;

      activateLinesInRadius();

      const adjustedGrowthRate = adjustRadiusGrowthRate(radiusGrowthRate);
      radiusGrowthIntervalRef.current = window.setInterval(() => {
        if (affectionRadiusRef.current < maxRadius) {
          affectionRadiusRef.current += adjustedGrowthRate / 60;
          activateLinesInRadius();
        }
      }, 1000 / 60);
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      if (radiusGrowthIntervalRef.current) {
        clearInterval(radiusGrowthIntervalRef.current);
        radiusGrowthIntervalRef.current = null;
      }
      affectionRadiusRef.current = minRadius;

      const activeLines: Array<{
        line: HTMLDivElement;
        state: LineState;
        time: number;
      }> = [];
      lineStatesRef.current.forEach((state, line) => {
        if (state.isActive) {
          activeLines.push({ line, state, time: state.activationTime });
        }
      });

      activeLines.sort((a, b) => a.time - b.time);

      activeLines.forEach((item, index) => {
        const { line, state } = item;

        if (state.growTimeout) {
          clearTimeout(state.growTimeout);
          state.growTimeout = null;
        }

        if (lineTimeoutsRef.current.has(line)) {
          clearTimeout(lineTimeoutsRef.current.get(line)!);
          lineTimeoutsRef.current.delete(line);
        }

        const staggerDelay = index * 5;

        const timeoutId = window.setTimeout(() => {
          line.classList.remove('active', 'growing');

          setTimeout(() => {
            state.isActive = false;
            state.isGrowing = false;
            lineTimeoutsRef.current.delete(line);
          }, shrinkDuration);
        }, staggerDelay);

        lineTimeoutsRef.current.set(line, timeoutId);
      });
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && isMouseDownRef.current) {
        e.preventDefault();
      }
      const pos = getPointerPosition(e);
      mouseXRef.current = pos.clientX;
      mouseYRef.current = pos.clientY;

      if (isMouseDownRef.current) {
        activateLinesInRadius();
      }
    };

    const handleResize = () => {
      setTimeout(populateGrid, 200);
    };

    addPointerDownListener(document, handleMouseDown);
    addPointerUpListener(document, handleMouseUp);
    addPointerMoveListener(document, handleMouseMove);
    window.addEventListener('resize', handleResize);

    populateGrid();

    return () => {
      clearAllLineAnimations();
      if (radiusGrowthIntervalRef.current) {
        clearInterval(radiusGrowthIntervalRef.current);
      }
      if (styleRef.current && styleRef.current.parentNode) {
        styleRef.current.parentNode.removeChild(styleRef.current);
        styleRef.current = null;
      }
      removePointerDownListener(document, handleMouseDown);
      removePointerUpListener(document, handleMouseUp);
      removePointerMoveListener(document, handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    gridRowHeight,
    gridColWidth,
    minRadius,
    maxRadius,
    radiusGrowthRate,
    activeColor,
    growingColor,
    lineWidth,
    lineHeight,
    activeWidth,
    growDuration,
    shrinkDuration,
    shrinkDelay,
  ]);

  return (
    <div className="w-full h-full" style={{ backgroundColor }}>
      <div
        ref={containerRef}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, ${gridColWidth}px)`,
          gridTemplateRows: `repeat(auto-fill, ${gridRowHeight}px)`,
          width: '100vw',
          height: '100vh',
          boxSizing: 'border-box',
          padding: '0px',
          overflow: 'hidden',
        }}
      />
    </div>
  );
};

