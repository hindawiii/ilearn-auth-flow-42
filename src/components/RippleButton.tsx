import { forwardRef, useState, type ButtonHTMLAttributes, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type Ripple = { id: number; x: number; y: number; size: number };

export const RippleButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, children, ...rest }, ref) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const handle = (e: MouseEvent<HTMLButtonElement>) => {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const id = Date.now() + Math.random();
      const r: Ripple = { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size };
      setRipples((rs) => [...rs, r]);
      setTimeout(() => setRipples((rs) => rs.filter((x) => x.id !== id)), 650);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        {...rest}
        onClick={handle}
        className={cn("relative overflow-hidden", className)}
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className="ilearn-ripple"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          />
        ))}
        <span className="relative">{children}</span>
      </button>
    );
  },
);
RippleButton.displayName = "RippleButton";