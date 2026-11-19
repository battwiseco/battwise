import React from "react";
import { interpolate, Sequence, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Bed, C, Frame, HEAD, Hl, Scene, Sfx, Stack, Tag, h1, h2, lead, small, useIn } from "./brand";

// 004 — Should you drain your battery to 0% before charging? Data: Battery University BU-808, Table 2 (NMC).
// 30 fps, 785 frames = 26.2 s, voice + sound (tools/voice.py, tools/sfx.py)

const Stamp: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 180 } });
  return (
    <div style={{
      alignSelf: "flex-start", fontFamily: HEAD, fontWeight: 700, fontSize: 150, letterSpacing: "0.04em", color: C.warn,
      border: `12px solid ${C.warn}`, borderRadius: 32, padding: "4px 44px 14px",
      opacity: Math.min(1, s * 1.5), transform: `rotate(-5deg) scale(${interpolate(s, [0, 1], [1.8, 1])})`,
    }}>MYTH<Sfx name="stamp" at={at} /></div>
  );
};

const Hook: React.FC = () => (
  <Stack>
    <div style={useIn(0)}><Tag>Myth or fact?</Tag></div>
    <div style={{ ...h1, ...useIn(3) }}>Should you drain your phone to <Hl color={C.warn}>0%</Hl> before charging?</div>
    <Stamp at={100} />
  </Stack>
);

const Memory: React.FC = () => (
  <Stack gap={56}>
    <div style={useIn(0)}><Tag ghost>Where the myth came from</Tag></div>
    <div style={{ ...h2, ...useIn(4) }}>Old nickel batteries had a <Hl>"memory".</Hl></div>
    <div style={{ ...lead, ...useIn(35) }}>Lithium-ion doesn't. It never needs a full drain to stay healthy.</div>
  </Stack>
);

const ROWS = [
  { dod: "100% → 0%", cycles: 300 },
  { dod: "Use 40%", cycles: 1000 },
  { dod: "Use 20%", cycles: 2000 },
  { dod: "Use 10%", cycles: 6000 },
];

const Chart: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stack gap={40}>
      <div style={{ ...h2, fontSize: 76, ...useIn(0) }}>Smaller discharges = <Hl>more cycles</Hl></div>
      {ROWS.map((r, i) => {
        const at = 20 + i * 28;
        const p = interpolate(f, [at, at + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
        return (
          <div key={r.dod} style={useIn(at - 6)}>
            <Sfx name="pop" at={at} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 40, marginBottom: 12 }}>
              <span>{r.dod}</span>
              <span style={{ fontFamily: HEAD, fontWeight: 700 }}>~{Math.round(r.cycles * p).toLocaleString("en-US")}</span>
            </div>
            <div style={{ height: 60, borderRadius: 16, background: "rgba(234,248,243,0.08)" }}>
              <div style={{ height: 60, width: `${(r.cycles / 6000) * 100 * p}%`, minWidth: p > 0 ? 24 : 0, borderRadius: 16, background: i === 0 ? C.warn : C.teal }} />
            </div>
          </div>
        );
      })}
      <div style={{ ...small, ...useIn(140) }}>Cycles until capacity drops to 70%, NMC lithium-ion. Estimates: Battery University, BU-808.</div>
    </Stack>
  );
};

const Do: React.FC = () => (
  <Stack gap={50}>
    <div style={useIn(0)}><Tag ghost>Do this instead</Tag></div>
    <div style={{ ...h2, ...useIn(4) }}>Top up <Hl>whenever it suits you.</Hl></div>
    <div style={{ ...lead, ...useIn(30) }}>Short, frequent charges are easier on lithium-ion than running it flat.</div>
  </Stack>
);

const Outro: React.FC = () => (
  <Stack gap={50}>
    <div style={{ ...h1, fontSize: 104, ...useIn(0) }}>Follow for more <Hl>battery myths, busted.</Hl></div>
    <div style={{ ...small, ...useIn(20) }}>Source: Battery University, BU-808 "How to Prolong Lithium-based Batteries".</div>
  </Stack>
);

export const DrainMyth: React.FC = () => (
  <Frame>
    <Bed total={785} />
    <Scene comp="004-drain-myth" line="hook" from={0} dur={130}><Hook /></Scene>
    <Scene comp="004-drain-myth" line="memory" from={130} dur={150}><Memory /></Scene>
    <Scene comp="004-drain-myth" line="chart" from={280} dur={285}><Chart /></Scene>
    <Scene comp="004-drain-myth" line="do" from={565} dur={120}><Do /></Scene>
    <Scene comp="004-drain-myth" line="outro" from={685} dur={100}><Outro /></Scene>
  </Frame>
);
