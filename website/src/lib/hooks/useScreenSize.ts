'use client';

import { useEffect, useMemo, useState } from 'react';

type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const determineScreenSize = (width: number): ScreenSize => {
  if (width < 640) {
    return 'xs';
  } else if (width < 768) {
    return 'sm';
  } else if (width < 1024) {
    return 'md';
  } else if (width < 1280) {
    return 'lg';
  } else if (width < 1536) {
    return 'xl';
  }

  return '2xl';
};

/**
 * This hook can be used to determine the current screen size. See https://tailwindcss.com/docs/responsive-design for
 * more information. In SSR, this hook will return null.
 */
export const useScreenSize = (): ScreenSize | null => {
  const [currentScreenSize, setCurrentScreenSize] = useState<ScreenSize | null>(null);

  useEffect(() => {
    setCurrentScreenSize(determineScreenSize(window.innerWidth));
    const handler = () => setCurrentScreenSize(determineScreenSize(window.innerWidth));
    window.addEventListener('resize', handler);

    return () => window.removeEventListener('resize', handler);
  }, []);

  return useMemo(() => currentScreenSize, [currentScreenSize]);
};
