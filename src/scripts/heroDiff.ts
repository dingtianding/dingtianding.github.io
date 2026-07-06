/* ============================================================
   Hero diff — the signature moment.
   The accountant line types itself out, gets struck through
   ("removed"), then the engineer line writes in with a live
   caret, as if an agent proposed a reviewable change and a
   human approved it. Text lives in the markup for no-JS /
   reduced-motion; here we clear it and re-type on load.
   ============================================================ */

import { gsap } from 'gsap';

export function initHeroDiff(): gsap.core.Timeline | null {
  const diff = document.querySelector<HTMLElement>('[data-diff]');
  if (!diff) return null;

  const delLine = diff.querySelector<HTMLElement>('.diff__line--del');
  const delText = diff.querySelector<HTMLElement>('.diff__line--del .diff__text');
  const addText = diff.querySelector<HTMLElement>('.diff__line--add .diff__text');
  const caret = diff.querySelector<HTMLElement>('.diff__caret');
  const approve = diff.querySelector<HTMLElement>('.diff__approve');
  if (!delLine || !delText || !addText) return null;

  const delFull = delText.textContent ?? '';
  const addFull = addText.textContent ?? '';

  // Clear immediately so the full strings never flash before typing.
  delText.textContent = '';
  addText.textContent = '';
  gsap.set(diff, { '--strike': 0 });
  gsap.set(approve, { opacity: 0, y: 4 });

  // Char-by-char typer via an animated counter — no extra GSAP plugin.
  const type = (el: HTMLElement, text: string, dur: number) => {
    const state = { n: 0 };
    return gsap.to(state, {
      n: text.length,
      duration: dur,
      ease: 'none',
      onUpdate: () => {
        el.textContent = text.slice(0, Math.round(state.n));
      },
    });
  };

  const tl = gsap.timeline({ delay: 0.85, defaults: { ease: 'power2.out' } });

  // 1. Type the accountant line.
  tl.add(type(delText, delFull, Math.max(0.6, delFull.length * 0.02)));

  // 2. Strike it through — the change is "removed".
  tl.to(diff, { '--strike': 1, duration: 0.4, ease: 'power2.inOut' }, '+=0.3');
  tl.to(delLine, { opacity: 0.5, duration: 0.35 }, '<0.05');

  // 3. Caret drops in and starts blinking.
  tl.to(caret, { opacity: 1, y: 0, duration: 0.2 }, '+=0.1');
  tl.add(() => caret?.classList.add('is-blinking'));

  // 4. Write the engineer line.
  tl.add(type(addText, addFull, Math.max(0.7, addFull.length * 0.022)), '+=0.05');

  // 5. Resolution beat: approved.
  tl.to(approve, { opacity: 1, y: 0, duration: 0.5 }, '+=0.35');

  return tl;
}
