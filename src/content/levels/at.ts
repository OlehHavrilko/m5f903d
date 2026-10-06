import type { LevelSpec } from '../../core/level-registry.js';

/**
 * Branch B, entry level: the 8HP-type automatic as one assembly. Converter,
 * planetary kinematics, clutches, mechatronics and the oil film arrive in M4
 * (docs/M0-design-plan.md §5.3).
 */
export const AT_LEVELS: readonly LevelSpec[] = [
  {
    id: 'at.unit',
    branch: 'at',
    order: 0,
    title: {
      en: 'The automatic',
      ru: 'Автоматическая коробка',
      uk: 'Автоматична коробка',
    },
    subtitle: {
      en: 'Eight speeds, one case',
      ru: 'Восемь передач в одном корпусе',
      uk: 'Вісім передач в одному корпусі',
    },
    scale: { unitMeters: 0.62 },
    camera: {
      fovMeters: 0.98,
      from: [1.15, 0.75, 1.15],
      to: [0, 0, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'An 8-speed automatic with a torque converter',
      ru: '8-ступенчатый автомат с гидротрансформатором',
      uk: '8-ступеневий автомат із гідротрансформатором',
    },
    geometry: {
      en: 'Converter bell at the input, main case, mechatronic sleeve on the side, oil pan below and the output flange at the rear.',
      ru: 'Колокол ГДТ на входе, основной корпус, мехатроник сбоку, поддон снизу и выходной фланец сзади.',
      uk: 'Дзвін ГДТ на вході, основний корпус, мехатроніка збоку, піддон знизу та вихідний фланець ззаду.',
    },
    animation: {
      en: 'The converter and output flange turn at input speed.',
      ru: 'Гидротрансформатор и выходной фланец вращаются со скоростью входа.',
      uk: 'Гідротрансформатор і вихідний фланець обертаються зі швидкістю входу.',
    },
    facts: [
      {
        text: {
          en: 'A torque converter trades speed for torque at low road speed, then a lock-up clutch removes the slip on the move.',
          ru: 'Гидротрансформатор обменивает скорость на момент на малой скорости, а фрикцион блокировки затем убирает проскальзывание.',
          uk: 'Гідротрансформатор обмінює швидкість на момент на малій швидкості, а фрикціон блокування потім прибирає прослизання.',
        },
      },
      {
        text: {
          en: 'Four planetary gear sets and selectable clutches produce eight forward ratios without interrupting torque flow.',
          ru: 'Четыре планетарных ряда и набор фрикционов дают восемь передач вперёд без разрыва потока момента.',
          uk: 'Чотири планетарні ряди й набір фрикціонів дають вісім передач уперед без розриву потоку моменту.',
        },
        unverified: true,
      },
    ],
    callouts: [
      {
        label: { en: 'Gears', ru: 'Передачи', uk: 'Передачі' },
        value: '8 вперёд',
        source: 'zf-8hp-catalogue',
      },
      {
        label: { en: 'Input torque', ru: 'Входной момент', uk: 'Вхідний момент' },
        value: '≈750 Н·м',
        unverified: true,
        source: 'bmw-pressclub',
      },
    ],
    simplified: [
      {
        en: 'Internals are not modelled on this level; the case is schematic.',
        ru: 'Внутренности на этом уровне не моделируются: корпус схематичен.',
        uk: 'Внутрішні частини на цьому рівні не моделюються: корпус схематичний.',
      },
    ],
    sources: ['zf-8hp-catalogue', 'bmw-pressclub', 'bosch-handbook'],
    modes: ['tour', 'explore'],
  },
];
