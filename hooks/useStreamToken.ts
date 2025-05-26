import { useState, useCallback, useEffect } from 'react';
import { TOKEN_REFRESH_INTERVAL } from '@/config';

interface UseStreamTokenParams {
  contentId: string | number;
  mediaType: 'movie' | 'show';
  qualityIndex?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  isActive: boolean;
}

export function useStreamToken({
  contentId,
  mediaType,
  qualityIndex = 0,
  seasonNumber,
  episodeNumber,
  isActive
}: UseStreamTokenParams) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(async () => {
    if (!contentId || !isActive) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/generateStreamToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: contentId.toString(),
          mediaType,
          qualityIndex,
          seasonNumber,
          episodeNumber
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate stream token');
      }
      
      const data = await response.json();
      setToken(data.token);
    } catch (err) {
      console.error('Token generation error:', err);
      setError('Failed to generate stream token');
    } finally {
      setLoading(false);
    }
  }, [contentId, mediaType, qualityIndex, seasonNumber, episodeNumber, isActive]);


  useEffect(() => {
    if (isActive) {
      getToken();
    }
  }, [isActive, getToken]);


  useEffect(() => {
    if (!isActive) return;
    
    // Refresh token 
    const refreshInterval = setInterval(getToken, TOKEN_REFRESH_INTERVAL);
    
    return () => clearInterval(refreshInterval);
  }, [isActive, getToken]);

  return {
    token,
    loading,
    error,
    refreshToken: getToken,
    streamUrl: token ? `/api/stream?token=${token}` : null
  };
}