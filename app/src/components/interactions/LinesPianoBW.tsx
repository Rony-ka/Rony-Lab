import React, { useEffect, useRef } from 'react';

export interface LinesPianoBWConfig {
  gridRowHeight?: number;
  gridColWidth?: number;
  growDuration?: number;
  shrinkDelay?: number;
  initialScaleX?: number;
  targetScaleX?: number;
  minRadius?: number;
  maxRadius?: number;
  radiusGrowthRate?: number;
  lineColor?: string;
  lineWidth?: number;
  lineHeight?: number;
  backgroundColor?: string;
}

interface LineState {
  lineElement: HTMLDivElement;
  currentScaleX: number;
  isActive: boolean;
  isGrowing: boolean;
  shouldShrinkAfterGrowth: boolean;
  animationFrameId: number | null;
  startTime: number;
  startScaleX: number;
  endScaleX: number;
  activationTime: number;
}

export const LinesPianoBW: React.FC<LinesPianoBWConfig> = ({
  gridRowHeight = 45,
  gridColWidth = 20,
  growDuration = 500,
  shrinkDelay = 1200,
  initialScaleX = 1.2,
  targetScaleX = 10,
  minRadius = 50,
  maxRadius = 500,
  radiusGrowthRate = 100,
  lineColor = '#000000',
  lineWidth = 1,
  lineHeight = 45,
  backgroundColor = '#ffffff',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineStatesRef = useRef<Map<HTMLDivElement, LineState>>(new Map());
  const lineTimeoutsRef = useRef<Map<HTMLDivElement, number>>(new Map());
  const isMouseDownRef = useRef(false);
  const affectionRadiusRef = useRef(minRadius);
  const radiusGrowthIntervalRef = useRef<number | null>(null);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  const easeOutQuad = (t: number) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

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

    const clearAllLineAnimations = () => {
      lineStatesRef.current.forEach((state) => {
        if (state.animationFrameId) {
          cancelAnimationFrame(state.animationFrameId);
        }
        state.isActive = false;
        state.isGrowing = false;
        state.shouldShrinkAfterGrowth = false;
        state.animationFrameId = null;
        if (state.lineElement) {
          state.lineElement.style.setProperty('--line-width-scale', `${initialScaleX}`);
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
            state.startTime = currentTime;
            state.startScaleX = state.currentScaleX;
            state.endScaleX = targetScaleX;

            if (lineTimeoutsRef.current.has(line)) {
              clearTimeout(lineTimeoutsRef.current.get(line)!);
              lineTimeoutsRef.current.delete(line);
            }

            const animateGrowth = (time: number) => {
              if (!state.isActive || !state.isGrowing) {
                state.animationFrameId = null;
                return;
              }

              const elapsed = time - state.startTime;
              let progress = Math.min(elapsed / growDuration, 1);
              progress = easeOutQuad(progress);

              state.currentScaleX =
                state.startScaleX + (state.endScaleX - state.startScaleX) * progress;
              state.lineElement.style.setProperty('--line-width-scale', `${state.currentScaleX}`);

              if (progress < 1) {
                state.animationFrameId = requestAnimationFrame(animateGrowth);
              } else {
                state.animationFrameId = null;
                state.isGrowing = false;

                if (state.shouldShrinkAfterGrowth) {
                  state.shouldShrinkAfterGrowth = false;
                  state.startTime = performance.now();
                  state.startScaleX = state.currentScaleX;
                  state.endScaleX = initialScaleX;

                  const animateShrinkNow = (time: number) => {
                    const elapsed = time - state.startTime;
                    let progress = Math.min(elapsed / shrinkDelay, 1);
                    progress = easeOutQuad(progress);

                    state.currentScaleX =
                      state.startScaleX + (state.endScaleX - state.startScaleX) * progress;
                    state.lineElement.style.setProperty(
                      '--line-width-scale',
                      `${state.currentScaleX}`
                    );

                    if (progress < 1) {
                      state.animationFrameId = requestAnimationFrame(animateShrinkNow);
                    } else {
                      state.lineElement.style.setProperty('--line-width-scale', `${initialScaleX}`);
                      state.isActive = false;
                      lineTimeoutsRef.current.delete(line);
                    }
                  };
                  state.animationFrameId = requestAnimationFrame(animateShrinkNow);
                } else {
                  state.isActive = true;
                }
              }
            };
            state.animationFrameId = requestAnimationFrame(animateGrowth);
          }
        }
      });
    };

    const populateGrid = () => {
      clearAllLineAnimations();
      gridContainer.innerHTML = '';

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const rowsThatFit = Math.floor(viewportHeight / gridRowHeight);
      const colsThatFit = Math.floor(viewportWidth / gridColWidth);
      const numLinesToCreate = rowsThatFit * colsThatFit;

      for (let i = 0; i < numLinesToCreate; i++) {
        const line = document.createElement('div');
        line.className = 'line';
        line.style.width = '100%';
        line.style.height = '100%';
        line.style.transformOrigin = 'center center';
        line.style.setProperty('--line-width-scale', `${initialScaleX}`);
        line.style.transform = `scaleX(var(--line-width-scale))`;
        line.style.display = 'flex';
        line.style.justifyContent = 'center';
        line.style.alignItems = 'center';

        const before = document.createElement('div');
        before.style.backgroundColor = lineColor;
        before.style.width = `${lineWidth}px`;
        before.style.height = `${lineHeight}px`;
        line.appendChild(before);

        gridContainer.appendChild(line);

        lineStatesRef.current.set(line, {
          lineElement: line,
          currentScaleX: initialScaleX,
          isActive: false,
          isGrowing: false,
          shouldShrinkAfterGrowth: false,
          animationFrameId: null,
          startTime: 0,
          startScaleX: initialScaleX,
          endScaleX: initialScaleX,
          activationTime: 0,
        });

        line.addEventListener('mouseenter', () => {
          if (isMouseDownRef.current) return;

          const state = lineStatesRef.current.get(line)!;

          if (!state.isGrowing && state.isActive) {
            if (state.animationFrameId) {
              cancelAnimationFrame(state.animationFrameId);
              state.animationFrameId = null;
            }
            state.isActive = false;
          }

          if (lineTimeoutsRef.current.has(line)) {
            clearTimeout(lineTimeoutsRef.current.get(line)!);
            lineTimeoutsRef.current.delete(line);
          }

          if (!state.isActive) {
            state.isActive = true;
            state.isGrowing = true;
            state.shouldShrinkAfterGrowth = false;
            state.startTime = performance.now();
            state.startScaleX = state.currentScaleX;
            state.endScaleX = targetScaleX;

            const animateGrowth = (currentTime: number) => {
              if (!state.isActive || !state.isGrowing) {
                state.animationFrameId = null;
                return;
              }

              const elapsed = currentTime - state.startTime;
              let progress = Math.min(elapsed / growDuration, 1);
              progress = easeOutQuad(progress);

              state.currentScaleX =
                state.startScaleX + (state.endScaleX - state.startScaleX) * progress;
              state.lineElement.style.setProperty('--line-width-scale', `${state.currentScaleX}`);

              if (progress < 1) {
                state.animationFrameId = requestAnimationFrame(animateGrowth);
              } else {
                state.animationFrameId = null;
                state.isGrowing = false;

                if (state.shouldShrinkAfterGrowth) {
                  state.shouldShrinkAfterGrowth = false;
                  state.startTime = performance.now();
                  state.startScaleX = state.currentScaleX;
                  state.endScaleX = initialScaleX;

                  const animateShrinkNow = (time: number) => {
                    const elapsed = time - state.startTime;
                    let progress = Math.min(elapsed / shrinkDelay, 1);
                    progress = easeOutQuad(progress);

                    state.currentScaleX =
                      state.startScaleX + (state.endScaleX - state.startScaleX) * progress;
                    state.lineElement.style.setProperty(
                      '--line-width-scale',
                      `${state.currentScaleX}`
                    );

                    if (progress < 1) {
                      state.animationFrameId = requestAnimationFrame(animateShrinkNow);
                    } else {
                      state.lineElement.style.setProperty('--line-width-scale', `${initialScaleX}`);
                      state.isActive = false;
                      lineTimeoutsRef.current.delete(line);
                    }
                  };
                  state.animationFrameId = requestAnimationFrame(animateShrinkNow);
                } else {
                  state.isActive = true;
                }
              }
            };
            state.animationFrameId = requestAnimationFrame(animateGrowth);
          }
        });

        line.addEventListener('mouseleave', () => {
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
              state.isActive = false;
              if (state.animationFrameId) {
                cancelAnimationFrame(state.animationFrameId);
                state.animationFrameId = null;
              }

              state.startScaleX = state.currentScaleX;
              state.endScaleX = initialScaleX;
              state.startTime = performance.now();

              const animateShrink = (currentTime: number) => {
                if (state.isActive) {
                  state.animationFrameId = null;
                  return;
                }

                const elapsed = currentTime - state.startTime;
                let progress = Math.min(elapsed / shrinkDelay, 1);
                progress = easeOutQuad(progress);

                state.currentScaleX =
                  state.startScaleX + (state.endScaleX - state.startScaleX) * progress;
                state.lineElement.style.setProperty('--line-width-scale', `${state.currentScaleX}`);

                if (progress < 1) {
                  state.animationFrameId = requestAnimationFrame(animateShrink);
                } else {
                  state.lineElement.style.setProperty('--line-width-scale', `${initialScaleX}`);
                  state.isActive = false;
                  lineTimeoutsRef.current.delete(line);
                }
              };
              state.animationFrameId = requestAnimationFrame(animateShrink);
            }, 0);

            lineTimeoutsRef.current.set(line, timeoutId);
          }
        });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDownRef.current = true;
      mouseXRef.current = e.clientX;
      mouseYRef.current = e.clientY;
      affectionRadiusRef.current = minRadius;

      activateLinesInRadius();

      radiusGrowthIntervalRef.current = window.setInterval(() => {
        if (affectionRadiusRef.current < maxRadius) {
          affectionRadiusRef.current += radiusGrowthRate / 60;
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

        if (state.animationFrameId) {
          cancelAnimationFrame(state.animationFrameId);
          state.animationFrameId = null;
        }

        if (lineTimeoutsRef.current.has(line)) {
          clearTimeout(lineTimeoutsRef.current.get(line)!);
          lineTimeoutsRef.current.delete(line);
        }

        const staggerDelay = index * 10;

        const timeoutId = window.setTimeout(() => {
          state.isActive = false;
          state.startTime = performance.now();
          state.startScaleX = state.currentScaleX;
          state.endScaleX = initialScaleX;

          const animateShrink = (currentTime: number) => {
            if (state.isActive) {
              state.animationFrameId = null;
              return;
            }

            const elapsed = currentTime - state.startTime;
            let progress = Math.min(elapsed / shrinkDelay, 1);
            progress = easeOutQuad(progress);

            state.currentScaleX =
              state.startScaleX + (state.endScaleX - state.startScaleX) * progress;
            state.lineElement.style.setProperty('--line-width-scale', `${state.currentScaleX}`);

            if (progress < 1) {
              state.animationFrameId = requestAnimationFrame(animateShrink);
            } else {
              state.lineElement.style.setProperty('--line-width-scale', `${initialScaleX}`);
              state.isActive = false;
              lineTimeoutsRef.current.delete(line);
            }
          };
          state.animationFrameId = requestAnimationFrame(animateShrink);
        }, staggerDelay);

        lineTimeoutsRef.current.set(line, timeoutId);
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
      mouseYRef.current = e.clientY;

      if (isMouseDownRef.current) {
        activateLinesInRadius();
      }
    };

    const handleResize = () => {
      setTimeout(populateGrid, 200);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    populateGrid();

    return () => {
      clearAllLineAnimations();
      if (radiusGrowthIntervalRef.current) {
        clearInterval(radiusGrowthIntervalRef.current);
      }
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    gridRowHeight,
    gridColWidth,
    growDuration,
    shrinkDelay,
    initialScaleX,
    targetScaleX,
    minRadius,
    maxRadius,
    radiusGrowthRate,
    lineColor,
    lineWidth,
    lineHeight,
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

