'use client';

import { useIllustrations } from '@/contexts/IllustrationProvider';

export default function IllustrationDisplay({ name, alt = '', className = '', fallback = null }) {
  const { getIllustration, loading } = useIllustrations();
  const src = getIllustration(name, fallback);

  // While loading, show skeleton
  if (loading) {
    return <div className={`animate-pulse bg-border rounded-panel ${className}`} />;
  }

  // If src is a React element (JSX fallback), render it directly
  if (src && typeof src !== 'string') {
    return <div className={className}>{src}</div>;
  }

  // If src is a string URL, render as image
  if (src && typeof src === 'string') {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`auth-illustration ${className}`}
        loading="lazy"
      />
    );
  }

  // No illustration available — render fallback JSX
  if (fallback && typeof fallback !== 'string') {
    return <div className={className}>{fallback}</div>;
  }

  return null;
}
