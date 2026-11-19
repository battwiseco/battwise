import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";

// Fonts: Space Grotesk + Inter, SIL OFL 1.1
loadFont({ family: "Space Grotesk", url: staticFile("SpaceGrotesk.ttf"), weight: "300 700" });
loadFont({ family: "Inter", url: staticFile("Inter.ttf"), weight: "100 900" });

export const C = {
  bg0: "#07131F", bg1: "#14405C", teal: "#1FD6B4", lime: "#B6F55A", bolt: "#FFC933",
  ink: "#EAF8F3", muted: "#9CBACB", warn: "#FF8A6B", line: "rgba(234,248,243,0.14)",
};
export const HEAD = "'Space Grotesk', sans-serif";
export const BODY = "'Inter', sans-serif";
export const grad = `linear-gradient(90deg, ${C.teal}, ${C.lime})`;

export const Mark: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <svg viewBox="190 126 300 396" width={size * 0.76} height={size}>
    <defs>
      <linearGradient id="bwr" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor={C.teal} /><stop offset="1" stopColor={C.lime} />
      </linearGradient>
    </defs>
    <rect x="196" y="132" width="64" height="372" rx="32" fill={C.ink} />
    <circle cx="340" cy="372" r="112" fill="none" stroke="url(#bwr)" strokeWidth="64" />
    <polygon points="356,318 312,382 338,382 324,432 372,362 346,362" fill={C.bolt} />
  </svg>
);

/** Background + header + footer shared by every Reel. Safe zone: keep content between y 260 and 1500. */
export const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 90) * 20;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 70% 20%, ${C.bg1} 0%, ${C.bg0} 70%)`, color: C.ink, fontFamily: BODY }}>
      <div style={{ position: "absolute", width: 1000, height: 1000, right: -420 + drift, bottom: -300, borderRadius: "50%", border: `150px solid ${C.teal}`, opacity: 0.06 }} />
      <div style={{ position: "absolute", top: 150, left: 80, display: "flex", alignItems: "center", gap: 18, fontFamily: HEAD, fontWeight: 700, fontSize: 40 }}>
        <Mark size={64} /> battwise
      </div>
      <AbsoluteFill style={{ padding: "0 80px" }}>{children}</AbsoluteFill>
      <div style={{ position: "absolute", bottom: 330, left: 80, fontFamily: HEAD, fontSize: 32, color: C.muted, fontWeight: 500 }}>@battwise.co</div>
    </AbsoluteFill>
  );
};

/** fade+rise in at `at`, optional fade out at `out` (frames) */
export const useIn = (at: number, out?: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 200 } });
  const o = out === undefined ? 1 : interpolate(f, [out, out + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { opacity: s * o, transform: `translateY(${(1 - s) * 40}px)` };
};

export const Tag: React.FC<{ children: React.ReactNode; ghost?: boolean }> = ({ children, ghost }) => (
  <span style={{
    alignSelf: "flex-start", fontFamily: HEAD, fontWeight: 700, fontSize: 34, letterSpacing: "0.12em", textTransform: "uppercase",
    padding: "14px 28px", borderRadius: 999,
    ...(ghost ? { color: C.lime, border: `3px solid ${C.lime}` } : { color: C.bg0, background: grad }),
  }}>{children}</span>
);

export const Hl: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => (
  <span style={color ? { color } : { background: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{children}</span>
);

export const h1: React.CSSProperties = { fontFamily: HEAD, fontWeight: 700, fontSize: 116, lineHeight: 1.0, letterSpacing: "-0.035em" };
export const h2: React.CSSProperties = { fontFamily: HEAD, fontWeight: 700, fontSize: 88, lineHeight: 1.04, letterSpacing: "-0.03em" };
export const lead: React.CSSProperties = { fontSize: 50, lineHeight: 1.3 };
export const small: React.CSSProperties = { fontSize: 34, lineHeight: 1.4, color: C.muted };

/** Vertical stack centred in the safe zone */
export const Stack: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 44 }) => (
  <div style={{ position: "absolute", top: 280, bottom: 420, left: 80, right: 80, display: "flex", flexDirection: "column", justifyContent: "center", gap }}>{children}</div>
);

// ---------- Sound ----------
// Voice lines: reels/public/vo/<comp>/<line>.wav (tools/voice.py, Kokoro, Apache 2.0)
// Sound kit:   reels/public/sfx/*.wav (tools/sfx.py, synthesized in code)

/** One-shot sound effect at `at` frames (relative to the enclosing Sequence). */
export const Sfx: React.FC<{ name: "whoosh" | "pop" | "stamp"; at?: number; volume?: number }> = ({ name, at = 0, volume }) => (
  <Sequence from={Math.max(0, at)} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume ?? { whoosh: 0.3, pop: 0.35, stamp: 0.6 }[name]} />
  </Sequence>
);

/** Ambient bed under the whole reel, faded in/out. */
export const Bed: React.FC<{ total: number; volume?: number }> = ({ total, volume = 0.12 }) => (
  <Audio
    src={staticFile("sfx/pad.wav")}
    volume={(f) => interpolate(f, [0, 20, total - 40, total], [0, volume, volume, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
  />
);

/** A scene: Sequence + transition whoosh + its voice line (starts `delay` frames in). */
export const Scene: React.FC<{ comp: string; line: string; from?: number; dur: number; delay?: number; whoosh?: boolean; children: React.ReactNode }> = ({
  comp, line, from = 0, dur, delay = 6, whoosh = true, children,
}) => (
  <Sequence from={from} durationInFrames={dur}>
    {whoosh && from > 0 ? <Sfx name="whoosh" /> : null}
    <Sequence from={delay} layout="none"><Audio src={staticFile(`vo/${comp}/${line}.wav`)} /></Sequence>
    {children}
  </Sequence>
);
