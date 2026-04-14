import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface ScreenWrapperProps {
  children: ReactNode;
}

export function ScreenWrapper({ children }: ScreenWrapperProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    setIsDark(document.documentElement.classList.contains('dark'));

    return () => observer.disconnect();
  }, []);

  const lightPattern = '/food-pattern-light.png';
  const darkPattern = '/food-pattern-dark.png';

  return (
    <div
      key={isDark ? 'dark' : 'light'}
      style={{
        backgroundImage: `url(${isDark ? darkPattern : lightPattern})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}