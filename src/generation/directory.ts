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
  ambient_phase:
  `sync :metronome_8
  tick
  synth :zawa, wave: 1, phase: 0.5, release: 10, note: (knit :e1, 12, :c1, 4).look, cutoff: (line 60, 120, steps: 6).look
  sleep 8`,
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
  drums_tabla:
  `sync :metronome_8
  sample :loop_tabla, beat_stretch: 16
  sleep 8`,
  drums_industrial:
  `sync :metronome_2
  sample :loop_industrial, beat_stretch: 2
  sleep 2`,
  drums_compus:
  `sync :metronome_8
  sample :loop_compus, beat_stretch: 8
  sleep 1`,
  drums_garzul:
  `sync :metronome_8
  sample :loop_garzul, beat_stretch: 16
  sleep 8`,
  drums_mika:
  `sync :metronome_8
  sample :loop_mika, beat_stretch: 16
  sleep 8`,
  drums_safari:
  `sync :metronome_4
  sample :loop_safari, beat_stretch: 16
  sleep 8`,
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
  lead_sharp:
  `sync :metronome_4
  use_synth :dsaw
  use_random_seed 310003
  ns = (scale :e2, :minor_pentatonic, num_octaves: 4).take(4)
  16.times do
    play ns.choose, detune: 12, release: 0.2, amp: 2, amp: rand + 0.5, cutoff: rrand(70, 120), amp: 2
    sleep 0.25
  end`,
  lead_blimps:
  `sync :metronome_4
  use_random_seed 4000
  8.times do
    play chord(:e3, :m7).choose, release: 0.1, pan: rrand(-1, 1, res: 0.9), amp: 1
    sleep 0.5 
  end`,
  lead_drive:
  `sync :metronome_1
  tick(:note) if factor? tick, 4
  use_synth :square
  density 2 do
    play (knit :c2, 2, :e1, 1, :f3, 1).look(:note), release: 0.5, attack: 0.25, amp: 1, cutoff: rrand_i(100, 130)
    sleep 1
  end`,
  lead_shufflit:
  `sync :metronome_8
  use_synth :beep
  notes = scale(:e3, :minor_pentatonic, num_octaves: 1)
  use_random_seed 679
  with_fx :echo, phase: 0.125, mix: 0.4, reps: 16 do
    play notes.choose, attack: 0, release: 0.1, pan: (range -1, 1, step: 0.125).tick, amp: rrand(2, 2.5)
    sleep 0.5
  end`,
  bass_breakbeat:
  `sync :metronome_4
  sample :loop_breakbeat, beat_stretch: 4
  sleep 4`,
  bass_melodic:
  `sync :metronome_1
  tick
  cue :beat, count: look
  sample :bd_haus, amp: factor?(look, 8) ? 3 : 2
  sleep 0.5
  use_synth :fm
  play :e2, release: 1, amp: 1 if factor?(look, 4)
  synth :noise, release: 0.051, amp: 0.5
  sleep 0.5`,
  bass_pulse:
  `sync :metronome_2
  use_synth :mod_pulse
  use_synth_defaults amp: 1, mod_range: 15, cutoff: 80, pulse_width: 0.2, attack: 0.03, release: 0.6,  mod_phase: 0.25, mod_invert_wave: 1
  play :a0
  sleep 0.5
  play :d1
  sleep 0.5
  play :a0
  sleep 0.5
  play :d1
  sleep 0.5`,
  bass_growing:
  `sync :metronome_8
  with_fx :hpf, cutoff: 10, reps: 8 do
    tick
    sample :bd_tek, amp: factor?(look, 8) ? 6 : 4
    sleep 0.5
    use_synth :tb303
    use_synth_defaults cutoff_attack: 2, cutoff_release: 0, env_curve: 2
    play (knit :e2, 24, :c2, 8).look, release: 2.5, cutoff: (range 70, 90).look, depth: 10 , amp: 2 if factor?(look, 2)
    sample :sn_dub, rate: -1, sustain: 0, release: (knit 0.05, 3, 0.5, 1).look
    sleep 0.5
  end`,
  bass_blue_monday:
  `sync :metronome_8
  use_synth :mod_saw
  use_synth_defaults amp: 0.5, attack: 0, sustain: 2, release: 0.25, mod_range: 12, mod_phase: 0.5, mod_invert_wave: 1
  notes = (ring :F, :C, :D, :D, :G, :C, :D, :D)
  notes.each do |n|
    tick
    play note(n, octave: 1), cutoff: (line 90, 130, steps: 16).look
    play note(n, octave: 2), cutoff: (line 90, 130, steps: 32).look
    sleep 2
  end`,
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
  weird_saw:
  `sync :metronome_8
  n = [:e2, :e2, :a3].choose
  with_synth :dsaw do
    with_transpose -12 do
      in_thread do
        2.times do
          play n, attack: 0.6, release: 4, detune: rrand(0, 0.1), cutoff: rrand(80, 120)
          sleep 2
        end
      end
    end
  end
  sleep 1
  with_synth :tri do
    play chord(n, :m7), amp: 5, release: 4
  end
  sleep 1`,
};

export type LiveLoopName = keyof typeof liveLoops;

export type LiveLoopCatagory = 'drums' | 'ambient' | 'weird' | 'lead' | 'bass';

const catagories: {[P in LiveLoopCatagory]: LiveLoopName[]; } = {
  drums: [
    'drums_tabla',
    'drums_chilled_dnb',
    'drums_upbeat',
    'drums_industrial',
    'drums_compus',
    'drums_garzul',
    'drums_safari',
    'drums_mika',
  ],
  ambient: [
    'ambient_hum',
    'ambient_piano',
    'ambient_phase',
  ],
  weird: [
    'weird_vinyl',
    'weird_space_scanner',
    'weird_saw',
  ],
  lead: [
    'lead_squelch',
    'lead_bleeps',
    'lead_drive',
    'lead_blimps',
    'lead_shufflit',
    'lead_sharp',
  ],
  bass: [
    'bass_breakbeat',
    'bass_blue_monday',
    'bass_growing',
    'bass_pulse',
    'bass_melodic',
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
