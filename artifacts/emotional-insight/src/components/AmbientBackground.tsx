// Soft drifting background. Swap or remove freely without breaking layout.
export function AmbientBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <div
        className="ambient-orb"
        style={{
          width: 480,
          height: 480,
          top: "-10%",
          left: "-10%",
          background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)",
          animationDelay: "0s",
        }}
      />
      <div
        className="ambient-orb"
        style={{
          width: 380,
          height: 380,
          bottom: "-8%",
          right: "-8%",
          background: "radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)",
          animationDelay: "-8s",
        }}
      />
      <div
        className="ambient-orb"
        style={{
          width: 260,
          height: 260,
          top: "40%",
          left: "55%",
          background: "radial-gradient(circle, hsl(var(--muted)) 0%, transparent 70%)",
          animationDelay: "-16s",
          opacity: 0.35,
        }}
      />
    </div>
  );
}
