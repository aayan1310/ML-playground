# 09 - Risks, gaps, deviations & next steps

> **Roman Urdu khulasa:** Ye file batati hai ke abhi kya kya kamzor ya baqi hai: kuch risks hain (PIN, client-reported stars), kuch "must-do" beta se pehle, aur agla kaam Phase 3 hai (frontend ko backend se jorna).

## Current state (from `docs/STATUS.md`, 2026-10-09/12)
- **Done/merged:** Phases 0, 1, 2; the design work; the on-device AI helper; the lab entry animations.
- **Built locally, not pushed, no PR, CI not run:** the temporary showcase labs (`showcase-labs`) and the nav/Labs-menu + always-play entry (`nav-menu-intros`, stacked on `showcase-labs`).
- **Phase 3 (frontend wired to the backend) has not started.**

## Open decision
- **D14 - bundle a model in the desktop installer:** still **OPEN** (decide before Phase 8). Options: ship SmolLM2 135M / Qwen2.5 0.5B inside the installer (300-600 MB) or download on first use.

## Must-do before beta launch (blocking)
1. **Teacher signup invite code** (Phase 3, Tier 2): `POST /auth/teacher/signup` needs an `invite_code` compared in constant time to `TEACHER_INVITE_CODE`; empty in production = signup closed. Add tests, regenerate `packages/api`, add the field to the signup screen.
2. **Teacher password recovery by email** (Phase 4, Tier 2): request reset (always same answer) + confirm with a single-use expiring hashed token; ends all sessions; rate limited; no student data in email.
3. **Production starts only with `REDIS_URL`** - already enforced by settings in Phase 2.

## Accepted beta risks (from the security review)
- **4-digit PINs + lockout abuse:** weak by nature; ~480 tries/day/student; a nuisance lockout is possible for anyone with the class code. A teacher can reset. Revisit if the pilot shows abuse.
- **Client-reported stars:** the server checks level/boss/answer count/time window and recomputes XP, but cannot prove play. Do not add leaderboards/certificates/rewards without revisiting.
- **Class/nickname existence is visible** (`class_not_found`, `locked`, `nickname_taken`); protected by rate limits only.

## Known gaps / limitations
- **Unlock order is not enforced on the server** (the client has `NEXT_PUBLIC_UNLOCK_ALL`). Can be added with `rules.is_unlocked`.
- **Desktop cookies not verified** (`Secure` cookies over `http://127.0.0.1:43117`) - Phase 5 done-check.
- **HSTS subdomains/preload off** until the domain is final (`check --deploy` warns about both).
- **Nickname profanity filter is a small starter list** - needs pilot-teacher feedback.
- **No audit log** of teacher actions (reset PIN, delete class).
- **Swagger docs public** at `/api/v1/docs/` (API shape only).
- **No recovery path for a forgotten teacher password** and no Django admin.
- **Guest import XP assumes all items were answered correctly** on a cleared level (guest data has no per-run counts).
- **AI helper:** Chrome often does not grant persistent storage to a new profile, so a very low-disk computer may delete the model (the helper then resumes). The CPU engine is single-threaded (page not cross-origin isolated). Gemini Nano tested with a stand-in only.
- **Lab entry:** the first frame of each run takes 50-100 ms to build the scene (one dropped frame); STEAM Orbit props are small on portrait phones.
- **Landing:** the landing page has its own copy of three.js inside (approved hero logo); Arabic/Urdu use fallback fonts.
- **Prompt Park first-load JS grew by 1 kB** (116 to 117 kB) because the showcase store shares the progress module.

## Deviations from the plan (documented)
- API field names are `snake_case` (plan did not say).
- Added `GET /auth/csrf` (needed so anonymous login can be CSRF-protected).
- No production Docker image and no `docker compose --profile full` yet (Phase 4).
- No Django admin (smaller attack surface).
- Production now refuses to start without `REDIS_URL`.

## Housekeeping for a human (from STATUS)
- Check `docs/product/SHOWCASE_QUESTIONS.md` (owner review before students see it).
- Push `showcase-labs`, open the PR, confirm CI is green; then merge `nav-menu-intros` after it.
- Old branches kept, not deleted: `landing-page` (superseded React landing) and `stash@{0}` (Coral theme copy). Delete when agreed.
- The empty `khair-app/` folder was removed (Phase 1 note resolved).
- Not run anywhere yet: GitHub CI, anything on Supabase, any Electron test, load test.

## Next steps
1. **Human:** review the showcase questions; push `showcase-labs`; open the PR; confirm CI green.
2. **When the real worlds exist:** build them in `packages/core/src/content/`, add to `WORLDS`, then remove `packages/core/src/showcase/` and `kl-showcase` (see D17).
3. **Phase 3 (frontend wired to the backend):** Next rewrite of `/api/*` to Django; outbox + background flush; account screens (join, student sign-in, teacher sign-up/sign-in, profile, teacher dashboard); guest import prompt; teacher invite code (must-do); full state matrix per screen; Playwright e2e (guest plays -> joins class -> appears in dashboard; offline run syncs). Showcase runs must **never** be synced. Start in a new session.

## Suggested reading order for a new engineer
1. `README.md` (repo root) and this folder's `README.md`.
2. `00-overview-architecture.md` (this analysis).
3. `docs/KHAIR_LABS_BUILD_PLAN.md` + `docs/STATUS.md`.
4. `AGENTS.md` (rules of the road).
5. Your module file: web -> `01`, core -> `02`, backend -> `05`, tooling -> `06`/`07`.
