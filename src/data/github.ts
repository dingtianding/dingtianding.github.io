/* ============================================================
   Build-time GitHub loader.
   Projects carry their repo URL in `links`; here we parse the
   owner/name out of that URL and fetch public repo stats from
   the GitHub REST API *at build time*. No client JS, no token
   needed for public data, fully static output, deterministic
   by design. A scheduled rebuild keeps the figures current.

   Every failure path degrades to "no stats" so a card always
   renders, even offline or rate-limited.
   ============================================================ */

export interface RepoStats {
  stars: number;
  language: string | null;
  pushedAt: string; // ISO 8601
  htmlUrl: string;
}

const API = 'https://api.github.com/repos/';

/** Extract `owner/name` from a github.com URL, else null. */
export function parseRepo(href: string): string | null {
  const m = href.match(/github\.com\/([^/\s]+)\/([^/#?\s]+)/i);
  if (!m) return null;
  return `${m[1]}/${m[2].replace(/\.git$/, '')}`;
}

/** Pick the GitHub repo for a project from its links (prefers a
 *  link labelled "Repository"). Non-GitHub hosts (e.g. Codeberg)
 *  return null and simply carry no live stats. */
export function repoForLinks(links: { label: string; href: string }[]): string | null {
  const preferred =
    links.find((l) => /repository|repo|source|github/i.test(l.label)) ??
    links.find((l) => /github\.com/i.test(l.href));
  return preferred ? parseRepo(preferred.href) : null;
}

/** Fetch stats for a set of `owner/name` slugs. Returns a map;
 *  missing keys mean "unavailable" and should render without stats. */
export async function fetchRepoStats(slugs: string[]): Promise<Record<string, RepoStats>> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'dingtianding-portfolio-build',
  };
  // Optional: bumps the rate limit from 60→5000/hr inside CI. Never
  // shipped to the client, this file only runs at build time. Read
  // from both Astro's env and process.env so the Actions-provided
  // token is picked up regardless of how it is injected.
  const token =
    import.meta.env.GITHUB_TOKEN || (globalThis as any).process?.env?.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const out: Record<string, RepoStats> = {};
  await Promise.all(
    [...new Set(slugs)].map(async (slug) => {
      try {
        const res = await fetch(API + slug, { headers });
        if (!res.ok) return;
        const d: any = await res.json();
        out[slug] = {
          stars: d.stargazers_count ?? 0,
          language: d.language ?? null,
          pushedAt: d.pushed_at ?? '',
          htmlUrl: d.html_url ?? '',
        };
      } catch {
        /* offline / rate-limited, skip; the card renders without stats */
      }
    }),
  );
  return out;
}

/** Compact relative age, e.g. "3d ago", "5mo ago", "2y ago". */
export function relativeTime(iso: string): string {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
