import React from "react";
import { Composition, registerRoot } from "remotion";
import { EvCold } from "./EvCold";
import { DrainMyth } from "./DrainMyth";
import { ChargeCycles } from "./ChargeCycles";
import { FreezingCharge } from "./FreezingCharge";

const Root: React.FC = () => (
  <>
    <Composition id="002-ev-cold" component={EvCold} durationInFrames={750} fps={30} width={1080} height={1920} />
    <Composition id="004-drain-myth" component={DrainMyth} durationInFrames={720} fps={30} width={1080} height={1920} />
    <Composition id="006-charge-cycles" component={ChargeCycles} durationInFrames={780} fps={30} width={1080} height={1920} />
    <Composition id="008-freezing-charge" component={FreezingCharge} durationInFrames={720} fps={30} width={1080} height={1920} />
  </>
);

registerRoot(Root);
