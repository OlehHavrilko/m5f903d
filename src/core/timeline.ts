import type { LocalizedText } from './level-registry.js';

/** Shared state every level can read (docs/M0-design-plan.md §8). */
export interface VehicleState {
  rpm: number;
  gear: number;
  throttle: number;
  brake: number;
  speedKph: number;
  steering: number;
  suspensionTravel: [number, number, number, number];
  temps: { coolantC: number; oilC: number; atfC: number; brakeC: number };
  torqueSplit: { front: number; rear: number };
  /** Crank angle in degrees, 0…720 (one full four-stroke cycle). */
  crankAngle: number;
}

export type PresetId =
  'idle' | 'launch' | 'dyno-pull' | 'cruise' | 'corner+bump' | 'upshift' | 'hard-braking';

export interface VehiclePreset {
  readonly id: PresetId;
  readonly label: LocalizedText;
  /** Nominal length in seconds; the loop wraps after this. */
  readonly duration: number;
  /** Pure function of time — no Math.random, no Date.now. */
  readonly sample: (t: number, seed: number) => VehicleState;
}

/** Deterministic PRNG (mulberry32). Never used inside a frame without a fixed seed. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Triangle wave in [0, 1] with period 1, phase 0 at t=0. */
export function triangle(t: number): number {
  const f = t - Math.floor(t);
  return f < 0.5 ? f * 2 : 2 - f * 2;
}

function wrap(value: number, period: number): number {
  const r = value % period;
  return r < 0 ? r + period : r;
}

function baseState(): VehicleState {
  return {
    rpm: 800,
    gear: 1,
    throttle: 0,
    brake: 0,
    speedKph: 0,
    steering: 0,
    suspensionTravel: [0, 0, 0, 0],
    temps: { coolantC: 90, oilC: 100, atfC: 85, brakeC: 40 },
    torqueSplit: { front: 0.2, rear: 0.8 },
    crankAngle: 0,
  };
}

function withCrank(state: VehicleState, t: number, seed: number, presetId: PresetId): VehicleState {
  // Numerical integration of rpm→crank angle keeps the cycle deterministic
  // while the preset itself stays a pure function of t.
  const steps = Math.max(1, Math.round(t * 240));
  const dt = t / steps;
  let angle = 0;
  for (let i = 0; i < steps; i += 1) {
    const sample = PRESET_SAMPLERS[presetId](i * dt, seed);
    angle += (sample.rpm / 60) * 360 * dt;
  }
  state.crankAngle = wrap(angle, 720);
  return state;
}

const PRESET_SAMPLERS: Record<PresetId, (t: number, seed: number) => { rpm: number }> = {
  idle: () => ({ rpm: 780 }),
  launch: (t) => ({ rpm: 1500 + smoothstep(0.4, 1.2, t) * 5200 }),
  'dyno-pull': (t) => ({ rpm: 2000 + smoothstep(0, 6, t) * 5000 }),
  cruise: (t) => ({ rpm: 1900 + Math.sin(t * 0.7) * 60 }),
  'corner+bump': (t) => ({ rpm: 3000 + Math.sin(t * 2.1) * 400 }),
  upshift: (t) => ({ rpm: lerp(6200, 4300, smoothstep(0.35, 0.55, t)) }),
  'hard-braking': (t) => ({ rpm: lerp(5600, 1600, smoothstep(0.2, 2.2, t)) }),
};

export const PRESETS: readonly VehiclePreset[] = [
  {
    id: 'idle',
    label: { en: 'Idle', ru: 'Холостой ход', uk: 'Холостий хід' },
    duration: 4,
    sample: (t, seed) => {
      const state = baseState();
      const rng = mulberry32(seed + 1);
      const jitter = (rng() - 0.5) * 12;
      state.rpm = 780 + jitter;
      state.throttle = 0;
      state.gear = 1;
      state.speedKph = 0;
      state.temps.coolantC = 90 + Math.sin(t * 0.2) * 1.5;
      return withCrank(state, t, seed, 'idle');
    },
  },
  {
    id: 'launch',
    label: { en: 'Launch', ru: 'Старт с места', uk: 'Старт з місця' },
    duration: 4,
    sample: (t, seed) => {
      const state = baseState();
      const rev = smoothstep(0, 0.5, t) * 2600;
      const launchPhase = smoothstep(0.5, 3.2, t);
      state.rpm = 1500 + rev + launchPhase * 5200;
      state.throttle = smoothstep(0.5, 0.8, t);
      state.brake = t < 0.5 ? 0.4 : 0;
      state.speedKph = launchPhase * 100;
      state.gear = 1 + Math.floor(launchPhase * 3.2);
      state.torqueSplit = { front: 0.35 * launchPhase + 0.05, rear: 0.6 };
      state.suspensionTravel = [0.01, 0.01, -0.03, -0.03];
      return withCrank(state, t, seed, 'launch');
    },
  },
  {
    id: 'dyno-pull',
    label: { en: 'Dyno pull', ru: 'Замер на стенде', uk: 'Замір на стенді' },
    duration: 8,
    sample: (t, seed) => {
      const state = baseState();
      const ramp = smoothstep(0, 6, t);
      const hold = smoothstep(6, 7.5, t);
      state.rpm = 2000 + ramp * 5000;
      state.throttle = t < 7.5 ? 1 : Math.max(0, 1 - hold * 4);
      state.gear = 4;
      state.speedKph = 60 + ramp * 190;
      state.temps.oilC = 100 + ramp * 30;
      state.temps.coolantC = 90 + ramp * 15;
      return withCrank(state, t, seed, 'dyno-pull');
    },
  },
  {
    id: 'cruise',
    label: { en: 'Cruise', ru: 'Крейсерский ход', uk: 'Крейсерський хід' },
    duration: 6,
    sample: (t, seed) => {
      const state = baseState();
      state.rpm = 1900 + Math.sin(t * 0.7) * 60;
      state.throttle = 0.18 + Math.sin(t * 0.5) * 0.05;
      state.gear = 8;
      state.speedKph = 110;
      state.torqueSplit = { front: 0.1, rear: 0.9 };
      return withCrank(state, t, seed, 'cruise');
    },
  },
  {
    id: 'corner+bump',
    label: { en: 'Corner + bump', ru: 'Поворот и неровность', uk: 'Поворот і нерівність' },
    duration: 5,
    sample: (t, seed) => {
      const state = baseState();
      state.rpm = 3000 + Math.sin(t * 2.1) * 400;
      state.throttle = 0.35;
      state.gear = 3;
      state.speedKph = 80;
      state.steering = Math.sin(t * 1.3) * 0.6;
      const bump = Math.exp(-((t - 2.2) ** 2) / 0.02);
      state.suspensionTravel = [bump * 0.06, bump * 0.04, -bump * 0.07, -bump * 0.05];
      state.torqueSplit = { front: 0.05, rear: 0.95 };
      return withCrank(state, t, seed, 'corner+bump');
    },
  },
  {
    id: 'upshift',
    label: { en: 'Upshift', ru: 'Переключение вверх', uk: 'Перемикання вгору' },
    duration: 2,
    sample: (t, seed) => {
      const state = baseState();
      state.rpm = lerp(6200, 4300, smoothstep(0.35, 0.55, t));
      state.throttle = t > 0.3 && t < 0.6 ? 0.1 : 1;
      state.gear = t < 0.5 ? 4 : 5;
      state.speedKph = lerp(150, 168, smoothstep(0, 1, t));
      return withCrank(state, t, seed, 'upshift');
    },
  },
  {
    id: 'hard-braking',
    label: { en: 'Hard braking', ru: 'Экстренное торможение', uk: 'Екстрене гальмування' },
    duration: 3,
    sample: (t, seed) => {
      const state = baseState();
      state.rpm = lerp(5600, 1600, smoothstep(0.2, 2.2, t));
      state.brake = smoothstep(0, 0.2, t);
      state.throttle = 0;
      state.gear = 3;
      state.speedKph = Math.max(0, 120 - smoothstep(0, 2.6, t) * 120);
      state.temps.brakeC = 40 + smoothstep(0, 2.6, t) * 260;
      state.suspensionTravel = [-0.05, -0.05, 0.02, 0.02];
      return withCrank(state, t, seed, 'hard-braking');
    },
  },
];

export function getPreset(id: PresetId): VehiclePreset {
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) throw new Error(`Unknown preset: ${id}`);
  return preset;
}

/**
 * Deterministic timeline: given the same preset, seed and elapsed time it always
 * produces the same VehicleState. The render loop only feeds it a fixed dt.
 */
export class Timeline {
  #preset: VehiclePreset;
  #time = 0;
  #rate = 1;
  #playing = true;
  #seed: number;

  constructor(presetId: PresetId = 'idle', seed = 1) {
    this.#preset = getPreset(presetId);
    this.#seed = seed;
  }

  get presetId(): PresetId {
    return this.#preset.id;
  }

  get time(): number {
    return this.#time;
  }

  get playing(): boolean {
    return this.#playing;
  }

  get rate(): number {
    return this.#rate;
  }

  setPreset(id: PresetId): void {
    this.#preset = getPreset(id);
    this.#time = 0;
  }

  play(): void {
    this.#playing = true;
  }

  pause(): void {
    this.#playing = false;
  }

  toggle(): void {
    this.#playing = !this.#playing;
  }

  setRate(rate: number): void {
    this.#rate = clamp(rate, 0.05, 4);
  }

  seek(t: number): void {
    this.#time = Math.max(0, t);
  }

  /** Advance by a real delta (seconds); returns the new state. */
  update(dt: number): VehicleState {
    if (this.#playing) this.#time += dt * this.#rate;
    return this.sample();
  }

  /** Step a fixed number of frames without wall-clock time. */
  step(frames: number, dt = 1 / 60): VehicleState {
    for (let i = 0; i < frames; i += 1) this.#time += dt * this.#rate;
    return this.sample();
  }

  /** Pure evaluation at the current time. */
  sample(): VehicleState {
    return this.#preset.sample(this.#time, this.#seed);
  }
}
