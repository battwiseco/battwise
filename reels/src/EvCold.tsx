import React from "react";
import { interpolate, Sequence, useCurrentFrame, Easing } from "remotion";
import { Bed, C, Frame, HEAD, Hl, Scene, Sfx, Stack, Tag, h1, h2, lead, small, useIn } from "./brand";

// 002 — How cold weather cuts EV range. Data: AAA (2019), 5 EVs on a dynamometer.
// 30 fps, 825 frames = 27.5 s, voice + sound (tools/voice.py, tools/sfx.py)

const Counter: React.FC = () => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [10, 55], [0, 41], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  return <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 330, lineHeight: 0.9, letterSpacing: "-0.05em", color: C.warn }}>−{v}%</div>;
};

const Hook: React.FC = () => (
  <Stack>
    <div style={useIn(0)}><Tag>Winter range</Tag></div>
    <div style={{ ...h2, ...useIn(3) }}>A cold day can cut your EV's range by</div>
    <div style={useIn(8)}><Counter /></div>
  </Stack>
);

const Bar: React.FC<{ label: string; value: number; color: string; at: number; note: string }> = ({ label, value, color, at, note }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [at, at + 30], [0, value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ ...useIn(at - 6) }}>
      <Sfx name="pop" at={at} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 40, marginBottom: 14 }}>
        <span>{label}</span><span style={{ fontFamily: HEAD, fontWeight: 700 }}>{Math.round(w)} mi</span>
      </div>
      <div style={{ height: 70, borderRadius: 18, background: "rgba(234,248,243,0.08)" }}>
        <div style={{ height: 70, width: `${w}%`, borderRadius: 18, background: color }} />
      </div>
      <div style={{ ...small, marginTop: 10 }}>{note}</div>
    </div>
  );
};

const Bars: React.FC = () => (
  <Stack gap={50}>
    <div style={{ ...h2, fontSize: 76, ...useIn(0) }}>Every 100 miles of range at 24°C (75°F) becomes:</div>
    <Bar label="At 24°C (75°F)" value={100} color={C.teal} at={12} note="baseline" />
    <Bar label="At −7°C (20°F), heater off" value={88} color={C.bolt} at={40} note="−12%" />
    <Bar label="At −7°C (20°F), heater on" value={59} color={C.warn} at={70} note="−41%" />
  </Stack>
);

const Why: React.FC = () => (
  <Stack gap={56}>
    <div style={useIn(0)}><Tag ghost>Why it happens</Tag></div>
    <div style={{ ...h2, ...useIn(4) }}>Most of the loss is <Hl>heating</Hl>, not the battery.</div>
    <div style={{ ...lead, ...useIn(30) }}><b style={{ color: C.bolt }}>1 ·</b> Cold slows the chemistry inside the cells.</div>
    <div style={{ ...lead, ...useIn(60) }}><b style={{ color: C.warn }}>2 ·</b> Warming the cabin and the battery uses the same energy that would move the car.</div>
  </Stack>
);

const Fix: React.FC = () => (
  <Stack gap={50}>
    <div style={useIn(0)}><Tag ghost>Win it back</Tag></div>
    <div style={{ ...h2, ...useIn(4) }}>Pre-heat while it's <Hl>still plugged in.</Hl></div>
    <div style={{ ...lead, ...useIn(30) }}>The car warms up on grid power, not on your range.</div>
    <div style={{ ...lead, ...useIn(55) }}>Park in a garage when you can, and plan charging stops on cold trips.</div>
  </Stack>
);

const Outro: React.FC = () => (
  <Stack gap={50}>
    <div style={{ ...h1, fontSize: 104, ...useIn(0) }}>Send this to an EV driver <Hl>before winter.</Hl></div>
    <div style={{ ...small, ...useIn(20) }}>Source: AAA, 2019. Five EVs tested on a dynamometer in a climate-controlled lab. Your car will vary.</div>
  </Stack>
);

export const EvCold: React.FC = () => (
  <Frame>
    <Bed total={825} />
    <Scene comp="002-ev-cold" line="hook" from={0} dur={150}><Hook /></Scene>
    <Scene comp="002-ev-cold" line="bars" from={150} dur={210}><Bars /></Scene>
    <Scene comp="002-ev-cold" line="why" from={360} dur={150}><Why /></Scene>
    <Scene comp="002-ev-cold" line="fix" from={510} dur={195}><Fix /></Scene>
    <Scene comp="002-ev-cold" line="outro" from={705} dur={120}><Outro /></Scene>
  </Frame>
);
