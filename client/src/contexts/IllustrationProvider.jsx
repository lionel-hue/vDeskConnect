'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

const IllustrationContext = createContext(null);

export function IllustrationProvider({ children }) {
  const [illustrations, setIllustrations] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchIllustrations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/ui/illustrations');
      const keyed = {};
      (data || []).forEach((ill) => { if (ill && ill.key && ill.url) keyed[ill.key] = ill.url; });
      setIllustrations(keyed);
    } catch {
      // Backend not ready yet — use fallback illustrations silently
      setIllustrations({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIllustrations(); }, [fetchIllustrations]);

  const getIllustration = useCallback(
    (key, fallback = null) => {
      const url = illustrations[key];
      // Only return a string URL (or the fallback which could be a string or JSX)
      return (typeof url === 'string' && url) ? url : fallback;
    },
    [illustrations]
  );

  return (
    <IllustrationContext.Provider value={{ illustrations, loading, getIllustration, refresh: fetchIllustrations }}>
      {children}
    </IllustrationContext.Provider>
  );
}

export function useIllustrations() {
  const ctx = useContext(IllustrationContext);
  if (!ctx) throw new Error('useIllustrations must be used within IllustrationProvider');
  return ctx;
}
