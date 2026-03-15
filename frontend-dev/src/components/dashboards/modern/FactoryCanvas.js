import { useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import BlueprintSkyscraper from './BlueprintSkyscraper';

const FactoryCanvas = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      // Initialize the futuristic blueprint skyscraper scene
      sceneRef.current = new BlueprintSkyscraper(canvasRef.current, theme);

      // Handle window resize
      const handleResize = () => {
        if (canvasRef.current && sceneRef.current) {
          const width = canvasRef.current.clientWidth;
          const height = canvasRef.current.clientHeight;
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          sceneRef.current.onWindowResize?.();
        }
      };

      window.addEventListener('resize', handleResize);

      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        if (sceneRef.current) {
          sceneRef.current.dispose();
          sceneRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing Blueprint Skyscraper scene:', error);
    }
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
};

export default FactoryCanvas;
