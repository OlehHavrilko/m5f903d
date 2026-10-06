import type { LevelSpec } from '../../core/level-registry.js';

/**
 * Branch A, entry level: the complete power unit. Deeper engine levels
 * (long block, one cylinder, valvetrain, combustion, oil film, metal lattice)
 * arrive in M3 (docs/M0-design-plan.md §5.2).
 */
export const ENGINE_LEVELS: readonly LevelSpec[] = [
  {
    id: 'engine.unit',
    branch: 'engine',
    order: 0,
    title: {
      en: 'The power unit',
      ru: 'Силовой агрегат',
      uk: 'Силовий агрегат',
    },
    subtitle: {
      en: 'V8, two turbos, one gearbox',
      ru: 'V8, две турбины, одна коробка',
      uk: 'V8, дві турбіни, одна коробка',
    },
    scale: { unitMeters: 0.6 },
    camera: {
      fovMeters: 0.95,
      from: [1.15, 0.8, 1.35],
      to: [0, 0.28, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'The 4.4 L S63 twin-turbo V8 as one assembly',
      ru: '4,4-литровый S63 twin-turbo V8 как единый агрегат',
      uk: '4,4-літровий S63 twin-turbo V8 як єдиний агрегат',
    },
    geometry: {
      en: 'Schematic 90° V: block, two cylinder banks with cam covers, intake in the valley, two outboard turbos, timing cover and the bell housing facing the gearbox.',
      ru: 'Схематичный 90° V: блок, два банка цилиндров с клапанными крышками, впуск в развале, две турбины по бортам, крышка ГРМ и колокол со стороны коробки.',
      uk: 'Схематичний 90° V: блок, два банки циліндрів із клапанними кришками, впуск у розвалі, дві турбіни з бортів, кришка ГРМ і дзвін із боку коробки.',
    },
    animation: {
      en: 'Accessory pulley and the engine body drift at idle speed.',
      ru: 'Шкив навесного оборудования и корпус двигателя слегка покачиваются на холостых.',
      uk: 'Шків навісного обладнання та корпус двигуна злегка погойдуються на холостих.',
    },
    facts: [
      {
        text: {
          en: 'A 90° V8 fires evenly on both banks with a single-plane crank, and stays short enough to sit behind the front axle.',
          ru: '90-градусный V8 даёт равномерные вспышки по двум банкам с одноплоскостным коленвалом и остаётся коротким, чтобы уместиться за передней осью.',
          uk: '90-градусний V8 дає рівномірні спалахи по двох банках з одноплощинним колінвалом і лишається коротким, щоб уміститися за передньою віссю.',
        },
        unverified: true,
      },
      {
        text: {
          en: 'Two turbochargers sit outside the bank angle: exhaust energy spins them, and the intake charge is cooled before it enters the cylinders.',
          ru: 'Две турбины стоят по бортам развала: энергия выхлопа раскручивает их, а заряд воздуха охлаждается до входа в цилиндры.',
          uk: 'Дві турбіни стоять з бортів розвалу: енергія вихлопу розкручує їх, а заряд повітря охолоджується до входу в циліндри.',
        },
      },
      {
        text: {
          en: 'The same assembly has to shed hundreds of kilowatts of heat, which is why oil, coolant and charge cooling are their own circuits.',
          ru: 'Этот же агрегат должен отводить сотни киловатт тепла — поэтому у масла, ОЖ и наддувочного воздуха отдельные контуры.',
          uk: 'Цей самий агрегат має відводити сотні кіловат тепла — тому в оливи, ОЖ і наддувного повітря окремі контури.',
        },
      },
    ],
    callouts: [
      {
        label: { en: 'Displacement', ru: 'Объём', uk: 'Об’єм' },
        value: '4 395 см³',
        source: 'autostatistics-s63',
      },
      {
        label: { en: 'Bore × stroke', ru: 'Диаметр × ход', uk: 'Діаметр × хід' },
        value: '89,0 × 88,3 мм',
        source: 'bmw-n63-wikipedia',
      },
      {
        label: { en: 'Compression ratio', ru: 'Степень сжатия', uk: 'Ступінь стиснення' },
        value: '10,0:1',
        unverified: true,
        source: 'autostatistics-s63',
      },
      {
        label: { en: 'Peak power', ru: 'Мощность', uk: 'Потужність' },
        value: '625 л.с.',
        source: 'bmw-pressclub',
      },
      {
        label: { en: 'Peak torque', ru: 'Момент', uk: 'Момент' },
        value: '750 Н·м @ 1 800–5 800',
        source: 'bmw-pressclub',
      },
    ],
    simplified: [
      {
        en: 'The aggregate is a schematic assembly; part count and placement are reduced.',
        ru: 'Агрегат показан схематично: число и расположение деталей сокращены.',
        uk: 'Агрегат показано схематично: кількість і розташування деталей скорочено.',
      },
      {
        en: 'Accessories, mounts and most plumbing are omitted on this level.',
        ru: 'Навесное оборудование, опоры и большая часть магистралей на этом уровне опущены.',
        uk: 'Навісне обладнання, опори та більшість магістралей на цьому рівні опущено.',
      },
    ],
    sources: ['bmw-pressclub', 'bmw-n63-wikipedia', 'autostatistics-s63', 'bosch-handbook'],
    modes: ['tour', 'explore'],
  },
];
