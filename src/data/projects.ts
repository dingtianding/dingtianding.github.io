export interface Project {
  name: string;
  blurb: string;
  tech: string[];
  image?: string;
  accent?: boolean; // featured / larger card
  award?: string;
  links: { label: string; href: string }[];
}

// Ordered by how I'd want a recruiter or founder to read them:
// current work first, then the strongest builds.
export const projects: Project[] = [
  {
    name: 'Xelsius',
    blurb:
      'Cursor for accountants. An agent that reads financial data and proposes deterministic, reviewable diffs — so the human approves a change instead of hunting for it. The tool I wish I had when I did this work by hand.',
    tech: ['TypeScript', 'LLM agents', 'Deterministic diffs', 'Fintech'],
    accent: true,
    award: 'Building now',
    links: [{ label: 'Repository', href: 'https://github.com/dingtianding/Xelsius' }],
  },
  {
    name: 'Aurora',
    blurb:
      'An AI emotional-wellness companion: conversational support, mood tracking, and reflection tools in one private space. Built in a weekend and took first place.',
    tech: ['Flask', 'React', 'Redux', 'Docker', 'AWS'],
    image: '/images/Aurora.png',
    award: 'Hackathon winner',
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
    links: [{ label: 'Repository', href: 'https://github.com/dingtianding/Underhood' }],
  },
  {
    name: 'mapStatesToPosts',
    blurb:
      'A MERN photo-postcard app for exploring, uploading, and sharing snapshots across all 50 US states.',
    tech: ['MongoDB', 'Express', 'React', 'Node'],
    image: '/images/mSTP.png',
    links: [{ label: 'Repository', href: 'https://github.com/yuhmanashi/mapStatesToPosts' }],
  },
  {
    name: 'Castlevania97',
    blurb:
      'A 2D arcade fighter rendered on HTML canvas, hand-built in vanilla JavaScript as an homage to KOF97 and Castlevania.',
    tech: ['JavaScript', 'Canvas'],
    image: '/images/C97.png',
    links: [
      { label: 'Play', href: 'https://dingtianding.github.io/Castlevania97/' },
      { label: 'Repository', href: 'https://github.com/dingtianding/Castlevania97' },
    ],
  },
];
