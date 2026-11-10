# Study Hub

An interactive, multi-course study platform: lessons with formula explanations and
interactive diagrams, spaced-repetition flashcards, practice quizzes, timed mock exams,
exercises with worked solutions, a printable formula sheet and progress tracking.
Works offline (PWA) and syncs progress between devices with a sync code.

**Live:** https://study-hub.infosec-muni-studyhub.workers.dev

Courses (both FI MUNI):

- **IV111 Probability in Computer Science** — 13 lectures, 182 flashcards, 93 explained formulas,
  113 quiz questions + 17 random question generators, 91 exercises with worked solutions and 16 interactive
  visualizations (Venn diagrams, Bayes trees, distributions, tail bounds, LLN/CLT simulations,
  Markov-chain explorer, MDP value/policy iteration, entropy & mutual information, Huffman builder,
  Kraft checker, channel capacity, CTMC queues).
- **IA174 Fundaments of Cryptography** — 13 lessons tagged *must-know / understand / context*
  following the official exam guide, 190 flashcards, 56 explained formulas, 119 multiple-choice questions
  + 23 generators, 61 exercises in the four exam question types (describe, find the flaw, HW-style,
  security proof) and 19 interactive labs: perfect-secrecy checker, attack-game simulator
  (SS/PRG/PRP/CPA/CCA/forgery games), one-time & two-time pad, ChaCha and AES round by round, GF(2⁸),
  ECB/CBC/CTR on text and images, birthday attack and Floyd's ρ, Merkle–Damgård and sponge, Merkle trees, HMAC/CBC-MAC/CMAC/polynomial MAC, EtM vs MtE, groups, RSA attacks,
  Diffie–Hellman with MITM, baby-step giant-step, elliptic curves over ℝ and 𝔽ₚ,
  Schnorr nonce reuse, zero-knowledge identification. The mock exam reproduces the real exam
  structure (penalised MCQs + four open questions, 120 points, grade estimate).

> All exercises are **original problems** written in the style of the official tutorials/worksheets
> and point to related official material (`cf. Tutorial 2.1`, `cf. Worksheet 3`). No text from the
> official sheets, slides, homework assignments or their solutions is included.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173 (sync API mocked in memory)
npm test             # unit + content-integrity tests
npm run build        # type-check + production build into dist/
npm run preview      # build, then run the real Cloudflare Worker locally (wrangler dev)
```

Requires Node ≥ 20.

## Modes

| Mode | What it does |
|---|---|
| **Dashboard** | mastery per exam question, cards due, last mock exam, streak, upcoming schedule |
| **Learn** | one page per lecture: definitions, theorems, proof ideas, worked examples, formula cards ("Explain" shows symbols, intuition, conditions, pitfalls), embedded visualizations, mini-quiz |
| **Flashcards** | SM-2-style spaced repetition (Again/Hard/Good/Easy, keys 1–4, Space flips), cram mode, browse/search |
| **Practice quiz** | by exam question or lecture; filters: all / my mistakes / unseen / weak; randomly generated problems |
| **Mock exam** | timed; auto-graded part and written problems self-graded with a rubric; per-topic report and history. Courses can define the exact exam structure (parts, points, penalties, grade scale) |
| **Exercises** | filter by tutorial or topic / exam question / question type / status; hints, worked solutions, solved/review flags |
| **Formula sheet** | every formula, searchable, printable |
| **Playground** | the course's visualizations with free parameters (other courses' ones one click away) |
| **Progress** | accuracy per lecture, mastery per exam question, activity heat-map, exam history |
| **Settings** | theme, sync code, JSON export/import, reset per course |

## Project structure

```
src/
  platform/            course-agnostic app (never mentions a specific course)
    types.ts           the content model: Course, Topic, Section, Formula, Flashcard, QuizQuestion, Exercise, …
    registry.ts        list of courses (each lazy-loaded)
    pages/             Dashboard, Learn, Flashcards, Quiz, MockExam, Exercises, FormulaSheet, Playground, Progress, Settings
    components/        Markdown+KaTeX, FormulaCard, QuestionView, VizHost
    state/             localStorage store, merge logic, sync client, spaced repetition
  shared/
    math/              tested numerics: distributions, bounds, Markov chains, MDPs, entropy, codes, channels
      crypto/          AES, ChaCha20, SHA-256, GF(2⁸), toy Merkle–Damgård hash, number theory, groups, elliptic curves
    viz/               reusable visualizations (+ registry); crypto/ holds the cryptography labs
  courses/
    _template/         copy this to start a new course
    iv111/             topics/ (one file per lecture), exercises/, generators.ts, viz/ (course-specific)
    ia174/             topics/, exercises/ (by exam question type), generators.ts
worker/                Cloudflare Worker: static assets + KV-backed sync API
tests/                 math, state merge, quiz parsing, content integrity
```

## Adding a new course

1. Copy `src/courses/_template` to `src/courses/<id>` and set `id`, `code`, `title`.
2. Define `examGroups` (how the exam is organised – chapters, Q1–Qn, midterm/final…).
   Mark groups that are not examined with `examinable: false`.
3. Write topics (one file per lecture is convenient). Every text field is Markdown with
   LaTeX (`$…$`, `$$…$$`). Use `String.raw` (aliased as `md`) so backslashes need no escaping.
4. Add flashcards, quiz questions (`mcq`, `multi`, `truefalse`, `numeric`), exercises
   (with `rubric` for mock-exam self-grading) and optionally `generators`.
   Optional extras: `importance: 'must' | 'understand' | 'context'` on sections (shown as badges),
   `tag` on topics (label instead of `L<n>`), `category` on exercises with `exerciseCategories` on the
   course, and `exerciseUnits: 'topic'` to group exercises by topic instead of tutorial.
5. Embed any shared visualization by id (`viz: [{ id: 'markovChain', props: { preset: 'weather' } }]`);
   course-specific ones go into the course's `viz` registry.
6. Configure the mock exam: either `autoPerGroup`/`writtenPerGroup`, or an exact `blueprint` of parts
   (auto-graded parts with `points`, `penalty`, `difficulty`, `types`; written parts with `points` and a
   `category`) plus an optional `gradeScale`. See `src/courses/ia174/index.ts`.
7. Register it in `src/platform/registry.ts`:
   ```ts
   { id: 'xyz', code: 'XYZ123', title: '…', description: '…', color: '#0b8', load: () => import('../courses/xyz') }
   ```
8. Run `npm test`. The content test validates **every** registered course: all LaTeX must
   render, ids must be unique, answers must be valid and every examinable group needs
   questions and exercises.

**Turning lecture PDFs into content:** `pdftotext -layout lecture.pdf -` gives the text;
write definitions/theorems in your own words, add the formulas with symbol explanations,
then cards, questions and exercises. Keep copyrighted/non-distributable material out of the repo
(`private/` is git-ignored if you want local-only notes).

## Deployment (Cloudflare Workers, free tier)

The app is a static build served by a Worker that also provides the sync API
(`GET/PUT /api/sync/<32-hex code>`, stored in Workers KV).

### One-time setup

```bash
npx wrangler login                       # opens the browser
npx wrangler kv namespace create SYNC    # prints an id
```

Put the printed id into `wrangler.jsonc` (`kv_namespaces[0].id`) and deploy:

```bash
npm run deploy                           # build + wrangler deploy
```

The site is then live at `https://study-hub.<your-account>.workers.dev`.

### Automatic deploys on every push (recommended)

In the Cloudflare dashboard: **Workers & Pages → study-hub → Settings → Builds → Connect**
your GitHub repository, with

- build command: `npm run build`
- deploy command: `npx wrangler deploy`

Every push to `main` then builds and deploys. (`.github/workflows/ci.yml` additionally runs the
tests and build on GitHub for every push.)

Alternatively deploy from GitHub Actions with `cloudflare/wrangler-action@v3` and the repo secrets
`CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`.

## Sync & privacy

Progress lives in the browser's localStorage. Creating a **sync code** in Settings uploads it
(without the code itself) to KV under that code; entering the same code on another device merges
both states (newer record wins, per card/question/exercise). Anyone who knows the code can read and
overwrite that progress — treat it like a password. Export/import JSON works without any server.

## Built with Claude Code

Developed with [Claude Code](https://claude.com/claude-code). The platform/course split, the content-integrity
tests and the tested math library (`src/shared/math`) keep generated course content honest: every formula
must render and every answer is checked.

## License

Code: [Apache-2.0](LICENSE). The IV111 and IA174 course content is my own study material based on the
FI MUNI courses; it is not official course material.
