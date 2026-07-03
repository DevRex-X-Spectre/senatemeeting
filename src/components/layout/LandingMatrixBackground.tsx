const SNAKE_SEGMENTS = Array.from({ length: 14 }, (_, index) => index);

export function LandingMatrixBackground() {
  return (
    <div className="landing-grid-bg pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-pure-white/45" />
      <div className="landing-grid-glow landing-grid-glow-top" />
      <div className="landing-grid-glow landing-grid-glow-bottom" />
      <div className="landing-snake-track">
        {SNAKE_SEGMENTS.map((segment) => (
          <span
            key={segment}
            className="landing-snake-segment"
            style={{ animationDelay: `${segment * -0.13}s` }}
          />
        ))}
      </div>
    </div>
  );
}
