// TODO add liveloops and get rid of stubs
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
    sleep 4
  end`,
  ambient_hum:
  `sync :metronome_4
  pitch_shift = [-1, 0, 1].choose
  sample :ambi_choir, attack: 0.25, rate: -0.33, pitch: pitch_shift`,
  drums_upbeat:
  `sync :metronome_2
  with_fx :level, amp: 0.4 do
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
  end
  end`,
  drums_chilled_dnb:
  `sync :metronome_4
  sample :loop_amen,  beat_stretch: 4
  sleep 4`,
  drums_dance:
  `sync :metronome_2
  sample :loop_industrial, beat_stretch: 2
  sleep 2`,
  drums_tabla:
  `sync :metronome_8
  sample :loop_tabla, beat_stretch: 16
  sleep 8`,
  drums_industrial:
  `sync :metronome_2
  sample :loop_industrial, beat_stretch: 2
  sleep 2`,
  lead_squelch:
  `sync :metronome_4
  with_synth :tb303 do
    with_fx :reverb, room: 0.8 do
      use_random_seed 3000
      16.times do
        n = (ring :e1, :e2, :e3).tick
        play n, release: 0.125, cutoff: rrand(70, 130), res: 0.9, wave: 1, amp: 0.8
        sleep 0.125
      end
    end
  end`,
  lead_bleeps:
  `sync :metronome_2
  8.times do
    play scale(:Eb2, :major_pentatonic, num_octaves: 3).choose, release: 0.1, amp: rand
    sleep 0.25
  end`,
  bass_stub:
  `sleep 1`,
  weird_space_scanner:
  `sync :metronome_4
  with_synth :tb303 do
    with_fx :reverb, room: 0.8 do
      with_fx :slicer, phase: 0.25, amp: 1.5 do
        co = (line 70, 130, steps: 8).tick
        play :e1, cutoff: co, release: 7, attack: 1, cutoff_attack: 4, cutoff_release: 4
        sleep 8
      end
    end
  end`,
};

export type LiveLoopName = keyof typeof liveLoops;

export type LiveLoopCatagory = 'drums' | 'ambient' | 'weird' | 'lead' | 'bass';

const catagories: {[P in LiveLoopCatagory]: LiveLoopName[]; } = {
  drums: [
    'drums_tabla',
    'drums_chilled_dnb',
    'drums_dance',
    'drums_upbeat',
    'drums_industrial',
  ],
  ambient: [
    'ambient_hum',
    'ambient_piano',
  ],
  weird: [
    'weird_vinyl',
    'weird_space_scanner',
  ],
  lead: [
    'lead_squelch',
    'lead_bleeps',
  ],
  bass: [
    'bass_stub',
  ],
};

export function getRubyForLiveLoop(name: LiveLoopName) {
  return liveLoops[name];
}

export function getLoopsOfType(l: LiveLoopCatagory) {
  return catagories[l];
}

const effects = [
  {
    name: 'level',
    parameters: {},
    colour: 0xffffff,
  },
  {
    name: 'reverb',
    parameters: {
      room: 0.99,
    },
    colour: 0xff6600,
  },
  {
    name: 'echo',
    parameters: {},
    colour: 0x00ffff,
  },
  {
    name: 'wobble',
    parameters: {},
    colour: 0x66ff33,
  },
  {
    name: 'whammy',
    parameters: {},
    colour: 0xff00ff,
  },
  {
    name: 'nhpf',
    parameters: {},
    colour: 0xffff00,
  },
];

export function getNumberOfEffects() {
  return effects.length;
}

export function getEffect(i: number) {
  return effects[i];
}
