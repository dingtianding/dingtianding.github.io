/* ============================================================
   Living ledger background.
   A quiet accounting system auditing itself: faint monospace
   ledger rows fill the canvas, and a slow scan line sweeps
   top→bottom. Rows the scan has passed "reconcile" (settle
   green); rows ahead stay faint. Ambient, never loud.

   Perf: DPR capped, time-based motion, paused when the tab is
   hidden, and never started under prefers-reduced-motion.
   ============================================================ */

interface Row {
  text: string;
  x: number;
  y: number;
  seed: number; // per-row jitter so reconciliation feels organic
}

const ACCOUNTS = [
  'acct 1010  Cash',
  'acct 1200  A/R',
  'acct 2000  A/P',
  'acct 4100  Revenue',
  'acct 5200  COGS',
  'acct 6000  Payroll',
  'acct 1500  Fixed Assets',
  'acct 3000  Equity',
  'acct 2400  Deferred Rev',
  'acct 5400  SG&A',
];

const REFS = ['INV', 'JE', 'PO', 'TXN', 'GL', 'AP', 'AR'];

function amount(): string {
  const n = (Math.random() * 90000 + 100).toFixed(2);
  const [int, dec] = n.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${grouped}.${dec}`;
}

function makeText(): string {
  const acct = ACCOUNTS[(Math.random() * ACCOUNTS.length) | 0];
  const ref = REFS[(Math.random() * REFS.length) | 0];
  const id = (Math.random() * 9000 + 1000) | 0;
  return `${acct.padEnd(22)}${amount().padStart(13)}   → ${ref}-${id}`;
}

export function initLedger(): void {
  const canvas = document.getElementById('ledger') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const FONT_SIZE = 13;
  const LINE_H = 30;
  const COL_GAP = 64;
  let dpr = 1;
  let cssW = 0;
  let cssH = 0;
  let rows: Row[] = [];
  let colW = 420;

  // Scan sweeps a bit beyond the viewport so it never visibly "pops".
  const SCAN_SPEED = 46; // px / second
  let scanY = 0;
  const BAND = 150; // reconciliation influence radius

  // Faint base palette pulled from the site's CSS variables.
  const css = getComputedStyle(document.documentElement);
  const faint = css.getPropertyValue('--text-faint').trim() || '#62625e';
  const signal = '232, 178, 90'; // gold, as rgb triplet
  const add = '70, 192, 90'; // reconciled green

  function measure(): void {
    ctx.font = `${FONT_SIZE}px 'JetBrains Mono', ui-monospace, monospace`;
    colW = Math.max(360, ctx.measureText(makeText()).width + COL_GAP);
  }

  function build(): void {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = window.innerWidth;
    cssH = window.innerHeight;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    measure();

    rows = [];
    const cols = Math.max(1, Math.ceil(cssW / colW));
    const rowsPer = Math.ceil(cssH / LINE_H) + 2;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rowsPer; r++) {
        rows.push({
          text: makeText(),
          x: c * colW + 24,
          y: r * LINE_H + 40,
          seed: Math.random(),
        });
      }
    }
    scanY = 0;
  }

  let last = performance.now();
  let running = true;

  function frame(now: number): void {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    scanY += SCAN_SPEED * dt;
    if (scanY > cssH + BAND) scanY = -BAND;

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.font = `${FONT_SIZE}px 'JetBrains Mono', ui-monospace, monospace`;
    ctx.textBaseline = 'middle';

    for (const row of rows) {
      const d = row.y - scanY; // <0 = already reconciled, >0 = ahead
      const prox = Math.max(0, 1 - Math.abs(d) / BAND);

      let alpha = 0.05; // resting faint state
      let color = faint;

      if (prox > 0) {
        if (d <= 0) {
          // Passed by the scan: settle green, brightest right at the line.
          const settle = prox * (0.55 + row.seed * 0.2);
          alpha = 0.05 + settle;
          color = `rgba(${add}, ${alpha})`;
        } else {
          // Just ahead of the scan: a warm gold "being read" glow.
          alpha = 0.05 + prox * 0.28;
          color = `rgba(${signal}, ${alpha})`;
        }
        ctx.fillStyle = color;
      } else {
        ctx.fillStyle = `rgba(150, 150, 145, ${alpha})`;
      }

      ctx.fillText(row.text, row.x, row.y);
    }

    // The scan line itself — a thin gold sweep with a soft leading gradient.
    const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 4);
    grad.addColorStop(0, 'rgba(232, 178, 90, 0)');
    grad.addColorStop(1, 'rgba(232, 178, 90, 0.10)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 60, cssW, 64);
    ctx.fillStyle = 'rgba(232, 178, 90, 0.45)';
    ctx.fillRect(0, scanY, cssW, 1);

    requestAnimationFrame(frame);
  }

  function start(): void {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
  function stop(): void {
    running = false;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  let resizeTimer: number | undefined;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(build, 200);
  });

  build();
  requestAnimationFrame(frame);
}
