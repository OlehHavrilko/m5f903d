# Car → Atom

Интерактивный 3D-разбор автомобиля: одна непрерывная камера летит от машины
целиком (12 м) до атома железа внутри коленвала (~0,25 нм), а отдельными
ветками раскрываются ДВС, АКПП, подвеска и тормоза/руление.

- **Стек:** TypeScript + three.js + Vite, без фреймворков.
- **Ассеты:** ноль скачанных моделей/текстур/HDRI — вся геометрия процедурная.
- **Подача:** нейтральная белая студия-циклорама, без дороги и антуража.
- **Объект по умолчанию:** BMW M5 Sedan (F90) Competition, 2021, S63B44T4.

**Живая версия:** https://olehhavrilko.github.io/m5f903d/

## Быстрый старт

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm test           # unit-тесты без GPU
npm run format:check
```

Полезные параметры URL: `?debug` — профайлер, `?tier=low|mid|high` — ручной
тир качества, `#l=car&p=0.5&lang=en&mode=tour` — deep link на уровень.

## Деплой (GitHub Pages)

Сайт раздаётся с ветки `gh-pages` (Pages → source: branch `gh-pages`, `/`).
Публикация одной командой:

```bash
npm run deploy:pages        # build + force-push dist/ в origin/gh-pages
bash scripts/deploy-pages.sh --no-build   # если dist/ уже собран
```

Скрипт [`scripts/deploy-pages.sh`](scripts/deploy-pages.sh) собирает проект,
кладёт содержимое `dist/` во временный репозиторий и делает force-push в
`gh-pages`. Он также добавляет `.nojekyll`, чтобы GitHub Pages не прогонял
вывод Vite через Jekyll. Ветка `main` остаётся источником кода и истории.

> Workflow GitHub Actions здесь намеренно не используется: токен окружения
> имеет scopes `repo`/`gist`/`read:org` без `workflow`, поэтому пуш файлов в
> `.github/workflows/` отклоняется. Ветка `gh-pages` работает с этими scopes.

## Документация

- [`docs/M0-design-plan.md`](docs/M0-design-plan.md) — план этапа M0: концепция,
  архитектура «спина + ветки», ASCII-раскадровки, сводная таблица уровней,
  источники и открытые вопросы.
- [`docs/M1-implementation.md`](docs/M1-implementation.md) — что вошло в M1,
  бюджеты бандла и известные ограничения.
- [`docs/M2-implementation.md`](docs/M2-implementation.md) — спина целиком,
  хаб ветвей, режимы Explode/Flow, динамические чанки веток.

## Статус

- **M0** — план готов. ✅
- **M1** — ядро готово: рендерер с guard'ом WebGL, орбитальная камера,
  seam-переходы, реестр уровней, словарь `en/ru/uk`, deep-links, `?debug`,
  детерминированный таймлайн, процедурный кузов и белая циклорама. ✅
- **M2** — спина `studio → car → body → chassis-hub`, хаб ветвей, режимы
  Explode/Flow и входы во все четыре ветки (`engine.unit`, `at.unit`,
  `susp.corner`, `brake.corner`). ✅
- **M3** — ветка A (ДВС) целиком, включая микро-масштабы. Дальше.

> Внутренняя геометрия агрегатов **схематична** и не является точной копией
> OEM-деталей. Публичные ТТХ приводятся со ссылками на источники.
