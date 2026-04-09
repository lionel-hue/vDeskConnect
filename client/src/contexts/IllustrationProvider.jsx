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
      data.forEach((ill) => { keyed[ill.key] = ill.url; });
      setIllustrations(keyed);
    } catch {
      setIllustrations({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIllustrations(); }, [fetchIllustrations]);

  const getIllustration = useCallback(
    (key, fallback = null) => illustrations[key] || fallback,
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
