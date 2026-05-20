import { useMemo } from "react";

export function Particles({ count = 40 }: { count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        dx: (Math.random() - 0.5) * 120,
        dy: (Math.random() - 0.5) * 120,
        duration: 12 + Math.random() * 18,
        delay: Math.random() * -20,
        opacity: 0.15 + Math.random() * 0.25,
      })),
    [count],
  );
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {items.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-primary"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            ["--dx" as string]: `${p.dx}px`,
            ["--dy" as string]: `${p.dy}px`,
            animation: `ilearn-particle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}