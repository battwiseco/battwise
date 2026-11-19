import React from "react";
import { interpolate, Sequence, useCurrentFrame, Easing } from "remotion";
import { C, Frame, HEAD, Hl, Stack, Tag, h1, h2, lead, small, useIn } from "./brand";

// 006 — How many charge cycles is your battery built for?
// Data: Apple Support 101575 (iPhone) + apple.com/batteries/service-and-recycling (iPad, Mac, Watch)
// 30 fps, 780 frames = 26 s

const Hook: React.FC = () => (
  <Stack>
    <div style={useIn(0)}><Tag>By the numbers</Tag></div>
    <div style={{ ...h1, ...useIn(3) }}>How many charges is your battery <Hl>built for?</Hl></div>
  </Stack>
);

const Cycle: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [30, 70], [0, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const b = interpolate(f, [80, 120], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Stack gap={50}>
      <div style={useIn(0)}><Tag ghost>First, what's a "cycle"?</Tag></div>
      <div style={{ ...h2, fontSize: 80, ...useIn(4) }}>One cycle = using <Hl>100%</Hl> in total, not one plug-in.</div>
      <div style={{ height: 90, borderRadius: 20, background: "rgba(234,248,243,0.08)", display: "flex", overflow: "hidden", ...useIn(20) }}>
        <div style={{ width: `${a}%`, background: C.teal }} />
        <div style={{ width: `${b}%`, background: C.lime }} />
      </div>
      <div style={{ ...lead, ...useIn(90) }}>60% today + 40% tomorrow = <b>1 cycle.</b></div>
    </Stack>
  );
};

const ROWS = [
  { name: "iPhone 14 and older", cycles: 500, color: C.warn },
  { name: "iPhone 15", cycles: 1000, color: C.teal },
  { name: "iPad", cycles: 1000, color: C.teal },
  { name: "MacBook", cycles: 1000, color: C.teal },
  { name: "Apple Watch", cycles: 1000, color: C.teal },
];

const Chart: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stack gap={34}>
      <div style={{ ...h2, fontSize: 72, ...useIn(0) }}>Cycles until <Hl>80%</Hl> capacity</div>
      {ROWS.map((r, i) => {
        const at = 18 + i * 22;
        const p = interpolate(f, [at, at + 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
        return (
          <div key={r.name} style={useIn(at - 6)}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 38, marginBottom: 10 }}>
              <span>{r.name}</span>
              <span style={{ fontFamily: HEAD, fontWeight: 700 }}>{Math.round(r.cycles * p).toLocaleString("en-US")}</span>
            </div>
            <div style={{ height: 50, borderRadius: 14, background: "rgba(234,248,243,0.08)" }}>
              <div style={{ height: 50, width: `${(r.cycles / 1000) * 100 * p}%`, minWidth: p > 0 ? 20 : 0, borderRadius: 14, background: r.color }} />
            </div>
          </div>
        );
      })}
      <div style={{ ...small, ...useIn(150) }}>Apple's design ratings, "under ideal conditions."</div>
    </Stack>
  );
};

const Years: React.FC = () => (
  <Stack gap={50}>
    <div style={useIn(0)}><Tag ghost>What that means</Tag></div>
    <div style={{ ...h2, ...useIn(4) }}>1 cycle a day ≈ <Hl>1,000 cycles in under 3 years.</Hl></div>
    <div style={{ ...lead, ...useIn(35) }}>Keep it cool and skip long stays at 100% to get the most out of every cycle.</div>
  </Stack>
);

const Outro: React.FC = () => (
  <Stack gap={50}>
    <div style={{ ...h1, fontSize: 100, ...useIn(0) }}>Check yours in <Hl>Settings › Battery.</Hl></div>
    <div style={{ ...lead, ...useIn(20) }}>Follow for more battery numbers.</div>
    <div style={{ ...small, ...useIn(30) }}>Sources: Apple Support "iPhone battery and performance"; Apple "Batteries: Service and Recycling".</div>
  </Stack>
);

export const ChargeCycles: React.FC = () => (
  <Frame>
    <Sequence durationInFrames={90}><Hook /></Sequence>
    <Sequence from={90} durationInFrames={180}><Cycle /></Sequence>
    <Sequence from={270} durationInFrames={240}><Chart /></Sequence>
    <Sequence from={510} durationInFrames={150}><Years /></Sequence>
    <Sequence from={660} durationInFrames={120}><Outro /></Sequence>
  </Frame>
);
