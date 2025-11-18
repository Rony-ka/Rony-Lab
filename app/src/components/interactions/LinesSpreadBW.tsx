import React, { useEffect, useRef } from 'react';

export interface LinesSpreadBWConfig {
  gridRowHeight?: number;
  gridColWidth?: number;
  baseInteractionRadius?: number;
  maxInteractionRadius?: number;
  radiusGrowthRate?: number;
  maxMoveDistance?: number;
  lineColor?: string;
  lineWidth?: number;
  lineHeight?: number;
  backgroundColor?: string;
}

export const LinesSpreadBW: React.FC<LinesSpreadBWConfig> = ({
  gridRowHeight = 45,
  gridColWidth = 20,
  baseInteractionRadius = 100,
  maxInteractionRadius = 400,
  radiusGrowthRate = 150,
  maxMoveDistance = 40,
  lineColor = '#000000',
  lineWidth = 1.5,
  lineHeight = 46,
  backgroundColor = '#ffffff',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineElementsRef = useRef<HTMLDivElement[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const mouseDownTimeRef = useRef(0);
  const currentRadiusRef = useRef(baseInteractionRadius);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const gridContainer = containerRef.current;
    if (!gridContainer) return;

    const populateGrid = () => {
      gridContainer.innerHTML = '';

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const rowsThatFit = Math.floor(viewportHeight / gridRowHeight);
      const colsThatFit = Math.floor(viewportWidth / gridColWidth);

      const numLinesToCreate = rowsThatFit * colsThatFit;

      lineElementsRef.current = [];

      for (let i = 0; i < numLinesToCreate; i++) {
        const line = document.createElement('div');
        line.className = 'line';
        line.style.width = '100%';
        line.style.height = '100%';
        line.style.transformOrigin = 'center center';
        line.style.display = 'flex';
        line.style.justifyContent = 'center';
        line.style.alignItems = 'center';
        line.style.transition = 'transform 0.3s ease-out';
        line.style.borderRadius = '5px';

        const before = document.createElement('div');
        before.style.backgroundColor = lineColor;
        before.style.width = `${lineWidth}px`;
        before.style.height = `${lineHeight}px`;
        before.style.borderRadius = '0px';
        line.appendChild(before);

        gridContainer.appendChild(line);
        lineElementsRef.current.push(line);
      }
      updateLinePositions();
    };

    const updateLinePositions = () => {
      lineElementsRef.current.forEach((line) => {
        const rect = line.getBoundingClientRect();
        const lineCenterX = rect.left + rect.width / 2;
        const lineCenterY = rect.top + rect.height / 2;

        const dx = mousePosRef.current.x - lineCenterX;
        const dy = mousePosRef.current.y - lineCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let translateX = 0;

        if (distance < currentRadiusRef.current) {
          const influence = 1 - distance / currentRadiusRef.current;
          const direction = Math.sign(dx);
          translateX = -direction * influence * maxMoveDistance;
        }

        line.style.transform = `translateX(${translateX}px)`;
      });
    };

    const animate = () => {
      if (isMouseDownRef.current) {
        const elapsedTime = (Date.now() - mouseDownTimeRef.current) / 1000;
        currentRadiusRef.current = Math.min(
          baseInteractionRadius + radiusGrowthRate * elapsedTime,
          maxInteractionRadius
        );
      } else {
        currentRadiusRef.current = baseInteractionRadius;
      }

      updateLinePositions();

      if (isMouseDownRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current.x = e.clientX;
      mousePosRef.current.y = e.clientY;
      if (!isMouseDownRef.current) {
        updateLinePositions();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDownRef.current = true;
      mouseDownTimeRef.current = Date.now();
      mousePosRef.current.x = e.clientX;
      mousePosRef.current.y = e.clientY;
      animate();
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      currentRadiusRef.current = baseInteractionRadius;
      updateLinePositions();
    };

    const handleMouseLeave = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        currentRadiusRef.current = baseInteractionRadius;
        updateLinePositions();
      }
    };

    const handleResize = () => {
      setTimeout(() => {
        populateGrid();
        updateLinePositions();
      }, 200);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    populateGrid();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    gridRowHeight,
    gridColWidth,
    baseInteractionRadius,
    maxInteractionRadius,
    radiusGrowthRate,
    maxMoveDistance,
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

