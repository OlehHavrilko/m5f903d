#!/usr/bin/env bash
#
# Publish the production build (dist/) to the `gh-pages` branch of origin,
# which GitHub Pages serves as a static site.
#
# Why a branch and not a GitHub Actions workflow: the CI token used in this
# workspace has only `repo`/`gist`/`read:org` scopes, so it cannot push files
# under .github/workflows/. A gh-pages branch works with the scopes we have.
#
# Usage:  npm run deploy:pages        (builds first, then publishes)
#         scripts/deploy-pages.sh --no-build
#
set -euo pipefail

BRANCH="gh-pages"
ROOT="$(git rev-parse --show-toplevel)"
DIST="$ROOT/dist"
DO_BUILD=1

for arg in "$@"; do
  case "$arg" in
    --no-build) DO_BUILD=0 ;;
    -h|--help)
      sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 2
      ;;
  esac
done

cd "$ROOT"

if [ "$DO_BUILD" -eq 1 ]; then
  echo "==> Building production bundle"
  npm run build
fi

if [ ! -f "$DIST/index.html" ]; then
  echo "Refusing to deploy: $DIST/index.html is missing. Run 'npm run build' first." >&2
  exit 1
fi

ORIGIN_URL="$(git remote get-url origin)"
REV="$(git rev-parse --short HEAD)"
STAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# The throwaway repo used for the gh-pages push needs an identity. Prefer the
# one configured for this repository, then the global one, then a fallback so a
# fresh clone still deploys.
GIT_NAME="$(git config --get user.name || true)"
GIT_EMAIL="$(git config --get user.email || true)"
GIT_NAME="${GIT_NAME:-github-pages}"
GIT_EMAIL="${GIT_EMAIL:-github-pages@users.noreply.github.com}"

# GitHub Pages would otherwise run Jekyll over the output; .nojekyll keeps the
# tree byte-for-byte what Vite emitted.
touch "$DIST/.nojekyll"

WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

echo "==> Staging dist/ for the $BRANCH branch"
cp -R "$DIST/." "$WORK/"

cd "$WORK"
git init -q
git checkout -q -b "$BRANCH"
git add -A
git -c commit.gpgsign=false -c user.name="$GIT_NAME" -c user.email="$GIT_EMAIL" \
  commit -q -m "deploy: $REV ($STAMP)"
git remote add origin "$ORIGIN_URL"

echo "==> Pushing to $ORIGIN_URL ($BRANCH)"
git push -f origin "$BRANCH"

echo
echo "Published. GitHub Pages URL:"
echo "  https://olehhavrilko.github.io/m5f903d/"
