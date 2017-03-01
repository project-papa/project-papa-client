// TODO add liveloops
const liveLoops = {
  ambient_piano:
  `sync :metronome_4
  with_fx :level, amp: 1.5 do
    sp_time = [1, 2, 3, 4].choose
    sp_rate = 1
    s = sample :ambi_piano, cutoff: rrand(70, 130), rate: sp_rate * choose([0.25, 0.5, 0.75, 1]), pan: rrand(-1, 1), pan_slide: sp_time
    control s, pan: rrand(-1, 1)
    sleep 4
  end`,
  weird_vinyl:
  `sync :metronome_4
  with_fx :wobble, mix: 0.4 do
    sample :vinyl_scratch
    sleep 0.5
    sample :vinyl_scratch
    sample :vinyl_hiss
    sleep 0.5
    sample :vinyl_rewind
    sleep 3
  end`,
  drums_upbeat:
  `sync :metronome_2
  with_fx :distortion, distort: 0.7 do
    sample :drum_heavy_kick
    sleep 0.5
    sample :drum_cymbal_pedal
    sleep 0.25
    sample :drum_cymbal_closed
    sleep 0.25
    sample :drum_snare_hard
    sample :drum_heavy_kick
    sleep 0.25
    sample :drum_cymbal_closed
    sleep 0.25
    sample :drum_cymbal_pedal
    sleep 0.25
    sample :drum_cymbal_closed
    sleep 0.25
  end`,
};

export type LiveLoopName = keyof typeof liveLoops;

export function getRubyForLiveLoop(name: LiveLoopName) {
  return liveLoops[name];
}

// TODO insert correct colours and add parameters
const effects = [
  {
    name: 'level',
    parameters: {},
    colour: 0xffffff,
  },
  {
    name: 'reverb',
    parameters: {
      room: 0.85,
    },
    colour: 0xffffff,
  },
  {
    name: 'echo',
    parameters: {},
    colour: 0xffffff,
  },
  {
    name: 'wobble',
    parameters: {},
    colour: 0xffffff,
  },
  {
    name: 'whammy',
    parameters: {},
    colour: 0xffffff,
  },
  {
    name: 'hpf',
    parameters: {},
    colour: 0xffffff,
  },
];

export type EffectName = keyof typeof effects;

export function getEffect(i : number) {
  return this.effects[i];
}
