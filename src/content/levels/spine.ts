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
  {
    id: 'body',
    branch: 'spine',
    order: 2,
    title: {
      en: 'Body and structure',
      ru: 'Кузов и силовая структура',
      uk: 'Кузов і силова структура',
    },
    subtitle: {
      en: 'Panels come off, the cage stays',
      ru: 'Панели снимаются, каркас остаётся',
      uk: 'Панелі знімаються, каркас залишається',
    },
    scale: { unitMeters: 2.5 },
    camera: {
      fovMeters: 5.6,
      from: [3.2, 2.4, 4.6],
      to: [0, 0.82, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'Body-in-white: floor, rails, sills, pillars and subframes',
      ru: 'Кузов-остов: пол, лонжероны, пороги, стойки и подрамники',
      uk: 'Кузов-остов: підлога, лонжерони, пороги, стійки та підрамники',
    },
    geometry: {
      en: 'A load-bearing cage of boxes and rails, plus bolt-on panels: bonnet, boot, wings, doors, bumpers and glazing. Explode mode pulls the skin away from the structure.',
      ru: 'Несущий каркас из коробов и лонжеронов плюс съёмные панели: капот, крышка багажника, крылья, двери, бамперы и стёкла. Режим «Разлёт» снимает обшивку с каркаса.',
      uk: 'Несучий каркас із коробів і лонжеронів плюс знімні панелі: капот, кришка багажника, крила, двері, бампери та стекло. Режим «Розліт» знімає обшивку з каркаса.',
    },
    animation: {
      en: 'In Explode mode every panel slides along its own removal axis; the structure never moves.',
      ru: 'В режиме «Разлёт» каждая панель уезжает по своей оси снятия; структура остаётся на месте.',
      uk: 'У режимі «Розліт» кожна панель від’їжджає по своїй осі зняття; структура лишається на місці.',
    },
    facts: [
      {
        text: {
          en: 'The body is a closed box: a floor, sills, rails and a roof tied together are far stiffer in torsion than the same panels apart.',
          ru: 'Кузов — это замкнутая коробка: пол, пороги, лонжероны и крыша, связанные вместе, работают на кручение намного жёстче, чем по отдельности.',
          uk: 'Кузов — це замкнена коробка: підлога, пороги, лонжерони та дах, зв’язані разом, працюють на кручення значно жорсткіше, ніж окремо.',
        },
      },
      {
        text: {
          en: 'Front and rear sections are designed to fold in a crash and absorb energy before it reaches the passenger cell.',
          ru: 'Передняя и задняя части рассчитаны на смятие в аварии и поглощают энергию до того, как она дойдёт до салона.',
          uk: 'Передня та задня частини розраховані на зминання в аварії й поглинають енергію до того, як вона дійде до салону.',
        },
      },
      {
        text: {
          en: 'Different steels and aluminium are used in the same shell: high-strength grades where loads are high, softer metal in the crumple zones.',
          ru: 'В одном кузове сочетают разные стали и алюминий: высокопрочные — там, где большие нагрузки, мягче — в зонах деформации.',
          uk: 'В одному кузові поєднують різні сталі та алюміній: високоміцні — там, де великі навантаження, м’якші — у зонах деформації.',
        },
        unverified: true,
      },
    ],
    callouts: [
      {
        label: { en: 'Length', ru: 'Длина', uk: 'Довжина' },
        value: '4 966 мм',
        source: 'bmw-pressclub',
      },
      {
        label: { en: 'Height', ru: 'Высота', uk: 'Висота' },
        value: '1 473 мм',
        source: 'bmw-pressclub',
      },
      {
        label: { en: 'Wheelbase', ru: 'Колёсная база', uk: 'Колісна база' },
        value: '2 982 мм',
        source: 'bmw-pressclub',
      },
    ],
    simplified: [
      {
        en: 'Panels are flat schematics: no weld flanges, spot welds, beads or panel gaps are modelled.',
        ru: 'Панели — плоские схемы: сварные фланцы, точки сварки, рёбра жёсткости и зазоры не моделируются.',
        uk: 'Панелі — пласкі схеми: зварні фланці, точки зварювання, ребра жорсткості та зазори не моделюються.',
      },
      {
        en: 'Sound deadening, seals, wires and trim are omitted.',
        ru: 'Шумоизоляция, уплотнители, проводка и отделка опущены.',
        uk: 'Шумоізоляція, ущільнювачі, проводка та оздоблення опущені.',
      },
    ],
    sources: ['bmw-pressclub', 'bosch-handbook', 'sae-papers'],
    modes: ['tour', 'explore', 'explode'],
  },
  {
    id: 'chassis-hub',
    branch: 'spine',
    order: 3,
    title: {
      en: 'Chassis hub: choose a branch',
      ru: 'Хаб шасси: выберите ветку',
      uk: 'Хаб шасі: оберіть гілку',
    },
    subtitle: {
      en: 'How everything is connected',
      ru: 'Как всё связано между собой',
      uk: 'Як усе пов’язано між собою',
    },
    scale: { unitMeters: 1.2 },
    camera: {
      fovMeters: 4.4,
      from: [2.7, 0.9, 3.5],
      to: [0, 0.45, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'The rolling chassis under a translucent body shell',
      ru: 'Ходовая часть под полупрозрачным кузовом',
      uk: 'Ходова частина під напівпрозорим кузовом',
    },
    geometry: {
      en: 'Engine, transmission, transfer case, propshaft, differential, half-shafts, all four corners and the exhaust, with the body shown as a ghost shell.',
      ru: 'Двигатель, коробка, раздатка, карданный вал, редуктор, полуоси, все четыре угла и выхлоп; кузов показан призрачной оболочкой.',
      uk: 'Двигун, коробка, роздатка, карданний вал, редуктор, півосі, усі чотири кути та вихлоп; кузов показано примарною оболонкою.',
    },
    animation: {
      en: 'Flow mode moves markers along the torque path; wheels turn with road speed.',
      ru: 'Режим «Потоки» ведёт маркеры по пути момента; колёса вращаются со скоростью дороги.',
      uk: 'Режим «Потоки» веде маркери шляхом моменту; колеса обертаються зі швидкістю дороги.',
    },
    facts: [
      {
        text: {
          en: 'Torque leaves the engine, crosses the converter, runs down the propshaft and reaches all four wheels through two differentials.',
          ru: 'Момент выходит из двигателя, проходит гидротрансформатор, идёт по кардану и доходит до всех четырёх колёс через два редуктора.',
          uk: 'Момент виходить із двигуна, проходить гідротрансформатор, іде карданом і доходить до всіх чотирьох коліс через два редуктори.',
        },
      },
      {
        text: {
          en: 'The all-wheel-drive system sends most of the torque to the rear axle by default; a transfer case can feed the front axle too.',
          ru: 'Полный привод по умолчанию отдаёт большую часть момента на заднюю ось; раздатка может подключать и переднюю.',
          uk: 'Повний привід за замовчуванням віддає більшу частину моменту на задню вісь; роздатка може підключати й передню.',
        },
        unverified: true,
      },
      {
        text: {
          en: 'Every branch ahead shows one of these systems at a much closer scale.',
          ru: 'Каждая из веток впереди показывает одну из этих систем на намного более близком масштабе.',
          uk: 'Кожна з гілок попереду показує одну з цих систем на значно ближчому масштабі.',
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
        label: { en: 'Drive', ru: 'Привод', uk: 'Привід' },
        value: 'M xDrive, задний уклон',
        unverified: true,
        source: 'bmw-pressclub',
      },
      {
        label: { en: 'Engine', ru: 'Двигатель', uk: 'Двигун' },
        value: '4,4 л V8 twin-turbo',
        source: 'bmw-n63-wikipedia',
      },
    ],
    simplified: [
      {
        en: 'Driveline parts are tube-and-box schematics, not castings; internal gears are not shown.',
        ru: 'Детали трансмиссии — схематические трубы и короба, а не отливки; внутренние шестерни не показаны.',
        uk: 'Деталі трансмісії — схематичні труби та короби, а не виливки; внутрішні шестерні не показані.',
      },
      {
        en: 'Fluid lines, wiring and heat shielding are omitted.',
        ru: 'Магистрали, проводка и теплозащита опущены.',
        uk: 'Магістралі, проводка та теплозахист опущені.',
      },
    ],
    sources: ['bmw-pressclub', 'bmw-n63-wikipedia', 'bosch-handbook', 'carbuzz-m5-2021'],
    hub: true,
    modes: ['tour', 'explore', 'flow'],
  },
];
