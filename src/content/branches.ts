import type { BranchId, LocalizedText } from '../core/level-registry.js';
import { PHYSICS_COLORS } from '../materials/index.js';

/**
 * The branches offered at the chassis hub. `entry` is the deep-link target of
 * the branch and its first level; `ready` flips on as each branch's geometry
 * and levels land. The hub UI is generated from this list, so no branch is
 * hard-coded in scene or HUD code (docs/M0-design-plan.md §4).
 */
export interface BranchInfo {
  readonly id: BranchId;
  readonly accent: number;
  readonly title: LocalizedText;
  readonly summary: LocalizedText;
  readonly scaleRange: LocalizedText;
  readonly entry: string;
  readonly ready: boolean;
}

export const BRANCHES: readonly BranchInfo[] = [
  {
    id: 'engine',
    accent: PHYSICS_COLORS.exhaust,
    title: { en: 'Engine', ru: 'Двигатель', uk: 'Двигун' },
    summary: {
      en: 'A 4.4 L twin-turbo V8, opened until one cylinder becomes one iron atom.',
      ru: '4,4-литровый V8 с двумя турбинами: вскрываем, пока цилиндр не станет атомом железа.',
      uk: '4,4-літровий V8 із двома турбінами: розкриваємо, доки циліндр не стане атомом заліза.',
    },
    scaleRange: { en: '0.6 m → 0.25 nm', ru: '0,6 м → 0,25 нм', uk: '0,6 м → 0,25 нм' },
    entry: 'engine.unit',
    ready: true,
  },
  {
    id: 'at',
    accent: PHYSICS_COLORS.air,
    title: { en: 'Transmission', ru: 'Коробка передач', uk: 'Коробка передач' },
    summary: {
      en: 'The 8-speed automatic: torque converter, four planetary sets, mechatronics.',
      ru: '8-ступенчатый автомат: гидротрансформатор, четыре планетарных ряда, мехатроник.',
      uk: '8-ступеневий автомат: гідротрансформатор, чотири планетарні ряди, мехатроніка.',
    },
    scaleRange: { en: '0.6 m → 1 µm', ru: '0,6 м → 1 мкм', uk: '0,6 м → 1 мкм' },
    entry: 'at.unit',
    ready: true,
  },
  {
    id: 'susp',
    accent: PHYSICS_COLORS.coolant,
    title: { en: 'Suspension', ru: 'Подвеска', uk: 'Підвіска' },
    summary: {
      en: 'One front corner: double wishbones, adaptive damper, tyre contact patch.',
      ru: 'Один передний угол: двойные рычаги, адаптивный амортизатор, пятно контакта шины.',
      uk: 'Один передній кут: подвійні важелі, адаптивний амортизатор, пляма контакту шини.',
    },
    scaleRange: { en: '0.5 m → 0.2 mm', ru: '0,5 м → 0,2 мм', uk: '0,5 м → 0,2 мм' },
    entry: 'susp.corner',
    ready: true,
  },
  {
    id: 'brake',
    accent: PHYSICS_COLORS.oil,
    title: { en: 'Brakes & steering', ru: 'Тормоза и руление', uk: 'Гальма та кермування' },
    summary: {
      en: 'A carbon-ceramic disc, a six-piston caliper and the electric steering rack.',
      ru: 'Карбон-керамический диск, 6-поршневой суппорт и рейка с электроприводом.',
      uk: 'Карбон-керамічний диск, 6-поршневий супорт і рейка з електроприводом.',
    },
    scaleRange: { en: '0.3 m → 20 µm', ru: '0,3 м → 20 мкм', uk: '0,3 м → 20 мкм' },
    entry: 'brake.corner',
    ready: true,
  },
];

const BY_ID = new Map<BranchId, BranchInfo>(BRANCHES.map((branch) => [branch.id, branch]));

export function getBranch(id: BranchId): BranchInfo | undefined {
  return BY_ID.get(id);
}
