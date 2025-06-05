import React, { useState, useEffect, useRef } from 'react';
import './MathEngineStartup.css';

interface MathEngineStartupProps {
  userName: string;
  userAvatar?: string;
  onComplete: () => void;
}

const MathEngineStartup: React.FC<MathEngineStartupProps> = ({
  userName,
  userAvatar,
  onComplete
}) => {
  const [phase, setPhase] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  // Particle system for equations
  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    text: string;
    size: number;
    opacity: number;
    color: string;
    targetX?: number;
    targetY?: number;
    isConverging: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 20;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = -Math.random() * 2 - 1;
      this.text = this.getRandomEquation();
      this.size = Math.random() * 14 + 10;
      this.opacity = 0;
      this.color = this.getRandomColor();
    }

    getRandomEquation(): string {
      const equations = [
        '2 + 2', '3 × 4', '10 - 5', '8 ÷ 2', '5²', '√16',
        '7 + 3', '6 × 2', '15 - 8', '12 ÷ 3', '3³', '√25',
        'π', '∞', '∑', '∫', 'dx', 'φ'
      ];
      return equations[Math.floor(Math.random() * equations.length)];
    }

    getRandomColor(): string {
      const colors = ['#10b981', '#3b82f6', '#8b5cf6'];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    update(canvas: HTMLCanvasElement, phase: number): void {
      if (phase === 3 && !this.isConverging) {
        // Start converging to center
        this.isConverging = true;
        this.targetX = canvas.width / 2 + (Math.random() - 0.5) * 100;
        this.targetY = canvas.height / 2 + (Math.random() - 0.5) * 100;
      }

      if (this.isConverging && this.targetX && this.targetY) {
        // Converge to center for triple helix
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.x += dx * 0.05;
        this.y += dy * 0.05;
        
        // Spiral motion
        const angle = Date.now() * 0.001;
        this.x += Math.cos(angle + this.x * 0.01) * 0.5;
        this.y += Math.sin(angle + this.y * 0.01) * 0.5;
      } else {
        // Normal floating motion
        this.x += this.vx;
        this.y += this.vy;
      }

      // Fade in and out
      if (this.opacity < 1 && this.y > canvas.height * 0.3) {
        this.opacity += 0.02;
      }
      if (this.y < canvas.height * 0.2 || (phase === 3 && this.opacity > 0)) {
        this.opacity -= phase === 3 ? 0.01 : 0.02;
      }
    }

    draw(ctx: CanvasRenderingContext2D): void {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.font = `${this.size}px 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(this.text, this.x, this.y);
      ctx.restore();
    }
  }

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles in phase 2 and 3
      if (phase >= 2 && Math.random() < 0.1) {
        particlesRef.current.push(new Particle(canvas));
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.update(canvas, phase);
        particle.draw(ctx);
        return particle.opacity > 0 && particle.y > -20;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase]);

  // Phase transitions
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(2), 1000);
    const timer2 = setTimeout(() => setPhase(3), 2000);
    const timer3 = setTimeout(() => {
      setPhase(4); // Final compression phase
      setTimeout(onComplete, 500);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="math-engine-startup">
      <canvas ref={canvasRef} className="particle-canvas" />
      
      <div className={`startup-content phase-${phase}`}>
        {/* Phase 1: Welcome */}
        <div className={`phase phase-1 ${phase === 1 ? 'active' : ''}`}>
          <div className="avatar-container">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="user-avatar" />
            ) : (
              <div className="avatar-placeholder">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="avatar-pulse" />
          </div>
          <h1 className="welcome-text">Welcome back, {userName}!</h1>
        </div>

        {/* Phase 2: Engines */}
        <div className={`phase phase-2 ${phase === 2 ? 'active' : ''}`}>
          <h2 className="firing-text">Firing up your math engines...</h2>
          <div className="engines-container">
            <div className="engine engine-1">
              <div className="cylinder">
                <div className="cylinder-top" />
                <div className="cylinder-body">
                  <div className="energy-flow" />
                </div>
                <div className="cylinder-bottom" />
              </div>
              <div className="engine-glow" />
            </div>
            <div className="engine engine-2">
              <div className="cylinder">
                <div className="cylinder-top" />
                <div className="cylinder-body">
                  <div className="energy-flow" />
                </div>
                <div className="cylinder-bottom" />
              </div>
              <div className="engine-glow" />
            </div>
            <div className="engine engine-3">
              <div className="cylinder">
                <div className="cylinder-top" />
                <div className="cylinder-body">
                  <div className="energy-flow" />
                </div>
                <div className="cylinder-bottom" />
              </div>
              <div className="engine-glow" />
            </div>
          </div>
        </div>

        {/* Phase 3: Calculating */}
        <div className={`phase phase-3 ${phase === 3 ? 'active' : ''}`}>
          <h2 className="calculating-text">Calculating your perfect challenge...</h2>
          <div className="triple-helix-container">
            <div className="helix-strand strand-1" />
            <div className="helix-strand strand-2" />
            <div className="helix-strand strand-3" />
            <div className="helix-glow" />
          </div>
        </div>

        {/* Phase 4: Final compression */}
        <div className={`phase phase-4 ${phase === 4 ? 'active' : ''}`}>
          <div className="compression-dots">
            <div className="dot dot-1" />
            <div className="dot dot-2" />
            <div className="dot dot-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathEngineStartup;