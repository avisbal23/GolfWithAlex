import { useEffect, useState } from 'react';

interface BirdieCelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
}

const COLORS = [
  '#FFD700',
  '#FFC107',
  '#FFEB3B',
  '#FF9800',
  '#4CAF50',
];

export function BirdieCelebration({ isVisible, onComplete }: BirdieCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 40; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 0.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 8 + Math.random() * 8,
        });
      }
      setParticles(newParticles);
      setShowText(true);

      const timer = setTimeout(() => {
        setShowText(false);
        setParticles([]);
        onComplete();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
      data-testid="celebration-birdie"
    >
      {showText && (
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce-in"
          data-testid="text-birdie-container"
        >
          <div 
            className="text-5xl sm:text-6xl font-bold text-center drop-shadow-lg"
            style={{ color: '#FFD700', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
            data-testid="text-birdie"
          >
            BIRDIE!
          </div>
        </div>
      )}

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            top: '-20px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: '2px',
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes bounce-in {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          70% { transform: translate(-50%, -50%) scale(0.9); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
        .animate-confetti-fall {
          animation: confetti-fall 2.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
