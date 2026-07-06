import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initLedger } from './ledger';
import { initHeroDiff } from './heroDiff';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

// Mark ready so the anti-flash CSS releases the hidden reveal elements.
root.classList.add('is-ready');

/** Wrap each character of an element's text in a <span class="char">,
 *  preserving inline elements like <br>. Returns the char spans. */
function splitChars(el: HTMLElement): HTMLElement[] {
  const nodes = Array.from(el.childNodes);
  const out: HTMLElement[] = [];
  el.textContent = '';
  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Collapse template indentation so only real glyphs get wrapped.
      for (const ch of (node.textContent ?? '').replace(/\s+/g, ' ').trim()) {
        const s = document.createElement('span');
        s.className = 'char';
        s.textContent = ch === ' ' ? ' ' : ch;
        el.appendChild(s);
        out.push(s);
      }
    } else {
      el.appendChild(node.cloneNode(true));
    }
  }
  return out;
}

if (reduceMotion) {
  // Honor the user's preference: no smooth scroll, no entrance animation.
  gsap.set('[data-reveal]', { clearProps: 'all' });
} else {
  // ---- Ambient ledger background ----
  initLedger();

  // ---- Lenis smooth scroll, driven by GSAP's ticker ----
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // In-page anchor links route through Lenis for a smooth glide.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -72 });
    });
  });

  // ---- Top scroll-progress bar ----
  const bar = document.querySelector<HTMLElement>('.scroll-progress');
  if (bar) {
    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    });
  }

  // ---- Hero load timeline ----
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Name reveals character-by-character, rising into place.
  const nameEl = document.querySelector<HTMLElement>('.hero__name');
  if (nameEl) {
    const chars = splitChars(nameEl);
    heroTl.from(
      chars,
      { yPercent: 90, opacity: 0, duration: 0.9, stagger: 0.045, ease: 'power4.out' },
      0.15,
    );
  }

  // The rest of the hero staggers in (name handled above).
  const heroBits = gsap
    .utils
    .toArray<HTMLElement>('.hero [data-reveal]')
    .filter((el) => !el.classList.contains('hero__name'));
  heroTl.from(heroBits, { y: 26, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.35);

  // The signature diff: types itself out, strikes, rewrites, approves.
  initHeroDiff();

  // ---- Section titles: clip-wipe reveal ----
  gsap.utils.toArray<HTMLElement>('.section-title[data-reveal]').forEach((title) => {
    gsap.from(title, {
      clipPath: 'inset(0 100% 0 0)',
      y: 20,
      opacity: 0,
      duration: 1,
      ease: 'power4.out',
      scrollTrigger: { trigger: title, start: 'top 85%' },
    });
  });

  // ---- Generic scroll reveals (skip hero, titles, cards) ----
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.closest('.hero')) return;
    if (el.classList.contains('section-title')) return;
    if (el.classList.contains('card')) return;
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });

  // ---- Work cards: staggered batch entrance ----
  const cards = gsap.utils.toArray<HTMLElement>('.card');
  if (cards.length) {
    gsap.set(cards, { opacity: 0, y: 44 });
    ScrollTrigger.batch(cards, {
      start: 'top 90%',
      onEnter: (els) =>
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
          overwrite: true,
        }),
    });
  }

  // ---- Terminal diff: scrub reveal line-by-line, then resolve ----
  const terminal = document.querySelector<HTMLElement>('[data-terminal]');
  if (terminal) {
    const lines = gsap.utils.toArray<HTMLElement>('.t-line', terminal);
    gsap.set(lines, { opacity: 0.12 });
    const ttl = gsap.timeline({
      scrollTrigger: {
        trigger: terminal,
        start: 'top 78%',
        end: 'bottom 62%',
        scrub: 0.5,
        onUpdate: (self) => terminal.classList.toggle('is-resolved', self.progress > 0.9),
      },
    });
    lines.forEach((ln) => ttl.to(ln, { opacity: 1, duration: 0.5 }));
  }

  // ---- Magnetic buttons ----
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    const strength = 0.4;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    });
    el.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });

  // ---- Active nav link tracking ----
  const navLinks = new Map<string, HTMLElement>();
  document.querySelectorAll<HTMLElement>('.nav__links a[href^="#"]').forEach((a) => {
    const id = a.getAttribute('href')!.slice(1);
    navLinks.set(id, a);
  });
  document.querySelectorAll<HTMLElement>('section[id]').forEach((section) => {
    const link = navLinks.get(section.id);
    if (!link) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });
}

// Footer year, regardless of motion preference.
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
