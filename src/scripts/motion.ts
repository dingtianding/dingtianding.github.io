import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

// Mark ready so the anti-flash CSS releases the hidden reveal elements.
root.classList.add('is-ready');

if (reduceMotion) {
  // Honor the user's preference: no smooth scroll, no entrance animation.
  gsap.set('[data-reveal]', { clearProps: 'all' });
} else {
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

  // ---- Hero load timeline: staggered reveal ----
  const heroBits = gsap.utils.toArray<HTMLElement>('.hero [data-reveal]');
  gsap.timeline({ defaults: { ease: 'power3.out' } }).from(heroBits, {
    y: 26,
    opacity: 0,
    duration: 0.9,
    stagger: 0.08,
    delay: 0.1,
  });

  // ---- Scroll reveals for everything below the fold ----
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.closest('.hero')) return; // hero handled above
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });
}

// Footer year, regardless of motion preference.
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
