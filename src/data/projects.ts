export interface StackGroup {
  group: string;
  items: string[];
}

export interface Challenge {
  title: string;
  body: string;
}

// Rich case-study content for a project. When present, the project gets a
// dedicated /work/<slug> page and a "Case study" link on its card.
// Asset fields (diagram, screenshots, video) are optional — pages render a
// labelled placeholder until the real asset is dropped into /public/images.
export interface ProjectDetail {
  oneLiner: string;
  status: string; // e.g. "Private · in daily use", "Scaffold · early"
  problem: string;
  architecture: string[]; // one entry per paragraph
  diagram?: string; // /images/<slug>-architecture.(png|svg)
  stack: StackGroup[];
  challenges: Challenge[];
  screenshots?: string[]; // /images/<slug>-1.png, ...
  video?: string; // embeddable URL (YouTube/Loom)
  role: string;
}

export interface Project {
  name: string;
  slug?: string; // present ⇒ has a /work/<slug> case-study page
  blurb: string;
  tech: string[];
  image?: string;
  accent?: boolean; // featured / larger card
  award?: string;
  isPrivate?: boolean; // private repo — no public code link
  handCoded?: boolean; // genuinely hand-written, not AI-generated
  links: { label: string; href: string }[];
  detail?: ProjectDetail;
}

// Ordered by how I'd want a recruiter or founder to read them:
// current work first, then the strongest builds.
export const projects: Project[] = [
  {
    name: 'Xelsius',
    blurb:
      'A side project exploring how an agent could read financial data and propose reviewable, deterministic diffs a person approves — instead of a black box deciding.',
    tech: ['TypeScript', 'LLM agents', 'Fintech'],
    accent: true,
    award: 'Exploring',
    links: [{ label: 'Repository', href: 'https://github.com/dingtianding/Xelsius' }],
  },

  // ---- Vertical AI for finance & accounting (the DCB suite) ----
  {
    name: 'CPA Copilot',
    slug: 'cpa-copilot',
    blurb:
      'A screen-aware desktop overlay for CPAs: hit a hotkey, it reads whatever accounting software is on screen, and answers in context — no copy-paste, no leaving your tools.',
    tech: ['Rust', 'Tauri', 'React', 'Claude vision', 'On-device RAG'],
    award: 'Private · building',
    isPrivate: true,
    links: [],
    detail: {
      oneLiner: 'A screen-aware AI copilot overlay, built by a practicing CPA for daily use.',
      status: 'Private · in daily use',
      problem:
        'CPAs live inside legacy desktop software — tax prep tools, Excel workpapers, QuickBooks, financial PDFs. Most AI tooling assumes you will copy-paste into a chat tab, which is a non-starter mid-workpaper for a non-technical finance professional. The screen is the context that AI tools throw away.',
      architecture: [
        'A frameless, always-on-top desktop overlay built on Tauri 2 — a Rust core with a React/TypeScript webview UI. A global hotkey captures an in-memory screenshot plus the frontmost application, and sends it straight from the machine to Claude (vision) with a CPA/tax system prompt. The answer streams back into the overlay.',
        'Firm documents are searchable on-device: a local RAG pipeline embeds Markdown/PDF/text with BGE-base, stores a JSON vector index in the app data directory, and reranks candidates with a bge-reranker cross-encoder before injecting cited context. No server sits in the LLM loop — the user brings their own Anthropic key.',
        'A separate decorated Settings window (opened from the dock) manages the API key, model tier, opacity, customizable hotkeys, and the knowledge base — kept out of the floating overlay so the assistant stays minimal.',
      ],
      stack: [
        { group: 'Desktop core', items: ['Rust', 'Tauri 2', 'global-shortcut', 'active-win'] },
        { group: 'UI', items: ['React', 'TypeScript', 'Vite'] },
        { group: 'AI / retrieval', items: ['Anthropic Claude (vision)', 'fastembed — BGE-base', 'bge-reranker', 'pdf-extract'] },
      ],
      challenges: [
        {
          title: 'Cross-window state sync on macOS',
          body: 'The overlay and Settings windows are two separate webviews that do not reliably share localStorage on macOS. Settings changes (API key, model, opacity, hotkeys) are synced by emitting the full settings snapshot in a Tauri event payload, so the overlay applies them live.',
        },
        {
          title: 'On-device retrieval without a server',
          body: 'Embeddings, a JSON vector index, and a cross-encoder reranker all run locally so firm documents never leave the machine — while keeping the multi-gigabyte model cache out of version control.',
        },
        {
          title: 'Confidentiality-first capture',
          body: 'Screenshots are captured in memory and never written to disk; taxpayer PII (SSN/EIN) is redacted in responses; and because it is bring-your-own-key, requests go straight to Anthropic with no backend of ours in the loop.',
        },
      ],
      role: 'Sole engineer and product owner — Rust backend, React overlay, the on-device RAG pipeline, and the multi-window UX.',
    },
  },
  {
    name: 'CPA Practice',
    slug: 'cpa-practice',
    blurb:
      'A full-stack practice-management platform for CPA and tax firms — clients, engagements, tasks, documents, and communications in one system of record, with a PII-gated ingest pipeline.',
    tech: ['FastAPI', 'PostgreSQL', 'Next.js', 'Docker'],
    award: 'Private · building',
    isPrivate: true,
    links: [],
    detail: {
      oneLiner: 'The CPA firm as software: one system of record, with agents kept in the loop.',
      status: 'Private · building',
      problem:
        'CPA firms run on spreadsheets, email threads, and shared drives. Client, engagement, task, and document state is scattered with no single source of truth — and no safe path to automate the repetitive work without leaking client PII.',
      architecture: [
        'A FastAPI + SQLAlchemy + PostgreSQL backend is the single source of truth: JWT email/password auth, and CRUD for clients, engagements, tasks, documents, and communications, with a dashboard summary on top.',
        'A work-session ingest endpoint accepts structured records and rejects unredacted PII (SSN/EIN) with a 422 before anything is written — the gate that lets automation feed the system safely. A Next.js (App Router) front-end consumes the API; Docker Compose runs local Postgres; pytest runs in CI on GitHub Actions.',
      ],
      stack: [
        { group: 'Backend', items: ['Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Pydantic', 'JWT'] },
        { group: 'Frontend', items: ['Next.js (App Router)', 'React', 'TypeScript', 'Tailwind'] },
        { group: 'Infra / quality', items: ['Docker Compose', 'pytest', 'GitHub Actions'] },
      ],
      challenges: [
        {
          title: 'PII-gated ingest',
          body: 'Unredacted SSN/EIN in an ingested work session is rejected with a 422 at the boundary, so the automated path can never persist sensitive data — covered by integration tests against an in-memory SQLite override so CI needs no Postgres.',
        },
        {
          title: 'A multi-entity domain model',
          body: 'Clients, engagements, tasks, documents, and communications relate in ways that mirror how a real firm tracks work — modeled to support a dashboard summary and to extend to professional services beyond CPA/tax over time.',
        },
      ],
      role: 'Sole engineer — auth, the data model and API, the ingest pipeline and its test suite, and the web UI.',
    },
  },
  {
    name: 'FilingLens',
    slug: 'filinglens',
    blurb:
      'SEC/EDGAR filing analytics: ingest submissions and XBRL company facts, normalize them into Postgres, then diff filings and compare companies on revenue, margin, debt, liquidity, and risk-text changes.',
    tech: ['Python', 'FastAPI', 'XBRL', 'PostgreSQL', 'React'],
    award: 'Public · early',
    links: [],
    detail: {
      oneLiner: 'Turning EDGAR + XBRL into queryable analytics: filing diffs and company comparison.',
      status: 'Public · scaffold stage',
      problem:
        "Public companies' numbers live in SEC filings, but they are buried in EDGAR and XBRL. Comparing companies, or spotting what actually changed between two filings — in the financials or the risk text — is slow, manual work.",
      architecture: [
        'A practical SEC data pipeline: ingest SEC submissions and XBRL company facts for a controlled universe of tickers, store raw JSON and documents in object storage, then normalize filing metadata and financial facts into PostgreSQL.',
        'A FastAPI backend serves analytics — revenue, margin, debt, liquidity, risk-text changes, and filing summaries — to a React dashboard. The build is at scaffold stage: API and dashboard shells plus a storage abstraction are in place; the next step is ingestion for a small ticker universe, then normalized tables and trend endpoints.',
      ],
      stack: [
        { group: 'Pipeline', items: ['Python', 'SEC EDGAR', 'XBRL', 'object storage'] },
        { group: 'Backend', items: ['FastAPI', 'PostgreSQL'] },
        { group: 'Frontend', items: ['React', 'TypeScript'] },
      ],
      challenges: [
        {
          title: 'XBRL normalization',
          body: 'Company facts arrive as sprawling, inconsistently-tagged XBRL taxonomies; turning them into clean, comparable financial facts is the core of the pipeline.',
        },
        {
          title: 'Filing diffing',
          body: 'Detecting meaningful change between filings — both in the structured financials and in narrative risk text — rather than surfacing noise.',
        },
      ],
      role: 'Sole engineer — pipeline, normalization schema, API, and dashboard.',
    },
  },
  {
    name: 'DCB Knowledge Base',
    slug: 'dcb-knowledge-base',
    blurb:
      'A money & investing knowledge base with an AI advisor: browse vetted, sourced explainers for free; ask an advisor that answers grounded in the corpus with citations. Educational, not personalized advice.',
    tech: ['FastAPI', 'RAG', 'Claude', 'Next.js', 'PostgreSQL'],
    award: 'Private · building',
    isPrivate: true,
    links: [],
    detail: {
      oneLiner: 'A vetted finance knowledge base with a citation-grounded AI advisor.',
      status: 'Private · building',
      problem:
        'Personal-finance information online is either shallow SEO filler or paywalled and ungrounded. People want vetted, sourced explainers — and an AI advisor that answers from that corpus with citations, with a clear line between education and personalized advice.',
      architecture: [
        'A FastAPI + SQLAlchemy + PostgreSQL backend holds a corpus of vetted explainers. A Claude-backed RAG advisor answers grounded in that corpus and returns citations — free for partner-firm clients, a subscriber feature otherwise.',
        'A Next.js (App Router, React 19, Tailwind v4) front-end is the marketing home leading into the knowledge base. It is a separate product from CPA Practice with no shared database; the only link is outbound entitlement/auth from the firm tool.',
      ],
      stack: [
        { group: 'Backend', items: ['Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL'] },
        { group: 'AI / retrieval', items: ['Anthropic Claude', 'RAG', 'citations'] },
        { group: 'Frontend', items: ['Next.js (App Router)', 'React 19', 'Tailwind v4', 'TypeScript'] },
      ],
      challenges: [
        {
          title: 'Grounded answers with citations',
          body: 'The advisor answers only from the vetted corpus and surfaces its sources, so responses are checkable rather than confidently wrong.',
        },
        {
          title: 'Education, not advice',
          body: 'Keeping the product clearly on the educational-information side of the line — and modeling entitlement across two products without a shared database.',
        },
      ],
      role: 'Sole engineer — corpus model, the RAG advisor, the entitlement link, and the marketing/KB front-end.',
    },
  },

  // ---- Earlier builds ----
  {
    name: 'Aurora',
    blurb:
      'An AI emotional-wellness companion: conversational support, mood tracking, and reflection tools in one private space. Built in a weekend and took first place.',
    tech: ['Flask', 'React', 'Redux', 'Docker', 'AWS'],
    image: '/images/Aurora.png',
    award: 'Hackathon winner',
    handCoded: true,
    links: [
      { label: 'Demo', href: 'https://www.youtube.com/watch?v=BVoHn6dpLC0&t=3857s' },
      { label: 'Repository', href: 'https://github.com/team-8-hackathon/Aurora-App' },
    ],
  },
  {
    name: 'Fire Drill XR',
    blurb:
      'A mixed-reality fire-safety trainer on the Meta Presence Platform that teaches hazard protocols inside your real room. Built at MIT Reality Hack.',
    tech: ['C#', 'Unity', 'Meta Presence', 'Quest'],
    image: '/images/realityhack.jpeg',
    award: 'MIT Reality Hack 2024',
    handCoded: true,
    links: [
      { label: 'Demo', href: 'https://devpost.com/software/fire-drill-xr' },
      { label: 'Repository', href: 'https://codeberg.org/reality-hack-2024/FireDrillXR' },
    ],
  },
  {
    name: 'Underhood',
    blurb:
      'An archived full-stack Robinhood clone with market data, watchlists, and simulated trading. Kept as a Rails/React build record rather than a live demo.',
    tech: ['Ruby on Rails', 'React', 'Redux', 'PostgreSQL'],
    image: '/images/UH.png',
    award: 'Archived',
    handCoded: true,
    links: [{ label: 'Repository', href: 'https://github.com/dingtianding/Underhood' }],
  },
  {
    name: 'mapStatesToPosts',
    blurb:
      'A MERN photo-postcard app for exploring, uploading, and sharing snapshots across all 50 US states.',
    tech: ['MongoDB', 'Express', 'React', 'Node'],
    image: '/images/mSTP.png',
    handCoded: true,
    links: [{ label: 'Repository', href: 'https://github.com/yuhmanashi/mapStatesToPosts' }],
  },
  {
    name: 'Castlevania97',
    blurb:
      'A 2D arcade fighter rendered on HTML canvas, hand-built in vanilla JavaScript as an homage to KOF97 and Castlevania.',
    tech: ['JavaScript', 'Canvas'],
    image: '/images/C97.png',
    handCoded: true,
    links: [
      { label: 'Play', href: 'https://dingtianding.github.io/Castlevania97/' },
      { label: 'Repository', href: 'https://github.com/dingtianding/Castlevania97' },
    ],
  },
];
