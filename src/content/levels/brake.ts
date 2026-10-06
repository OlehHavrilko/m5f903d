import type { LevelSpec } from '../../core/level-registry.js';

/**
 * Branch D, entry level: the brake corner. Caliper cutaway, friction pair and
 * the steering rack arrive in M5 (docs/M0-design-plan.md §5.5).
 */
export const BRAKE_LEVELS: readonly LevelSpec[] = [
  {
    id: 'brake.corner',
    branch: 'brake',
    order: 0,
    title: {
      en: 'A brake corner',
      ru: 'Тормозной угол',
      uk: 'Гальмівний кут',
    },
    subtitle: {
      en: 'Turning motion into heat',
      ru: 'Превращаем движение в тепло',
      uk: 'Перетворюємо рух на тепло',
    },
    scale: { unitMeters: 0.3 },
    camera: {
      fovMeters: 0.6,
      from: [0.55, 0.42, 0.6],
      to: [0, 0.05, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'Ventilated disc, six-piston caliper and pads on the front axle',
      ru: 'Вентилируемый диск, 6-поршневой суппорт и колодки передней оси',
      uk: 'Вентильований диск, 6-поршневий супорт і колодки передньої осі',
    },
    geometry: {
      en: 'Drilled disc, aluminium hat, caliper body with pistons, two pads and the flexible hose, all from primitives.',
      ru: 'Диск с отверстиями, алюминиевая шляпа, корпус суппорта с поршнями, две колодки и гибкий шланг — всё из примитивов.',
      uk: 'Диск із отворами, алюмінієва шляпа, корпус супорта з поршнями, дві колодки та гнучкий шланг — усе з примітивів.',
    },
    animation: {
      en: 'The disc spins at road speed while the caliper stays fixed.',
      ru: 'Диск вращается со скоростью дороги, а суппорт остаётся неподвижным.',
      uk: 'Диск обертається зі швидкістю дороги, а супорт лишається нерухомим.',
    },
    facts: [
      {
        text: {
          en: 'Braking converts the car’s kinetic energy into heat in the disc; the pads press on both faces at once.',
          ru: 'Торможение превращает кинетическую энергию машины в тепло в диске: колодки давят на обе стороны одновременно.',
          uk: 'Гальмування перетворює кінетичну енергію машини в тепло в диску: колодки тиснуть на обидві сторони одночасно.',
        },
      },
      {
        text: {
          en: 'Vents and drilled holes give the heat somewhere to go, which is what delays brake fade.',
          ru: 'Вентиляция и отверстия дают теплу уходить — именно это откладывает наступление фейда.',
          uk: 'Вентиляція та отвори дають теплу виходити — саме це відсуває настання фейду.',
        },
      },
      {
        text: {
          en: 'ABS repeatedly releases and reapplies pressure to keep the tyre near its peak grip instead of locking.',
          ru: 'ABS многократно отпускает и снова поднимает давление, чтобы шина оставалась у пика сцепления, а не шла юзом.',
          uk: 'ABS багаторазово відпускає й знову піднімає тиск, щоб шина лишалася біля піку зчеплення, а не йшла юзом.',
        },
      },
    ],
    callouts: [
      {
        label: { en: 'Front disc', ru: 'Передний диск', uk: 'Передній диск' },
        value: '395 мм',
        source: 'turner-brakes',
      },
      {
        label: { en: 'Rear disc', ru: 'Задний диск', uk: 'Задній диск' },
        value: '380 мм',
        source: 'turner-brakes',
      },
      {
        label: { en: 'Front caliper', ru: 'Передний суппорт', uk: 'Передній супорт' },
        value: '6 поршней',
        source: 'turner-brakes',
      },
    ],
    simplified: [
      {
        en: 'Piston count and disc diameter are shown, but the internal cooling vanes are not modelled.',
        ru: 'Число поршней и диаметр диска показаны, но внутренние вентиляционные каналы не моделируются.',
        uk: 'Кількість поршнів і діаметр диска показано, але внутрішні вентиляційні канали не моделюються.',
      },
    ],
    sources: ['turner-brakes', 'bosch-handbook', 'sae-papers'],
    modes: ['tour', 'explore'],
  },
];
