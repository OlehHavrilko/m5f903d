import './hud.css';
import type { LevelRegistry, LevelSpec } from '../core/level-registry.js';
import { levelModes, type BackgroundMode, type ViewMode } from '../core/modes.js';
import { LANG_NAMES, t, type UIKey } from '../content/i18n/index.js';
import { BRANCHES, getBranch } from '../content/branches.js';
import { SOURCES, getSource } from '../content/sources.js';
import { formatScaleLabel, type Lang } from '../core/units.js';

export type AppMode = ViewMode;

export interface HudCallbacks {
  onNext(): void;
  onPrev(): void;
  onReset(): void;
  onLanguage(lang: Lang): void;
  onMode(mode: AppMode): void;
  /** Navigates to a level id (branch entry, hub or spine level). */
  onGoto(levelId: string): void;
  onBackground(mode: BackgroundMode): void;
  onFloor(visible: boolean): void;
  onGuide(): void;
  onDismissIntro(): void;
}

const MODES: Array<{ id: AppMode; key: UIKey }> = [
  { id: 'tour', key: 'ui.mode.tour' },
  { id: 'explore', key: 'ui.mode.explore' },
  { id: 'cutaway', key: 'ui.mode.cutaway' },
  { id: 'explode', key: 'ui.mode.explode' },
  { id: 'flow', key: 'ui.mode.flow' },
  { id: 'slowmo', key: 'ui.mode.slowmo' },
  { id: 'compare', key: 'ui.mode.compare' },
  { id: 'dyno', key: 'ui.mode.dyno' },
];

const BACKGROUNDS: Array<{ id: BackgroundMode; key: UIKey }> = [
  { id: 'white', key: 'ui.bg.white' },
  { id: 'gray', key: 'ui.bg.gray' },
  { id: 'black', key: 'ui.bg.black' },
];

/** Scale ruler anchors, in metres (docs/M0-design-plan.md §9). */
const ANCHORS: Array<{ key: UIKey; meters: number }> = [
  { key: 'ui.anchor.car', meters: 5 },
  { key: 'ui.anchor.wheel', meters: 0.7 },
  { key: 'ui.anchor.hand', meters: 0.09 },
  { key: 'ui.anchor.coin', meters: 0.024 },
  { key: 'ui.anchor.tooth', meters: 0.005 },
  { key: 'ui.anchor.hair', meters: 7e-5 },
  { key: 'ui.anchor.cell', meters: 8e-6 },
  { key: 'ui.anchor.film', meters: 1e-6 },
  { key: 'ui.anchor.atom', meters: 2.5e-10 },
];

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label: string, className?: string): HTMLButtonElement {
  const b = element('button', className);
  b.type = 'button';
  b.textContent = label;
  return b;
}

/**
 * Mobile-first HUD. All strings come from the i18n dictionary and every number
 * from the level spec; the HUD never invents copy. Mode availability is driven
 * by the level itself, and the branch menu is generated from `content/branches`.
 */
export class Hud {
  #root: HTMLElement;
  #callbacks: HudCallbacks;
  #registry: LevelRegistry;
  #lang: Lang;
  #mode: AppMode = 'tour';
  #background: BackgroundMode = 'white';
  #floorVisible = true;

  #brandTitle: HTMLElement;
  #brandTag: HTMLElement;
  #langGroup: HTMLElement;
  #crumbs: HTMLElement;
  #levelTitle: HTMLElement;
  #levelSubtitle: HTMLElement;
  #levelSubject: HTMLElement;
  #levelScale: HTMLElement;
  #progress: HTMLElement;
  #ruler: HTMLElement;
  #modeGroup: HTMLElement;
  #modeButtons = new Map<AppMode, HTMLButtonElement>();
  #bgGroup: HTMLElement;
  #bgButtons = new Map<BackgroundMode, HTMLButtonElement>();
  #floorButton: HTMLButtonElement;
  #branches: HTMLElement;
  #branchTitle: HTMLElement;
  #branchHint: HTMLElement;
  #branchList: HTMLElement;
  #honesty: HTMLElement;
  #intro: HTMLElement;
  #sr: HTMLElement;
  #prev: HTMLButtonElement;
  #next: HTMLButtonElement;
  #current: LevelSpec | null = null;
  #currentProgress = 0;

  constructor(
    container: HTMLElement,
    options: { lang: Lang; registry: LevelRegistry; callbacks: HudCallbacks },
  ) {
    this.#registry = options.registry;
    this.#callbacks = options.callbacks;
    this.#lang = options.lang;

    this.#root = element('div', 'c2a-hud');
    this.#root.setAttribute('role', 'group');
    this.#root.setAttribute('aria-label', t('app.title', this.#lang));

    // --- Top bar -----------------------------------------------------------
    const top = element('div', 'c2a-top');
    const brand = element('div', 'c2a-brand');
    this.#brandTitle = element('strong', undefined, t('app.title', this.#lang));
    this.#brandTag = element('span', undefined, t('app.tagline', this.#lang));
    brand.append(this.#brandTitle, this.#brandTag);

    const topRight = element('div', 'c2a-topright');
    this.#langGroup = element('div', 'c2a-group');
    this.#langGroup.setAttribute('role', 'group');
    this.#langGroup.setAttribute('aria-label', t('ui.language', this.#lang));

    this.#bgGroup = element('div', 'c2a-group');
    this.#bgGroup.setAttribute('role', 'group');
    this.#bgGroup.setAttribute('aria-label', t('ui.background', this.#lang));
    for (const background of BACKGROUNDS) {
      const b = button(t(background.key, this.#lang), 'c2a-swatch');
      b.dataset['bg'] = background.id;
      b.setAttribute('aria-pressed', String(background.id === this.#background));
      b.addEventListener('click', () => {
        this.setBackground(background.id);
        this.#callbacks.onBackground(background.id);
      });
      this.#bgButtons.set(background.id, b);
      this.#bgGroup.append(b);
    }
    this.#floorButton = button(t('ui.bg.floor', this.#lang));
    this.#floorButton.setAttribute('aria-pressed', String(this.#floorVisible));
    this.#floorButton.addEventListener('click', () => {
      this.setFloor(!this.#floorVisible);
      this.#callbacks.onFloor(this.#floorVisible);
    });
    this.#bgGroup.append(this.#floorButton);

    topRight.append(this.#bgGroup, this.#langGroup);
    top.append(brand, topRight);

    // --- Breadcrumb --------------------------------------------------------
    this.#crumbs = element('nav', 'c2a-crumbs');
    this.#crumbs.setAttribute('aria-label', t('ui.scaleRuler', this.#lang));

    // --- Bottom bar --------------------------------------------------------
    const bottom = element('div', 'c2a-bottom');

    const controls = element('div', 'c2a-group');
    this.#prev = button('‹', undefined);
    this.#prev.addEventListener('click', () => this.#callbacks.onPrev());
    this.#next = button('›', undefined);
    this.#next.addEventListener('click', () => this.#callbacks.onNext());
    const reset = button('⟲', undefined);
    reset.addEventListener('click', () => this.#callbacks.onReset());
    controls.append(this.#prev, this.#next, reset);

    this.#modeGroup = element('div', 'c2a-group c2a-modes');
    this.#modeGroup.setAttribute('role', 'group');
    this.#modeGroup.setAttribute('aria-label', t('ui.mode.tour', this.#lang));
    for (const mode of MODES) {
      const b = button(t(mode.key, this.#lang));
      b.dataset['mode'] = mode.id;
      b.addEventListener('click', () => {
        if (b.disabled) return;
        this.setMode(mode.id);
        this.#callbacks.onMode(mode.id);
      });
      this.#modeButtons.set(mode.id, b);
      this.#modeGroup.append(b);
    }

    const honestyButton = button(t('ui.honesty.title', this.#lang));
    honestyButton.addEventListener('click', () => this.toggleHonesty());

    const guideButton = element('a', 'c2a-link', t('intro.guide', this.#lang));
    guideButton.setAttribute('href', './guide/index.html');
    guideButton.addEventListener('click', () => this.#callbacks.onGuide());

    bottom.append(controls, this.#modeGroup, honestyButton, guideButton);

    // --- Level card + progress + ruler ------------------------------------
    const card = element('div', 'c2a-level-card');
    this.#levelTitle = element('h2');
    this.#levelSubtitle = element('p');
    this.#levelSubject = element('p');
    card.append(this.#levelTitle, this.#levelSubtitle, this.#levelSubject);
    this.#levelScale = element('div', 'c2a-scale');

    const progress = element('div', 'c2a-progress');
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', '100');
    this.#progress = element('i');
    progress.append(this.#progress);

    this.#ruler = element('div', 'c2a-ruler');

    const middle = element('div', 'c2a-middle');
    middle.append(card, this.#levelScale, progress, bottom, this.#ruler);

    // --- Branch menu (shown on the hub level) ------------------------------
    this.#branches = element('section', 'c2a-branches');
    this.#branchTitle = element('h3');
    this.#branchHint = element('p', 'c2a-branch-hint');
    this.#branchList = element('div', 'c2a-branch-list');
    this.#branches.append(this.#branchTitle, this.#branchHint, this.#branchList);
    this.#branches.hidden = true;

    // --- Honesty panel -----------------------------------------------------
    this.#honesty = element('aside', 'c2a-panel');
    this.#honesty.hidden = true;
    this.#honesty.setAttribute('aria-label', t('ui.honesty.title', this.#lang));

    // --- Intro card --------------------------------------------------------
    this.#intro = element('div', 'c2a-intro');
    const introCard = element('div', 'c2a-intro-card');
    const introTitle = element('h1', undefined, t('intro.title', this.#lang));
    const introBody = element('p', undefined, t('intro.body', this.#lang));
    const introActions = element('div', 'c2a-intro-actions');
    const start = button(t('intro.start', this.#lang));
    start.addEventListener('click', () => this.hideIntro());
    const guide = element('a', 'c2a-link', t('intro.guide', this.#lang));
    guide.setAttribute('href', './guide/index.html');
    introActions.append(start, guide);
    introCard.append(introTitle, introBody, introActions);
    this.#intro.append(introCard);

    // --- Live region -------------------------------------------------------
    this.#sr = element('div', 'c2a-sr');
    this.#sr.setAttribute('role', 'status');
    this.#sr.setAttribute('aria-live', 'polite');

    this.#root.append(
      top,
      this.#crumbs,
      this.#branches,
      middle,
      this.#honesty,
      this.#intro,
      this.#sr,
    );
    container.append(this.#root);

    this.#renderLanguageButtons();
    this.#renderModeLabels();
    this.#renderRuler();
    this.#renderHonestyContent();
    this.updateNavigation();
  }

  get lang(): Lang {
    return this.#lang;
  }

  get mode(): AppMode {
    return this.#mode;
  }

  get background(): BackgroundMode {
    return this.#background;
  }

  get floorVisible(): boolean {
    return this.#floorVisible;
  }

  #renderLanguageButtons(): void {
    this.#langGroup.replaceChildren();
    for (const lang of ['en', 'ru', 'uk'] as const) {
      const b = button(LANG_NAMES[lang][lang].slice(0, 2).toUpperCase());
      b.setAttribute('aria-label', LANG_NAMES[lang][this.#lang]);
      b.setAttribute('aria-pressed', String(lang === this.#lang));
      b.addEventListener('click', () => this.#callbacks.onLanguage(lang));
      this.#langGroup.append(b);
    }
  }

  #renderModeLabels(): void {
    for (const mode of MODES) {
      this.#modeButtons.get(mode.id)!.textContent = t(mode.key, this.#lang);
    }
  }

  #renderModes(): void {
    for (const [id, b] of this.#modeButtons) {
      b.setAttribute('aria-pressed', String(id === this.#mode));
    }
  }

  /** Shows only the modes the current level advertises. */
  #applyModeAvailability(level: LevelSpec): void {
    const available = new Set(levelModes(level.modes));
    for (const [id, b] of this.#modeButtons) {
      const on = available.has(id);
      // Hiding keeps the bottom bar short enough for a 320 px phone while
      // every visible control keeps its 44 px tap target.
      b.hidden = !on;
      b.disabled = !on;
      b.setAttribute('aria-disabled', String(!on));
    }
    if (!available.has(this.#mode)) {
      this.setMode('tour');
      this.#callbacks.onMode('tour');
    } else {
      this.#renderModes();
    }
  }

  #renderRuler(): void {
    this.#ruler.replaceChildren();
    const label = element('span', undefined, `${t('ui.scaleRuler', this.#lang)}:`);
    const list = element('ol');
    for (const anchor of ANCHORS) {
      const li = element('li', undefined, t(anchor.key, this.#lang));
      li.dataset['meters'] = String(anchor.meters);
      list.append(li);
    }
    this.#ruler.append(label, list);
  }

  setLanguage(lang: Lang): void {
    this.#lang = lang;
    this.#brandTitle.textContent = t('app.title', lang);
    this.#brandTag.textContent = t('app.tagline', lang);
    this.#langGroup.setAttribute('aria-label', t('ui.language', lang));
    this.#bgGroup.setAttribute('aria-label', t('ui.background', lang));
    this.#floorButton.textContent = t('ui.bg.floor', lang);
    this.#renderLanguageButtons();
    this.#renderModeLabels();
    this.#renderRuler();
    if (this.#current) this.render(this.#current, this.#currentProgress);
    this.#renderHonestyContent();
  }

  /** Re-renders the level card, breadcrumb, ruler highlight and progress. */
  render(level: LevelSpec, progress: number): void {
    this.#current = level;
    this.#currentProgress = progress;
    const lang = this.#lang;

    this.#levelTitle.textContent = level.title[lang];
    this.#levelSubtitle.textContent = level.subtitle?.[lang] ?? '';
    this.#levelSubject.textContent = level.subject[lang];
    this.#levelScale.textContent = `${t('ui.scale', lang)}: ${formatScaleLabel(level.scale.unitMeters, lang)}`;

    this.#renderCrumbs(level);
    this.#renderBranches(level);
    this.#applyModeAvailability(level);

    this.#progress.style.width = `${Math.round(progress * 100)}%`;
    (this.#progress.parentElement as HTMLElement).setAttribute(
      'aria-valuenow',
      String(Math.round(progress * 100)),
    );

    // Highlight the nearest scale anchor.
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    ANCHORS.forEach((anchor, index) => {
      const distance = Math.abs(Math.log10(anchor.meters) - Math.log10(level.scale.unitMeters));
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    const items = this.#ruler.querySelectorAll('li');
    items.forEach((li, index) => li.setAttribute('data-active', String(index === bestIndex)));

    this.#renderHonestyContent();
    this.updateNavigation();

    this.announce(
      t('a11y.levelChanged', lang, {
        title: level.title[lang],
        scale: formatScaleLabel(level.scale.unitMeters, lang),
      }),
    );
  }

  #renderCrumbs(level: LevelSpec): void {
    this.#crumbs.replaceChildren();
    const parts: Array<{ id: string; label: string }> = [];
    if (level.branch !== 'spine') {
      const hub = this.#registry.get('chassis-hub');
      if (hub) parts.push({ id: hub.id, label: hub.title[this.#lang] });
      const branch = getBranch(level.branch);
      if (branch) parts.push({ id: branch.entry, label: branch.title[this.#lang] });
      for (const item of this.#registry.branch(level.branch)) {
        if (item.order > 0 && item.order <= level.order) {
          parts.push({ id: item.id, label: item.title[this.#lang] });
        }
      }
    } else {
      for (const item of this.#registry.branch(level.branch)) {
        if (item.order <= level.order) parts.push({ id: item.id, label: item.title[this.#lang] });
      }
    }

    parts.forEach((part, index) => {
      if (index > 0) this.#crumbs.append(element('span', 'c2a-crumb-sep', '▸'));
      const crumb = button(part.label, 'c2a-crumb');
      if (part.id === level.id) {
        crumb.setAttribute('aria-current', 'true');
      } else {
        crumb.addEventListener('click', () => this.#callbacks.onGoto(part.id));
      }
      this.#crumbs.append(crumb);
    });
  }

  #renderBranches(level: LevelSpec): void {
    const show = level.hub === true;
    this.#branches.hidden = !show;
    if (!show) return;

    this.#branchTitle.textContent = t('ui.branches.title', this.#lang);
    this.#branchHint.textContent = t('ui.branches.hint', this.#lang);
    this.#branchList.replaceChildren();

    for (const branch of BRANCHES) {
      const card = element('button', 'c2a-branch');
      card.type = 'button';
      const accent = `#${branch.accent.toString(16).padStart(6, '0')}`;
      card.style.setProperty('--branch-accent', accent);
      card.append(
        element('strong', 'c2a-branch-title', branch.title[this.#lang]),
        element('span', 'c2a-branch-summary', branch.summary[this.#lang]),
        element('span', 'c2a-branch-range', branch.scaleRange[this.#lang]),
      );
      if (!branch.ready) {
        card.disabled = true;
        card.setAttribute('aria-disabled', 'true');
        card.append(element('span', 'c2a-badge', t('ui.branches.soon', this.#lang)));
      } else {
        card.addEventListener('click', () => {
          this.announce(t('a11y.branchChosen', this.#lang, { branch: branch.title[this.#lang] }));
          this.#callbacks.onGoto(branch.entry);
        });
      }
      this.#branchList.append(card);
    }
  }

  updateNavigation(): void {
    const current = this.#current;
    const prev = current ? this.#registry.neighbour(current.id, -1) : undefined;
    const next = current ? this.#registry.neighbour(current.id, 1) : undefined;
    this.#prev.disabled = !prev;
    this.#next.disabled = !next;
    this.#prev.setAttribute(
      'aria-label',
      prev ? `${t('ui.prev', this.#lang)}: ${prev.title[this.#lang]}` : t('ui.prev', this.#lang),
    );
    this.#next.setAttribute(
      'aria-label',
      next ? `${t('ui.next', this.#lang)}: ${next.title[this.#lang]}` : t('ui.next', this.#lang),
    );
  }

  setMode(mode: AppMode): void {
    if (this.#mode !== mode) {
      this.#mode = mode;
      this.announce(
        t('a11y.modeChanged', this.#lang, { mode: t(`ui.mode.${mode}` as UIKey, this.#lang) }),
      );
    }
    this.#renderModes();
  }

  setBackground(mode: BackgroundMode): void {
    this.#background = mode;
    for (const [id, b] of this.#bgButtons) {
      b.setAttribute('aria-pressed', String(id === mode));
    }
  }

  setFloor(visible: boolean): void {
    this.#floorVisible = visible;
    this.#floorButton.setAttribute('aria-pressed', String(visible));
  }

  #renderHonestyContent(): void {
    const level = this.#current;
    if (!level) return;
    const lang = this.#lang;
    const panel = this.#honesty;
    panel.replaceChildren();

    const close = button(t('ui.honesty.close', lang), 'c2a-close');
    close.addEventListener('click', () => this.toggleHonesty(false));

    const heading = element('h2', undefined, t('ui.honesty.title', lang));

    const numbersHeading = element('h3', undefined, t('ui.callouts', lang));
    const numbers = element('ul');
    for (const callout of level.callouts) {
      const li = element('li');
      li.append(`${callout.label[lang]}: ${callout.value}`);
      if (callout.unverified) {
        const badge = element('span', 'c2a-badge', t('ui.honesty.unverified', lang));
        li.append(badge);
      }
      if (callout.source) {
        const src = getSource(callout.source);
        const ref = element(
          'span',
          'c2a-source',
          src ? ` — ${src.title[lang]}` : ` — ${callout.source}`,
        );
        li.append(ref);
      }
      numbers.append(li);
    }

    const factsHeading = element('h3', undefined, t('ui.facts', lang));
    const facts = element('ul');
    for (const fact of level.facts) {
      const li = element('li', undefined, fact.text[lang]);
      if (fact.unverified)
        li.append(element('span', 'c2a-badge', t('ui.honesty.unverified', lang)));
      facts.append(li);
    }

    const schematicHeading = element('h3', undefined, t('ui.honesty.schematic', lang));
    const schematic = element('ul');
    for (const item of level.simplified) schematic.append(element('li', undefined, item[lang]));

    const sourcesHeading = element('h3', undefined, t('ui.honesty.sources', lang));
    const sources = element('ul');
    for (const id of level.sources) {
      const source = getSource(id);
      const li = element('li');
      if (source?.url) {
        const a = element('a', 'c2a-link', source.title[lang]);
        a.setAttribute('href', source.url);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        li.append(a);
      } else {
        li.append(source ? source.title[lang] : id);
      }
      if (source?.note) li.append(element('span', 'c2a-source', ` — ${source.note[lang]}`));
      sources.append(li);
    }

    const disclaimer = element('h3', undefined, t('ui.honesty.disclaimerTitle', lang));
    const disclaimerText = element('p', 'c2a-source', t('ui.honesty.disclaimer', lang));

    panel.append(
      close,
      heading,
      numbersHeading,
      numbers,
      factsHeading,
      facts,
      schematicHeading,
      schematic,
      sourcesHeading,
      sources,
      disclaimer,
      disclaimerText,
    );
    panel.dataset['sourcesTotal'] = String(SOURCES.length);
  }

  toggleHonesty(force?: boolean): void {
    const next = force ?? this.#honesty.hidden;
    this.#honesty.hidden = !next;
    if (next) {
      this.announce(t('a11y.honestyOpen', this.#lang));
      (this.#honesty.querySelector('button') as HTMLButtonElement | null)?.focus();
    }
  }

  get honestyOpen(): boolean {
    return !this.#honesty.hidden;
  }

  hideIntro(): void {
    this.#intro.hidden = true;
    this.#callbacks.onDismissIntro();
  }

  get introVisible(): boolean {
    return !this.#intro.hidden;
  }

  showIntro(): void {
    this.#intro.hidden = false;
  }

  announce(message: string): void {
    this.#sr.textContent = '';
    // A microtask delay guarantees screen readers see a change even for repeats.
    queueMicrotask(() => {
      this.#sr.textContent = message;
    });
  }

  setProgress(progress: number): void {
    this.#currentProgress = progress;
    this.#progress.style.width = `${Math.round(progress * 100)}%`;
  }

  destroy(): void {
    this.#root.remove();
  }
}
