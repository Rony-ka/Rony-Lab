import React, { useEffect, useRef } from 'react';

export interface LinesPressGrowConfig {
  gridRowHeight?: number;
  gridColWidth?: number;
  baseInteractionRadius?: number;
  pressedInteractionRadius?: number;
  growSpeed?: number;
  shrinkSpeed?: number;
  easingPower?: number;
  lerpFactor?: number;
  baseEffectStrength?: number;
  lineColor?: string;
  lineWidth?: number;
  lineHeight?: number;
  backgroundColor?: string;
}

interface LineElement extends HTMLDivElement {
  currentRotation: number;
  targetRotation: number;
  cachedCenterX: number;
  cachedCenterY: number;
}

export const LinesPressGrow: React.FC<LinesPressGrowConfig> = ({
  gridRowHeight = 45,
  gridColWidth = 20,
  baseInteractionRadius = 100,
  pressedInteractionRadius = 400,
  growSpeed = 0.03,
  shrinkSpeed = 0.025,
  easingPower = 3,
  lerpFactor = 0.02,
  baseEffectStrength = 1.0,
  lineColor = '#000000',
  lineWidth = 1.5,
  lineHeight = 46,
  backgroundColor = '#ffffff',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineElementsRef = useRef<LineElement[]>([]);
  const interactionPointRef = useRef({ x: 0, y: 0, active: false });
  const isPressedRef = useRef(false);
  const animationFrameRef = useRef<number>();
  const currentRadiusRef = useRef(baseInteractionRadius);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Ease-in-out function for smooth transitions
  const easeInOut = (t: number, power: number = easingPower) => {
    return t < 0.5
      ? Math.pow(2, power - 1) * Math.pow(t, power)
      : 1 - Math.pow(-2 * t + 2, power) / 2;
  };

  useEffect(() => {
    const gridContainer = containerRef.current;
    if (!gridContainer) return;

    const populateGrid = () => {
      gridContainer.innerHTML = '';
      lineElementsRef.current = [];

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const rowsThatFit = Math.ceil(viewportHeight / gridRowHeight);
      const colsThatFit = Math.ceil(viewportWidth / gridColWidth);

      const numLinesToCreate = rowsThatFit * colsThatFit;

      for (let i = 0; i < numLinesToCreate; i++) {
        const line = document.createElement('div') as LineElement;
        line.className = 'line';
        line.style.width = '100%';
        line.style.height = '100%';
        line.style.transformOrigin = 'center center';
        line.style.display = 'flex';
        line.style.justifyContent = 'center';
        line.style.alignItems = 'center';
        line.style.borderRadius = '5px';

        const before = document.createElement('div');
        before.style.backgroundColor = lineColor;
        before.style.width = `${lineWidth}px`;
        before.style.height = `${lineHeight}px`;
        before.style.borderRadius = '0px';
        line.appendChild(before);

        gridContainer.appendChild(line);
        line.currentRotation = 0;
        line.targetRotation = 0;
        lineElementsRef.current.push(line);
      }

      // Cache line positions after they're rendered
      setTimeout(() => {
        lineElementsRef.current.forEach((line) => {
          const rect = line.getBoundingClientRect();
          line.cachedCenterX = rect.left + rect.width / 2;
          line.cachedCenterY = rect.top + rect.height / 2;
        });
      }, 0);

      requestAnimationFrame(animateLines);
    };

    const animateLines = () => {
      // Smoothly grow or shrink the interaction radius with easing
      const targetRadius = isPressedRef.current ? pressedInteractionRadius : baseInteractionRadius;
      const speed = isPressedRef.current ? growSpeed : shrinkSpeed;
      
      // Calculate the raw lerp
      const rawProgress = Math.abs(currentRadiusRef.current - targetRadius) / Math.abs(pressedInteractionRadius - baseInteractionRadius);
      const easedSpeed = speed * (1 + easeInOut(1 - rawProgress));
      
      currentRadiusRef.current = lerp(currentRadiusRef.current, targetRadius, easedSpeed);

      lineElementsRef.current.forEach((line) => {
        const lineCenterX = line.cachedCenterX;
        const lineCenterY = line.cachedCenterY;

        let newTargetRotation = 0;

        if (interactionPointRef.current.active) {
          const dx = interactionPointRef.current.x - lineCenterX;
          const dy = interactionPointRef.current.y - lineCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Only affect lines within the current radius
          if (distance < currentRadiusRef.current) {
            const angleToMouse = Math.atan2(dy, dx);
            const angleDegrees = angleToMouse * (180 / Math.PI);
            const targetAngle = angleDegrees + 90;

            // Calculate influence based on distance and current radius
            const normalizedDistance = distance / currentRadiusRef.current;
            const influence = 1 - normalizedDistance;
            const smoothInfluence = Math.pow(influence, 1.5); // Smooth falloff

            const rotationInfluence = smoothInfluence * baseEffectStrength;
            newTargetRotation = targetAngle * rotationInfluence;
          }
        }

        line.currentRotation = lerp(line.currentRotation, newTargetRotation, lerpFactor);
        line.style.transform = `rotate(${line.currentRotation}deg)`;
      });

      animationFrameRef.current = requestAnimationFrame(animateLines);
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      interactionPointRef.current.x = touch.clientX;
      interactionPointRef.current.y = touch.clientY;
      interactionPointRef.current.active = true;
      isPressedRef.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      interactionPointRef.current.x = touch.clientX;
      interactionPointRef.current.y = touch.clientY;
    };

    const handleTouchEnd = () => {
      interactionPointRef.current.active = false;
      isPressedRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      interactionPointRef.current.x = e.clientX;
      interactionPointRef.current.y = e.clientY;
      interactionPointRef.current.active = true;
    };

    const handleMouseDown = () => {
      isPressedRef.current = true;
    };

    const handleMouseUp = () => {
      isPressedRef.current = false;
    };

    const handleMouseLeave = () => {
      interactionPointRef.current.active = false;
      isPressedRef.current = false;
    };

    const handleResize = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setTimeout(populateGrid, 200);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
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
    baseInteractionRadius,
    pressedInteractionRadius,
    growSpeed,
    shrinkSpeed,
    easingPower,
    lerpFactor,
    baseEffectStrength,
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
          gridTemplateColumns: `repeat(auto-fill, minmax(${gridColWidth}px, 1fr))`,
          gridTemplateRows: `repeat(auto-fill, minmax(${gridRowHeight}px, 1fr))`,
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

