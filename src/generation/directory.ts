const liveLoops = {
  dnb: `  sample :bass_dnb_f, amp: 5
    sample :loop_amen, amp: 5
    sleep 1`,
};

export type LiveLoopName = keyof typeof liveLoops;

export function getRubyForLiveLoop(name: LiveLoopName) {
  return liveLoops[name];
}

const effects = {
  echo: {
    mix: 0.5,
    vol: 0.2,
  },
  echo2: {
    cutoff: 2,
  },
};

export type EffectName = keyof typeof effects;

export function getParametersForEffect(name: EffectName) {
  return new Map(Object.entries(effects[name]));
}
