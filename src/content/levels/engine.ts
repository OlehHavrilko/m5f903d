import type { LevelSpec } from '../../core/level-registry.js';

/**
 * Branch A, the engine: from the complete power unit down to a single iron atom.
 * The whole descent is data; the matching procedural geometry lives in
 * `branches/engine/*` and is loaded on demand (docs/M0-design-plan.md §5.2).
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
  {
    id: 'engine.longblock',
    branch: 'engine',
    order: 1,
    title: {
      en: 'The long block in section',
      ru: 'Long block в разрезе',
      uk: 'Long block у розрізі',
    },
    subtitle: {
      en: 'Ninety degrees, eight bores',
      ru: 'Девяносто градусов, восемь цилиндров',
      uk: 'Дев’яносто градусів, вісім циліндрів',
    },
    scale: { unitMeters: 0.3 },
    camera: {
      fovMeters: 0.66,
      from: [0.9, 0.6, 0.8],
      to: [0, 0.02, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'The 90° V8 block, two heads, crankshaft and sump',
      ru: '90-градусный блок V8, две ГБЦ, коленвал и поддон',
      uk: '90-градусний блок V8, дві ГБЦ, колінвал і піддон',
    },
    geometry: {
      en: 'A cutaway block with two inclined banks of four bores, a four-throw crankshaft, heads and a sump; the near bank is opened so pistons and bores read.',
      ru: 'Разрез блока: два наклонных банка по четыре цилиндра, четырёхколенный коленвал, ГБЦ и поддон; ближний банк вскрыт, чтобы были видны поршни и цилиндры.',
      uk: 'Розріз блоку: два нахилені банки по чотири циліндри, чотириколінний колінвал, ГБЦ і піддон; ближній банк розкрито, щоб було видно поршні та циліндри.',
    },
    animation: {
      en: 'The crank turns through 720°; the eight pistons follow the crank-slider law in firing order 1-5-4-8-6-3-7-2.',
      ru: 'Коленвал делает 720°; восемь поршней движутся по закону кривошипа в порядке работы 1-5-4-8-6-3-7-2.',
      uk: 'Колінвал робить 720°; вісім поршнів рухаються за законом кривошипа в порядку роботи 1-5-4-8-6-3-7-2.',
    },
    facts: [
      {
        text: {
          en: 'Both banks share one crankshaft: a 90° V with a cross-plane crank can fire evenly every 90°.',
          ru: 'Оба банка работают на одном коленвале: 90-градусный V с cross-plane коленвалом может давать равномерные вспышки каждые 90°.',
          uk: 'Обидва банки працюють на одному колінвалі: 90-градусний V із cross-plane колінвалом може давати рівномірні спалахи кожні 90°.',
        },
      },
      {
        text: {
          en: 'The block is the stiffness spine: it carries the main bearings and ties both heads to the transmission.',
          ru: 'Блок — это силовой хребет: он несёт коренные подшипники и связывает обе ГБЦ с коробкой.',
          uk: 'Блок — це силовий хребет: він несе корінні підшипники й зв’язує обидві ГБЦ із коробкою.',
        },
      },
      {
        text: {
          en: 'A dry sump keeps oil pressure under lateral load and lets the engine sit lower.',
          ru: 'Сухой картер держит давление масла в поворотах и позволяет поставить двигатель ниже.',
          uk: 'Сухий картер тримає тиск оливи в поворотах і дозволяє поставити двигун нижче.',
        },
        unverified: true,
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
        label: { en: 'V angle', ru: 'Угол развала', uk: 'Кут розвалу' },
        value: '90°',
        source: 'bmw-n63-wikipedia',
      },
      {
        label: { en: 'Firing order', ru: 'Порядок работы', uk: 'Порядок роботи' },
        value: '1-5-4-8-6-3-7-2',
        source: 'bosch-handbook',
      },
    ],
    simplified: [
      {
        en: 'The cutaway is schematic: coolant jackets, oil galleries, fasteners and the timing drive are reduced or omitted.',
        ru: 'Разрез схематичен: рубашки охлаждения, масляные каналы, крепёж и привод ГРМ сокращены или опущены.',
        uk: 'Розріз схематичний: сорочки охолодження, оливні канали, кріплення та привод ГРМ скорочено або опущено.',
      },
      {
        en: 'Head internals and valve events are represented on the pistons, not as separate parts at this scale.',
        ru: 'Внутренности ГБЦ и фазы газораспределения показаны на поршнях, а не отдельными деталями в этом масштабе.',
        uk: 'Внутрішні частини ГБЦ і фази газорозподілу показано на поршнях, а не окремими деталями в цьому масштабі.',
      },
    ],
    sources: ['bmw-n63-wikipedia', 'autostatistics-s63', 'bosch-handbook', 'sae-papers'],
    modes: ['tour', 'explore', 'cutaway', 'flow', 'slowmo'],
  },
  {
    id: 'engine.cylinder',
    branch: 'engine',
    order: 2,
    title: {
      en: 'One cylinder, four strokes',
      ru: 'Один цилиндр, четыре такта',
      uk: 'Один циліндр, чотири такти',
    },
    subtitle: {
      en: 'Two crank turns, one bang',
      ru: 'Два оборота коленвала, одна вспышка',
      uk: 'Два оберти колінвала, один спалах',
    },
    scale: { unitMeters: 0.12 },
    camera: {
      fovMeters: 0.3,
      from: [0.3, 0.3, 0.34],
      to: [0, 0.12, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'Piston, rings, pin, connecting rod, crank throw and two valves',
      ru: 'Поршень, кольца, палец, шатун, колено коленвала и два клапана',
      uk: 'Поршень, кільця, палець, шатун, коліно колінвала та два клапани',
    },
    geometry: {
      en: 'A transparent liner over a piston with three rings, a floating pin, a connecting rod and a single crank throw; intake and exhaust valves angle into the chamber.',
      ru: 'Прозрачная гильза, внутри поршень с тремя кольцами, плавающий палец, шатун и одно колено коленвала; впускной и выпускной клапаны входят в камеру под углом.',
      uk: 'Прозора гільза, усередині поршень із трьома кільцями, плаваючий палець, шатун і одне коліно колінвала; впускний і випускний клапани входять у камеру під кутом.',
    },
    animation: {
      en: 'The piston follows s(θ) through 720°; valves open for intake (360–540°) and exhaust (180–360°); a flash marks the start of expansion.',
      ru: 'Поршень движется по s(θ) через 720°; клапаны открываются на впуск (360–540°) и выпуск (180–360°); вспышка отмечает начало рабочего хода.',
      uk: 'Поршень рухається за s(θ) через 720°; клапани відкриваються на впуск (360–540°) і випуск (180–360°); спалах позначає початок робочого ходу.',
    },
    facts: [
      {
        text: {
          en: 'Only the power stroke produces torque; intake, compression and exhaust all consume work.',
          ru: 'Момент создаёт только рабочий ход; впуск, сжатие и выпуск потребляют работу.',
          uk: 'Момент створює лише робочий хід; впуск, стиснення та випуск споживають роботу.',
        },
      },
      {
        text: {
          en: 'A four-stroke cycle takes two crank revolutions, so the camshaft turns at half crank speed.',
          ru: 'Четырёхтактный цикл занимает два оборота коленвала, поэтому распредвал вращается вдвое медленнее.',
          uk: 'Чотиритактний цикл займає два оберти колінвала, тому розподвал обертається вдвічі повільніше.',
        },
      },
      {
        text: {
          en: 'The rings seal combustion gas and meter oil while keeping the piston off the bore wall.',
          ru: 'Кольца уплотняют газы и дозируют масло, удерживая поршень от касания стенки цилиндра.',
          uk: 'Кільця ущільнюють гази й дозують оливу, утримуючи поршень від торкання стінки циліндра.',
        },
      },
    ],
    callouts: [
      {
        label: { en: 'Bore', ru: 'Диаметр', uk: 'Діаметр' },
        value: '89,0 мм',
        source: 'bmw-n63-wikipedia',
      },
      {
        label: { en: 'Stroke', ru: 'Ход', uk: 'Хід' },
        value: '88,3 мм',
        source: 'bmw-n63-wikipedia',
      },
      {
        label: { en: 'Compression ratio', ru: 'Степень сжатия', uk: 'Ступінь стиснення' },
        value: '10,0:1',
        unverified: true,
        source: 'autostatistics-s63',
      },
      {
        label: { en: 'Cycle', ru: 'Цикл', uk: 'Цикл' },
        value: '720°',
        source: 'bosch-handbook',
      },
    ],
    simplified: [
      {
        en: 'Geometry is schematic; gas exchange, blow-by and heat transfer are not solved, only shown.',
        ru: 'Геометрия схематична; газообмен, прорыв газов и теплообмен не рассчитываются, а показываются.',
        uk: 'Геометрія схематична; газообмін, прорив газів і теплообмін не розраховуються, а показуються.',
      },
      {
        en: 'Valve events are idealised rectangles-in-time rather than measured lift curves.',
        ru: 'Фазы клапанов идеализированы, а не взяты из измеренных кривых подъёма.',
        uk: 'Фази клапанів ідеалізовано, а не взяті з виміряних кривих підйому.',
      },
    ],
    sources: ['bmw-n63-wikipedia', 'autostatistics-s63', 'bosch-handbook', 'sae-papers'],
    modes: ['tour', 'explore', 'cutaway', 'flow', 'slowmo'],
  },
  {
    id: 'engine.valvetrain',
    branch: 'engine',
    order: 3,
    title: {
      en: 'DOHC, variable lift',
      ru: 'DOHC с переменным подъёмом',
      uk: 'DOHC із змінним підйомом',
    },
    subtitle: {
      en: 'Camshafts that change their mind',
      ru: 'Распредвалы, которые передумывают',
      uk: 'Розподвали, які передумують',
    },
    scale: { unitMeters: 0.05 },
    camera: {
      fovMeters: 0.32,
      from: [0.36, 0.32, 0.4],
      to: [0, 0.08, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'Twin camshafts, bucket tappets, springs, four valves per cylinder, VANOS phasers and the chain',
      ru: 'Два распредвала, стаканы, пружины, четыре клапана на цилиндр, фазовращатели VANOS и цепь',
      uk: 'Два розподвали, склянки, пружини, чотири клапани на циліндр, фазообертачі VANOS і ланцюг',
    },
    geometry: {
      en: 'A sectioned head with two cams, four valves per cylinder, coil springs and a chain drive whose phasers sit on the cam noses.',
      ru: 'Разрез ГБЦ: два распредвала, четыре клапана на цилиндр, пружины и цепной привод с фазовращателями на носках валов.',
      uk: 'Розріз ГБЦ: два розподвали, чотири клапани на циліндр, пружини та ланцюговий привод із фазообертачами на носках валів.',
    },
    animation: {
      en: 'Cams spin at half crank speed; VANOS shifts intake and exhaust phase, and Valvetronic varies lift with engine speed.',
      ru: 'Распредвалы вращаются вдвое медленнее коленвала; VANOS сдвигает фазы впуска и выпуска, а Valvetronic меняет подъём по оборотам.',
      uk: 'Розподвали обертаються вдвічі повільніше колінвала; VANOS зсуває фази впуску та випуску, а Valvetronic змінює підйом за обертами.',
    },
    facts: [
      {
        text: {
          en: 'Variable cam timing trades low-end stability for top-end breathing.',
          ru: 'Изменяемые фазы газораспределения обменивают устойчивость на низах на дыхание на верхах.',
          uk: 'Змінні фази газорозподілу обмінюють стійкість на низах на дихання на верхах.',
        },
      },
      {
        text: {
          en: 'Continuous valve-lift control cuts pumping losses: the engine is no longer throttled by a plate alone.',
          ru: 'Непрерывное управление подъёмом клапанов снижает насосные потери: двигатель дросселируется не только заслонкой.',
          uk: 'Безперервне керування підйомом клапанів знижує насосні втрати: двигун дроселюється не лише заслінкою.',
        },
      },
      {
        text: {
          en: 'One chain drives both camshafts, so their relative phase can be scheduled freely.',
          ru: 'Одна цепь приводит оба распредвала, поэтому их взаимную фазу можно задавать свободно.',
          uk: 'Один ланцюг приводить обидва розподвали, тому їхню взаємну фазу можна задавати вільно.',
        },
      },
    ],
    callouts: [
      {
        label: { en: 'Valves per cylinder', ru: 'Клапанов на цилиндр', uk: 'Клапанів на циліндр' },
        value: '4',
        source: 'bmw-n63-wikipedia',
      },
      {
        label: {
          en: 'Cam drive ratio',
          ru: 'Передаточное отношение ГРМ',
          uk: 'Передатне відношення ГРМ',
        },
        value: '1:2 коленвала',
        source: 'bosch-handbook',
      },
      {
        label: { en: 'Lift control', ru: 'Управление подъёмом', uk: 'Керування підйомом' },
        value: 'Valvetronic, бесступенчато',
        unverified: true,
        source: 'bmw-pressclub',
      },
    ],
    simplified: [
      {
        en: 'Springs, buckets and phasers are schematic; no spring surge or valvetrain dynamics are simulated.',
        ru: 'Пружины, стаканы и фазовращатели схематичны; динамика клапанного механизма не моделируется.',
        uk: 'Пружини, склянки та фазообертачі схематичні; динаміка клапанного механізму не моделюється.',
      },
      {
        en: 'Lift curves are drawn to show the idea, not to reproduce a measured cam profile.',
        ru: 'Кривые подъёма показывают идею, а не воспроизводят измеренный профиль кулачка.',
        uk: 'Криві підйому показують ідею, а не відтворюють виміряний профіль кулачка.',
      },
    ],
    sources: ['bmw-pressclub', 'bmw-n63-wikipedia', 'bosch-handbook', 'sae-papers'],
    modes: ['tour', 'explore', 'cutaway', 'slowmo'],
  },
  {
    id: 'engine.charge',
    branch: 'engine',
    order: 4,
    title: {
      en: 'Charge, spark, boost',
      ru: 'Смесь, искра, наддув',
      uk: 'Суміш, іскра, наддув',
    },
    subtitle: {
      en: 'Air and fuel, then fire',
      ru: 'Воздух и топливо, затем огонь',
      uk: 'Повітря та паливо, потім вогонь',
    },
    scale: { unitMeters: 0.02 },
    camera: {
      fovMeters: 0.26,
      from: [0.28, 0.2, 0.3],
      to: [0, 0.02, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'DI injector and spray, spark plug, flame front, twin-scroll turbo, intercooler and wastegate',
      ru: 'Форсунка прямого впрыска с факелом, свеча, фронт пламени, twin-scroll турбина, интеркулер и вестгейт',
      uk: 'Форсунка прямого впорскування з факелом, свічка, фронт полум’я, twin-scroll турбіна, інтеркулер і вестгейт',
    },
    geometry: {
      en: 'A chamber slice with an injector and its spray cone, a spark plug and a growing flame; beside it a turbo with compressor and turbine wheels, an intercooler core and a wastegate flap.',
      ru: 'Срез камеры: форсунка с факелом, свеча и растущее пламя; рядом турбина с колёсами компрессора и турбины, сердцевина интеркулера и заслонка вестгейта.',
      uk: 'Зріз камери: форсунка з факелом, свічка та полум’я, що росте; поряд турбіна з колесами компресора і турбіни, осердя інтеркулера та заслінка вестгейта.',
    },
    animation: {
      en: 'Injection, spark and flame growth follow the crank angle; the turbo spools with rpm and the wastegate opens at the boost limit.',
      ru: 'Впрыск, искра и рост пламени следуют за углом коленвала; турбина раскручивается по оборотам, а вестгейт открывается на пределе наддува.',
      uk: 'Упорскування, іскра та ріст полум’я йдуть за кутом колінвала; турбіна розкручується за обертами, а вестгейт відкривається на межі наддуву.',
    },
    facts: [
      {
        text: {
          en: 'Direct injection puts fuel where it will burn and cools the charge as it evaporates.',
          ru: 'Прямой впрыск подаёт топливо туда, где оно сгорит, и охлаждает заряд при испарении.',
          uk: 'Пряме впорскування подає паливо туди, де воно згорить, і охолоджує заряд під час випаровування.',
        },
      },
      {
        text: {
          en: 'Compressing air heats it; an intercooler removes that heat so more oxygen fits in the same volume.',
          ru: 'Сжатие нагревает воздух; интеркулер отводит это тепло, чтобы в тот же объём вошло больше кислорода.',
          uk: 'Стиснення нагріває повітря; інтеркулер відводить це тепло, щоб у той самий об’єм увійшло більше кисню.',
        },
      },
      {
        text: {
          en: 'A wastegate caps boost by routing exhaust around the turbine once the target pressure is reached.',
          ru: 'Вестгейт ограничивает наддув, направляя выхлоп мимо турбины при достижении целевого давления.',
          uk: 'Вестгейт обмежує наддув, направляючи вихлоп повз турбіну після досягнення цільового тиску.',
        },
      },
    ],
    callouts: [
      {
        label: { en: 'Boost', ru: 'Наддув', uk: 'Наддув' },
        value: '≈1,5 бар',
        unverified: true,
      },
      {
        label: {
          en: 'Lambda at full load',
          ru: 'Лямбда под нагрузкой',
          uk: 'Лямбда під навантаженням',
        },
        value: '≈0,85',
        unverified: true,
        source: 'bosch-handbook',
      },
      {
        label: {
          en: 'Turbo shaft speed',
          ru: 'Скорость вала турбины',
          uk: 'Швидкість вала турбіни',
        },
        value: 'до ≈200 000 об/мин',
        unverified: true,
      },
    ],
    simplified: [
      {
        en: 'Spray, flame and turbo are schematics; no CFD, only the sequence and the direction of energy.',
        ru: 'Факел, пламя и турбина схематичны; расчёта течений нет — только последовательность и направление энергии.',
        uk: 'Факел, полум’я та турбіна схематичні; розрахунку течій немає — лише послідовність і напрям енергії.',
      },
      {
        en: 'The intercooler is a single representative core, not the full charge-air circuit.',
        ru: 'Интеркулер — один типовой блок, а не весь контур наддувочного воздуха.',
        uk: 'Інтеркулер — один типовий блок, а не весь контур наддувного повітря.',
      },
    ],
    sources: ['bmw-pressclub', 'bmw-n63-wikipedia', 'bosch-handbook', 'sae-papers'],
    modes: ['tour', 'explore', 'cutaway', 'flow', 'slowmo'],
  },
  {
    id: 'engine.combustion',
    branch: 'engine',
    order: 5,
    title: {
      en: 'Inside the flame',
      ru: 'Внутри пламени',
      uk: 'Усередині полум’я',
    },
    subtitle: {
      en: 'A kernel becomes a front',
      ru: 'Ядро становится фронтом',
      uk: 'Ядро стає фронтом',
    },
    scale: { unitMeters: 0.005 },
    camera: {
      fovMeters: 0.07,
      from: [0.08, 0.05, 0.09],
      to: [0, 0.014, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'Combustion chamber micro-view: flame kernel, turbulent front and thermal boundary layer',
      ru: 'Микро-вид камеры сгорания: ядро пламени, турбулентный фронт и тепловой погранслой',
      uk: 'Мікро-вид камери згоряння: ядро полум’я, турбулентний фронт і тепловий прикордонний шар',
    },
    geometry: {
      en: 'A shallow chamber volume with a flame kernel at the plug, a wrinkled front spreading through it and a boundary layer hugging the walls; colour tracks temperature.',
      ru: 'Небольшой объём камеры: ядро у свечи, сморщенный фронт, расходящийся по объёму, и погранслой у стенок; цвет соответствует температуре.',
      uk: 'Невеликий об’єм камери: ядро біля свічки, зморщений фронт, що розходиться об’ємом, і прикордонний шар біля стінок; колір відповідає температурі.',
    },
    animation: {
      en: 'The kernel is born at the plug, the front races across the chamber, and a cooler boundary layer survives against the metal.',
      ru: 'Ядро рождается у свечи, фронт проносится по камере, а у металла остаётся более холодный погранслой.',
      uk: 'Ядро народжується біля свічки, фронт пролітає камерою, а біля металу залишається холодніший прикордонний шар.',
    },
    facts: [
      {
        text: {
          en: 'The flame front moves at tens of metres per second, not thousands: turbulence does the fast work.',
          ru: 'Фронт пламени идёт десятки метров в секунду, а не тысячи: быструю работу делает турбулентность.',
          uk: 'Фронт полум’я йде десятки метрів за секунду, а не тисячі: швидку роботу робить турбулентність.',
        },
      },
      {
        text: {
          en: 'A quench layer near the wall leaves some fuel unburned, which is why exhaust needs after-treatment.',
          ru: 'Пристеночный слой гашения оставляет часть топлива несгоревшей — поэтому выхлопу нужна нейтрализация.',
          uk: 'Пристінний шар гасіння залишає частину палива незгорілою — тому вихлопу потрібна нейтралізація.',
        },
      },
      {
        text: {
          en: 'Knock is autoignition of the end gas, not the flame arriving early.',
          ru: 'Детонация — это самовоспламенение конечного газа, а не ранний приход пламени.',
          uk: 'Детонація — це самозаймання кінцевого газу, а не ранній прихід полум’я.',
        },
      },
    ],
    callouts: [
      {
        label: {
          en: 'Laminar flame speed',
          ru: 'Ламинарная скорость фронта',
          uk: 'Ламінарна швидкість фронту',
        },
        value: '≈0,4 м/с',
        unverified: true,
        source: 'sae-papers',
      },
      {
        label: {
          en: 'Turbulent flame speed',
          ru: 'Турбулентная скорость фронта',
          uk: 'Турбулентна швидкість фронту',
        },
        value: '≈10–30 м/с',
        unverified: true,
        source: 'sae-papers',
      },
      {
        label: {
          en: 'Peak gas temperature',
          ru: 'Пиковая температура газов',
          uk: 'Пікова температура газів',
        },
        value: '≈2 200 °C',
        unverified: true,
        source: 'sae-papers',
      },
    ],
    simplified: [
      {
        en: 'One idealized chamber with simplified chemistry; heat is shown as colour, not solved.',
        ru: 'Одна идеализированная камера с упрощённой химией; тепло показано цветом, а не рассчитано.',
        uk: 'Одна ідеалізована камера зі спрощеною хімією; тепло показано кольором, а не розраховано.',
      },
      {
        en: 'The scale is exaggerated so the flame front stays inside the frame.',
        ru: 'Масштаб увеличен, чтобы фронт пламени оставался в кадре.',
        uk: 'Масштаб збільшено, щоб фронт полум’я залишався в кадрі.',
      },
    ],
    sources: ['bosch-handbook', 'sae-papers'],
    modes: ['tour', 'explore', 'slowmo'],
  },
  {
    id: 'engine.oil',
    branch: 'engine',
    order: 6,
    title: {
      en: 'The oil wedge',
      ru: 'Масляный клин',
      uk: 'Оливний клин',
    },
    subtitle: {
      en: 'Metal floating on liquid',
      ru: 'Металл, плавающий на жидкости',
      uk: 'Метал, що плаває на рідині',
    },
    scale: { unitMeters: 0.0005 },
    camera: {
      fovMeters: 0.18,
      from: [0.2, 0.14, 0.22],
      to: [0, 0, 0.02],
      fovDeg: 38,
    },
    subject: {
      en: 'Main bearing: journal, shell, hydrodynamic film, oil feed and honing',
      ru: 'Коренной подшипник: шейка, вкладыш, гидродинамическая плёнка, канал подачи и хон',
      uk: 'Корінний підшипник: шийка, вкладиш, гідродинамічна плівка, канал подачі та хон',
    },
    geometry: {
      en: 'A cutaway bearing shell around a rotating journal with a wedge-shaped film, an oil feed hole and cross-hatch honing on the bore wall.',
      ru: 'Разрез вкладыша вокруг вращающейся шейки: клиновидная плёнка, маслоподводящее отверстие и хон на стенке цилиндра.',
      uk: 'Розріз вкладиша навколо шийки, що обертається: клиноподібна плівка, маслопідвідний отвір і хон на стінці циліндра.',
    },
    animation: {
      en: 'Oil flows into the wedge; pressure builds as the journal drags fluid into the narrowing gap and the shaft lifts off the shell.',
      ru: 'Масло входит в клин; давление растёт, когда шейка втягивает жидкость в сужающийся зазор, и вал приподнимается над вкладышем.',
      uk: 'Олива входить у клин; тиск зростає, коли шийка втягує рідину в звужуваний зазор, і вал піднімається над вкладишем.',
    },
    facts: [
      {
        text: {
          en: 'A hydrodynamic film carries the load only while pressure is maintained; the shaft never touches the shell when running.',
          ru: 'Гидродинамическая плёнка несёт нагрузку, пока поддерживается давление; на ходу вал не касается вкладыша.',
          uk: 'Гідродинамічна плівка несе навантаження, доки підтримується тиск; на ходу вал не торкається вкладиша.',
        },
      },
      {
        text: {
          en: 'Viscosity falls as oil heats, so the bearing is designed for the hot case, not the cold one.',
          ru: 'Вязкость падает с нагревом масла, поэтому подшипник рассчитывают на горячий режим, а не на холодный.',
          uk: 'В’язкість падає з нагрівом оливи, тому підшипник розраховують на гарячий режим, а не на холодний.',
        },
      },
      {
        text: {
          en: 'Boundary contact remains at start and stop, which is where most bearing wear happens.',
          ru: 'Граничный контакт остаётся при пуске и остановке — именно там возникает основная часть износа.',
          uk: 'Граничний контакт залишається під час пуску та зупинки — саме там виникає основна частина зносу.',
        },
      },
    ],
    callouts: [
      {
        label: { en: 'Film thickness', ru: 'Толщина плёнки', uk: 'Товщина плівки' },
        value: '≈2–10 мкм',
        unverified: true,
        source: 'bosch-handbook',
      },
      {
        label: { en: 'Bearing clearance', ru: 'Зазор подшипника', uk: 'Зазор підшипника' },
        value: '≈0,05 мм',
        unverified: true,
      },
      {
        label: { en: 'Oil pressure', ru: 'Давление масла', uk: 'Тиск оливи' },
        value: '2–6 бар',
        unverified: true,
      },
    ],
    simplified: [
      {
        en: 'The film is exaggerated roughly a hundredfold so it can be seen at all.',
        ru: 'Плёнка увеличена примерно в сто раз, иначе её не было бы видно.',
        uk: 'Плівку збільшено приблизно у сто разів, інакше її не було б видно.',
      },
      {
        en: 'A single main bearing with no thermal or pressure solve; the wedge shows the mechanism, not magnitudes.',
        ru: 'Один коренной подшипник без расчёта тепла и давления; клин показывает механизм, а не величины.',
        uk: 'Один корінний підшипник без розрахунку тепла й тиску; клин показує механізм, а не величини.',
      },
    ],
    sources: ['bosch-handbook', 'sae-papers', 'stribeck-wikipedia'],
    modes: ['tour', 'explore', 'cutaway', 'flow'],
  },
  {
    id: 'engine.metal',
    branch: 'engine',
    order: 7,
    title: {
      en: 'What metal really is',
      ru: 'Что такое металл на самом деле',
      uk: 'Що таке метал насправді',
    },
    subtitle: {
      en: 'Grains, not a solid',
      ru: 'Зёрна, а не сплошное тело',
      uk: 'Зерна, а не суцільне тіло',
    },
    scale: { unitMeters: 2e-5 },
    camera: {
      fovMeters: 0.32,
      from: [0.38, 0.28, 0.42],
      to: [0, 0, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'Microstructure of cast aluminium and iron: grains and grain boundaries',
      ru: 'Микроструктура литого алюминия и чугуна: зёрна и границы зёрен',
      uk: 'Мікроструктура литого алюмінію та чавуну: зерна й межі зерен',
    },
    geometry: {
      en: 'A field of jittered polyhedral grains joined by boundary lines; colour marks different crystal orientations.',
      ru: 'Поле случайно ориентированных многогранных зёрен, соединённых линиями границ; цвет отмечает разную ориентацию кристаллов.',
      uk: 'Поле випадково орієнтованих багатогранних зерен, з’єднаних лініями меж; колір позначає різну орієнтацію кристалів.',
    },
    animation: {
      en: 'A slow rotation shows that the metal is a network of grains rather than a uniform solid.',
      ru: 'Медленное вращение показывает, что металл — это сеть зёрен, а не однородное твёрдое тело.',
      uk: 'Повільне обертання показує, що метал — це мережа зерен, а не однорідне тверде тіло.',
    },
    facts: [
      {
        text: {
          en: 'Metals are polycrystalline: many grains of different orientation meet at boundaries.',
          ru: 'Металлы поликристалличны: множество зёрен разной ориентации встречаются на границах.',
          uk: 'Метали полікристалічні: безліч зерен різної орієнтації зустрічаються на межах.',
        },
      },
      {
        text: {
          en: 'A crack either follows boundaries or cuts across grains; that choice decides whether the metal is tough or brittle.',
          ru: 'Трещина идёт либо по границам, либо сквозь зёрна; от этого зависит, вязкий металл или хрупкий.',
          uk: 'Тріщина йде або по межах, або крізь зерна; від цього залежить, в’язкий метал чи крихкий.',
        },
      },
      {
        text: {
          en: 'Heat treatment controls grain size, and grain size controls strength.',
          ru: 'Термообработка управляет размером зерна, а размер зерна управляет прочностью.',
          uk: 'Термообробка керує розміром зерна, а розмір зерна керує міцністю.',
        },
      },
    ],
    callouts: [
      {
        label: { en: 'Grain size', ru: 'Размер зерна', uk: 'Розмір зерна' },
        value: '≈10–50 мкм',
        unverified: true,
        source: 'sae-papers',
      },
      {
        label: { en: 'Grain boundary width', ru: 'Ширина границы зерна', uk: 'Ширина межі зерна' },
        value: 'несколько атомов',
        unverified: true,
      },
      {
        label: {
          en: 'Iron lattice constant',
          ru: 'Постоянная решётки железа',
          uk: 'Стала ґратки заліза',
        },
        value: '0,287 нм',
        source: 'iron-wikipedia',
      },
    ],
    simplified: [
      {
        en: 'Grains are idealized polyhedra, not an etched micrograph, and the scale is exaggerated to show the network.',
        ru: 'Зёрна — идеализированные многогранники, а не травленая микрофотография; масштаб увеличен, чтобы показать сеть.',
        uk: 'Зерна — ідеалізовані багатогранники, а не травлена мікрофотографія; масштаб збільшено, щоб показати мережу.',
      },
    ],
    sources: ['sae-papers', 'iron-wikipedia'],
    modes: ['tour', 'explore', 'cutaway'],
  },
  {
    id: 'engine.atom',
    branch: 'engine',
    order: 8,
    title: {
      en: 'Iron, one atom',
      ru: 'Железо, один атом',
      uk: 'Залізо, один атом',
    },
    subtitle: {
      en: 'The end of the fall',
      ru: 'Конец спуска',
      uk: 'Кінець спуску',
    },
    scale: { unitMeters: 2.5e-10 },
    camera: {
      fovMeters: 0.44,
      from: [0.5, 0.34, 0.54],
      to: [0, 0, 0],
      fovDeg: 38,
    },
    subject: {
      en: 'A body-centred cubic iron crystal and a single iron atom',
      ru: 'Объёмно-центрированная кубическая решётка железа и один атом железа',
      uk: 'Об’ємно-центрована кубічна ґратка заліза та один атом заліза',
    },
    geometry: {
      en: 'A body-centred cubic cell of iron atoms, and a single atom with its nucleus and two electron shells.',
      ru: 'Объёмно-центрированная кубическая ячейка атомов железа и один атом с ядром и двумя электронными оболочками.',
      uk: 'Об’ємно-центрована кубічна комірка атомів заліза та один атом із ядром і двома електронними оболонками.',
    },
    animation: {
      en: 'The lattice breathes and the atom’s electrons orbit their shells.',
      ru: 'Решётка слегка дышит, а электроны атома обходят свои оболочки.',
      uk: 'Ґратка злегка дихає, а електрони атома обходять свої оболонки.',
    },
    facts: [
      {
        text: {
          en: 'At room temperature iron packs in a body-centred cubic lattice.',
          ru: 'При комнатной температуре железо упаковано в объёмно-центрированную кубическую решётку.',
          uk: 'За кімнатної температури залізо упаковане в об’ємно-центровану кубічну ґратку.',
        },
      },
      {
        text: {
          en: 'The nucleus carries almost all the mass; the electrons decide how iron bonds and reacts.',
          ru: 'Почти вся масса — в ядре; электроны определяют, как железо связывается и реагирует.',
          uk: 'Майже вся маса — у ядрі; електрони визначають, як залізо зв’язується та реагує.',
        },
      },
      {
        text: {
          en: 'This is the floor of the dive: below the atom there is no car left to explain.',
          ru: 'Это дно спуска: ниже атома объяснять уже нечего — машины там нет.',
          uk: 'Це дно спуску: нижче атома пояснювати вже нічого — машини там немає.',
        },
      },
    ],
    callouts: [
      {
        label: { en: 'Atomic number', ru: 'Атомный номер', uk: 'Атомний номер' },
        value: '26 (Fe)',
        source: 'iron-wikipedia',
      },
      {
        label: { en: 'Lattice', ru: 'Решётка', uk: 'Ґратка' },
        value: 'BCC, a = 0,287 нм',
        source: 'iron-wikipedia',
      },
      {
        label: { en: 'Atom diameter', ru: 'Диаметр атома', uk: 'Діаметр атома' },
        value: '≈0,25 нм',
        unverified: true,
        source: 'iron-wikipedia',
      },
    ],
    simplified: [
      {
        en: 'The atom is a nucleus with two shells, not a quantum orbital model; the scale is hugely exaggerated.',
        ru: 'Атом показан как ядро и две оболочки, а не квантовая орбитальная модель; масштаб сильно увеличен.',
        uk: 'Атом показано як ядро та дві оболонки, а не квантова орбітальна модель; масштаб сильно збільшено.',
      },
    ],
    sources: ['iron-wikipedia', 'gpu-to-atom'],
    modes: ['tour', 'explore'],
  },
];
