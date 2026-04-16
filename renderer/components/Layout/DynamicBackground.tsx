export function DynamicBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-(--accent-secondary)/10 blur-[140px] rounded-full mix-blend-screen animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-(--accent-fuchsia)/10 blur-[140px] rounded-full mix-blend-screen" />
      <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-(--accent-blue)/5 blur-[120px] rounded-full" />
      {/* Subtle noise texture over background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
        }}
      ></div>
    </div>
  );
}
