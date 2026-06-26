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
    name: 'DCB Copilot',
    slug: 'dcb-copilot',
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
    name: 'DCB Practice',
    slug: 'dcb-practice',
    blurb:
      'An AI-native accounting firm: agents run the repetitive tax and accounting work end to end while humans review and approve — built on a practice-management platform that is the system of record, with a PII-gated ingest pipeline.',
    tech: ['Agentic AI', 'FastAPI', 'PostgreSQL', 'Next.js'],
    award: 'Private · building',
    isPrivate: true,
    links: [],
    detail: {
      oneLiner: 'Not software a firm uses — the firm itself, delivered as software: agents do the work, humans approve.',
      status: 'Private · building',
      problem:
        'The spend on professional services dwarfs the spend on software, and accounting, tax, and audit are among the most outsourced of all — which makes them the strongest candidates to be replaced, not just improved. The opportunity is not another tool that helps a CPA work faster; it is to deliver the service itself. But you cannot let agents touch real client work without a system of record, an audit trail, and a hard guarantee that sensitive data is handled correctly.',
      architecture: [
        "The substrate is a FastAPI + SQLAlchemy + PostgreSQL platform that is the firm's single source of truth: JWT auth, and clients, engagements, tasks, documents, and communications, with a dashboard summary. This is what makes agent work reviewable — every action lands against a real record a human can audit and approve.",
        'On top of it, an agentic layer does the repetitive accounting work and feeds results back through a work-session ingest endpoint that rejects unredacted PII (SSN/EIN) with a 422 before anything is written — so automation can never persist sensitive data. A Next.js (App Router) front-end is the human review surface; Docker Compose runs local Postgres; pytest runs in CI.',
      ],
      stack: [
        { group: 'Backend', items: ['Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Pydantic', 'JWT'] },
        { group: 'AI', items: ['LLM agents', 'tool use', 'human-in-the-loop review'] },
        { group: 'Frontend / infra', items: ['Next.js (App Router)', 'React', 'TypeScript', 'Docker', 'pytest', 'GitHub Actions'] },
      ],
      challenges: [
        {
          title: 'Agents that touch real work, safely',
          body: 'Letting agents run accounting tasks end to end requires every action to be reviewable and reversible — landed against a system of record a human approves, not a black box that just emits an answer.',
        },
        {
          title: 'PII-gated ingest',
          body: 'Unredacted SSN/EIN in an ingested work session is rejected with a 422 at the boundary, so the automated path can never persist sensitive data — covered by integration tests against an in-memory SQLite override so CI needs no Postgres.',
        },
        {
          title: 'A multi-entity domain model',
          body: 'Clients, engagements, tasks, documents, and communications relate the way a real firm tracks work — the coherent picture an agent needs to operate over, rather than scattered files.',
        },
      ],
      role: 'Sole engineer — the platform (auth, data model, API), the PII-gated ingest pipeline and its test suite, and the agentic layer and review UI.',
    },
  },
  {
    name: 'DCB Research',
    slug: 'dcb-research',
    blurb:
      'A research platform over SEC filings, XBRL company facts, and federal/state tax sources: ingest, normalize into Postgres, then search, diff filings, and compare companies on revenue, margin, debt, liquidity, and risk-text changes. The source-data backbone DCB Public distills from.',
    tech: ['Python', 'FastAPI', 'XBRL', 'PostgreSQL', 'React'],
    award: 'Building',
    links: [],
    detail: {
      oneLiner: 'A source-data backbone over SEC filings + tax sources — queryable analytics, filing diffs, and the corpus DCB Public distills from.',
      status: 'Scaffold · building',
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
    name: 'DCB Public',
    slug: 'dcb-public',
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

  {
    name: 'Open Claw Life Coach',
    slug: 'open-claw-life-coach',
    blurb:
      'A personal operating system: an agent that continuously accumulates context across goals, career, projects, health, finance, and journal — with layered memory, a decision log, and an automatic weekly review — so it understands not just what you did, but why.',
    tech: ['LLM agents', 'Memory', 'Markdown', 'Personal infra'],
    award: 'Personal · building',
    isPrivate: true,
    links: [],
    detail: {
      oneLiner: 'A personal operating system — an agent that accumulates the context of your life and reasons over it.',
      status: 'Personal · building',
      problem:
        "Chatbots forget. A genuinely useful personal agent needs durable, structured context — goals, career, health, finances, projects, and the reasoning behind decisions — collected automatically rather than re-typed every session. The hard part isn't the model; it's the context system around it.",
      architecture: [
        'Context is organized as a Life OS — version-controlled Markdown across Goals, Career, Projects, Health, Finance, Relationships, Journal, Knowledge, and Preferences. Plain files keep the user in control and make the system easy to evolve without locking into a particular database or note app.',
        "Memory works in three layers: short-term (today's tasks, the current sprint, live conversations), medium-term (this week's goals, active projects, recruiters in flight), and long-term (career history, résumé, coding style, health trends, interview stories). A weekly review rolls short-term context into long-term, updates goals, and archives completed work.",
        'A decision log records every important decision with its reasoning, the alternatives considered, and a review date — so over a year the agent understands why choices were made, not just what happened. Context collection is automated through a prioritized set of integrations (GitHub activity, Calendar, Gmail, a job-application tracker, fitness data, daily journal) layered in over time.',
      ],
      stack: [
        { group: 'Core', items: ['LLM agent', 'tool use', 'version-controlled Markdown'] },
        { group: 'Memory', items: ['short / medium / long-term tiers', 'decision log', 'weekly review'] },
        { group: 'Integrations (roadmap)', items: ['GitHub', 'Google Calendar', 'Gmail', 'fitness data', 'job tracker'] },
      ],
      challenges: [
        {
          title: 'Automating context collection',
          body: 'The value is proportional to how little you have to type. Pulling context from GitHub, calendar, email, workouts, and notes — while keeping the user in control of it — is the core engineering problem.',
        },
        {
          title: 'Layered memory that stays useful',
          body: "Promoting the right short-term context into long-term memory (and archiving the rest) on a weekly cadence, so the agent's working set stays relevant instead of bloating.",
        },
        {
          title: 'A decision log with reasoning',
          body: 'Recording not just what was decided but why — with alternatives and a review date — so the system can reflect on past reasoning, not just past events.',
        },
      ],
      role: 'Sole designer and engineer — the Life OS schema, the memory tiers, the decision log, and the integration pipeline.',
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
