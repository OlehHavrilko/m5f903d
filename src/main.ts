import { CameraRig } from './core/camera-rig.js';
import { DebugOverlay } from './core/debug.js';
import { parseDeepLink, serializeDeepLink, type DeepLinkState } from './core/deeplink.js';
import { LevelManager } from './core/level-manager.js';
import { LevelRegistry, type BranchId, type LevelSpec } from './core/level-registry.js';
import {
  detectQualityTier,
  qualityProfile,
  readDeviceHints,
  type QualityTier,
} from './core/quality.js';
import { Stage, WebGLUnavailableError, isWebGLAvailable } from './core/renderer.js';
import { Timeline } from './core/timeline.js';
import { poseForLevel } from './core/seam.js';
import type { LevelBuilder } from './core/level-content.js';
import { assertSourcesExist } from './content/sources.js';
import { SPINE_LEVELS } from './content/levels/spine.js';
import { Hud, type AppMode } from './ui/hud.js';
import { createStudioEnvironment } from './spine/studio-environment.js';
import { buildCarLevel, buildStudioLevel } from './spine/levels.js';
import type { Lang } from './core/units.js';

const LANG_STORAGE_KEY = 'car-to-atom.lang';
const TIER_STORAGE_KEY = 'car-to-atom.tier';

function readStoredLang(): Lang | undefined {
  try {
    const value = localStorage.getItem(LANG_STORAGE_KEY);
    if (value === 'en' || value === 'ru' || value === 'uk') return value;
  } catch {
    /* storage may be blocked */
  }
  return undefined;
}

function storeLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}

function readStoredTier(): QualityTier | undefined {
  try {
    const value = localStorage.getItem(TIER_STORAGE_KEY);
    if (value === 'low' || value === 'mid' || value === 'high') return value;
  } catch {
    /* ignore */
  }
  return undefined;
}

function showBootError(message?: string): void {
  const el = document.getElementById('boot-error');
  el?.classList.add('show');
  if (message) {
    const text = document.getElementById('boot-error-text');
    if (text) text.textContent = message;
  }
  document.getElementById('viewport')?.setAttribute('aria-hidden', 'true');
}

interface BootResult {
  dispose(): void;
}

async function boot(): Promise<BootResult> {
  const canvas = document.getElementById('viewport') as HTMLCanvasElement | null;
  const app = document.getElementById('app');
  if (!canvas || !app) throw new Error('app shell missing');

  if (!isWebGLAvailable()) {
    showBootError();
    throw new WebGLUnavailableError();
  }

  const initialLink = parseDeepLink(globalThis.location.hash);
  let currentLang: Lang = initialLink.lang ?? readStoredLang() ?? 'ru';

  const registry = new LevelRegistry(SPINE_LEVELS);
  for (const level of registry.all) assertSourcesExist(level.sources);

  // `?tier=low|mid|high` overrides autodetection; a manual choice is remembered.
  const params = new URLSearchParams(globalThis.location.search);
  const tierParam = params.get('tier');
  const storedTier =
    tierParam === 'low' || tierParam === 'mid' || tierParam === 'high'
      ? tierParam
      : readStoredTier();
  const hints = readDeviceHints();
  const profile = qualityProfile(storedTier ?? detectQualityTier(hints));

  const stage = new Stage(canvas, profile, {
    onContextLost: () => showBootError(),
    onContextRestored: () => {
      document.getElementById('boot-error')?.classList.remove('show');
      stage.resize();
    },
  });

  const environment = createStudioEnvironment(stage.scene, profile);
  const timeline = new Timeline('idle', 1);
  const rig = new CameraRig(
    stage.camera,
    poseForLevel(registry.all[0]!.camera, stage.camera.aspect),
  );

  const builders = new Map<string, LevelBuilder>([
    ['studio', buildStudioLevel],
    ['car', buildCarLevel],
  ]);

  const manager = new LevelManager(stage.scene, registry, builders, { profile, timeline }, rig);

  let currentLevel: LevelSpec = registry.all[0]!;
  let currentProgress = 0;
  const debug = DebugOverlay.enabled(globalThis.location.search)
    ? new DebugOverlay(stage, profile, app)
    : null;

  const progressFor = (level: LevelSpec): number => {
    const levels = registry.branch(level.branch);
    if (levels.length <= 1) return 1;
    const index = levels.findIndex((l) => l.id === level.id);
    return index / (levels.length - 1);
  };

  const levelAtProgress = (branch: BranchId, progress: number): LevelSpec => {
    const levels = registry.branch(branch);
    const index = Math.round(Math.min(1, Math.max(0, progress)) * (levels.length - 1));
    return levels[index] ?? levels[0]!;
  };

  const applyMode = (mode: AppMode): void => {
    rig.setReducedMotion(mode === 'explore' ? true : (hints.reducedMotion ?? false));
  };

  let hotkeysEnabled = false;

  const syncHash = (): void => {
    const state: DeepLinkState = { level: currentLevel.id, progress: currentProgress };
    if (currentLang !== 'ru') state.lang = currentLang;
    if (hud.mode !== 'tour') state.mode = hud.mode;
    const hash = serializeDeepLink(state);
    if (hash !== globalThis.location.hash) {
      globalThis.history.replaceState(null, '', hash || globalThis.location.pathname);
    }
  };

  const hud = new Hud(app, {
    lang: currentLang,
    registry,
    callbacks: {
      onNext: () => goRelative(1),
      onPrev: () => goRelative(-1),
      onReset: () => {
        timeline.setPreset('idle');
        timeline.seek(0);
        manager.activate('studio');
      },
      onLanguage: (next) => setLanguage(next),
      onMode: (mode) => {
        applyMode(mode);
        syncHash();
      },
      onGuide: () => undefined,
      onDismissIntro: () => {
        hotkeysEnabled = true;
      },
    },
  });

  manager.setOnLevelChange((spec) => {
    currentLevel = spec;
    currentProgress = progressFor(spec);
    hud.render(spec, currentProgress);
    debug?.setLevel(spec.id);
    syncHash();
    applyMode(hud.mode);
  });

  function setLanguage(next: Lang): void {
    if (next === currentLang) return;
    currentLang = next;
    storeLang(next);
    hud.setLanguage(next);
    syncHash();
  }

  function goRelative(direction: 1 | -1): void {
    const neighbour = registry.neighbour(currentLevel.id, direction);
    if (neighbour) manager.activate(neighbour.id);
  }

  // --- Input ---------------------------------------------------------------
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const activePointers = new Map<number, { x: number; y: number }>();
  let pinchDistance = 0;

  canvas.addEventListener('pointerdown', (event) => {
    if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activePointers.size === 1) {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
    } else if (activePointers.size === 2) {
      const points = [...activePointers.values()];
      pinchDistance = Math.hypot(points[0]!.x - points[1]!.x, points[0]!.y - points[1]!.y);
    }
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!activePointers.has(event.pointerId)) return;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activePointers.size === 2) {
      const points = [...activePointers.values()];
      const distance = Math.hypot(points[0]!.x - points[1]!.x, points[0]!.y - points[1]!.y);
      if (pinchDistance > 0) rig.dolly(pinchDistance / Math.max(1, distance));
      pinchDistance = distance;
      return;
    }
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    rig.orbit(dx * 0.005, dy * 0.005);
  });

  const endPointer = (event: PointerEvent) => {
    activePointers.delete(event.pointerId);
    if (activePointers.size === 0) dragging = false;
    pinchDistance = 0;
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);

  canvas.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      rig.dolly(event.deltaY > 0 ? 1.08 : 0.92);
    },
    { passive: false },
  );

  globalThis.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName;
    if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'A') return;
    if (!hotkeysEnabled) return;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case '+':
      case '=':
        goRelative(1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case '-':
        goRelative(-1);
        break;
      case 'Escape':
        goRelative(-1);
        break;
      case 'Backspace':
      case 'Home':
        manager.activate('studio');
        break;
      case 'r':
      case 'R':
        rig.goTo(poseForLevel(currentLevel.camera, stage.camera.aspect, currentLevel.frame));
        break;
      case '?':
        hud.toggleHonesty();
        break;
      case ' ':
        event.preventDefault();
        timeline.toggle();
        break;
      case '[':
        timeline.setRate(timeline.rate / 1.5);
        break;
      case ']':
        timeline.setRate(timeline.rate * 1.5);
        break;
      case ',':
        timeline.step(-1);
        break;
      case '.':
        timeline.step(1);
        break;
      default: {
        const index = Number.parseInt(event.key, 10);
        if (index >= 1 && index <= 9) {
          const candidate = registry.branch(currentLevel.branch)[index - 1];
          if (candidate) manager.activate(candidate.id);
        }
      }
    }
  });

  globalThis.addEventListener('hashchange', () => {
    const link = parseDeepLink(globalThis.location.hash);
    if (link.lang && link.lang !== currentLang) setLanguage(link.lang);
    if (link.level && link.level !== currentLevel.id) manager.activate(link.level);
  });

  // --- Boot the first level ------------------------------------------------
  const startLevel = initialLink.level
    ? registry.resolve(initialLink.level)
    : initialLink.progress !== undefined
      ? levelAtProgress('spine', initialLink.progress)
      : registry.all[0]!;

  manager.activate(startLevel.id, { immediate: true });
  if (initialLink.mode) hud.setMode(initialLink.mode as AppMode);
  applyMode(hud.mode);

  // A deep link skips the intro card; a cold visit shows it and keeps hotkeys off.
  if (initialLink.level || initialLink.progress !== undefined) {
    hud.hideIntro();
  }

  stage.start((dt, elapsed) => {
    const state = timeline.update(dt);
    rig.update(dt);
    manager.update(dt, elapsed, state);
    environment.update(elapsed);
    if (debug) debug.frame(performance.now(), stage.scene);
  });

  return {
    dispose() {
      stage.stop();
      manager.dispose();
      environment.dispose();
      hud.destroy();
      debug?.destroy();
      stage.dispose();
    },
  };
}

boot().catch((error: unknown) => {
  if (error instanceof WebGLUnavailableError) {
    showBootError();
    return;
  }
  console.error(error);
  showBootError(`Ошибка загрузки: ${String(error)}`);
});

export {};
