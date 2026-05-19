export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute rounded-full opacity-10 animate-ilearn-float"
        style={{
          width: 400, height: 400, top: -100, insetInlineEnd: -100,
          background: "var(--gradient-primary)",
        }}
      />
      <div
        className="absolute rounded-full opacity-10 animate-ilearn-float"
        style={{
          width: 300, height: 300, bottom: -80, insetInlineStart: -80,
          background: "var(--gradient-primary)",
          animationDelay: "5s",
        }}
      />
      <div
        className="absolute rounded-full opacity-10 animate-ilearn-float"
        style={{
          width: 200, height: 200, top: "40%", insetInlineStart: "60%",
          background: "var(--gradient-primary)",
          animationDelay: "10s",
        }}
      />
    </div>
  );
}