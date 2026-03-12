#!/usr/bin/env bash
set -euo pipefail

# Refactor black-box checks for REFAC-01.
# Goal: verify architectural invariants mechanically so implementers don't have
# to re-check flows by hand after each refactor step.
#
# This script is intentionally "structural-first" (rg/grep) and offline.
# Optional: set E2E=1 to run Playwright (requires browser binaries).

cd "$(dirname "$0")/.."

need_cmd() {
  local cmd="$1"
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "ERROR: missing required command: $cmd" >&2
    exit 2
  }
}

need_cmd rg

fail() {
  local title="$1"
  local hint="$2"
  echo "FAIL: ${title}" >&2
  echo "Hint: ${hint}" >&2
  exit 2
}

PHASE="${PHASE:-3}"
case "$PHASE" in
  1|2|3) ;;
  *) fail "invalid-phase" "Set PHASE=1, PHASE=2, or PHASE=3." ;;
esac

echo "[blackbox] structural invariants (PHASE=${PHASE})"

# Invariant: localForage usage is contained in the storage adapter.
if rg -n --hidden --glob '!**/node_modules/**' --glob '!**/dist/**' \
  "localforage" src | rg -v "^src/storage/" >/dev/null; then
  rg -n --hidden --glob '!**/node_modules/**' --glob '!**/dist/**' \
    "localforage" src | rg -v "^src/storage/" || true
  fail "localforage-leak" "Import localforage only from src/storage/**; expose typed storage APIs instead."
fi

if [ "$PHASE" -ge 1 ]; then
  # Phase 1: high-signal seams only (Pareto).
  # - SiegePage tactic payload must not use any.
  if rg -n --hidden --glob '!**/node_modules/**' --glob '!**/dist/**' \
    "useState<any>|:\\s*any\\b" src/pages/siege/SiegePage.tsx >/dev/null; then
    rg -n --hidden --glob '!**/node_modules/**' --glob '!**/dist/**' \
      "useState<any>|:\\s*any\\b" src/pages/siege/SiegePage.tsx || true
    fail "siege-page-any" "Replace tacticData/executeTactic any with a typed discriminated union aligned to ApplyTacticPayloadSchema."
  fi

  # - side-effect persistence should not cast move types (T2).
  if rg -n "moveType\\s*:\\s*.*\\bas any\\b" src/shared/services/domainService.ts >/dev/null; then
    rg -n "moveType\\s*:\\s*.*\\bas any\\b" src/shared/services/domainService.ts || true
    fail "moveType-as-any" "Make SideEffect.create_daily_move.moveType strongly typed end-to-end."
  fi
fi

if [ "$PHASE" -ge 2 ]; then
  # Phase 2: start migrating pages to feature layer (prove the pattern).
  # Gate only the specific page mandated by T6 so the refactor can proceed incrementally.
  if rg -n --hidden --glob '!**/node_modules/**' --glob '!**/dist/**' \
    "from\\s+['\"][^'\"]*storage/repositories['\"]|storage/repositories" \
    src/pages/province/ProvinceDetailsPage.tsx >/dev/null; then
    rg -n --hidden --glob '!**/node_modules/**' --glob '!**/dist/**' \
      "from\\s+['\"][^'\"]*storage/repositories['\"]|storage/repositories" \
      src/pages/province/ProvinceDetailsPage.tsx || true
    fail "province-details-import-repositories" "Migrate ProvinceDetailsPage orchestration into src/features/** (T6)."
  fi
fi

if [ "$PHASE" -ge 3 ]; then
  # Phase 3: end-state invariants.
  # - pages are composition-only; they must not orchestrate persistence.
  if rg -n --hidden --glob '!**/node_modules/**' --glob '!**/dist/**' \
    "from\\s+['\"][^'\"]*storage/repositories['\"]|storage/repositories" \
    src/pages >/dev/null; then
    rg -n --hidden --glob '!**/node_modules/**' --glob '!**/dist/**' \
      "from\\s+['\"][^'\"]*storage/repositories['\"]|storage/repositories" \
      src/pages || true
    fail "pages-import-repositories" "Move orchestration into src/features/** and keep pages as composition-only."
  fi

  # - domain/features/storage are typed; no explicit-any escape hatches (tests excluded).
  if rg -n --hidden --glob '!**/*.test.ts' --glob '!**/*.test.tsx' \
    "\\bas any\\b|:\\s*any\\b|useState<any>|any\\[]|@typescript-eslint/no-explicit-any" \
    src/game src/features src/storage >/dev/null; then
    rg -n --hidden --glob '!**/*.test.ts' --glob '!**/*.test.tsx' \
      "\\bas any\\b|:\\s*any\\b|useState<any>|any\\[]|@typescript-eslint/no-explicit-any" \
      src/game src/features src/storage || true
    fail "typed-boundaries-any" "Replace 'any' with concrete types, or use 'unknown' + validation at boundaries."
  fi
fi

echo "[blackbox] optional e2e"
if [ "${E2E:-0}" = "1" ]; then
  if [ -f package.json ]; then
    if command -v npm >/dev/null 2>&1; then
      npm run -s e2e --if-present
    else
      fail "npm-missing" "Install Node/npm or run the checks in CI."
    fi
  else
    echo "NOTE: no package.json; skipping e2e."
  fi
else
  echo "NOTE: E2E=0; skipping Playwright. Run 'E2E=1 make blackbox' when available."
fi

echo "OK: refac blackbox checks"
