import React, { useEffect, useRef } from 'react';

export interface LinesSpreadColorConfig {
  gridRowHeight?: number;
  gridColWidth?: number;
  baseRadius?: number;
  maxRadius?: number;
  growthRate?: number;
  maxMove?: number;
  minW?: number;
  maxW?: number;
  lerp?: number;
  lerpWidth?: number;
  radiusLerp?: number;
  color1?: [number, number, number];
  color2?: [number, number, number];
  lineHeight?: number;
  backgroundColor?: string;
}

interface LineElement extends HTMLDivElement {
  cx: number;
  cy: number;
  tx: number;
  w: number;
}

export const LinesSpreadColor: React.FC<LinesSpreadColorConfig> = ({
  gridRowHeight = 45,
  gridColWidth = 20,
  baseRadius = 100,
  maxRadius = 400,
  growthRate = 150,
  maxMove = 40,
  minW = 1.5,
  maxW = 15,
  lerp = 0.03,
  lerpWidth = 0.03,
  radiusLerp = 0.05,
  color1 = [200, 128, 253],
  color2 = [240, 61, 42],
  lineHeight = 46,
  backgroundColor = '#0E0E0E',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<LineElement[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const isDownRef = useRef(false);
  const downTimeRef = useRef(0);
  const radiusRef = useRef(baseRadius);
  const targetRadiusRef = useRef(baseRadius);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const gridContainer = containerRef.current;
    if (!gridContainer) return;

    const populate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cols = Math.floor(w / gridColWidth);
      const rows = Math.floor(h / gridRowHeight);

      const total = Math.min(cols * rows, 2000);

      gridContainer.innerHTML = '';
      linesRef.current = [];

      const frag = document.createDocumentFragment();
      for (let i = 0; i < total; i++) {
        const line = document.createElement('div') as LineElement;
        line.className = 'line';
        line.style.width = '100%';
        line.style.height = '100%';
        line.style.display = 'flex';
        line.style.justifyContent = 'center';
        line.style.alignItems = 'center';

        const beforeEl = document.createElement('div');
        beforeEl.style.backgroundColor = 'transparent';
        beforeEl.style.width = `${minW}px`;
        beforeEl.style.height = `${lineHeight}px`;
        beforeEl.style.opacity = '0';
        beforeEl.style.transition = 'opacity 0.4s ease-out';
        line.appendChild(beforeEl);

        line.tx = 0;
        line.w = minW;
        frag.appendChild(line);
        linesRef.current.push(line);
      }
      gridContainer.appendChild(frag);

      // Cache positions once
      linesRef.current.forEach((line) => {
        const r = line.getBoundingClientRect();
        line.cx = r.left + r.width / 2;
        line.cy = r.top + r.height / 2;
      });
    };

    const animate = () => {
      // Update target radius
      if (isDownRef.current) {
        const elapsed = (Date.now() - downTimeRef.current) / 1000;
        targetRadiusRef.current = Math.min(baseRadius + growthRate * elapsed, maxRadius);
      } else {
        targetRadiusRef.current = baseRadius;
      }

      // Smoothly interpolate current radius toward target
      radiusRef.current += (targetRadiusRef.current - radiusRef.current) * radiusLerp;

      const r2 = radiusRef.current * radiusRef.current;

      // Batch DOM updates
      for (let i = 0; i < linesRef.current.length; i++) {
        const line = linesRef.current[i];
        const beforeEl = line.firstChild as HTMLDivElement;
        let ttx = 0,
          tw = minW,
          color = 'transparent',
          opacity = 0;

        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - line.cx;
          const dy = mouseRef.current.y - line.cy;
          const d2 = dx * dx + dy * dy;

          if (d2 < r2) {
            const d = Math.sqrt(d2);
            const inf = 1 - d / radiusRef.current;
            const dir = dx > 0 ? 1 : -1;
            ttx = -dir * inf * maxMove;
            tw = minW + (maxW - minW) * inf;
            const prog = Math.abs(ttx) / maxMove;
            const r = Math.round(color1[0] + (color2[0] - color1[0]) * prog);
            const g = Math.round(color1[1] + (color2[1] - color1[1]) * prog);
            const b = Math.round(color1[2] + (color2[2] - color1[2]) * prog);
            color = `rgb(${r},${g},${b})`;
            opacity = 1;
          }
        }

        line.tx += (ttx - line.tx) * lerp;
        line.w += (tw - line.w) * lerpWidth;

        // Apply updates directly
        line.style.transform = `translateX(${line.tx}px)`;
        beforeEl.style.width = `${line.w}px`;
        beforeEl.style.backgroundColor = color;
        beforeEl.style.opacity = `${opacity}`;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      mouseRef.current.x = t.clientX;
      mouseRef.current.y = t.clientY;
      mouseRef.current.active = true;
      isDownRef.current = true;
      downTimeRef.current = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      mouseRef.current.x = t.clientX;
      mouseRef.current.y = t.clientY;
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
      isDownRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseDown = () => {
      isDownRef.current = true;
      downTimeRef.current = Date.now();
    };

    const handleMouseUp = () => {
      isDownRef.current = false;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      isDownRef.current = false;
    };

    const handleResize = () => {
      setTimeout(populate, 200);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    populate();
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    gridRowHeight,
    gridColWidth,
    baseRadius,
    maxRadius,
    growthRate,
    maxMove,
    minW,
    maxW,
    lerp,
    lerpWidth,
    radiusLerp,
    color1,
    color2,
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

