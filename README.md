# UniMatch NG 🏛️
### Find your place among Nigeria's finest institutions

[![MLH Hacktoberfest](https://img.shields.io/badge/MLH-Hacktoberfest_2026-ff6b4a?style=flat-square&logo=majorleaguehacking)](https://mlh.io/)
[![Model](https://img.shields.io/badge/Model-Google_Gemma_4_(Open_Weights)-4285F4?style=flat-square&logo=google)](https://ai.google.dev/gemma)
[![Gemma License](https://img.shields.io/badge/Model_Terms-Gemma_Terms_of_Use-0F9D58?style=flat-square)](https://ai.google.dev/gemma/terms)
[![Deployment](https://img.shields.io/badge/Live_App-unimatchng.vercel.app-1F3D2B?style=flat-square)](https://unimatchng.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

**Live Web Application:** [https://unimatchng.vercel.app/](https://unimatchng.vercel.app/)

> *"Whether you seek the venerable quadrangles of Ibadan, the architectural majesty of Ife, the rigorous halls of Zaria, or the focused scholarship of premier private foundations, UniMatch NG aligns your UTME scores, O'level credits, and career ambitions with institutional excellence."*

---

## 🏆 Hackathon Context: MLH Hacktoberfest (Open Source & Open Weight AI)

This project was built for the **MLH (Major League Hacking) Hacktoberfest Hackathon**, celebrating the power and transparency of **Open Source and Open-Weight AI**.

### The Societal Challenge in Nigeria
Every year, over **1.8 million Nigerian secondary school leavers** sit for the Joint Admissions and Matriculation Board (JAMB) Unified Tertiary Matriculation Examination (UTME), competing for fewer than 600,000 available university admissions. 
- Disparate departmental cut-offs, varying faculty quota formulas (50% UTME / 30% Post-UTME / 20% O'Level), and volatile tuition structures create severe information asymmetry.
- Many qualified applicants pick mismatched institutions or combinations, forfeiting academic years and falling into despair.
- Commercial university counselling services in Nigeria charge high consultation fees that everyday families cannot afford.

### The Open-Weight AI Solution
**UniMatch NG** democratizes university guidance by putting an expert academic counsellor directly into the hands of every Nigerian student for free. Powered by Google's **Gemma** open-weight model family and a deterministic 100-point scoring engine, UniMatch NG offers transparent, reproducible, and verifiable institutional matching.

---

## 🤖 Open-Weight Model Attribution & Terms

### Foundation Model: Google Gemma
UniMatch NG runs on **Gemma 4** (configured via Backboard API with Gemma open model runtime):
- **Model Creator:** Google DeepMind and Google Research.
- **Model Family:** [Gemma Open Models](https://ai.google.dev/gemma) — Google's lightweight, state-of-the-art open-weight models built from the same research, datasets, and technology used to create Gemini.
- **Weight Availability:** Gemma weights are openly available to the global developer community on [Hugging Face (`google/gemma`)](https://huggingface.co/google) and [Kaggle Models](https://www.kaggle.com/models/google/gemma).

### Model Licensing & Responsible Use
- **License / Terms of Use:** The underlying model is governed by the official **[Gemma Terms of Use](https://ai.google.dev/gemma/terms)** and the **[Gemma Open Model License Agreement](https://ai.google.dev/gemma/terms)**.
- **Responsible AI:** Inference adheres to Google's [Responsible Generative AI Toolkit](https://ai.google.dev/gemma/docs/core_concepts).
- **Why Open-Weights Matter Here:** Open weights ensure that educational advisory algorithms can be openly inspected, evaluated for demographic fairness, and self-hosted on regional infrastructure across Africa without reliance on closed corporate black boxes.

---

## 🏛️ Distinctive Features & Aesthetic Philosophy

### 1. Heritage "Old Money" Collegiate Aesthetic
Unlike typical cookie-cutter SaaS products with neon purple gradients and generic AI pills, UniMatch NG adopts the tactile gravitas of a vintage Oxbridge/Commonwealth academic prospectus:
- **Curated Palette:** Bottle green (`#1F3D2B`), deep burgundy (`#5A1A24`), warm parchment (`#F5EFE0`), cream surfaces (`#FBF7EC`), navy ink (`#1B2432`), and antique brass accents (`#A98A4F`).
- **Classic Typography:** Cormorant Garamond, Cinzel, and EB Garamond with small caps and Roman numerals (Steps I–IV, Ranks I–X).
- **Prospectus Details:** Monogram crest (`UM`), double-rule brass dividers, fine paper grain texture, and unboxed typographic metadata.

### 2. Empirical 4-Stage Candidate Dossier (`/profile`)
- **Section I (Identity):** Full name, age, and academic track (*Science*, *Arts*, *Commercial*, *Social Science*).
- **Section II (Academics):** 
  - Dynamic WAEC/NECO O'Level credit ledger (up to 9 subjects with grades A1–F9).
  - Live calculation of credits (A1–C6) and automated verification of English and Mathematics matriculation requirements.
  - JAMB UTME score (0–400) with "Awaiting / N/A" toggle.
- **Section III (Vocation):** Free-form academic interests, dream vocation, and target department (if undecided, Gemma formulates 3 best-fit degree pathways).
- **Section IV (Preferences):** Institutional preference (*Federal*, *State*, *Private*) and budget tolerance. Auto-saves draft to client cache as the student types.

### 3. Deterministic 100-Point Scoring Algorithm (`/lib/scoring`)
To prevent "hallucinated rankings", Gemma outputs granular sub-scores that are deterministically synthesized in code:
$$\text{Score} = 0.30 \cdot \text{CutOff} + 0.25 \cdot \text{Faculty} + 0.15 \cdot \text{Fees} + 0.10 \cdot \text{Ambiance} + 0.10 \cdot \text{Reputation} + 0.10 \cdot \text{Hostels}$$
- Institutions are assigned **Safe**, **Match**, or **Reach** probability indicators.
- Filter and sort bar: filter by institution type, admission likelihood, state, or score.

### 4. Verified University Archives & Counsellor Chat (`/university/[slug]`)
- Contemporary post-UTME screening procedures, O'Level subject combinations, and Naira fee schedules (Acceptance, Tuition, Faculty dues, and Hostels).
- Interactive **"Ask the Counsellor"** chat box powered by Gemma with thread session persistence.

### 5. Archived Shortlist & Ledger (`/shortlist`)
- Side-by-side comparison of up to 3 institutions in a tabular ledger.
- Persistent candidate notes per institution stored locally.
- **Dual Export:** Export as official **PDF** (via dedicated `@media print` admissions ledger stylesheet) or download clean **JSON**.

---

## 🏗️ Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   (React 19 + TypeScript + Tailwind CSS + IndexedDB/Cache)  │
└──────────────┬──────────────────────────────▲───────────────┘
               │                              │
     POST /api/recommendations        JSON Response /
     POST /api/university/detail      Client Fallback
               │                              │
┌──────────────▼──────────────────────────────┴───────────────┐
│               Serverless / Express Runtime                  │
│       (/api/index.ts on Vercel / server.ts on Node)         │
├─────────────────────────────────────────────────────────────┤
│  • Zod Validation Layer (/lib/schemas)                      │
│  • Rate Limiting (Sliding Window per IP)                    │
│  • Deterministic Scoring Function (/lib/scoring)            │
│  • Two-Tier Cache: Upstash Redis REST / In-Memory           │
│  • SHA-256 Hash Normalization (/lib/cache)                  │
└──────────────┬──────────────────────────────▲───────────────┘
               │                              │
      POST /threads/messages         Structured JSON
               │                              │
┌──────────────▼──────────────────────────────┴───────────────┐
│                 Google Gemma 4 on Backboard                 │
│               (Open-Weight LLM Inference)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```bash
cp .env.example .env
```

| Variable | Required | Description | Default |
| :--- | :---: | :--- | :--- |
| `BACKBOARD_API_KEY` | Optional* | API key for running Gemma 4 on Backboard | `""` |
| `BACKBOARD_BASE_URL` | Optional | Backboard API base endpoint | `https://app.backboard.io/api` |
| `BACKBOARD_LLM_PROVIDER` | Optional | Provider identifier | `google` |
| `BACKBOARD_MODEL_NAME` | Optional | Model identifier | `gemma-4` |
| `CACHE_TTL_DAYS` | Optional | Server cache retention in days | `7` |
| `UPSTASH_REDIS_REST_URL` | Optional | Upstash Redis REST URL for distributed cache | `""` |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash Redis REST token | `""` |
| `GEMINI_API_KEY` | Optional | Secondary fallback provider key | `""` |
| `PORT` | Optional | Server port | `3000` |

*\*Note: If external API keys are omitted, UniMatch NG automatically switches into its built-in demonstration advisory mode, ensuring the app remains 100% interactive and testable out of the box.*

---

## 🚀 Local Development

### 1. Prerequisites
- Node.js $\ge 20.x$
- npm or pnpm

### 2. Installation
```bash
git clone https://github.com/victor-s-napoleon/unimatch-ng.git
cd unimatch-ng
npm install
```

### 3. Run Unit Tests
UniMatch NG includes test suites for deterministic scoring weights, Roman numerals, WAEC credit logic, cache hashing, and Zod schemas:
```bash
npm test
```

### 4. Start Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deploying to Vercel

UniMatch NG is configured with Vercel Serverless Function routing:
1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Select **Vite** as the Framework Preset.
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. In **Project Settings → Environment Variables**, add your `BACKBOARD_API_KEY` (and optionally `CACHE_TTL_DAYS`).
6. Deploy! The included `vercel.json` and `/api/index.ts` automatically mount all `/api/*` endpoints serverlessly.

---

## 🧪 Quality & Verification

- **Strict TypeScript:** No `any` types; Zod schemas shared across client and server.
- **Accessibility:** High contrast ratios, full keyboard navigation, explicit focus rings, and screen-reader accessible form controls.
- **Resilience:** Graceful offline reads via versioned client storage (`"unimatch_v1_"`), loading skeletons, and dual-layer caching.

---

## 📜 Licenses & Disclaimers

- **Application Source Code:** Released under the **[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)**.
- **Foundation AI Model:** Powered by Google's Gemma models, subject to the **[Gemma Terms of Use](https://ai.google.dev/gemma/terms)**.
- **Academic Disclaimer:** All cut-off marks, probability metrics, and tuition fee schedules are AI-assisted advisory estimations. Aspiring scholars must verify formal admissions circulars directly on the official JAMB Central Admissions Processing System (CAPS) portal (`jamb.gov.ng`) and respective institutional websites.

---

*Crafted with pride for aspiring Nigerian undergraduates and the MLH Hacktoberfest Open-Weight AI community.*
