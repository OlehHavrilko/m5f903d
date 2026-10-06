import type { LevelSpec } from '../../core/level-registry.js';

/**
 * SPINE levels (docs/M0-design-plan.md §5.1).
 * M1 ships `studio` + `car`; `body` and `chassis-hub` arrive in M2.
 * Every user-facing string lives here (content layer), never in scene code.
 */
export const SPINE_LEVELS: readonly LevelSpec[] = [
  {
    id: 'studio',
    branch: 'spine',
    order: 0,
    title: {
      en: 'A car, in a room with no walls',
      ru: 'Машина в комнате без стен',
      uk: 'Машина в кімнаті без стін',
    },
    subtitle: {
      en: 'Why look inside at all',
      ru: 'Зачем вообще смотреть внутрь',
      uk: 'Навіщо взагалі дивитися всередину',
    },
    scale: { unitMeters: 12 },
    camera: {
      fovMeters: 12,
      from: [7, 3.2, 9.5],
      to: [0, 0.85, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'The whole car on a seamless white cyclorama',
      ru: 'Автомобиль целиком на белой бесшовной циклораме',
      uk: 'Автомобіль повністю на білій безшовній циклорамі',
    },
    geometry: {
      en: 'Procedural body silhouette built from lofted cross-sections; wheels and glass are code, not a mesh file.',
      ru: 'Процедурный силуэт кузова из лофтованных сечений; колёса и стёкла — код, а не файл модели.',
      uk: 'Процедурний силует кузова з лофтованих перерізів; колеса та стекло — код, а не файл моделі.',
    },
    animation: {
      en: 'Slow turntable drift; a soft contact shadow keeps the car anchored to the floor.',
      ru: 'Медленный облёт по кругу; мягкая контактная тень удерживает машину на полу.',
      uk: 'Повільний обліт по колу; м’яка контактна тінь утримує машину на підлозі.',
    },
    facts: [
      {
        text: {
          en: 'A production car is roughly 5 metres long and 1.9 tonnes of steel, aluminium, glass and fluid.',
          ru: 'Серийный автомобиль — это примерно 5 метров длины и 1,9 тонны стали, алюминия, стекла и жидкостей.',
          uk: 'Серійний автомобіль — це приблизно 5 метрів довжини та 1,9 тонни сталі, алюмінію, скла й рідин.',
        },
      },
      {
        text: {
          en: 'Four independent systems make it move: engine, transmission, suspension, brakes and steering.',
          ru: 'Движут его четыре независимые системы: двигатель, коробка, подвеска, тормоза и рулевое.',
          uk: 'Рухають його чотири незалежні системи: двигун, коробка, підвіска, гальма й кермо.',
        },
      },
    ],
    callouts: [
      {
        label: { en: 'Length', ru: 'Длина', uk: 'Довжина' },
        value: '4,97 м',
        source: 'bmw-pressclub',
      },
      {
        label: { en: 'Mass', ru: 'Масса', uk: 'Маса' },
        value: '≈1,9 т',
        unverified: true,
        source: 'carbuzz-m5-2021',
      },
    ],
    simplified: [
      {
        en: 'The body is a schematic silhouette, not a surface-accurate scan of the car.',
        ru: 'Кузов — схематичный силуэт, а не точная поверхностная модель автомобиля.',
        uk: 'Кузов — схематичний силует, а не точна поверхнева модель автомобіля.',
      },
      {
        en: 'No environment, road or sky is modelled: the white cyclorama is the point, not a placeholder.',
        ru: 'Окружение, дорога и небо не моделируются: белая циклорама — это приём, а не заглушка.',
        uk: 'Оточення, дорога й небо не моделюються: біла циклорама — це прийом, а не заглушка.',
      },
    ],
    sources: ['bmw-pressclub', 'bosch-handbook'],
  },
  {
    id: 'car',
    branch: 'spine',
    order: 1,
    title: {
      en: 'The whole car',
      ru: 'Автомобиль целиком',
      uk: 'Автомобіль повністю',
    },
    subtitle: {
      en: 'Four systems we are about to open up',
      ru: 'Четыре системы, которые мы сейчас вскроем',
      uk: 'Чотири системи, які ми зараз відкриємо',
    },
    scale: { unitMeters: 5 },
    camera: {
      fovMeters: 5,
      from: [3.4, 1.9, 4.6],
      to: [0, 0.7, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'BMW M5 (F90) Competition, 2021 — full vehicle',
      ru: 'BMW M5 (F90) Competition, 2021 — автомобиль целиком',
      uk: 'BMW M5 (F90) Competition, 2021 — автомобіль повністю',
    },
    geometry: {
      en: 'Same procedural body as the studio level, now with system hotspots anchored to real locations (front engine bay, transmission tunnel, four corners).',
      ru: 'Тот же процедурный кузов, что и на уровне студии, но с хотспотами систем, привязанными к реальным местам (моторный отсек, туннель коробки, четыре угла).',
      uk: 'Той самий процедурний кузов, що й на рівні студії, але з хотспотами систем, прив’язаними до реальних місць (моторний відсік, тунель коробки, чотири кути).',
    },
    facts: [
      {
        text: {
          en: 'The engine sits at the front, the transmission runs down the centre tunnel, and drive goes to all four wheels through a rear-biased all-wheel-drive system.',
          ru: 'Двигатель стоит спереди, коробка идёт по центральному туннелю, а тяга идёт на все четыре колеса через полноприводную систему с задним уклоном.',
          uk: 'Двигун стоїть спереду, коробка йде центральним тунелем, а тяга йде на всі чотири колеса через повнопривідну систему із заднім ухилом.',
        },
        unverified: true,
      },
      {
        text: {
          en: 'Each of the four systems gets its own continuous dive: engine, transmission, suspension, brakes and steering.',
          ru: 'Каждая из четырёх систем получает собственный непрерывный спуск: ДВС, коробка, подвеска, тормоза и руление.',
          uk: 'Кожна з чотирьох систем отримує власний безперервний спуск: ДВС, коробка, підвіска, гальма й кермування.',
        },
      },
    ],
    callouts: [
      {
        label: { en: 'Wheelbase', ru: 'Колёсная база', uk: 'Колісна база' },
        value: '2 982 мм',
        source: 'bmw-pressclub',
      },
      {
        label: { en: 'Engine', ru: 'Двигатель', uk: 'Двигун' },
        value: '4,4 л V8 twin-turbo',
        source: 'bmw-n63-wikipedia',
      },
      {
        label: { en: 'Peak power', ru: 'Мощность', uk: 'Потужність' },
        value: '625 л.с.',
        source: 'bmw-pressclub',
      },
    ],
    simplified: [
      {
        en: 'Hotspot positions are approximate; they mark the region of a system, not a mounting point.',
        ru: 'Положения хотспотов приблизительны: они отмечают область системы, а не точку крепления.',
        uk: 'Позиції хотспотів приблизні: вони позначають область системи, а не точку кріплення.',
      },
      {
        en: 'Interior, trim and electronics are out of scope for this experience.',
        ru: 'Интерьер, отделка и электроника в этот разбор не входят.',
        uk: 'Інтер’єр, оздоблення та електроніка не входять до цього розбору.',
      },
    ],
    sources: ['bmw-pressclub', 'bmw-n63-wikipedia', 'carbuzz-m5-2021'],
  },
];
