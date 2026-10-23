# UniMatch NG 🏛️

> *"Find your place among Nigeria's finest institutions"*

UniMatch NG is an elite university recommendation platform designed specifically for aspiring Nigerian undergraduates. Powered by Google's Gemma 4 on Backboard (with automatic secondary resilience via Gemini), UniMatch NG provides deterministic, multi-factor academic appraisals across Nigerian Federal, State, and Premier Private institutions.

---

## Key Features

- **Heritage "Old Money" Aesthetic**: Visual design inspired by classic collegiate prospectuses, private libraries, and vintage university registers (bottle green `#1F3D2B`, deep burgundy `#5A1A24`, warm cream `#FBF7EC`, parchment `#F5EFE0`, and antique brass `#A98A4F`).
- **Empirical 4-Stage Candidate Dossier**:
  - **Section I**: Candidate Identity & Class Track (Science, Arts, Commercial, Social Science).
  - **Section II**: WAEC/NECO O'Level Credit Analysis (live calculation of credits A1–C6 and English/Maths prerequisites) & JAMB UTME score (0–400).
  - **Section III**: Vocational Ambition, Academic Interests, and Target Department (or automatic recommendation of 3 best-fit courses).
  - **Section IV**: Institutional Preferences (Federal, State, Private, Budget tolerance).
- **Deterministic 100-Point Scoring Algorithm (`/lib/scoring`)**:
  - Cut-off Fit: **30%**
  - Course & Department Strength: **25%**
  - Tuition & Fee Affordability: **15%**
  - Campus Ambiance & Student Life: **10%**
  - Reviews & Institutional Reputation: **10%**
  - Location & Hostel Accommodation: **10%**
- **Strict Zod Validation (`/lib/schemas`)**: Every client form input, API request, and AI model response is strictly validated at runtime.
- **Backboard Integration with Live Web Search (`/lib/backboard`)**:
  - Secure server-side route handlers (`/api/recommendations`, `/api/university/detail`, `/api/counsellor/chat`).
  - Thread persistence across sessions so follow-up inquiries to the admissions counsellor maintain complete candidate context.
  - Live web search enabled on university detail queries for contemporary post-UTME updates and tuition figures.
  - Exponential backoff retry (up to 3 attempts) and markdown code fence stripping.
- **Two-Tier Caching System (`/lib/cache`)**:
  - **Server-Side**: SHA-256 hash keying with Upstash Redis adapter and In-Memory fallback (TTL configurable via `CACHE_TTL_DAYS`).
  - **Client-Side**: Versioned local storage under `"unimatch_v1_"`, offline preservation, "From archive" indicator, and one-click "Refresh Appraisal" bypass.
- **Archived Shortlist & Ledger (`/shortlist`)**:
  - Up to 3 institutions compared side-by-side in a comparative ledger.
  - Personal candidate notes per university.
  - Export as official **PDF** (via custom `@media print` print stylesheet) or **JSON**.

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `BACKBOARD_API_KEY` | Backboard API key for running Gemma 4 | *(Required for Backboard)* |
| `BACKBOARD_BASE_URL` | Base URL for the Backboard REST API | `https://app.backboard.io/api` |
| `BACKBOARD_LLM_PROVIDER` | LLM provider on Backboard | `google` |
| `BACKBOARD_MODEL_NAME` | Model identifier | `gemma-4` |
| `CACHE_TTL_DAYS` | Cache retention in days for AI responses | `7` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint (Optional) | `""` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST bearer token (Optional) | `""` |
| `GEMINI_API_KEY` | Secondary fallback API key for Gemini | *(Optional)* |
| `PORT` | Local server port | `3000` |

---

## Installation & Local Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
UniMatch NG includes strict unit tests verifying scoring weights, Roman numeral conversion, WAEC credit logic, cache hashing, and schema safety:
```bash
npm test
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build & Deployment

### Build for Production
```bash
npm run build
```

### Run Full-Stack Node Server
```bash
npm start
```

### Deploying to Vercel
1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Configure your Environment Variables (`BACKBOARD_API_KEY`, `BACKBOARD_MODEL_NAME`, `CACHE_TTL_DAYS`).
4. Set Build Command to `npm run build` and Output Directory to `dist`.

---

## Project Structure

```
├── /src
│   ├── /components
│   │   ├── Crest.tsx                 # Monogram crest ("UM" brass & bottle green)
│   │   ├── Navbar.tsx                # Heritage navigation bar
│   │   ├── LandingHero.tsx           # Prospectus hero & process steps
│   │   ├── ProfileForm.tsx           # Multi-step candidate dossier (Steps I-IV)
│   │   ├── RecommendationsView.tsx   # 10 ranked cards with Roman numerals & filters
│   │   ├── UniversityDetailModal.tsx # Live detail dossier with fees in Naira
│   │   ├── ShortlistView.tsx         # Side-by-side ledger, notes, PDF & JSON export
│   │   ├── CounsellorChatBox.tsx     # Session-persistent counsellor chat
│   │   ├── SkeletonCard.tsx          # Themed parchment skeleton loader
│   │   └── Footer.tsx                # Academic integrity notice & NUC / JAMB disclaimer
│   ├── /lib
│   │   ├── /schemas/index.ts         # Zod schemas for forms, recommendations, details
│   │   ├── /scoring/index.ts         # Deterministic 100-point scoring & WAEC analysis
│   │   ├── /cache/index.ts           # SHA-256 keying, Upstash Redis & in-memory cache
│   │   ├── /backboard/index.ts       # Typed Backboard client with retry & thread session
│   │   ├── /prompts/index.ts         # Prompt templates and versioning
│   │   ├── /fallback/index.ts        # Static fallback registry of Nigerian universities
│   │   ├── client-storage.ts         # Versioned client-side storage ("unimatch_v1_")
│   │   └── utils.ts                  # Clean fences, slugify, and formatNaira
│   ├── App.tsx                       # Main application shell
│   ├── index.css                     # Tailwind v4 theme, fonts, and print stylesheet
│   └── main.tsx                      # Client entry point
├── /test
│   └── scoring.test.ts               # Unit tests
├── server.ts                         # Express server with Vite middleware & rate limiter
├── index.html                        # Heritage HTML document with Google Fonts
└── package.json
```

---

## Academic Disclaimer
UniMatch NG is an admissions advisory platform. All cutoff benchmarks, probability metrics, and tuition fee schedules are AI-assisted estimates. Candidates must confirm official requirements on the JAMB CAPS portal (`jamb.gov.ng`) and the respective institution's admissions registry.
