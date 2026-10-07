import type { LocalizedText } from '../core/level-registry.js';

/**
 * Every number shown in the UI must trace back to an entry here.
 * Three source types are required by the spec (docs/M0-design-plan.md §7):
 * OEM technical material, professional handbooks/SAE, and independent teardowns.
 */
export type SourceType = 'oem' | 'handbook' | 'teardown' | 'reference';

export interface Source {
  readonly id: string;
  readonly type: SourceType;
  readonly title: LocalizedText;
  readonly url?: string;
  readonly note?: LocalizedText;
}

export const SOURCES: readonly Source[] = [
  {
    id: 'bmw-pressclub',
    type: 'oem',
    title: {
      en: 'BMW Group PressClub',
      ru: 'BMW Group PressClub',
      uk: 'BMW Group PressClub',
    },
    url: 'https://www.press.bmwgroup.com/',
    note: {
      en: 'Manufacturer specifications and press kits.',
      ru: 'Официальные спецификации и пресс-киты производителя.',
      uk: 'Офіційні специфікації та прес-кіти виробника.',
    },
  },
  {
    id: 'bmw-n63-wikipedia',
    type: 'reference',
    title: {
      en: 'BMW N63/S63 engine family (Wikipedia)',
      ru: 'Семейство двигателей BMW N63/S63 (Wikipedia)',
      uk: 'Родина двигунів BMW N63/S63 (Wikipedia)',
    },
    url: 'https://en.wikipedia.org/wiki/BMW_N63',
    note: {
      en: 'Bore/stroke, valvetrain and family overview; cross-checked against OEM data.',
      ru: 'Диаметр/ход, ГРМ и обзор семейства; сверяется с данными производителя.',
      uk: 'Діаметр/хід, ГРМ та огляд родини; звіряється з даними виробника.',
    },
  },
  {
    id: 'autostatistics-s63',
    type: 'reference',
    title: {
      en: 'S63B44T4 engine data (AutoStatistics)',
      ru: 'Данные двигателя S63B44T4 (AutoStatistics)',
      uk: 'Дані двигуна S63B44T4 (AutoStatistics)',
    },
    url: 'https://autostatistics.net/bmw/engines/s63b44t4',
    note: {
      en: 'Aggregated public specs; treated as unverified where it disagrees with OEM data.',
      ru: 'Сводные публичные ТТХ; считается неподтверждённым при расхождении с OEM.',
      uk: 'Зведені публічні ТТХ; вважається непідтвердженим при розбіжності з OEM.',
    },
  },
  {
    id: 'zf-8hp-catalogue',
    type: 'oem',
    title: {
      en: 'ZF 8HP product catalogue (PDF)',
      ru: 'Каталог продукции ZF 8HP (PDF)',
      uk: 'Каталог продукції ZF 8HP (PDF)',
    },
    url: 'https://www.zf.com/products/media/zfengineeringsolutions/about_us_3/downloads_9/ZES-Product-Catalogue_2024-11_EN.pdf',
    note: {
      en: 'Planetary gearset layout, ratios and mechatronic unit for the 8HP family.',
      ru: 'Схема планетарных рядов, передаточные числа и мехатроник семейства 8HP.',
      uk: 'Схема планетарних рядів, передатні числа та мехатроніка родини 8HP.',
    },
  },
  {
    id: 'turner-brakes',
    type: 'teardown',
    title: {
      en: 'Turner Motorsport — F90 M5 brake hardware',
      ru: 'Turner Motorsport — тормоза F90 M5',
      uk: 'Turner Motorsport — гальма F90 M5',
    },
    url: 'https://www.turnermotorsport.com/BMW-F90-M5/c-322-bmw-brake-rotors',
    note: {
      en: 'Independent parts listing: rotor diameters and caliper configurations.',
      ru: 'Независимый каталог деталей: диаметры дисков и конфигурации суппортов.',
      uk: 'Незалежний каталог деталей: діаметри дисків і конфігурації супортів.',
    },
  },
  {
    id: 'carbuzz-m5-2021',
    type: 'teardown',
    title: {
      en: 'CarBuzz — 2021 BMW M5 Competition',
      ru: 'CarBuzz — BMW M5 Competition 2021',
      uk: 'CarBuzz — BMW M5 Competition 2021',
    },
    url: 'https://carbuzz.com/cars/bmw/m5/2021-bmw-m5-competition-sedan-awd/',
    note: {
      en: 'Independent review; used for market-specific acceleration and mass figures.',
      ru: 'Независимый обзор; используется для рыночных цифр разгона и массы.',
      uk: 'Незалежний огляд; використовується для ринкових цифр розгону та маси.',
    },
  },
  {
    id: 'bosch-handbook',
    type: 'handbook',
    title: {
      en: 'Bosch Automotive Handbook',
      ru: 'Справочник Bosch по автомобильной технике',
      uk: 'Довідник Bosch з автомобільної техніки',
    },
    note: {
      en: 'General engineering reference for combustion, transmission, brakes and suspension fundamentals.',
      ru: 'Общий инженерный справочник по сгоранию, трансмиссии, тормозам и подвеске.',
      uk: 'Загальний інженерний довідник зі згоряння, трансмісії, гальм і підвіски.',
    },
  },
  {
    id: 'sae-papers',
    type: 'handbook',
    title: {
      en: 'SAE technical papers',
      ru: 'Технические доклады SAE',
      uk: 'Технічні доповіді SAE',
    },
    url: 'https://www.sae.org/',
    note: {
      en: 'Peer-reviewed references for combustion, NVH and hydraulic behaviour.',
      ru: 'Рецензируемые источники по сгоранию, NVH и гидравлике.',
      uk: 'Рецензовані джерела зі згоряння, NVH та гідравліки.',
    },
  },
  {
    id: 'stribeck-wikipedia',
    type: 'reference',
    title: {
      en: 'Stribeck curve (Wikipedia)',
      ru: 'Кривая Штрибека (Wikipedia)',
      uk: 'Крива Штрібека (Wikipedia)',
    },
    url: 'https://en.wikipedia.org/wiki/Stribeck_curve',
    note: {
      en: 'Lubrication regimes and the friction–speed relation behind the oil wedge.',
      ru: 'Режимы смазки и связь трения со скоростью, лежащая в основе масляного клина.',
      uk: 'Режими змащення та зв’язок тертя зі швидкістю, що лежить в основі оливного клина.',
    },
  },
  {
    id: 'iron-wikipedia',
    type: 'reference',
    title: {
      en: 'Iron (Wikipedia)',
      ru: 'Железо (Wikipedia)',
      uk: 'Залізо (Wikipedia)',
    },
    url: 'https://en.wikipedia.org/wiki/Iron',
    note: {
      en: 'Body-centred cubic lattice, lattice constant and atomic number of iron.',
      ru: 'Объёмно-центрированная кубическая решётка, постоянная решётки и атомный номер железа.',
      uk: 'Об’ємно-центрована кубічна ґратка, стала ґратки та атомний номер заліза.',
    },
  },
  {
    id: 'gpu-to-atom',
    type: 'reference',
    title: {
      en: 'GPU → Atom (reference project by the same author)',
      ru: 'GPU → Atom (эталонный проект того же автора)',
      uk: 'GPU → Atom (еталонний проєкт того ж автора)',
    },
    url: 'https://olehhavrilko.github.io/3dgpuanimation/',
    note: {
      en: 'Reference for seamless scale transitions and the honesty panel.',
      ru: 'Ориентир по бесшовным переходам масштаба и панели честности.',
      uk: 'Орієнтир щодо безшовних переходів масштабу та панелі чесності.',
    },
  },
];

const BY_ID = new Map(SOURCES.map((s) => [s.id, s]));

export function getSource(id: string): Source | undefined {
  return BY_ID.get(id);
}

export function sourceLabel(id: string, lang: 'en' | 'ru' | 'uk'): string {
  const source = BY_ID.get(id);
  if (!source) return id;
  return source.title[lang];
}

/** Throws when a level references a source id that does not exist. */
export function assertSourcesExist(ids: readonly string[]): void {
  const missing = ids.filter((id) => !BY_ID.has(id));
  if (missing.length > 0) {
    throw new Error(`Unknown source ids: ${missing.join(', ')}`);
  }
}
