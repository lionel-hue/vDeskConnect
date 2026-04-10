'use client';

import { useState } from 'react';
import { useIllustrations } from '@/contexts/IllustrationProvider';

export default function IllustrationDisplay({ name, alt = '', className = '', fallback = null, mode = 'inline' }) {
  const { getIllustration, loading } = useIllustrations();
  const src = getIllustration(name, fallback);
  const [error, setError] = useState(false);

  // While loading, show skeleton
  if (loading) {
    return <div className={`animate-pulse bg-border rounded-panel ${className}`} />;
  }

  // If src is a React element (JSX fallback), render it directly
  if (src && typeof src !== 'string') {
    return <div className={className}>{src}</div>;
  }

  // If src is a string URL, render appropriately
  if (src && typeof src === 'string' && !error) {
    if (mode === 'background') {
      return (
        <img
          src={src}
          alt={alt || name}
          className={`w-full h-full object-cover ${className}`}
          loading="eager"
          aria-hidden="true"
          onError={(e) => {
            console.error(`Failed to load illustration: ${name}`, src);
            setError(true);
          }}
        />
      );
    }
    return (
      <img
        src={src}
        alt={alt || name}
        className={`auth-illustration ${className}`}
        loading="lazy"
        onError={(e) => {
          console.error(`Failed to load illustration: ${name}`, src);
          setError(true);
        }}
      />
    );
  }

  // No illustration available or error occurred — render fallback JSX
  if (fallback && typeof fallback !== 'string') {
    return <div className={className}>{fallback}</div>;
  }

  return null;
}
