/**
 * Utility functions to normalize mouse and touch events for mobile support
 */

export interface PointerPosition {
  clientX: number;
  clientY: number;
}

/**
 * Get the position from either a mouse or touch event
 */
export const getPointerPosition = (
  event: MouseEvent | TouchEvent
): PointerPosition => {
  if ('touches' in event && event.touches.length > 0) {
    return {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY,
    };
  } else if ('changedTouches' in event && event.changedTouches.length > 0) {
    return {
      clientX: event.changedTouches[0].clientX,
      clientY: event.changedTouches[0].clientY,
    };
  } else if ('clientX' in event) {
    return {
      clientX: event.clientX,
      clientY: event.clientY,
    };
  }
  return { clientX: 0, clientY: 0 };
};

/**
 * Add both mouse and touch event listeners
 */
export const addPointerDownListener = (
  element: HTMLElement | Document | Window,
  handler: (e: MouseEvent | TouchEvent) => void
) => {
  element.addEventListener('mousedown', handler as EventListener);
  element.addEventListener('touchstart', handler as EventListener, { passive: false });
};

export const addPointerUpListener = (
  element: HTMLElement | Document | Window,
  handler: (e: MouseEvent | TouchEvent) => void
) => {
  element.addEventListener('mouseup', handler as EventListener);
  element.addEventListener('touchend', handler as EventListener);
};

export const addPointerMoveListener = (
  element: HTMLElement | Document | Window,
  handler: (e: MouseEvent | TouchEvent) => void
) => {
  element.addEventListener('mousemove', handler as EventListener);
  element.addEventListener('touchmove', handler as EventListener, { passive: false });
};

export const removePointerDownListener = (
  element: HTMLElement | Document | Window,
  handler: (e: MouseEvent | TouchEvent) => void
) => {
  element.removeEventListener('mousedown', handler as EventListener);
  element.removeEventListener('touchstart', handler as EventListener);
};

export const removePointerUpListener = (
  element: HTMLElement | Document | Window,
  handler: (e: MouseEvent | TouchEvent) => void
) => {
  element.removeEventListener('mouseup', handler as EventListener);
  element.removeEventListener('touchend', handler as EventListener);
};

export const removePointerMoveListener = (
  element: HTMLElement | Document | Window,
  handler: (e: MouseEvent | TouchEvent) => void
) => {
  element.removeEventListener('mousemove', handler as EventListener);
  element.removeEventListener('touchmove', handler as EventListener);
};

/**
 * Add pointer enter/leave listeners with touch support
 * For touch devices, we simulate hover using touchmove detection
 */
export const addPointerEnterListener = (
  element: HTMLElement,
  handler: () => void
) => {
  element.addEventListener('mouseenter', handler);
  // For touch, we'll use touchstart as an approximation
  element.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handler();
  }, { passive: false });
};

export const addPointerLeaveListener = (
  element: HTMLElement,
  handler: () => void
) => {
  element.addEventListener('mouseleave', handler);
  // For touch, touchend works similarly
  element.addEventListener('touchend', handler);
};

export const removePointerEnterListener = (
  element: HTMLElement,
  handler: () => void
) => {
  element.removeEventListener('mouseenter', handler);
  element.removeEventListener('touchstart', handler as EventListener);
};

export const removePointerLeaveListener = (
  element: HTMLElement,
  handler: () => void
) => {
  element.removeEventListener('mouseleave', handler);
  element.removeEventListener('touchend', handler);
};

