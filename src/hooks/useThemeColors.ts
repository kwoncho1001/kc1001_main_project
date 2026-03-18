import { useState, useEffect } from 'react';

export function useThemeColors() {
  const [colors, setColors] = useState({
    background: '#ffffff',
    foreground: '#000000',
    accent: '#6366f1',
    border: '#e5e7eb',
    card: '#ffffff',
    muted: '#f3f4f6',
    success: '#10b981',
    error: '#ef4444',
  });

  useEffect(() => {
    const updateColors = () => {
      const style = getComputedStyle(document.documentElement);
      setColors({
        background: style.getPropertyValue('--background').trim() || '#ffffff',
        foreground: style.getPropertyValue('--foreground').trim() || '#000000',
        accent: style.getPropertyValue('--accent').trim() || '#6366f1',
        border: style.getPropertyValue('--border').trim() || '#e5e7eb',
        card: style.getPropertyValue('--card').trim() || '#ffffff',
        muted: style.getPropertyValue('--muted').trim() || '#f3f4f6',
        success: style.getPropertyValue('--success').trim() || '#10b981',
        error: style.getPropertyValue('--error').trim() || '#ef4444',
      });
    };

    updateColors();

    // Watch for theme changes (class 'dark' on html or body)
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return colors;
}
