# 05 - backend (Django + DRF)

> **Roman Urdu khulasa:** Ye backend accounts, classes, progress sync, XP/badges/streak sambhalta hai. Level content yahan nahi; ye sirf `catalog.json` parh kar checks karta hai. Client jo XP bhejta hai us par bharosa nahi; server rules.py (rules.ts ka mirror) se dobara calculate karta hai. Auth session cookies + CSRF hai.

- **Project:** `khair-backend` v0.1.0, Python `>=3.12,<3.13`.
- **Runtime deps:** Django >=5.2,<5.3 (locked 5.2.18), DRF (3.18.1), drf-spectacular (0.30.0), django-environ (0.14.0), Argon2-cffi (25.1.0), psycopg[binary] (3.3.6).
- **Dev:** pytest, pytest-django, pytest-cov, ruff. Coverage gate **90%** over `accounts, progress, gamification, catalog`.
- **Ruff:** line-length 120, py312, selects `E,F,I,B,UP,S` (security), ignores `S101`; tests ignore `S105/S106`.
- **Commands:** `uv sync`, `uv run pytest --cov`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run python manage.py makemigrations --check --dry-run`, `uv run python manage.py runserver`. Services: `docker compose up -d postgres redis`.
- **Layout note:** apps have **no `apps.py`, `admin.py`, per-app `urls.py` or `tests.py`**. Routing is centralized in `config/urls.py`; tests live in `tests/` subpackages. **There is no Django admin.**
- **API base:** `/api/v1/`; docs `/api/v1/docs/`; schema `/api/v1/schema/`.

## `config/` project

### `config/settings/base.py`
Environment-driven base so one image runs on any Docker host (D09).
- `AUTH_USER_MODEL = accounts.User`; `PASSWORD_HASHERS = [Argon2PasswordHasher]`.
- Password validators: length **10**, similarity, common, numeric.
- `INSTALLED_APPS`: auth, contenttypes, sessions, rest_framework, drf_spectacular, accounts, progress, gamification, catalog.
- Middleware: Security, Session, Common, Csrf, Authentication, XFrameOptions, `config.middleware.ApiNoStoreMiddleware`.
- `DATABASES`: `env.db("DATABASE_URL", default="postgres://khair:khair@127.0.0.1:5432/khair")`; `CONN_MAX_AGE` default 60.
- `LANGUAGE_CODE="en"`, `TIME_ZONE="UTC"`, `USE_TZ=True`.
- **Session/CSRF (D05):** `SESSION_COOKIE_AGE` default 30 days; `SESSION_COOKIE_HTTPONLY=True`; `SESSION_COOKIE_SAMESITE="Lax"`; `CSRF_COOKIE_HTTPONLY=False` (web reads the token); `CSRF_COOKIE_SAMESITE="Lax"`; `CSRF_TRUSTED_ORIGINS` env (default `[]`).
- **CACHES:** `RedisCache` if `REDIS_URL` set, else per-process `LocMemCache` (dev/test). Backs throttles.
- `CATALOG_PATH` default `REPO_ROOT/packages/core/catalog.json`.
- Product limits: `MAX_STUDENTS_PER_CLASS=60`, `PIN_MAX_FAILURES=5`, `PIN_LOCK_MINUTES=15`, `MAX_RUNS_PER_BATCH=100`.
- **REST_FRAMEWORK:** JSON-only renderer/parser; `SessionAuthentication` only; default `IsAuthenticated`; default throttles `AnonRateThrottle`+`UserRateThrottle`; rates `anon 60/min`, `user 240/min`, `auth_ip 20/min`, `class_code 40/min`, `teacher_signup 10/hour`, `runs 30/min`; `NUM_PROXIES` default 0; `EXCEPTION_HANDLER = accounts.errors.api_exception_handler`.
- SPECTACULAR: title "Khair Labs API", `SCHEMA_PATH_PREFIX=r"/api/v1"`.
- LOGGING: console, root level `LOG_LEVEL` (INFO). Comment: never log request bodies; keep nicknames/class codes out of logs.

### `config/settings/dev.py`
`DEBUG=True`; insecure default SECRET_KEY; localhost ALLOWED_HOSTS; CSRF origins localhost:3000, 127.0.0.1:3000, 127.0.0.1:43117 (Electron).

### `config/settings/test.py`
`DEBUG=False`; static test SECRET_KEY; `ALLOWED_HOSTS=["testserver","localhost"]`; DB default `sqlite:///:memory:`; `PASSWORD_HASHERS=[MD5PasswordHasher]` (fast).

### `config/settings/prod.py`
- **Required:** `SECRET_KEY` and `ALLOWED_HOSTS` (raise `ImproperlyConfigured` if absent); **`REDIS_URL` required** (missing Redis stops start-up - shared throttle counters).
- Security: `SECURE_PROXY_SSL_HEADER=("HTTP_X_FORWARDED_PROTO","https")`, `SECURE_SSL_REDIRECT=True`, HSTS 30 days (`INCLUDE_SUBDOMAINS=False`), `SECURE_CONTENT_TYPE_NOSNIFF=True`, `SECURE_REFERRER_POLICY="same-origin"`, `SESSION_COOKIE_SECURE=True`, `CSRF_COOKIE_SECURE=True`, `X_FRAME_OPTIONS="DENY"`, `NUM_PROXIES` default 1.

### `config/urls.py`
Centralized under `path("api/v1/", include(v1))`. Imports accounts/progress/catalog views, `HealthView`, and drf-spectacular schema/docs views.

### `config/views.py`
- `HealthView` (`authentication_classes=[]`, `AllowAny`, `throttle_classes=[]`): `GET` runs `SELECT 1`; returns `{status, database, version}` 200/503; never leaks the exception message.

### `config/middleware.py`
- `ApiNoStoreMiddleware`: for any `/api/` path sets `Cache-Control: no-store` and `Pragma: no-cache`.

### `config/asgi.py` / `wsgi.py`
Default settings `config.settings.prod`; expose `application`.

### `config/test_health.py`
Health OK; health on DB failure (503, no internals); OpenAPI schema served; Swagger page; prod requires SECRET_KEY/ALLOWED_HOSTS; prod secure settings; prod refuses to start without REDIS_URL.

## `accounts/` app

### Models (`accounts/models.py`)
- `CODE_ALPHABET` excludes 0/O/1/I/L; `CODE_LENGTH=6`.
- **`User`** (`AbstractBaseUser`): UUID PK, `role` (teacher/student/admin), `email` unique nullable, `is_active`, `is_staff`, `created_at`; `USERNAME_FIELD="email"`. **CheckConstraint `user_email_matches_role`:** students have NULL email, others non-NULL. Properties `is_teacher`/`is_student`. `__str__` returns `"{role}:{id}"` (no PII).
- **`UserManager`**: `create_user` (lowercases email, hashes password, requires email), `create_superuser` (role admin), `create_student` (no email/password, unusable password).
- **`Classroom`**: UUID PK, `teacher` FK (CASCADE, related `classrooms`), `name` (60), `code` unique (6), `is_active`, `created_at`; ordering `-created_at`; `save()` generates code; `regenerate_code()` retries up to 20 times; `delete_with_students()` (atomic) deletes student Users then the class (cascades progress).
- **`StudentProfile`**: OneToOne user (related `student_profile`), FK classroom (related `students`), `nickname` (20), `nickname_key`, `pin_hash`, `avatar_id`, `failed_pin_attempts`, `locked_until`, `guest_imported_at`, `created_at`. **Unique `(classroom, nickname_key)`.** `set_pin`/`check_pin`; `is_locked(now)`; `register_failure()` increments, on 5th failure sets `locked_until=now+15min` and resets the counter; `clear_failures()`.

### Serializers (`accounts/serializers.py`)
- `TeacherCredentialsSerializer` (email <=254 lowercased; password write-only <=128).
- `TeacherSignupSerializer(TeacherCredentialsSerializer)` - runs Django `validate_password` **only on signup**.
- `StudentJoinSerializer` / `StudentLoginSerializer` (class_code + nickname + PIN; login does not re-filter nickname).
- `MeSerializer` (`.for_user`), `ClassroomSerializer` (read-only id/code/created_at/student_count; annotated count avoids N+1), `StudentSerializer` (id from user_id, `locked` computed; no PIN), `ClassroomDetailSerializer` (+ students), `ResetPinResponseSerializer`, `StudentProgressRowSerializer`.

### Permissions / throttles / validators / errors
- `IsTeacher`, `IsStudent`.
- `AuthIpThrottle` (ip), `TeacherSignupThrottle` (ip), `ClassCodeThrottle` (keyed on class code, IP-independent -> defeats distributed guessing), `RunsThrottle` (user pk).
- `NICKNAME_RE = ^[A-Za-z0-9][A-Za-z0-9 _-]{1,19}$`; `CODE_RE = ^[A-Z0-9]{6}$`; `BLOCKED_WORDS` + `LEET` normalization; `normalize_nickname`; `validate_nickname`/`validate_pin`/`validate_class_code`.
- `ApiError(APIException)` and `api_exception_handler`: single error shape `{code, detail, ...}`; 400 -> `invalid` + `fields`; 401 -> `not_authenticated`; 403 -> `forbidden`; 429 -> `throttled` + `retry_after_seconds`.

### Views (`accounts/views.py`)
- `MAX_CLASSES_PER_TEACHER = 30`.
- `_burn_hash_time(pin)` - equal-time response for unknown nickname vs wrong PIN.
- `enforce_csrf(request)` - manually enforces CSRF on anonymous login/join/signup (DRF only does this once a session user exists). `PublicPostView` base.
- `CsrfView` GET -> 204 + `csrftoken` cookie.
- `TeacherSignupView` (POST) - create teacher; duplicate email -> generic `signup_failed` (no enumeration); logs in; 201.
- `TeacherLoginView` (POST) - 401 `invalid_credentials` for wrong/unknown/inactive.
- `StudentJoinView` (POST, atomic + `select_for_update`) - 404 class; 409 `class_full`; duplicate nickname -> 409 `nickname_taken`; logs in; 201.
- `StudentLoginView` (POST) - unknown nickname burns hash time; locked -> 423 without checking PIN; wrong PIN -> `register_failure`, 423 if now locked else 401 with `attempts_left`; success clears failures.
- `LogoutView` 204; `MeView` GET.
- `ClassListCreateView` (IsTeacher, no pagination) GET list annotated `student_total`; POST enforces `too_many_classes`.
- `OwnedClassMixin` - `get_object_or_404(Classroom, pk, teacher=request.user)` -> **other teachers get 404**.
- `ClassDetailView` GET/DELETE (`delete_with_students`).
- `ResetPinView` POST - server-generated `secrets.randbelow(10000)` PIN returned once.
- `ClassProgressView` GET - per-student xp/stars/levels_cleared/last_active/locked via aggregates.

### `seed_demo` command
- Refuses unless `DEBUG`. Idempotent: demo teacher `demo.teacher@example.com` / `demo-teacher-pass-2026`, class "Demo Class", 5 fake students (Comet/Pixel/Nova/Echo/Orbit with PINs 1111-5555), deterministic `uuid5` runs spread over days via `progress.services.apply_runs`. Prints credentials + class code.

### `accounts/tests/`
- `test_auth.py` - signup (weak password, duplicate generic, lowercase), login (parity for unknown email, role/inactive blocks), join (no email, case-insensitive nickname uniqueness, validations, class_full), login + lockout (`attempts_left`, 423, lock expiry, reset), session/CSRF (login/join/signup enforced, session rotation, cookie flags, no-store), throttling (per IP, per class code across IPs, X-Forwarded-For ignored), model details.
- `test_classes.py` - create/list, permissions (anon 401/403, student vs teacher 403, other teacher 404), detail (no secrets), reset-pin (clears lock), delete (cascades), progress table keys/aggregates.
- `test_seed_demo.py` - refuses outside DEBUG, creates 1/1/5, repeatable, login works.

## `progress/` app

### Models (`progress/models.py`)
- **`Run`**: UUID PK, user FK, `client_run_id` UUID, `world_id`, `level_id`, `boss`, `correct`, `stars`, `played_at`, `xp_awarded`, `received_at`, `source` (play/import). Unique `(user, client_run_id)`; check `stars <= 3`; index `(user, played_at)`.
- **`LevelBest`**: user, `level_key` ("world/level"), stars, updated_at; unique `(user, level_key)`.
- **`Badge`**: user, `badge_id`, earned_at; unique `(user, badge_id)`.
- **`ActivityDay`**: user, day (UTC); unique `(user, day)`.

### Serializers (`progress/serializers.py`)
`ID_RE`/`LEVEL_KEY_RE` regexes; `RunInSerializer`, `RunBatchSerializer` (rejects >100), result/response serializers, `StudentStateSerializer` (xp, stars, badges, streak, active_days), `GuestImportSerializer` (structural limits: stars ≤200 keys each matching LEVEL_KEY_RE, badges ≤60, days ≤400).

### Services (`progress/services.py`) - the core sync logic
Constants: `MAX_RUN_AGE=60 days`, `MAX_CLOCK_SKEW=5 min`, `IMPORT_NAMESPACE`, `GUEST_BADGES={"first-level","perfect-level","prompt-master"}`, `MAX_IMPORT_DAYS=400`.

- `_lock_user`: `select_for_update()` serializes syncs per user.
- `_record_badges`: bulk-create only missing.
- `_bump_best`: no-op unless improving.
- **`apply_runs(user, runs, now)` @atomic:** sort by `played_at` ascending; per run validate against catalog (unknown level -> `unknown_level`; boss mismatch -> `boss_mismatch`; `correct > items` -> `too_many_correct`; time outside window -> `bad_time`; existing `(user, client_run_id)` -> `duplicate`); compute `prev` best stars; `xp = rules.xp_for_run(...)`; insert Run in a nested atomic (race `IntegrityError` -> `duplicate`); `_bump_best`; `_record_badges`; `ActivityDay.get_or_create`; result `accepted` with `xp_awarded`. Returns results **in input order**. Idempotency via DB unique + pre-check + row lock; replays cannot farm bonuses because `prev` is consulted.
- **`import_guest(user, stars, badges, days, now)` @atomic:** lock user + `StudentProfile`; if `guest_imported_at` set -> 409 `already_imported`; per `world/level` skip unknown/0, clamp 0..3, skip if not improving, recompute XP via `rules.xp_for_run(items, value, prev)` as a first clear, create Run with deterministic `uuid5` and `source=import`; badges filtered to `GUEST_BADGES | {world-<id>}`; days parsed within `[today-400d, today]` and unioned; set `guest_imported_at`. **XP never copied from client.**
- **`student_state(user, now)`:** XP = `Sum(xp_awarded)`; stars = LevelBest map; badges ordered; days; `streak = rules.streak(days, rules.day_key(now))`; `active_days`.

### Views (`progress/views.py`)
- `ProgressMeView` GET (IsStudent) -> `student_state`.
- `RunBatchView` POST (IsStudent, `RunsThrottle`) -> `apply_runs`.
- `GuestImportView` POST (IsStudent; default user throttle) -> `import_guest`.

### Migrations
Single `0001_initial` per app (accounts, progress) matching models exactly; `run_stars_max_3` check; `(user, played_at)` index.

### `progress/tests/`
- `test_runs.py` - server-computed XP, client cannot inject XP, idempotency, replays don't farm, best-stars only go up, zero-star pays answers only, oldest-first + input-order response, boss badges, bad runs rejected with exact reason and no write, batch limits, isolation, per-user throttle, streak/days, badge dedupe.
- `test_import.py` - merge stars/recompute XP, no XP injection, star max, perfect on raise but no second first-clear, one-time import (409), unknown/zero skipped, malformed maps, badge union of known ids, days union + date validation, input limits, failed import doesn't consume the one-time import, boss flag kept.
- `test_concurrency.py` - **Postgres only**: two parallel syncs pay first-clear once; requires `transaction=True`.
- `test_database.py` - skipped unless `REQUIRE_POSTGRES` (CI): asserts PostgreSQL 16 so the race test cannot silently skip.

## `gamification/` app - the rules mirror
- **`rules.py`** - line-for-line mirror of `packages/core/src/rules.ts`: same constants, `level_key`, `lose_heart`, `stars_for`, `xp_for_run`, `best_stars`, `boss_gate_missing`, `is_unlocked` (with explicit bounds check), `current_index`, `badges_after_run`, `day_key`, `add_day`, `streak`.
- **No models, migrations or views** - pure logic.
- `tests/test_rules_parity.py` loads `packages/core/test-vectors/rules.json` and asserts every vector. This keeps the Python mirror honest.

## `catalog/` app
- **`loader.py`** - `Catalog` wraps parsed JSON (`worlds`, `_levels` keyed `(world_id, level_id)`); `level`, `world`, `level_keys`, `world_ids`; `_load` is `lru_cache`d; `get_catalog()` reads `settings.CATALOG_PATH`. Content/answers deliberately excluded.
- **`views.py`** - serializers (schema only) + `WorldsView` GET `catalog/worlds` (public) returns raw catalog data (ids, boss, items; no answers).
- `tests/test_catalog.py` - public endpoint, `prompt-park` first, 13 levels, each exactly `{id,boss,items}`, no "answer"/"correct", loader helpers, exactly 1 boss.

## Complete endpoint list

Base `/api/v1/`. Auth column = required authentication/permission.

| Method | Path | Auth | Throttle | Purpose |
|---|---|---|---|---|
| GET | `/health` | AllowAny | none | Liveness/readiness; DB check; 200/503; version |
| GET | `/auth/csrf` | AllowAny | default | Sets `csrftoken` cookie; 204 |
| POST | `/auth/teacher/signup` | AllowAny | AuthIp + TeacherSignup | Create teacher, sign in; 201 |
| POST | `/auth/teacher/login` | AllowAny | AuthIp | Teacher session login; 200 |
| POST | `/auth/student/join` | AllowAny | AuthIp + ClassCode | Join class (code+nickname+PIN); 201 |
| POST | `/auth/student/login` | AllowAny | AuthIp + ClassCode | Student login; 200 / 423 lockout |
| POST | `/auth/logout` | IsAuthenticated | user | End session; 204 |
| GET | `/auth/me` | IsAuthenticated | default | Current identity |
| GET | `/catalog/worlds` | AllowAny | default | World/level ids, order, item counts, boss flags |
| GET | `/progress/me` | IsStudent | default | Student state |
| POST | `/progress/runs` | IsStudent | Runs | Apply outbox batch; results + state |
| POST | `/progress/import` | IsStudent | user | One-time guest import; 409 if already |
| GET | `/classes` | IsTeacher | default | List own classes (unpaginated, annotated count) |
| POST | `/classes` | IsTeacher | default | Create class; 409 at limit 30 |
| GET | `/classes/<uuid:pk>` | IsTeacher (owner) | default | Class detail + students; non-owner 404 |
| DELETE | `/classes/<uuid:pk>` | IsTeacher (owner) | default | Delete class + students + progress; 204 |
| POST | `/classes/<uuid:pk>/students/<uuid:sid>/reset-pin` | IsTeacher (owner) | default | Reset PIN, clear lock; returns PIN once |
| GET | `/classes/<uuid:pk>/progress` | IsTeacher (owner) | default | Per-student progress table |
| GET | `/schema/` | spectacular default | default | OpenAPI schema |
| GET | `/docs/` | spectacular default | default | Swagger UI |

Notes:
- Only `SessionAuthentication` is configured; unauthenticated requests become **403 `forbidden`** in practice (the 401 branch is rarely reached). Tests accept 401/403.
- Undefined methods -> 405. All `/api/*` responses carry `Cache-Control: no-store`.
- Error envelope everywhere: `{code, detail, ...}`.

## Security posture & known gaps
Protections: Argon2-only hashing, min length 10, session cookies HttpOnly/Lax (Secure in prod), CSRF same-origin allow-list, Redis-backed shared throttles, `X-Forwarded-Proto` trust + SSL redirect + HSTS in prod, no-store middleware, PII kept out of logs, timing/enumeration defenses.

Known gaps (see `docs/security/phase-2-review.md`):
1. **Accepted risk:** 4-digit PINs + lockout abuse (nuisance lockout possible with class code).
2. Class/nickname existence visible (`class_not_found`, `locked`, `nickname_taken`).
3. **Accepted risk:** client-reported stars (no real stakes; server recomputes XP and checks level/boss/count/time).
4. Unlock order not enforced server-side (can use `rules.is_unlocked`).
5. Must-do: teacher password recovery by email (Phase 4).
6. Must-do: teacher signup invite code (Phase 3).
7. HSTS subdomains/preload off until the domain is final.
8. **Desktop cookies not yet verified** (Phase 5).
9. Fixed in Phase 2: prod refuses to start without `REDIS_URL`.
10. Nickname filter is a small starter list.
11. Swagger docs public (API shape only).
12. No audit log of teacher actions.

Verified evidence: `uv run pytest --cov` on real Postgres 16 -> **147 passed**, coverage **99.3%**; rules parity passes the shared vectors; mutation checks fail tests when the PIN lock, owner filter, CSRF check, row lock or perfect-bonus rule is removed; the Postgres race test pays the first-clear bonus once.
