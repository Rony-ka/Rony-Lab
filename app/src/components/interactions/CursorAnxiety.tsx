import React, { useEffect, useRef } from 'react';

export interface CursorAnxietyConfig {
  gridRowHeight?: number;
  gridColWidth?: number;
  interactionRadius?: number;
  movementRadius?: number;
  lerpFactor?: number;
  baseEffectStrength?: number;
  cursorSize?: number;
  backgroundColor?: string;
  cursorImageUrl?: string;
}

interface CursorElement extends HTMLDivElement {
  currentRotation: number;
  targetRotation: number;
  cachedCenterX: number;
  cachedCenterY: number;
  currentOffsetX: number;
  currentOffsetY: number;
  targetOffsetX: number;
  targetOffsetY: number;
}

export const CursorAnxiety: React.FC<CursorAnxietyConfig> = ({
  gridRowHeight = 80,
  gridColWidth = 80,
  interactionRadius = 300,
  movementRadius = 300,
  lerpFactor = 0.05,
  baseEffectStrength = 1.0,
  cursorSize = 54,
  backgroundColor = '#ffffff',
  cursorImageUrl = '', // User will provide their cursor PNG path
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorElementsRef = useRef<CursorElement[]>([]);
  const interactionPointRef = useRef({ x: 0, y: 0, active: false });
  const isPressedRef = useRef(false);
  const animationFrameRef = useRef<number>();

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  useEffect(() => {
    const gridContainer = containerRef.current;
    if (!gridContainer) return;

    const populateGrid = () => {
      gridContainer.innerHTML = '';
      cursorElementsRef.current = [];

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const rowsThatFit = Math.floor(viewportHeight / gridRowHeight);
      const colsThatFit = Math.floor(viewportWidth / gridColWidth);

      const numCursorsToCreate = rowsThatFit * colsThatFit;

      for (let i = 0; i < numCursorsToCreate; i++) {
        const cursorDiv = document.createElement('div') as CursorElement;
        cursorDiv.className = 'cursor-element';
        cursorDiv.style.width = '100%';
        cursorDiv.style.height = '100%';
        cursorDiv.style.transformOrigin = 'center center';
        cursorDiv.style.display = 'flex';
        cursorDiv.style.justifyContent = 'center';
        cursorDiv.style.alignItems = 'center';

        // Create the cursor image - always use img element for proper sizing
        const cursorImg = document.createElement('img');
        cursorImg.src = cursorImageUrl || 'data:image/svg+xml,%3Csvg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 6L10 32L18 26L24 38L28 36L22 24L32 24L10 6Z" fill="black" stroke="white" stroke-width="2" stroke-linejoin="round"/%3E%3C/svg%3E';
        cursorImg.alt = 'cursor';
        cursorImg.style.width = `${cursorSize}px`;
        cursorImg.style.height = `${cursorSize}px`;
        cursorImg.style.objectFit = 'contain';
        cursorImg.style.display = 'block';
        cursorImg.style.pointerEvents = 'none';
        cursorImg.style.willChange = 'transform';
        cursorDiv.appendChild(cursorImg);

        gridContainer.appendChild(cursorDiv);
        
        cursorDiv.currentRotation = 0;
        cursorDiv.targetRotation = 0;
        cursorDiv.currentOffsetX = 0;
        cursorDiv.currentOffsetY = 0;
        cursorDiv.targetOffsetX = 0;
        cursorDiv.targetOffsetY = 0;
        cursorElementsRef.current.push(cursorDiv);
      }

      // Cache cursor positions after they're rendered
      setTimeout(() => {
        cursorElementsRef.current.forEach((cursor) => {
          const rect = cursor.getBoundingClientRect();
          cursor.cachedCenterX = rect.left + rect.width / 2;
          cursor.cachedCenterY = rect.top + rect.height / 2;
        });
      }, 0);

      requestAnimationFrame(animateCursors);
    };

    const animateCursors = () => {
      cursorElementsRef.current.forEach((cursor) => {
        const cursorCenterX = cursor.cachedCenterX;
        const cursorCenterY = cursor.cachedCenterY;

        let newTargetRotation = 0;
        let newTargetOffsetX = 0;
        let newTargetOffsetY = 0;

        // If pressed, return to original position and rotation
        if (isPressedRef.current) {
          // Targets are already 0, cursors will lerp back to original state
        } else if (interactionPointRef.current.active) {
          const dx = interactionPointRef.current.x - cursorCenterX;
          const dy = interactionPointRef.current.y - cursorCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Only affect cursors within the interaction radius
          if (distance < interactionRadius) {
            const angleToMouse = Math.atan2(dy, dx);
            const angleDegrees = angleToMouse * (180 / Math.PI);
            
            // Rotate to point towards the mouse (cursor naturally points up-left, so adjust by 135 degrees)
            const targetAngle = angleDegrees + 135;

            // Calculate influence based on distance
            const normalizedDistance = distance / interactionRadius;
            const influence = 1 - normalizedDistance;
            const smoothInfluence = Math.pow(influence, 1.5);

            const rotationInfluence = smoothInfluence * baseEffectStrength;
            newTargetRotation = targetAngle * rotationInfluence;

            // Move cursors towards the mouse - only within movement radius
            // Farther cursors (within radius) move more, closer cursors move less
            if (distance < movementRadius) {
              const movementNormalizedDistance = distance / movementRadius;
              // Inverted: farther away = more movement
              const movementInfluence = movementNormalizedDistance;
              // Use a very smooth curve to fade out at the edges (higher power = smoother fade)
              const smoothMovementInfluence = Math.pow(movementInfluence, 0.3) * (1 - Math.pow(movementNormalizedDistance, 3));
              const moveAmount = smoothMovementInfluence * 50; // Max 50px movement (reduced from 80)
              newTargetOffsetX = (dx / distance) * moveAmount;
              newTargetOffsetY = (dy / distance) * moveAmount;
            }
          }
        }

        // Use faster lerp when returning to original position/rotation
        const returnLerpFactor = isPressedRef.current ? 0.08 : lerpFactor;
        const movementLerpFactor = isPressedRef.current ? 0.08 : 0.01;
        
        cursor.currentRotation = lerp(cursor.currentRotation, newTargetRotation, returnLerpFactor);
        cursor.currentOffsetX = lerp(cursor.currentOffsetX, newTargetOffsetX, movementLerpFactor);
        cursor.currentOffsetY = lerp(cursor.currentOffsetY, newTargetOffsetY, movementLerpFactor);
        
        const roundedRotation = Math.round(cursor.currentRotation * 10) / 10;
        const roundedOffsetX = Math.round(cursor.currentOffsetX * 10) / 10;
        const roundedOffsetY = Math.round(cursor.currentOffsetY * 10) / 10;
        
        cursor.style.transform = `translate(${roundedOffsetX}px, ${roundedOffsetY}px) rotate(${roundedRotation}deg)`;
      });

      animationFrameRef.current = requestAnimationFrame(animateCursors);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      interactionPointRef.current.x = touch.clientX;
      interactionPointRef.current.y = touch.clientY;
      interactionPointRef.current.active = true;
      isPressedRef.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling during touch move
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

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
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
    interactionRadius,
    movementRadius,
    lerpFactor,
    baseEffectStrength,
    cursorSize,
    cursorImageUrl,
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

