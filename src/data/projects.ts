export interface Project {
  name: string;
  blurb: string;
  tech: string[];
  image?: string;
  accent?: boolean; // featured / larger card
  award?: string;
  isPrivate?: boolean; // private repo — no public link
  handCoded?: boolean; // genuinely hand-written, not AI-generated
  links: { label: string; href: string }[];
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
  {
    name: 'CPA Copilot',
    blurb:
      'A copilot overlay built for the desktop accounting software CPAs already live in. Designed so older, non-technical finance professionals get AI assistance without leaving their tools or learning anything new — meeting traditional software where it is.',
    tech: ['Desktop overlay', 'LLM', 'CPA workflows'],
    award: 'Private · building',
    isPrivate: true,
    links: [],
  },
  {
    name: 'CPA Practice',
    blurb:
      'A full-stack, agentic CPA practice: agents run the repetitive accounting work end to end while humans stay in the loop to review and approve. The firm, reimagined as software.',
    tech: ['Agentic', 'Full-stack', 'Automation'],
    award: 'Private · building',
    isPrivate: true,
    links: [],
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
      'A full-stack clone of Robinhood — live market data, watchlists, and simulated trading with real-time price charts.',
    tech: ['Ruby on Rails', 'React', 'Redux', 'PostgreSQL'],
    image: '/images/UH.png',
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
