// ─── 1. Animated canvas background (nebula / particle grid) ───
const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
let W = 0, H = 0;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

interface Dot { x: number; y: number; vx: number; vy: number; size: number; hue: number; }
const dots: Dot[] = [];
const DOT_COUNT = Math.min(80, Math.floor((W * H) / 20000));
for (let i = 0; i < DOT_COUNT; i++) {
  dots.push({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    size: Math.random() * 1.8 + 0.4,
    hue: Math.random() * 60 + 160, // cyan-teal-purple range
  });
}

let mx = W / 2, my = H / 2;
window.addEventListener('mousemove', (e) => {
  mx = e.clientX;
  my = e.clientY;
});

function drawBg() {
  // Slow fade instead of clearing — creates trails
  ctx.fillStyle = 'rgba(10, 10, 20, 0.08)';
  ctx.fillRect(0, 0, W, H);

  for (const d of dots) {
    d.x += d.vx;
    d.y += d.vy;
    // Wrap around
    if (d.x < 0) d.x = W;
    if (d.x > W) d.x = 0;
    if (d.y < 0) d.y = H;
    if (d.y > H) d.y = 0;
    // Mouse repel
    const ddx = d.x - mx, ddy = d.y - my;
    const dist = Math.sqrt(ddx * ddx + ddy * ddy);
    if (dist < 180) {
      const f = (180 - dist) / 180;
      d.vx += (ddx / dist) * f * 0.04;
      d.vy += (ddy / dist) * f * 0.04;
    }
    // Gentle damping
    d.vx *= 0.99;
    d.vy *= 0.99;
    // Draw
    ctx.fillStyle = `hsla(${d.hue}, 80%, 60%, 0.7)`;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw connecting lines between close dots
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x;
      const dy = dots[i].y - dots[j].y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 18000) {
        const op = 1 - d2 / 18000;
        ctx.strokeStyle = `rgba(94, 234, 212, ${op * 0.18})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawBg);
}
drawBg();

// ─── 2. Number counters ───
const counters = document.querySelectorAll<HTMLElement>('.counter');
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const el = e.target as HTMLElement;
      const target = parseInt(el.dataset.target || '0', 10);
      const duration = 1800;
      const start = performance.now();
      function tick(now: number) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(eased * target).toString();
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach((c) => countObserver.observe(c));

// ─── 3. Procedural project previews (drawn on canvas per card) ───
const previews = document.querySelectorAll<HTMLElement>('.project-preview');
previews.forEach((el) => {
  const kind = el.dataset.preview;
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 480;
  c.style.width = '100%';
  c.style.height = '100%';
  el.appendChild(c);
  const cx = c.getContext('2d')!;
  drawPreview(cx, kind || 'drift', c.width, c.height);
});

function drawPreview(cx: CanvasRenderingContext2D, kind: string, w: number, h: number) {
  // Background
  const g = cx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#0a0a14');
  g.addColorStop(1, '#13131f');
  cx.fillStyle = g;
  cx.fillRect(0, 0, w, h);

  if (kind === 'automation') {
    // Pipeline flowchart preview
    cx.fillStyle = '#0d1117';
    cx.fillRect(30, 30, w - 60, h - 60);
    cx.strokeStyle = 'rgba(94, 234, 212, 0.2)';
    cx.lineWidth = 1;
    cx.strokeRect(30, 30, w - 60, h - 60);

    // Title
    cx.fillStyle = '#5eead4';
    cx.font = '700 14px "JetBrains Mono", monospace';
    cx.fillText('AUTOMATION PIPELINE', 50, 60);
    cx.fillStyle = '#575e6d';
    cx.font = '500 11px "JetBrains Mono", monospace';
    cx.fillText('form → ai → crm → phone', 50, 78);

    // Pipeline steps (horizontal flow)
    const stepLabels = ['Form', 'Triage', 'Email', 'CRM', 'Phone', 'Done'];
    const sx = 60;
    const sy = 130;
    const stepW = (w - 120) / stepLabels.length;
    stepLabels.forEach((label, i) => {
      const x = sx + i * stepW;
      // Box
      const grd = cx.createLinearGradient(x, sy, x + stepW - 14, sy + 50);
      if (i < 4) {
        grd.addColorStop(0, '#5eead4');
        grd.addColorStop(1, '#22d3ee');
      } else {
        grd.addColorStop(0, '#1a1d25');
        grd.addColorStop(1, '#14161c');
      }
      cx.fillStyle = grd;
      cx.beginPath();
      cx.roundRect(x, sy, stepW - 14, 50, 8);
      cx.fill();
      cx.strokeStyle = i < 4 ? '#5eead4' : 'rgba(94, 234, 212, 0.3)';
      cx.lineWidth = 1.5;
      cx.stroke();

      // Label
      cx.fillStyle = i < 4 ? '#0a0a14' : '#8a92a3';
      cx.font = '700 11px "JetBrains Mono", monospace';
      cx.textAlign = 'center';
      cx.fillText(label, x + (stepW - 14) / 2, sy + 30);
      cx.textAlign = 'left';

      // Arrow to next
      if (i < stepLabels.length - 1) {
        cx.strokeStyle = i < 3 ? '#5eead4' : 'rgba(94, 234, 212, 0.3)';
        cx.lineWidth = 2;
        cx.beginPath();
        cx.moveTo(x + stepW - 14, sy + 25);
        cx.lineTo(x + stepW - 4, sy + 25);
        cx.stroke();
        cx.beginPath();
        cx.moveTo(x + stepW - 8, sy + 21);
        cx.lineTo(x + stepW - 4, sy + 25);
        cx.lineTo(x + stepW - 8, sy + 29);
        cx.stroke();
      }
    });

    // Details below
    cx.fillStyle = '#8a92a3';
    cx.font = '500 11px monospace';
    cx.fillText('POST /contact', 50, 230);
    cx.fillStyle = '#5eead4';
    cx.fillText('→  gpt-4o-mini classify', 50, 254);
    cx.fillStyle = '#8a92a3';
    cx.fillText('→  Resend transactional email', 50, 278);
    cx.fillText('→  INSERT INTO leads (id, priority, ...)', 50, 302);
    cx.fillText('→  Telegram bot ping', 50, 326);
    cx.fillText('→  Google Calendar event', 50, 350);

    cx.fillStyle = '#5eead4';
    cx.font = '700 10px monospace';
    cx.fillText('STATUS', 50, h - 60);
    cx.fillStyle = '#34d399';
    cx.beginPath();
    cx.arc(95, h - 64, 3, 0, Math.PI * 2);
    cx.fill();
    cx.fillStyle = '#e6e8ed';
    cx.fillText('done · 2.4s', 104, h - 60);
  } else if (kind === 'website') {
    // Browser window with form + automation flow
    cx.fillStyle = '#ffffff';
    cx.fillRect(30, 40, w - 60, h - 70);
    cx.fillStyle = '#e6e6eb';
    cx.fillRect(30, 40, w - 60, 26);
    cx.fillStyle = '#ff5f57';
    cx.beginPath(); cx.arc(46, 53, 4, 0, Math.PI * 2); cx.fill();
    cx.fillStyle = '#febc2e';
    cx.beginPath(); cx.arc(58, 53, 4, 0, Math.PI * 2); cx.fill();
    cx.fillStyle = '#28c840';
    cx.beginPath(); cx.arc(70, 53, 4, 0, Math.PI * 2); cx.fill();
    // Url
    cx.fillStyle = '#ffffff';
    cx.fillRect(110, 48, 420, 14);
    cx.fillStyle = '#6b7280';
    cx.font = '500 10px monospace';
    cx.fillText('nordlicht-consulting.de', 120, 59);
    // Hero
    cx.fillStyle = '#111827';
    cx.font = '800 26px "Space Grotesk", sans-serif';
    cx.fillText('Clean systems,', 50, 120);
    const grd = cx.createLinearGradient(50, 130, 400, 160);
    grd.addColorStop(0, '#2563eb');
    grd.addColorStop(1, '#06b6d4');
    cx.fillStyle = grd;
    cx.fillText('zero chaos.', 50, 155);
    // Button
    cx.fillStyle = '#2563eb';
    cx.fillRect(50, 180, 130, 34);
    cx.fillStyle = '#ffffff';
    cx.font = '600 12px sans-serif';
    cx.fillText('Book a call →', 72, 202);
    // Automation sidebar (right)
    cx.fillStyle = '#0d1117';
    cx.fillRect(w - 220, 90, 180, h - 180);
    cx.fillStyle = '#5eead4';
    cx.font = '700 10px monospace';
    cx.fillText('PIPELINE', w - 205, 110);
    // Steps
    const steps = ['Form received', 'AI classify', 'Auto reply', 'CRM push', 'Slack ping'];
    steps.forEach((s, i) => {
      const y = 135 + i * 32;
      cx.fillStyle = i < 3 ? '#5eead4' : '#374151';
      cx.beginPath();
      cx.arc(w - 200, y, 4, 0, Math.PI * 2);
      cx.fill();
      if (i < 4) {
        cx.strokeStyle = i < 2 ? '#5eead4' : '#374151';
        cx.lineWidth = 1;
        cx.beginPath();
        cx.moveTo(w - 200, y + 4);
        cx.lineTo(w - 200, y + 28);
        cx.stroke();
      }
      cx.fillStyle = i < 3 ? '#e7e7f2' : '#6b7280';
      cx.font = '500 10px sans-serif';
      cx.fillText(s, w - 186, y + 3);
    });
  } else if (kind === 'mobile') {
    // Phone frame
    const px = w / 2 - 100;
    const py = 30;
    const pw = 200;
    const ph = h - 60;
    // Bezel
    cx.fillStyle = '#000000';
    cx.beginPath();
    cx.roundRect(px, py, pw, ph, 28);
    cx.fill();
    // Screen
    const sg = cx.createLinearGradient(px, py, px, py + ph);
    sg.addColorStop(0, '#0f172a');
    sg.addColorStop(1, '#1e1b4b');
    cx.fillStyle = sg;
    cx.beginPath();
    cx.roundRect(px + 6, py + 6, pw - 12, ph - 12, 22);
    cx.fill();
    // Notch
    cx.fillStyle = '#000000';
    cx.beginPath();
    cx.roundRect(px + pw / 2 - 36, py + 6, 72, 14, 7);
    cx.fill();
    // Logo circle
    const cg = cx.createLinearGradient(px + pw / 2 - 30, py + 60, px + pw / 2 + 30, py + 120);
    cg.addColorStop(0, '#22d3ee');
    cg.addColorStop(1, '#a78bfa');
    cx.fillStyle = cg;
    cx.beginPath();
    cx.roundRect(px + pw / 2 - 32, py + 80, 64, 64, 16);
    cx.fill();
    cx.fillStyle = '#ffffff';
    cx.font = '700 28px sans-serif';
    cx.textAlign = 'center';
    cx.fillText('P', px + pw / 2, py + 122);
    // Title
    cx.fillStyle = '#ffffff';
    cx.font = '700 20px "Space Grotesk", sans-serif';
    cx.fillText('Welcome to Pulse', px + pw / 2, py + 180);
    cx.fillStyle = 'rgba(255,255,255,0.6)';
    cx.font = '500 11px sans-serif';
    cx.fillText('Your daily fitness tracker.', px + pw / 2, py + 200);
    cx.fillText('Simple rings. Zero noise.', px + pw / 2, py + 216);
    // Dots
    cx.fillStyle = '#22d3ee';
    cx.fillRect(px + pw / 2 - 18, py + 250, 16, 3);
    cx.fillStyle = 'rgba(255,255,255,0.3)';
    cx.beginPath(); cx.arc(px + pw / 2 + 4, py + 252, 2, 0, Math.PI * 2); cx.fill();
    cx.beginPath(); cx.arc(px + pw / 2 + 14, py + 252, 2, 0, Math.PI * 2); cx.fill();
    // Button
    const bg = cx.createLinearGradient(px + 24, py + 290, px + pw - 24, py + 290);
    bg.addColorStop(0, '#22d3ee');
    bg.addColorStop(1, '#06b6d4');
    cx.fillStyle = bg;
    cx.beginPath();
    cx.roundRect(px + 24, py + 280, pw - 48, 36, 14);
    cx.fill();
    cx.fillStyle = '#0f172a';
    cx.font = '700 12px sans-serif';
    cx.fillText('Get started', px + pw / 2, py + 303);
    cx.textAlign = 'left';
  } else if (kind === 'leadtriage') {
    // Lead Triage — kanban columns mockup
    const cols = [
      { label: 'HOT', color: '#f472b6', count: 3 },
      { label: 'WARM', color: '#fbbf24', count: 5 },
      { label: 'COLD', color: '#60a5fa', count: 8 },
    ];
    const colW = (w - 90) / 3;
    cx.font = '700 11px "JetBrains Mono", monospace';
    cols.forEach((col, i) => {
      const cx0 = 30 + i * (colW + 15);
      // Column bg
      cx.fillStyle = 'rgba(20, 22, 35, 0.7)';
      cx.strokeStyle = 'rgba(94, 234, 212, 0.12)';
      cx.lineWidth = 1;
      cx.fillRect(cx0, 60, colW, h - 90);
      cx.strokeRect(cx0, 60, colW, h - 90);
      // Column header dot + label
      cx.fillStyle = col.color;
      cx.beginPath();
      cx.arc(cx0 + 16, 80, 4, 0, Math.PI * 2);
      cx.fill();
      cx.fillText(col.label, cx0 + 26, 84);
      cx.fillStyle = '#575e6d';
      cx.fillText(`${col.count}`, cx0 + colW - 22, 84);
      // Cards
      for (let k = 0; k < col.count; k++) {
        const cardY = 110 + k * 50;
        if (cardY + 40 > h - 40) break;
        cx.fillStyle = 'rgba(40, 44, 62, 0.85)';
        cx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        cx.fillRect(cx0 + 10, cardY, colW - 20, 40);
        cx.strokeRect(cx0 + 10, cardY, colW - 20, 40);
        // Left accent bar (category)
        cx.fillStyle = col.color;
        cx.fillRect(cx0 + 10, cardY, 3, 40);
        // Title line
        cx.fillStyle = '#e7e7f2';
        cx.font = '600 11px Inter, sans-serif';
        const names = ['Acme Corp', 'NewCo', 'BigTech', 'Startup', 'Agency', 'Retail', 'SaaS', 'Bank', 'Media'];
        cx.fillText(names[(i * 3 + k) % names.length], cx0 + 18, cardY + 15);
        cx.fillStyle = '#8a92a3';
        cx.font = '500 10px Inter, sans-serif';
        cx.fillText('Lead · auto', cx0 + 18, cardY + 30);
        cx.font = '700 11px "JetBrains Mono", monospace';
      }
    });
    // Header banner
    cx.fillStyle = '#5eead4';
    cx.font = '700 13px "JetBrains Mono", monospace';
    cx.fillText('LEAD TRIAGE', 30, 40);
    cx.fillStyle = '#575e6d';
    cx.font = '500 11px "JetBrains Mono", monospace';
    cx.fillText('gpt-4 · classified · kanban', 160, 40);
  } else if (kind === 'drift') {
    // Flow field particle trails
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const len = 30 + Math.random() * 80;
      const a = Math.sin(x * 0.01) + Math.cos(y * 0.012) * 1.2;
      const grd = cx.createLinearGradient(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len);
      const hue = 170 + (x / w) * 90;
      grd.addColorStop(0, `hsla(${hue}, 80%, 65%, 0)`);
      grd.addColorStop(0.5, `hsla(${hue}, 80%, 65%, 0.6)`);
      grd.addColorStop(1, `hsla(${hue}, 80%, 65%, 0)`);
      cx.strokeStyle = grd;
      cx.lineWidth = 1.2;
      cx.beginPath();
      cx.moveTo(x, y);
      cx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      cx.stroke();
    }
  } else if (kind === 'tictactoe') {
    // TTT board with X and O
    cx.strokeStyle = 'rgba(255,255,255,0.2)';
    cx.lineWidth = 3;
    const cs = 100;
    const ox = w/2 - cs*1.5, oy = h/2 - cs*1.5;
    for (let i = 1; i < 3; i++) {
      cx.beginPath(); cx.moveTo(ox + cs*i, oy); cx.lineTo(ox + cs*i, oy + cs*3); cx.stroke();
      cx.beginPath(); cx.moveTo(ox, oy + cs*i); cx.lineTo(ox + cs*3, oy + cs*i); cx.stroke();
    }
    // X (cyan)
    cx.strokeStyle = '#22d3ee';
    cx.lineWidth = 6;
    cx.lineCap = 'round';
    const drawX = (col: number, row: number) => {
      const x0 = ox + cs * col + 25, y0 = oy + cs * row + 25;
      const x1 = ox + cs * (col+1) - 25, y1 = oy + cs * (row+1) - 25;
      cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(x1, y1); cx.stroke();
      cx.beginPath(); cx.moveTo(x1, y0); cx.lineTo(x0, y1); cx.stroke();
    };
    const drawO = (col: number, row: number) => {
      cx.strokeStyle = '#f472b6';
      cx.beginPath();
      cx.arc(ox + cs*col + cs/2, oy + cs*row + cs/2, cs/2 - 22, 0, Math.PI*2);
      cx.stroke();
      cx.strokeStyle = '#22d3ee';
    };
    drawX(0, 0); drawO(1, 0); drawX(1, 1); drawO(2, 1); drawX(2, 2);
  } else if (kind === 'shell') {
    // Terminal mockup
    cx.fillStyle = 'rgba(20, 20, 35, 0.8)';
    cx.fillRect(40, 40, w - 80, h - 80);
    cx.strokeStyle = 'rgba(94, 234, 212, 0.25)';
    cx.lineWidth = 1;
    cx.strokeRect(40, 40, w - 80, h - 80);
    // Traffic lights
    const dots = ['#f87171', '#fbbf24', '#5eead4'];
    dots.forEach((c, i) => { cx.fillStyle = c; cx.beginPath(); cx.arc(60 + i*16, 60, 5, 0, Math.PI*2); cx.fill(); });
    // Text lines
    cx.font = '600 18px "JetBrains Mono", monospace';
    cx.fillStyle = '#5eead4'; cx.fillText('MyShell>', 60, 130);
    cx.fillStyle = '#e7e7f2'; cx.fillText('help', 170, 130);
    cx.fillStyle = '#9d9dbd'; cx.font = '500 15px "JetBrains Mono", monospace';
    cx.fillText('Built-in commands:', 60, 160);
    cx.fillText('  cd <dir>', 60, 185);
    cx.fillText('  echo <text>', 60, 205);
    cx.fillText('  exit', 60, 225);
    cx.fillStyle = '#5eead4'; cx.font = '600 18px "JetBrains Mono", monospace';
    cx.fillText('MyShell>', 60, 270);
    cx.fillStyle = '#e7e7f2'; cx.fillText('echo Hello, World!', 170, 270);
    cx.fillStyle = '#9d9dbd'; cx.font = '500 15px "JetBrains Mono", monospace';
    cx.fillText('Hello, World!', 60, 295);
    cx.fillStyle = '#5eead4'; cx.font = '600 18px "JetBrains Mono", monospace';
    cx.fillText('MyShell> ▊', 60, 340);
  } else if (kind === 'scraper') {
    // Data bars
    const bars = 22;
    for (let i = 0; i < bars; i++) {
      const bh = 40 + Math.abs(Math.sin(i * 0.8) + Math.cos(i * 0.3)) * 160;
      const bx = 60 + i * (w - 120) / bars;
      const by = h - 80 - bh;
      const grd = cx.createLinearGradient(bx, by, bx, by + bh);
      grd.addColorStop(0, '#22d3ee');
      grd.addColorStop(1, '#a78bfa');
      cx.fillStyle = grd;
      cx.fillRect(bx, by, (w - 120) / bars - 4, bh);
    }
    // Dotted line
    cx.strokeStyle = 'rgba(94, 234, 212, 0.4)';
    cx.setLineDash([6, 6]);
    cx.lineWidth = 1.5;
    cx.beginPath();
    cx.moveTo(40, h * 0.4);
    cx.lineTo(w - 40, h * 0.4);
    cx.stroke();
    cx.setLineDash([]);
    // Label
    cx.fillStyle = '#5eead4';
    cx.font = '600 13px "JetBrains Mono", monospace';
    cx.fillText('books_scraped.xlsx', 50, 40);
    cx.fillStyle = '#9d9dbd';
    cx.fillText('1000 rows · 3 cols', 50, 58);
  } else if (kind === 'kundendb') {
    // Table mockup
    cx.fillStyle = 'rgba(20, 20, 35, 0.8)';
    cx.fillRect(40, 40, w - 80, h - 80);
    cx.strokeStyle = 'rgba(94, 234, 212, 0.25)';
    cx.strokeRect(40, 40, w - 80, h - 80);
    // Header
    cx.fillStyle = '#5eead4';
    cx.font = '700 14px "JetBrains Mono", monospace';
    cx.fillText('ID', 60, 85);
    cx.fillText('NAME', 110, 85);
    cx.fillText('EMAIL', 260, 85);
    cx.fillText('TELEFON', 440, 85);
    // Rule
    cx.strokeStyle = 'rgba(94, 234, 212, 0.3)';
    cx.beginPath();
    cx.moveTo(50, 100);
    cx.lineTo(w - 50, 100);
    cx.stroke();
    // Rows
    cx.font = '500 13px "JetBrains Mono", monospace';
    const rows = [
      ['1', 'Anna Müller', 'anna@example.com', '0211-12345'],
      ['2', 'Thomas Berger', 'thomas@example.com', '0211-23456'],
      ['3', 'Sabine Krause', 'sabine@example.com', '0211-34567'],
      ['4', 'Marco Weber', 'marco@example.com', '0211-45678'],
    ];
    rows.forEach((r, i) => {
      const y = 130 + i * 28;
      cx.fillStyle = '#c9c9db';
      cx.fillText(r[0], 60, y);
      cx.fillText(r[1], 110, y);
      cx.fillText(r[2], 260, y);
      cx.fillText(r[3], 440, y);
    });
  } else if (kind === 'vocab') {
    // DE → ES quiz card
    cx.font = '700 20px "JetBrains Mono", monospace';
    cx.fillStyle = '#9d9dbd';
    cx.fillText('German', 60, 100);
    cx.font = '800 48px "Space Grotesk", sans-serif';
    const grd = cx.createLinearGradient(60, 110, 400, 160);
    grd.addColorStop(0, '#5eead4'); grd.addColorStop(1, '#a78bfa');
    cx.fillStyle = grd;
    cx.fillText('Hallo', 60, 160);

    // Arrow
    cx.strokeStyle = '#5eead4';
    cx.lineWidth = 3;
    cx.lineCap = 'round';
    cx.beginPath();
    cx.moveTo(60, 220);
    cx.lineTo(160, 220);
    cx.stroke();
    cx.beginPath();
    cx.moveTo(150, 210);
    cx.lineTo(160, 220);
    cx.lineTo(150, 230);
    cx.stroke();

    cx.font = '700 20px "JetBrains Mono", monospace';
    cx.fillStyle = '#9d9dbd';
    cx.fillText('Spanish', 60, 280);
    cx.font = '800 48px "Space Grotesk", sans-serif';
    cx.fillStyle = '#f472b6';
    cx.fillText('Hola', 60, 340);

    cx.font = '500 13px "JetBrains Mono", monospace';
    cx.fillStyle = '#5eead4';
    cx.fillText('✓ correct · 12/20', 60, h - 60);
  }
}

// ─── 4. Magnetic buttons ───
document.querySelectorAll<HTMLElement>('.btn-primary, .btn-secondary').forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const mx = e.clientX - r.left - r.width / 2;
    const my = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${mx * 0.15}px, ${my * 0.15}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ─── 5. Experience timeline fill (grows as you scroll past it) ───
const timeline = document.getElementById('timeline');
const timelineFill = document.getElementById('timeline-fill');
if (timeline && timelineFill) {
  const updateTimeline = () => {
    const rect = timeline.getBoundingClientRect();
    const viewH = window.innerHeight;
    // How much of the timeline is above the middle of the viewport?
    const start = rect.top - viewH * 0.8;
    const end = rect.bottom - viewH * 0.3;
    const total = end - start;
    const scrolled = -start;
    const pct = Math.max(0, Math.min(1, scrolled / total));
    timelineFill.style.height = (pct * 100) + '%';
  };
  updateTimeline();
  window.addEventListener('scroll', updateTimeline, { passive: true });
  window.addEventListener('resize', updateTimeline);
}

// ─── 6. 3D tilt on project cards ───
document.querySelectorAll<HTMLElement>('.project-card').forEach((card) => {
  const inner = card.querySelector('.glass') as HTMLElement | null;
  if (!inner) return;
  inner.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
  inner.style.transformStyle = 'preserve-3d';

  card.addEventListener('mousemove', (e) => {
    const r = inner.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width;
    const my = (e.clientY - r.top) / r.height;
    const rx = (my - 0.5) * -6;
    const ry = (mx - 0.5) * 6;
    inner.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  });
  card.addEventListener('mouseleave', () => {
    inner.style.transform = '';
  });
});
