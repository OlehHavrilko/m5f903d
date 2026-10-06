import type { LevelSpec } from '../../core/level-registry.js';

/**
 * Branch C, entry level: one complete front corner. Kinematics, damper
 * internals, springs and the contact patch arrive in M4
 * (docs/M0-design-plan.md §5.4).
 */
export const SUSP_LEVELS: readonly LevelSpec[] = [
  {
    id: 'susp.corner',
    branch: 'susp',
    order: 0,
    title: {
      en: 'One front corner',
      ru: 'Один передний угол',
      uk: 'Один передній кут',
    },
    subtitle: {
      en: 'Wheel, arms, damper, brake',
      ru: 'Колесо, рычаги, амортизатор, тормоз',
      uk: 'Колесо, важелі, амортизатор, гальмо',
    },
    scale: { unitMeters: 0.5 },
    camera: {
      fovMeters: 1.15,
      from: [0.95, 0.78, 1.05],
      to: [0, 0.18, -0.15],
      fovDeg: 38,
    },
    subject: {
      en: 'A double-wishbone front corner with an outboard damper and coil spring',
      ru: 'Передний угол на двойных поперечных рычагах с выносным амортизатором и пружиной',
      uk: 'Передній кут на подвійних поперечних важелях із виносним амортизатором і пружиною',
    },
    geometry: {
      en: 'Wheel and rim, knuckle, lower and upper wishbones, tie rod, anti-roll drop link, damper with a helical coil spring, and the ventilated brake disc.',
      ru: 'Колесо и диск, кулак, нижний и верхний рычаги, рулевая тяга, стойка стабилизатора, амортизатор с винтовой пружиной и вентилируемый тормозной диск.',
      uk: 'Колесо та диск, кулак, нижній і верхній важелі, кермова тяга, стійка стабілізатора, амортизатор із гвинтовою пружиною та вентильований гальмівний диск.',
    },
    animation: {
      en: 'The wheel turns and the spring compresses with suspension travel.',
      ru: 'Колесо вращается, а пружина сжимается вместе с ходом подвески.',
      uk: 'Колесо обертається, а пружина стискається разом із ходом підвіски.',
    },
    facts: [
      {
        text: {
          en: 'Upper and lower wishbones let the knuckle move while holding the camber angle, so the tyre stays flat on the road.',
          ru: 'Верхний и нижний рычаги позволяют кулаку двигаться, удерживая развал, поэтому шина остаётся плоской на дороге.',
          uk: 'Верхній і нижній важелі дозволяють кулаку рухатися, утримуючи розвал, тож шина лишається плоскою на дорозі.',
        },
      },
      {
        text: {
          en: 'The damper turns the energy of the movement into heat; the spring only stores it.',
          ru: 'Амортизатор превращает энергию движения в тепло; пружина только запасает её.',
          uk: 'Амортизатор перетворює енергію руху в тепло; пружина лише запасає її.',
        },
      },
      {
        text: {
          en: 'Everything between the spring and the road — tyre, rim, brake, knuckle — is unsprung mass, so it is kept as light as possible.',
          ru: 'Всё между пружиной и дорогой — шина, диск, тормоз, кулак — это неподрессоренная масса, поэтому её стараются облегчить.',
          uk: 'Усе між пружиною та дорогою — шина, диск, гальмо, кулак — це непідресорена маса, тому її намагаються полегшити.',
        },
      },
    ],
    callouts: [
      {
        label: { en: 'Front brake disc', ru: 'Передний диск', uk: 'Передній диск' },
        value: '395 мм',
        source: 'turner-brakes',
      },
      {
        label: { en: 'Tyre', ru: 'Шина', uk: 'Шина' },
        value: '275/35 R20',
        unverified: true,
        source: 'turner-brakes',
      },
      {
        label: { en: 'Wheelbase', ru: 'Колёсная база', uk: 'Колісна база' },
        value: '2 982 мм',
        source: 'bmw-pressclub',
      },
    ],
    simplified: [
      {
        en: 'Arm lengths and pick-up points are illustrative, not a suspension drawing.',
        ru: 'Длины рычагов и точки крепления условны: это не чертёж подвески.',
        uk: 'Довжини важелів і точки кріплення умовні: це не креслення підвіски.',
      },
      {
        en: 'The tyre has no tread pattern or sidewall lettering.',
        ru: 'У шины нет рисунка протектора и надписей на боковине.',
        uk: 'У шини немає рисунка протектора й написів на боковині.',
      },
    ],
    sources: ['bosch-handbook', 'sae-papers', 'turner-brakes', 'bmw-pressclub'],
    modes: ['tour', 'explore'],
  },
];
