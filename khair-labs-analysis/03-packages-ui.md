# 03 - packages/ui

> **Roman Urdu khulasa:** Ye package sirf design ka hai: Arcade Night ke colors (tokens), fonts, aur saari CSS. Koi component yahan nahi (components abhi `apps/web` mein hain). Sab colors tokens se aate hain, raw hex nahi.

- **Package:** `@khair/ui`, private, ESM. Source files, compiled by the app (no build step).
- **Exports:** `./fonts`, `./globals.css`, `./games.css`, `./lab-entry.css`, `./showcase.css`.
- **Dependencies:** `@fontsource/bricolage-grotesque`, `@fontsource/figtree`, `@fontsource/jetbrains-mono`.
- **Note (from STATUS/AGENTS):** components still live in `apps/web`; `packages/ui` currently holds tokens, fonts and CSS only. Adding colors/fonts/component patterns outside `packages/ui` needs human approval.

## `src/fonts.ts`
Self-hosted fonts, imported once in the root layout:
- Bricolage Grotesque 700/800 (display)
- Figtree 400/600/700/800 (body)
- JetBrains Mono 500 (mono)

## `src/globals.css` (28 KB) - the design system

Night-only token block (per D07). Key tokens:

| Token | Value | Use |
|---|---|---|
| `--font-display` | Bricolage Grotesque, system fallback | Headings |
| `--font-body` | Figtree, system fallback | Body |
| `--font-mono` | JetBrains Mono | Kickers, numbers, labels |
| `--r-card` / `--r-panel` / `--r-pill` | 20px / 14px / 999px | Radii |
| `--ease` | cubic-bezier(.16,1,.3,1) | Expo-out easing |
| `--z-nav` / `--z-overlay` / `--z-toast` | 40 / 60 / 70 | Layering |
| `--bg` | `#0E1116` | Ink background |
| `--bg2` | `#12161D` | |
| `--surface` / `--surface2` | `#171C24` / `#1E242E` | Stepped surfaces |
| `--line` | `#2A313C` | Borders |
| `--text` / `--muted` / `--faint` | `#F1F3F6` / `#A3ACB9` / `#8A94A3` | Type |
| `--accent` | `#C6F432` | Lime accent |
| `--accent-ink` / `--accent-shadow` / `--accent-soft` | `#10140A` / `#86A81C` / rgba lime | Accent variants |
| `--steam` / `--lingo` / `--cyber` / `--ai` | `#FF9F43` / `#34D399` / `#B48CFF` / `#5B9BFF` | Lab identity |
| `--ok` / `--bad` / `--gold` | `#34D399` / `#FF5A76` / `#FFC53D` | Right / wrong / stars |
| `--shadow` | `0 18px 50px rgba(3,6,12,.45)` | Elevation |

Also holds base styles (smooth scroll, overflow clip, `h2`, `.wrap`, `.sr`, `.skip`) and all product component classes (nav, footer, buttons, node path, boss card, play chrome, options, tokens, pools/buckets, slots, fog machine, compare, editor/checklist, feedback sheet, result). One known Impeccable finding: `side-tab` at `globals.css:217` (`.sentence .blank`) - waived (it is the deliberate underline fix, finding #1).

## `src/games.css` (10 KB)
Styles for the signature arcade games: game frame, HUD, HUD pills, streak, round label, timer bar, ready/start screen, timer toggle, flash, stream cards/choices/brief, roles, machine/machine-slot, steps/step/step-fix, target-card/match-meter/off-track/on-target, gates/gate/lit.

## `src/lab-entry.css` (4 KB) - D16 overlay
Ported from `docs/design/lab-entries-final.html`. **Tokens only**: `--lab` is set on the element from the lab's own token. The glow, flash and blur here are approved for this overlay only (`.design/direction.md`).
- `.lab-entry` fixed overlay, `z-index: var(--z-overlay)`, background `--bg`, 150 ms opacity transition.
- `data-phase="cover"` failsafe: removes itself after 8 s if scripts never run.
- `html.lab-entry-lock { overflow: hidden }` - scroll lock.
- `.lab-entry__canvas` fade, `.is-dim`, `.is-glitch` (Cyber glitch keyframes).
- `.lab-entry__flash` radial gradient with `mix-blend-mode: screen`.
- `.lab-entry__name` (display 800, clamp 40-96px, lab glow), `.mono` variant for Cyber, `.on` pop animation `cubic-bezier(.2,.9,.25,1.2)` (the approved overshoot, waived in `.impeccable/config.json`), `.lab-entry__sub` rise, `.lab-entry__badge`.
- `.lab-entry__skip`: 44px min-height, blurred pill.
- `.preview-grid` for `/labs/entry-preview`.
- `@media (prefers-reduced-motion: reduce)` disables all animations.

## `src/showcase.css` (0.9 KB) - D17
Temporary showcase labs. The world page reuses the AI Lab world page classes; only the lab colour and "Preview" label are new: `.w-ic[data-lab=...]` per-lab background + hard shadow via `color-mix`, `.preview-chip`, `.preview-note`, `.wv-xp`. Tokens only (no raw hex).

## Design contract summary (`docs/design/DESIGN.md`)
- Theme set by `data-kl` on `<html>`; Night only now (D07). Day tokens remain unused in the source.
- Type: display Bricolage Grotesque 700/800, body Figtree, mono JetBrains Mono 500.
- Shape/motion: tactile press (hard bottom shadow, drop 3px on `:active`), `--ease`, all motion under 500 ms, static under reduced motion; right `--ok`, wrong `--bad` + shake, stars/cleared `--gold`.
- Rules: every level is a game; ≤1 quiz per level; timed games offer a no-timer option and pause when hidden; help fades by zone; no em-dashes; touch ≥44px; no nested interactive elements.
