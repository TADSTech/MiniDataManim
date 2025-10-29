import { useState, useCallback, useEffect } from 'react';

export function useViewOperations() {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 10, 200));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 10, 50));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return {
    zoom,
    isFullscreen,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleFullscreen,
  };
}
