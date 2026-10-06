import * as THREE from 'three';
import type { LevelCamera, SeamFrame } from './level-registry.js';

/**
 * Camera framing and seam interpolation.
 *
 * A "level" authors its camera in level-local metres. The rig turns that into a
 * pose that always frames a subject of `camera.fovMeters` across the smaller
 * screen dimension, so framing survives any aspect ratio. Transitions between
 * levels interpolate world poses and cross-fade content, which is what makes the
 * scale change read as one continuous move instead of a cut (§4.2, §5).
 */
export interface CameraPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fovMeters: number;
  fovDeg: number;
}

export const DEFAULT_FOV_DEG = 38;

export function easeInOutCubic(t: number): number {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

/** Distance at which a subject of `fovMeters` fits the smaller screen dimension. */
export function framingDistance(fovMeters: number, fovDeg: number, aspect: number): number {
  const vfov = (fovDeg * Math.PI) / 180;
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const limiting = Math.min(1, safeAspect);
  return fovMeters / 2 / (Math.tan(vfov / 2) * limiting);
}

/** Builds a world-space pose for a level, honouring its optional seam frame. */
export function poseForLevel(camera: LevelCamera, aspect: number, frame?: SeamFrame): CameraPose {
  const fovDeg = camera.fovDeg ?? DEFAULT_FOV_DEG;
  const to = new THREE.Vector3(...camera.to);
  const from = new THREE.Vector3(...camera.from);
  const direction = from.clone().sub(to);
  if (direction.lengthSq() < 1e-12) direction.set(0, 0.4, 1);
  const distance = framingDistance(camera.fovMeters, fovDeg, aspect);
  const position = to.clone().add(direction.normalize().multiplyScalar(distance));

  const pose: CameraPose = {
    position,
    target: to,
    fovMeters: camera.fovMeters,
    fovDeg,
  };
  return frame ? applyFrame(pose, frame) : pose;
}

/** Maps a level-local pose into world space. */
export function applyFrame(pose: CameraPose, frame: SeamFrame): CameraPose {
  const p = new THREE.Vector3(...frame.position);
  const scale = frame.scale;
  return {
    position: pose.position.clone().multiplyScalar(scale).add(p),
    target: pose.target.clone().multiplyScalar(scale).add(p),
    fovMeters: pose.fovMeters * scale,
    fovDeg: pose.fovDeg,
  };
}

/** Longer of the two orbits, so a transition never swings through the subject. */
function slerpPosition(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  const ra = a.length();
  const rb = b.length();
  if (ra < 1e-9 || rb < 1e-9) return a.clone().lerp(b, t);
  const na = a.clone().divideScalar(ra);
  const nb = b.clone().divideScalar(rb);
  const dot = Math.min(1, Math.max(-1, na.dot(nb)));
  if (dot > 0.9995) return a.clone().lerp(b, t);
  const theta = Math.acos(dot) * t;
  const relative = nb.clone().sub(na.clone().multiplyScalar(dot));
  if (relative.lengthSq() < 1e-12) return a.clone().lerp(b, t);
  relative.normalize();
  const direction = na
    .clone()
    .multiplyScalar(Math.cos(theta))
    .add(relative.multiplyScalar(Math.sin(theta)));
  const radius = ra + (rb - ra) * t;
  return direction.multiplyScalar(radius);
}

/** Interpolates two world poses; `t` is normally pre-eased by the caller. */
export function interpolatePose(a: CameraPose, b: CameraPose, t: number): CameraPose {
  return {
    position: slerpPosition(a.position, b.position, t),
    target: a.target.clone().lerp(b.target, t),
    fovMeters: a.fovMeters + (b.fovMeters - a.fovMeters) * t,
    fovDeg: a.fovDeg + (b.fovDeg - a.fovDeg) * t,
  };
}

export interface SeamBands {
  /** Opacity of the outgoing level. */
  readonly from: number;
  /** Opacity of the incoming level. */
  readonly to: number;
  /** Uniform scale applied to the outgoing content around its own target. */
  readonly fromScale: number;
  /** Uniform scale applied to the incoming content around its own target. */
  readonly toScale: number;
}

/**
 * Cross-fade bands used during a seam. The incoming level grows slightly into
 * place while the outgoing one recedes, which reads as "the next scale appears
 * inside the current one" rather than a hard swap.
 */
export function seamBands(t: number): SeamBands {
  const x = Math.min(1, Math.max(0, t));
  const fadeOut = 1 - smoothBand(x, 0.12, 0.62);
  const fadeIn = smoothBand(x, 0.34, 0.9);
  return {
    from: fadeOut,
    to: fadeIn,
    fromScale: 1 + 0.08 * smoothBand(x, 0.1, 1),
    toScale: 0.9 + 0.1 * smoothBand(x, 0.25, 1),
  };
}

function smoothBand(x: number, edge0: number, edge1: number): number {
  const k = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return k * k * (3 - 2 * k);
}
