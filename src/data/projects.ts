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
// Asset fields (diagram, screenshots, video) are optional, pages render a
// labelled placeholder until the real asset is dropped into /public/images.
export interface ProjectDetail {
  oneLiner: string;
  status: string; // e.g. "Private · in daily use", "Scaffold · early"
  problem: string;
  architecture: string[]; // one entry per paragraph
  diagram?: string; // /images/<slug>-architecture.(png|svg)
  systemUrl?: string; // path to a self-contained HTML system-design diagram (embedded as an iframe)
  workflowUrl?: string; // path to a self-contained HTML workflow diagram (embedded as an iframe)
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
  isPrivate?: boolean; // private repo, no public code link
  handCoded?: boolean; // genuinely hand-written, not AI-generated
  demo?: string; // internal path to a live, interactive demo (e.g. "/ask")
  links: { label: string; href: string }[];
  detail?: ProjectDetail;
}

// Ordered by how I'd want a recruiter or founder to read them:
// current work first, then the strongest builds.
export const projects: Project[] = [
  // ---- Vertical AI for finance & accounting (the DCB suite) ----
  {
    name: 'DCB Copilot',
    slug: 'dcb-copilot',
    blurb:
      'A screen-aware desktop overlay for CPAs: hit a hotkey, it reads whatever accounting software is on screen, and answers in context, no copy-paste, no leaving your tools.',
    tech: ['Rust', 'Tauri', 'React', 'Claude vision', 'On-device RAG'],
    award: 'Private · building',
    isPrivate: true,
    links: [],
    detail: {
      oneLiner: 'A screen-aware AI copilot overlay, built by a practicing CPA for daily use.',
      status: 'Private · in daily use',
      systemUrl: '/dcb-copilot-system.html',
      problem:
        'CPAs live inside legacy desktop software, tax prep tools, Excel workpapers, QuickBooks, financial PDFs. Most AI tooling assumes you will copy-paste into a chat tab, which is a non-starter mid-workpaper for a non-technical finance professional. The screen is the context that AI tools throw away.',
      architecture: [
        'A frameless, always-on-top desktop overlay built on Tauri 2, a Rust core with a React/TypeScript webview UI. A global hotkey captures an in-memory screenshot plus the frontmost application, and sends it straight from the machine to Claude (vision) with a CPA/tax system prompt. The answer streams back into the overlay.',
        'Firm documents are searchable on-device: a local RAG pipeline embeds Markdown/PDF/text with BGE-base, stores a JSON vector index in the app data directory, and reranks candidates with a bge-reranker cross-encoder before injecting cited context. No server sits in the LLM loop, the user brings their own Anthropic key.',
        'A separate decorated Settings window (opened from the dock) manages the API key, model tier, opacity, customizable hotkeys, and the knowledge base, kept out of the floating overlay so the assistant stays minimal.',
      ],
      stack: [
        { group: 'Desktop core', items: ['Rust', 'Tauri 2', 'global-shortcut', 'active-win'] },
        { group: 'UI', items: ['React', 'TypeScript', 'Vite'] },
        { group: 'AI / retrieval', items: ['Anthropic Claude (vision)', 'fastembed, BGE-base', 'bge-reranker', 'pdf-extract'] },
      ],
      challenges: [
        {
          title: 'Cross-window state sync on macOS',
          body: 'The overlay and Settings windows are two separate webviews that do not reliably share localStorage on macOS. Settings changes (API key, model, opacity, hotkeys) are synced by emitting the full settings snapshot in a Tauri event payload, so the overlay applies them live.',
        },
        {
          title: 'On-device retrieval without a server',
          body: 'Embeddings, a JSON vector index, and a cross-encoder reranker all run locally so firm documents never leave the machine, while keeping the multi-gigabyte model cache out of version control.',
        },
        {
          title: 'Confidentiality-first capture',
          body: 'Screenshots are captured in memory and never written to disk; taxpayer PII (SSN/EIN) is redacted in responses; and because it is bring-your-own-key, requests go straight to Anthropic with no backend of ours in the loop.',
        },
      ],
      role: 'Sole engineer and product owner, Rust backend, React overlay, the on-device RAG pipeline, and the multi-window UX.',
    },
  },
  {
    name: 'DCB Practice',
    slug: 'dcb-practice',
    blurb:
      'An AI-native accounting firm: agents run the repetitive firm workflows, tax prep, bookkeeping, document collection, cleanup, review, and close, while humans review and approve. Built on a practice-management platform that is the system of record, with a PII-gated ingest, so every action an agent takes is auditable.',
    tech: ['Agentic AI', 'FastAPI', 'PostgreSQL', 'Next.js'],
    award: 'Private · building',
    isPrivate: true,
    links: [],
    detail: {
      oneLiner: 'Not software a firm uses, the firm itself, delivered as software: agents do the work, humans approve.',
      status: 'Private · building',
      systemUrl: '/dcb-practice-system.html',
      workflowUrl: '/dcb-practice-workflow.html',
      problem:
        'The spend on professional services dwarfs the spend on software, and accounting, tax, and audit are among the most outsourced of all, which makes them the strongest candidates to be replaced, not just improved. Inside a firm the hours disappear into the same repetitive work every season: tax prep, bookkeeping, document chasing, cleanup, reconciliations, review, and close. The opportunity is not another tool that helps a CPA work faster; it is to deliver that work itself. But you cannot let agents touch real client work without a system of record, an audit trail, and a hard guarantee that sensitive data is handled correctly.',
      architecture: [
        "The substrate is a FastAPI + SQLAlchemy + PostgreSQL platform that is the firm's single source of truth: JWT auth, and clients, engagements, tasks, documents, and communications, with a dashboard summary. This is what makes agent work reviewable, every action lands against a real record a human can audit and approve.",
        'On top of it, an agentic layer runs the repetitive firm workflows, tax prep, bookkeeping, document collection, cleanup, review, and close, and feeds every result back through a work-session ingest endpoint that rejects unredacted PII (SSN/EIN) with a 422 before anything is written, so automation can never persist sensitive data. Nothing an agent produces is final until a human approves it in the Next.js (App Router) review surface, and every step lands as an auditable record. Docker Compose runs local Postgres; pytest runs in CI.',
      ],
      stack: [
        { group: 'Backend', items: ['Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Pydantic', 'JWT'] },
        { group: 'AI', items: ['LLM agents', 'tool use', 'human-in-the-loop review', 'audit trail'] },
        { group: 'Frontend / infra', items: ['Next.js (App Router)', 'React', 'TypeScript', 'Docker', 'pytest', 'GitHub Actions'] },
      ],
      challenges: [
        {
          title: 'Agents that touch real work, safely',
          body: 'Letting agents run tax prep, bookkeeping, and close end to end requires every action to be reviewable and reversible, landed against a system of record a human approves, not a black box that just emits an answer.',
        },
        {
          title: 'PII-gated ingest',
          body: 'Unredacted SSN/EIN in an ingested work session is rejected with a 422 at the boundary, so the automated path can never persist sensitive data, covered by integration tests against an in-memory SQLite override so CI needs no Postgres.',
        },
        {
          title: 'A multi-entity domain model',
          body: 'Clients, engagements, tasks, documents, and communications relate the way a real firm tracks work, the coherent picture an agent needs to operate over, rather than scattered files.',
        },
      ],
      role: 'Sole engineer, the platform (auth, data model, API), the PII-gated ingest pipeline and its test suite, and the agentic layer and review UI.',
    },
  },
  {
    name: 'DCB Research',
    slug: 'dcb-research',
    blurb:
      'A research platform over SEC filings, XBRL company facts, and federal/state tax sources: ingest, normalize into Postgres, then search, diff filings, and compare companies on revenue, margin, debt, liquidity, and risk-text changes. The shared grounding backbone for the suite: the Practice agents and DCB Public both ground their answers in it.',
    tech: ['Python', 'FastAPI', 'XBRL', 'PostgreSQL', 'React'],
    award: 'Private · building',
    isPrivate: true,
    links: [],
    detail: {
      oneLiner: 'A research backbone over SEC filings + tax sources: normalized analytics plus hybrid retrieval and grounded, cited answers, the shared corpus both the Practice agents and DCB Public ground on.',
      status: 'Building',
      systemUrl: '/dcb-research-system.html',
      problem:
        "Public companies' numbers live in SEC filings, but they are buried in EDGAR and XBRL. Comparing companies, spotting what actually changed between two filings, in the financials or the risk text, or getting a grounded answer you can trust is slow, manual work.",
      architecture: [
        'A practical SEC data pipeline: ingest SEC submissions and XBRL company facts for a controlled universe of tickers, store raw JSON and documents in object storage, then normalize filing metadata and financial facts into PostgreSQL.',
        'A FastAPI backend serves analytics, revenue, margin, debt, liquidity, risk-text changes, and filing summaries, to a React dashboard, alongside a retrieval layer for question-answering over the corpus.',
        'Retrieval is hybrid: semantic embeddings and BM25 keyword search over filing sections, fused with reciprocal-rank fusion, feed a grounded answer that cites the specific sections it used. A dependency-free hashing embedder keeps retrieval runnable with no API key. And quality is measured, not assumed, an eval harness scores retrieval (hit@k against a gold set, offline) and generation (answer groundedness via an LLM judge), and runs in CI.',
      ],
      stack: [
        { group: 'Pipeline', items: ['Python', 'SEC EDGAR', 'XBRL', 'object storage'] },
        { group: 'Backend', items: ['FastAPI', 'PostgreSQL', 'SQLAlchemy'] },
        { group: 'Retrieval & evals', items: ['hybrid search (semantic + BM25 · RRF)', 'grounded citations', 'eval harness (hit@k · LLM-judge)'] },
        { group: 'Frontend', items: ['React', 'TypeScript'] },
      ],
      challenges: [
        {
          title: 'XBRL normalization',
          body: 'Company facts arrive as sprawling, inconsistently-tagged XBRL taxonomies; turning them into clean, comparable financial facts is the core of the pipeline.',
        },
        {
          title: 'Measured retrieval quality',
          body: 'Hybrid retrieval (semantic + BM25, fused with reciprocal-rank fusion) grounds answers in specific filing sections; an eval harness scores retrieval hit@k and answer groundedness so regressions are caught, not shipped.',
        },
        {
          title: 'Filing diffing',
          body: 'Detecting meaningful change between filings, both in the structured financials and in narrative risk text, rather than surfacing noise.',
        },
      ],
      role: 'Sole engineer, the ingestion pipeline, normalization schema, API and dashboard, the hybrid-retrieval layer, and the eval harness.',
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
    demo: '/ask',
    links: [],
    detail: {
      oneLiner: 'A vetted finance knowledge base with a citation-grounded AI advisor.',
      status: 'Private · building',
      systemUrl: '/dcb-public-system.html',
      problem:
        'Personal-finance information online is either shallow SEO filler or paywalled and ungrounded. People want vetted, sourced explainers, and an AI advisor that answers from that corpus with citations, with a clear line between education and personalized advice.',
      architecture: [
        'A FastAPI + SQLAlchemy + PostgreSQL backend holds a corpus of vetted explainers. A Claude-backed RAG advisor answers grounded in that corpus and returns citations, free for partner-firm clients, a subscriber feature otherwise.',
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
          body: 'Keeping the product clearly on the educational-information side of the line, and modeling entitlement across two products without a shared database.',
        },
      ],
      role: 'Sole engineer, corpus model, the RAG advisor, the entitlement link, and the marketing/KB front-end.',
    },
  },

  {
    name: 'DD-KB',
    slug: 'dd-kb',
    image: '/images/DD-KB.png',
    blurb:
      'A purpose-organized Obsidian knowledge base (career, DCB, durable engineering notes) plus a dependency-free local RAG engine over it: BM25 retrieval, heading-aware chunks with citations, grounded cited answers, a browser UI, and an Obsidian sidebar plugin. Pure Python standard library, re-indexes on change, and runs entirely on localhost.',
    tech: ['Python (stdlib)', 'RAG', 'BM25', 'Obsidian plugin'],
    award: 'Local RAG',
    handCoded: true,
    links: [{ label: 'Repository', href: 'https://github.com/dingtianding/DD-KB-App' }],
    detail: {
      oneLiner: 'A personal knowledge base with a dependency-free local RAG engine: retrieve by meaning, get cited answers, never leave your machine.',
      status: 'Open-source engine · private vault',
      problem:
        'Useful knowledge scatters across chat histories, bookmarks, PDFs, and note apps, and an AI assistant re-derives its context from scratch every session. The goal is a durable, curated knowledge layer that both a human and an assistant can retrieve from, with grounded, cited answers, without shipping private career and product notes to a third-party service. The hard part is not the model; it is retrieval that stays fast and honest, capture that stays low-friction, and a system that never leaves the machine.',
      architecture: [
        'The corpus is an Obsidian vault, purpose-organized (voice, career, DCB, durable engineering knowledge, personal references) with explicit rules about what to keep and what to exclude: an Inbox and Templates are held out of retrieval until curated, and no secrets or PII are stored. Plain Markdown keeps the owner in control and the vault portable.',
        'The engine is a dependency-free Python service (standard library only) that indexes Markdown into heading-aware chunks carrying their source path and line numbers, and retrieves with in-memory BM25. The index re-builds automatically when a note changes, so nothing needs restarting, and it binds to 127.0.0.1 so the vault is never exposed over the network.',
        'Retrieval works with no API key. An optional grounded-answer path synthesizes a cited response from the retrieved excerpts through the OpenAI Responses API, keyed only through the environment. Two surfaces read the same index: a browser UI and an Obsidian right-sidebar plugin.',
      ],
      stack: [
        { group: 'Engine', items: ['Python (standard library only)', 'BM25 retrieval', 'in-memory index', 'http.server'] },
        { group: 'Corpus', items: ['Obsidian', 'Markdown', 'heading-aware chunking'] },
        { group: 'Answers / UI', items: ['OpenAI Responses API (optional)', 'browser UI', 'Obsidian sidebar plugin'] },
      ],
      challenges: [
        {
          title: 'Zero dependencies, on purpose',
          body: 'BM25 retrieval, an HTTP server, and change-detection built on nothing but the Python standard library, so the tool installs and runs anywhere python3 exists, with no packages to manage.',
        },
        {
          title: 'Grounded, not guessed',
          body: 'Every chunk carries its source path and line numbers, so an answer cites exactly where it came from. Retrieval runs with no key; generation is opt-in, so the default path never calls out.',
        },
        {
          title: 'Private by construction',
          body: 'Binds to localhost only, never exposes the vault over the network, and holds the uncurated Inbox, Templates, and any secrets out of the index.',
        },
      ],
      role: 'Sole author and engineer: the vault organization and rules, the BM25 retrieval and chunking, the auto-refreshing index, the browser UI, and the Obsidian plugin.',
    },
  },

  {
    name: 'Tape',
    blurb:
      'A live-markets dashboard built to explore Angular 19 and RxJS: real-time price streams, signal-driven state, sparkline trends, and a Reactive-Forms order ticket with conditional validation. Fully client-side, no backend.',
    tech: ['Angular 19', 'RxJS', 'TypeScript', 'Reactive Forms'],
    award: 'Angular',
    demo: '/tape/',
    links: [{ label: 'Repository', href: 'https://github.com/dingtianding/tape' }],
  },

  // ---- Earlier builds ----
  {
    name: 'Xelsius',
    blurb:
      'An earlier exploration of agent-proposed, reviewable diffs on financial data, the "Cursor for accountants" idea that grew into the DCB suite.',
    tech: ['TypeScript', 'Python', 'LLM agents'],
    award: 'Earlier build',
    links: [{ label: 'Repository', href: 'https://github.com/dingtianding/Xelsius' }],
  },
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
