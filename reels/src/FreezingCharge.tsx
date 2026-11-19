import React from "react";
import { interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, Frame, HEAD, Hl, Stack, Tag, h1, h2, lead, small, useIn } from "./brand";

// 008 — Is it fine to charge your e-bike in a freezing garage? Data: Battery University BU-410, Table 1.
// 30 fps, 720 frames = 24 s

const ICE = "#8FD3FF";

const Stamp: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 180 } });
  return (
    <div style={{
      alignSelf: "flex-start", fontFamily: HEAD, fontWeight: 700, fontSize: 150, letterSpacing: "0.04em", color: C.warn,
      border: `12px solid ${C.warn}`, borderRadius: 32, padding: "4px 44px 14px",
      opacity: Math.min(1, s * 1.5), transform: `rotate(-5deg) scale(${interpolate(s, [0, 1], [1.8, 1])})`,
    }}>MYTH</div>
  );
};

const Hook: React.FC = () => (
  <Stack>
    <div style={useIn(0)}><Tag>Myth or fact?</Tag></div>
    <div style={{ ...h1, fontSize: 104, ...useIn(3) }}>It's fine to charge your e-bike in a <Hl color={ICE}>freezing garage.</Hl></div>
    <Stamp at={50} />
  </Stack>
);

const Why: React.FC = () => (
  <Stack gap={56}>
    <div style={useIn(0)}><Tag ghost>What actually happens</Tag></div>
    <div style={{ ...h2, ...useIn(4) }}>Below 0°C, lithium <Hl color={C.warn}>plates onto the anode</Hl> as metal.</div>
    <div style={{ ...lead, ...useIn(35) }}>It looks like it's charging normally. The damage is permanent and hurts both capacity and safety.</div>
  </Stack>
);

// Temperature scale: -20..60 °C mapped to 0..100% width
const pos = (t: number) => ((t + 20) / 80) * 100;

const Band: React.FC<{ from: number; to: number; color: string; at: number; label: string; top: number }> = ({ from, to, color, at, label, top }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", left: `${pos(from)}%`, width: `${(pos(to) - pos(from)) * p}%`, top, height: 64, borderRadius: 14,
      background: color, display: "flex", alignItems: "center", paddingLeft: 18, fontFamily: HEAD, fontWeight: 700, fontSize: 32,
      color: C.bg0, whiteSpace: "nowrap", overflow: "hidden",
    }}>{label}</div>
  );
};

const Range: React.FC = () => (
  <Stack gap={44}>
    <div style={{ ...h2, fontSize: 76, ...useIn(0) }}>The safe <Hl>charging</Hl> window</div>
    <div style={{ position: "relative", height: 250, ...useIn(10) }}>
      <Band from={0} to={45} color="rgba(31,214,180,0.5)" at={20} label="Charge OK" top={0} />
      <Band from={10} to={30} color={C.teal} at={60} label="Best" top={90} />
      <div style={{
        position: "absolute", left: 0, width: `${pos(0)}%`, top: 180, height: 64, borderRadius: 14, border: `4px dashed ${C.warn}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: C.warn, ...useIn(100),
      }}>No charge</div>
    </div>
    <div style={{ position: "relative", height: 40, fontSize: 32, color: C.muted, ...useIn(10) }}>
      {[-20, 0, 10, 30, 45].map((t) => (
        <span key={t} style={{ position: "absolute", left: `${pos(t)}%`, transform: t === -20 ? "none" : "translateX(-50%)" }}>{t}°C</span>
      ))}
    </div>
    <div style={{ ...small, ...useIn(130) }}>Charge OK 0–45°C, best 10–30°C. Consumer lithium-ion, Battery University BU-410 Table 1. Your manual's limits come first.</div>
  </Stack>
);

const Do: React.FC = () => (
  <Stack gap={50}>
    <div style={useIn(0)}><Tag ghost>Do this instead</Tag></div>
    <div style={{ ...h2, ...useIn(4) }}>Bring the battery inside. <Hl>Let it warm up, then charge.</Hl></div>
    <div style={{ ...lead, ...useIn(30) }}>Riding in the cold is fine. It's charging cold that does the damage.</div>
  </Stack>
);

const Outro: React.FC = () => (
  <Stack gap={50}>
    <div style={{ ...h1, fontSize: 100, ...useIn(0) }}>Send this to someone who <Hl>rides all winter.</Hl></div>
    <div style={{ ...small, ...useIn(20) }}>Source: Battery University, BU-410 "Charging at High and Low Temperatures".</div>
  </Stack>
);

export const FreezingCharge: React.FC = () => (
  <Frame>
    <Sequence durationInFrames={120}><Hook /></Sequence>
    <Sequence from={120} durationInFrames={150}><Why /></Sequence>
    <Sequence from={270} durationInFrames={210}><Range /></Sequence>
    <Sequence from={480} durationInFrames={135}><Do /></Sequence>
    <Sequence from={615} durationInFrames={105}><Outro /></Sequence>
  </Frame>
);
