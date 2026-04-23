// components/LotteryVisualizer.tsx
import {  Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LotteryVisualizer({
  onComplete,
  eventTitle,
}: {
  onComplete: () => void;
  eventTitle: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 30000; // 30 secondes
    const interval = 100; // Update chaque 100ms
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500); // Petit délai après 100%
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
      <div className="relative w-64 h-64 mb-8">
        {/* La Roue (Animation de rotation) */}
        <div className="absolute inset-0 rounded-full border-8 border-dashed border-brand animate-[spin_3s_linear_infinite]" />
        <div className="absolute inset-4 rounded-full border-4 border-double border-muted/20 animate-[spin_10s_linear_infinite_reverse]" />

        <div className="absolute inset-0 flex flex-center items-center justify-center flex-col">
          <Trophy className="h-16 w-16 text-brand animate-bounce" />
          <span className="text-2xl font-bold mt-2">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-title font-bold mb-2">Tirage en cours...</h2>
      <p className="text-muted mb-8 max-w-md">
        Sélection du gagnant pour : <br />
        <span className="text-foreground font-bold">{eventTitle}</span>
      </p>

      {/* Barre de progression professionnelle */}
      <div className="w-full max-w-md bg-muted/20 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
