'use client';

import { useIllustrations } from '@/contexts/IllustrationProvider';

export default function IllustrationDisplay({ name, alt = '', className = '', fallback = null }) {
  const { getIllustration, loading } = useIllustrations();
  const src = getIllustration(name, fallback);

  if (!src && !loading) return null;
  if (loading) {
    return <div className={`animate-pulse bg-border rounded-panel ${className}`} />;
  }

  return (
    <img
      src={src}
      alt={alt || name}
      className={`auth-illustration ${className}`}
      loading="lazy"
    />
  );
}
