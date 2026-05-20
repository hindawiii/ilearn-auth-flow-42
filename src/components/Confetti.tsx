import { useEffect, useState } from "react";

const COLORS = ["#6C5CE7", "#00D2D3", "#FFD93D", "#FF6B6B", "#00B894", "#E84393"];

export function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<Array<{ id: number; left: number; delay: number; color: string; duration: number }>>([]);

  useEffect(() => {
    if (!trigger) return;
    const arr = Array.from({ length: 80 }, (_, i) => ({
      id: trigger * 1000 + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: COLORS[i % COLORS.length],
      duration: 2 + Math.random() * 1.5,
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!pieces.length) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="ilearn-confetti"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            borderRadius: Math.random() > 0.5 ? "2px" : "50%",
          }}
        />
      ))}
    </div>
  );
}