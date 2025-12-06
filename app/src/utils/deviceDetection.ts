import React from 'react';

/**
 * Utility to detect if the device is mobile and adjust parameters accordingly
 */

export const isMobileDevice = (): boolean => {
  // Check if it's a touch device with small screen
  return (
    ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
    window.innerWidth < 768
  );
};

/**
 * Adjust radius growth rate based on device type
 * Mobile gets 3x slower growth for better user experience
 */
export const adjustRadiusGrowthRate = (baseRate: number): number => {
  return isMobileDevice() ? baseRate / 3 : baseRate;
};

/**
 * Check if device is mobile on mount
 */
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

