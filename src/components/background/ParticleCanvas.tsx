import { useEffect, useRef } from "react";

const colorBackground = "#030305";
const colorArc = "#6D28D9";
const particleSize = 2;
const particleGap = 28;

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  size: number;
  draw(ctx: CanvasRenderingContext2D): void;
  update(mouse: MouseState): void;
}

interface MouseState {
  x: number | undefined;
  y: number | undefined;
  radius: number;
}

function createParticle(x: number, y: number): Particle {
  return {
    x,
    y,
    originX: x,
    originY: y,
    size: particleSize,
    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = colorArc;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    },
    update(mouse: MouseState) {
      if (mouse.x === undefined || mouse.y === undefined) return;

      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius && distance > 0) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (mouse.radius - distance) / mouse.radius;
        const directionX = forceDirectionX * force * 5;
        const directionY = forceDirectionY * force * 5;

        this.x -= directionX;
        this.y -= directionY;
      }

      this.x += (this.originX - this.x) * 0.08;
      this.y += (this.originY - this.y) * 0.08;
    },
  };
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<MouseState>({ x: undefined, y: undefined, radius: 150 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    function init() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const resolutionScale = Math.min(window.devicePixelRatio, 2);
      canvas.width = width * resolutionScale;
      canvas.height = height * resolutionScale;
      ctx!.scale(resolutionScale, resolutionScale);

      particlesRef.current = [];
      for (let x = 0; x < width; x += particleGap) {
        for (let y = 0; y < height; y += particleGap) {
          particlesRef.current.push(createParticle(x, y));
        }
      }
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.fillStyle = colorBackground;
      ctx.fillRect(0, 0, width, height);

      for (const p of particlesRef.current) {
        p.update(mouseRef.current);
        p.draw(ctx);
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleResize = () => {
      init();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    init();
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
      }}
    />
  );
}
