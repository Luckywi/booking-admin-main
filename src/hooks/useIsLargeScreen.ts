import { useEffect, useState } from 'react';

export function useIsLargeScreen(breakpoint = 1024) {
  const [isLarge, setIsLarge] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLarge(window.innerWidth >= breakpoint);
    };

    checkScreenSize(); // Initial check
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [breakpoint]);

  return isLarge;
}
