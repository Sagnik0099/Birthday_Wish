
(() => {
  'use strict';
  const DEFAULT_WISHES = ["Happy Birthday!", "Many happy returns", "Cheers to you today", "Make a wish!", "Another year of you", "You deserve the best", "Wishing you joy", "Hope it's a great one", "Eat all the cake", "Today is yours", "Shine bright today", "Celebrate big", "May your dreams come true", "Here's to your year ahead", "You make things more fun", "Blow out every candle", "Age is just a number", "Fabulous at any age", "Better with every year", "Laughter and good times today", "Wishing you endless smiles", "Party like it's your day", "May all your wishes come true", "Good health and happiness", "Great things are coming", "You really are one of a kind", "Cheers to our friendship", "So glad we became friends", "Hope today feels unforgettable", "Sending you good vibes", "Enjoy every moment", "The best is yet to come", "You keep getting more amazing", "Adventures await you", "May this year be your best", "Cake, candles, confetti!", "Treat yourself today", "You've earned this day", "Rest, laugh, celebrate", "Warmest wishes to you", "Joy to you today", "Here's to many more", "Life looks good on you", "Wishing you peace and joy", "Stay wonderful always", "Keep being you", "Hope your day is sweet", "Surrounded by happy moments", "A toast to your next adventure", "Raise a glass to you", "You make every day brighter", "Dream big this year", "May luck follow you", "Forever young at heart", "Time flies, you shine", "Cheers to another lap", "Blessings on your day", "May joy find you daily", "Happiest of birthdays", "What a year it's been", "Level up! New year, new you", "Sparkle all day long", "Keep spreading those smiles", "Keep making the world brighter", "Wishing you pure happiness", "Hope all your hopes come true", "Go make some memories", "Fill today with fun", "You deserve a brilliant day", "Another trip around the sun", "Better and better each year", "Wishing you sweet surprises", "Celebrate being you", "It's your time to shine", "Cake, laughs and good vibes", "Every adventure is better with friends", "May your days be full of joy", "Hope you feel appreciated", "You're simply the best", "Make today unforgettable", "Here's to health and wealth", "Bright days ahead for you", "Onward to new adventures", "Smile, it's your birthday", "Life is more fun with friends", "Glad to call you my friend", "Cheers to your next chapter", "May all your days be golden", "Sending you birthday cheer", "Hope it's everything you want", "Joy today and always", "A day as wonderful as you", "Happy day, happy heart", "Cheers to you, friend!", "Wishing you the world", "Light, laughter and good memories", "You are truly appreciated", "Thank you for being you", "Many more candles to blow", "Happy Birthday to you!"];

  // ---------- configuration (frame units match the 16 ms tick of the Python original) ----------
  const TAU = Math.PI * 2, BOX = 800, STEP_MS = 16;
  const R_INNER = 187, R_OUTER = 342, R_RING = 366, SLIDE = 11, FADE = 34;
  const REVEAL = 52, GREET = 82, IDLE_AFTER = 165, IDLE_EVERY = 340;
  const SPIN = 0.0006, BOOST = 0.0006, SWEEP_SPEED = 0.22, SWEEP_W = 3.0;
  const MAX_SPARKS = 600, MAX_BALLOONS = 6, CONFETTI_N = 70, BOKEH_N = 14, STAR_N = 140;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const BG_TOP = [0.045, 0.030, 0.125], BG_BOT = [0.250, 0.075, 0.230];
  const CREAM = [1.0, 0.95, 0.88], GOLD = [0.86, 0.69, 0.40], FLASH = [1.0, 0.97, 0.92];
  const STOPS = [[1, .45, .70], [1, .60, .40], [1, .84, .40], [.45, .90, .72], [.45, .72, 1]];
  const UI = '"Manrope", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
  const SERIF = '"Instrument Serif", Georgia, "Times New Roman", serif';

  // ---------- helpers ----------
  const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const rgb = (c, a = 1) => `rgba(${Math.round(clamp(c[0]) * 255)},${Math.round(clamp(c[1]) * 255)},${Math.round(clamp(c[2]) * 255)},${clamp(a).toFixed(3)})`;
  const palette = (k) => { k = clamp(k) * (STOPS.length - 1); const i = Math.min(Math.floor(k), STOPS.length - 2); return mix(STOPS[i], STOPS[i + 1], k - i); };
  const spaced = (t) => t.toUpperCase().split(/\s+/).filter(Boolean).map((w) => [...w].join(' ')).join('   ');
  const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const $ = (id) => document.getElementById(id);
  // Only normalize names entered in ALL CAPS; preserve deliberate mixed-case spellings.
  const prettyName = (value) => {
    if (!value) return '';
    return value === value.toUpperCase()
      ? value.toLowerCase().replace(/(^|[\s-])([a-z])/g, (_, sep, char) => sep + char.toUpperCase())
      : value;
  };


  // ---------- canvas ----------
  const stage = $('stage'), cv = $('cv'), ctx = cv.getContext('2d');
  const view = { s: 1, dpr: 1, hw: 400, hh: 400 };
  function resize() {
    const r = stage.getBoundingClientRect();
    view.dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(1, Math.round(r.width * view.dpr));
    cv.height = Math.max(1, Math.round(r.height * view.dpr));
    const isGift = document.documentElement.classList.contains('gift-view');
    const verticalFit = isGift ? (r.width > 620 ? r.height * .67 : (r.height < 540 ? r.height * .60 : r.height - 120)) : r.height;
    view.s = Math.min(r.width, Math.max(300, verticalFit)) / BOX;
    view.hw = r.width / 2 / view.s;
    view.hh = r.height / 2 / view.s;
    // Circle's bottom edge in CSS pixels. Finale is positioned here from the
    // beginning, so revealing it never pushes or moves the wheel.
    stage.style.setProperty('--wheel-bottom', Math.round(r.height/2 + R_RING*view.s + 8)+'px');
    if (wishes && wishes.length) fitFont();
  }

  // ---------- state ----------
  let wishes = DEFAULT_WISHES.slice(), n = wishes.length;
  let person = { name: '', age: null };
  let introActive = document.documentElement.classList.contains('gift-view');
  let senderNote = '';
  let rng = Math.random, S, spokes, bokeh, stars, confetti, balloons, sparks, rockets, meteor, shock, fontPx = 10;

  function fitFont() {
    // Same complete radial sentences as the original, not abbreviated or grouped.
    // The lettering is slightly larger than the original's minimum where geometry allows.
    const maxW = R_OUTER - R_INNER - 6;
    const minimum = window.innerWidth <= 620 ? 12 : 11;
    for (fontPx = 15; fontPx >= minimum; fontPx--) {
      ctx.font = `700 ${fontPx}px ${UI}`;
      if (Math.max(...wishes.map((w) => ctx.measureText(w).width)) <= maxW) return;
    }
    fontPx = minimum;
  }

  function reset(preroll = 0) {
    rng = mulberry32(7);
    n = wishes.length;
    S = { frame: 0, rot: 0, shown: 0, cur: null, curSince: 0, kind: 'wish', prev: null, fadeLen: 14, tint: CREAM, text: '', counter: '',
          doneAt: null, greeted: false, nextLaunch: 0, arc: 0, paused: S ? S.paused : false, wishPromptShown: false };
    const finaleSection = $('finaleSection');
    stage.classList.remove('celebration-finished');
    finaleSection.hidden = true;
    finaleSection.classList.remove('show');
    $('openWish').hidden = false;
    spokes = wishes.map((text, i) => ({ text, angle: Math.PI / 2 - TAU * i / n, color: palette(i / Math.max(1, n - 1)), born: null }));
    const R = (a, b) => a + (b - a) * rng();
    bokeh = Array.from({ length: BOKEH_N }, () => ({ x: R(-560, 560), y: R(-560, 560), r: R(26, 70), vx: R(-.12, .12), vy: R(-.18, -.04), phase: R(0, TAU), hue: rng() }));
    stars = Array.from({ length: STAR_N }, () => ({ u: rng(), v: rng(), b: R(.15, .5), sz: [.8, 1, 1, 1.4][Math.floor(rng() * 4)], phase: R(0, TAU) }));
    confetti = Array.from({ length: CONFETTI_N }, () => ({ x: R(-1, 1), y: -(R(0, 1) * 800 + 420), size: R(3, 6.5), fall: R(1.4, 3.4), sway: R(6, 18), phase: R(0, TAU), color: palette(rng()), spin: R(.05, .15) }));
    balloons = []; sparks = []; rockets = []; meteor = null; shock = null;
    fitFont();
    for (let i = 0; i < preroll; i++) advance();
  }

  // ---------- centre text ----------
  function setCentre(text, counter, index, tint, kind, len = 14) {
    S.prev = S.cur !== null ? { text: S.text, counter: S.counter, tint: S.tint } : null;
    S.cur = index; S.curSince = S.frame; S.tint = tint; S.text = text; S.counter = counter; S.kind = kind; S.fadeLen = len;
    const phraseEl = $('mobilePhrase');
    phraseEl.classList.remove('wish-arrive');
    void phraseEl.offsetWidth;
    phraseEl.textContent = text;
    phraseEl.classList.add('wish-arrive');
    phraseEl.classList.toggle('compact', text.length > 27 || text.includes('\n'));
    $('mobileCounter').textContent = counter;
    $('mobileName').textContent = prettyName(person.name);
    $('mobileName').classList.toggle('compact', person.name.length > 15);
    $('mobileAge').textContent = person.age ? `TURNING ${person.age}` : '';
  }
  const showWish = (i, len = 14) => setCentre(wishes[i], `N° ${String(i + 1).padStart(3, '0')}`, i, mix(CREAM, spokes[i].color, .18), 'wish', len);
  const greeting = () => 'Happy Birthday!'; // Name already appears separately, so it is never duplicated.
  const showGreeting = () => setCentre(greeting(), `${n} / ${n}`, n - 1, mix(GOLD, FLASH, .5), 'greeting');

  // ---------- fireworks ----------
  function spark(x, y, vx, vy, life, color, size = 2, gravity = .05, drag = .985) {
    if (sparks.length < MAX_SPARKS) sparks.push({ x, y, vx, vy, age: 0, life, color, size, gravity, drag });
  }
  function burst(x, y, color, count = 56) {
    for (let k = 0; k < count; k++) {
      const a = TAU * k / count + (rng() - .5) * .16;
      const sp = k % 3 ? 3.3 * (.85 + rng() * .15) : .8 + rng() * 2;
      let tint = mix(color, FLASH, rng() * .35);
      if (k % 5 === 0) tint = mix(color, palette(rng()), .6);
      spark(x, y, Math.cos(a) * sp, Math.sin(a) * sp, 48 + Math.floor(rng() * 31), tint, 1.8 + rng());
    }
  }
  function launch() {
    rockets.push({ x: (rng() * 2 - 1) * view.hw * .8, y: view.hh + 10, vy: -(7 + rng() * 2.5),
                   target: -view.hh * (.15 + rng() * .65), color: palette(rng()) });
  }

  // ---------- simulation ----------
  function revealNext() {
    spokes[S.shown].born = S.frame;
    showWish(S.shown, 14); // One spoke and one centre wish every 52 frames (~0.83s).
    S.shown++;
    if (S.shown === n) {
      S.doneAt = S.frame;
      if (!calm) { shock = { age: 0 }; launch(); launch(); launch(); S.nextLaunch = 45; }
    }
  }

  function advance() {
    S.frame++;
    S.rot -= (calm ? SPIN * .3 : SPIN) + (S.shown >= n && !calm ? BOOST : 0);
    if (S.shown < n && S.frame % REVEAL === 0) revealNext();
    // Pixel-smooth progress over every frame (no sudden 1-wish progress jumps).
    const linearProgress = clamp(S.frame / Math.max(1, n * REVEAL));
    S.arc = linearProgress; // steady, continuous progress rather than discrete steps

    if (S.doneAt !== null) {
      const since = S.frame - S.doneAt;
      if (!S.greeted && since >= GREET) { S.greeted = true; showGreeting(); }
      else if (since > IDLE_AFTER && S.frame - S.curSince > IDLE_EVERY && n > 1) {
        let k; do { k = Math.floor(rng() * n); } while (k === S.cur);
        showWish(k);
      }
      if (!S.wishPromptShown && document.documentElement.classList.contains('gift-view') && since >= IDLE_AFTER) {
        const finale = $('finaleSection');
        $('openWish').hidden = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('senderEmail').value.trim());
        finale.hidden = false;

        requestAnimationFrame(() => finale.classList.add('show'));
        S.wishPromptShown = true;
        // The stage has a fixed height for gift viewers; do not scroll or resize it.
        stage.classList.add('celebration-finished');
      }
      if (!calm) {
        if (--S.nextLaunch <= 0) { const c = rng() < .35 ? 2 : 1; for (let i = 0; i < c; i++) launch(); S.nextLaunch = 30 + Math.floor(rng() * 41); }
        if (S.frame % 75 === 0 && balloons.length < MAX_BALLOONS) {
          balloons.push({ x: (rng() * 2 - 1) * view.hw * .85, y: view.hh + 70, vy: -(.7 + rng() * .8), sway: 8 + rng() * 14, phase: rng() * TAU, color: palette(rng()) });
        }
        for (const c of confetti) {
          c.y += c.fall; c.phase += .06;
          if (c.y > view.hh + 12) { c.y = -view.hh - 12 - rng() * 120; c.x = rng() * 2 - 1; }
        }
        balloons.forEach((b) => { b.y += b.vy; b.phase += .03; });
        balloons = balloons.filter((b) => b.y > -view.hh - 100);
        if (shock && ++shock.age > 50) shock = null;
      }
    }

    for (const b of bokeh) {
      b.x += b.vx; b.y += b.vy; b.phase += .02;
      if (b.y < -view.hh - b.r) { b.y = view.hh + b.r; b.x = (rng() * 2 - 1) * view.hw; }
    }
    if (!calm) {
      if (!meteor) { if (rng() < .004) meteor = { x: -100 + rng() * 520, y: -view.hh + rng() * 120, dx: -9, dy: 5, age: 0, life: 45 }; }
      else { meteor.x += meteor.dx; meteor.y += meteor.dy; if (++meteor.age >= meteor.life) meteor = null; }
      rockets = rockets.filter((r) => {
        r.y += r.vy;
        spark(r.x, r.y, 0, 0, 3, FLASH, 2.6, 0);
        spark(r.x + (rng() - .5) * 2, r.y, (rng() - .5) * .4, .2 + rng() * .6, 16, mix(GOLD, FLASH, .5), 1.8, .02);
        if (r.y <= r.target) { burst(r.x, r.y, r.color); return false; }
        return true;
      });
    }
    sparks = sparks.filter((s) => {
      s.vx *= s.drag; s.vy = s.vy * s.drag + s.gravity; s.x += s.vx; s.y += s.vy;
      return ++s.age < s.life;
    });
  }

  // ---------- drawing ----------
  function wrap(text, maxW) {
    const lines = [];
    for (const para of text.split('\n')) {
      let line = '';
      for (const word of para.split(' ')) {
        const t = line ? line + ' ' + word : word;
        if (line && ctx.measureText(t).width > maxW) { lines.push(line); line = word; } else line = t;
      }
      lines.push(line);
    }
    return lines;
  }

  function draw() {
    const f = S.frame;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, cv.height);
    [0, .25, .5, .75, 1].forEach((t) => g.addColorStop(t, rgb(mix(BG_TOP, BG_BOT, Math.pow(t, 1.4)))));
    ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
    const k = view.s * view.dpr;
    ctx.setTransform(k, 0, 0, k, cv.width / 2, cv.height / 2);
    ctx.textBaseline = 'middle';

    // bokeh
    for (const b of bokeh) {
      const lv = .05 + .03 * Math.sin(b.phase), c = palette(b.hue);
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU);
      ctx.fillStyle = rgb(c, lv); ctx.fill();
      ctx.strokeStyle = rgb(c, lv * 1.2); ctx.lineWidth = 1; ctx.stroke();
    }
    // stars
    for (const s of stars) {
      const x = (s.u - .5) * 2 * view.hw, y = (s.v - .5) * 2 * view.hh;
      if (Math.hypot(x, y) < R_RING + 6) continue;
      ctx.fillStyle = rgb(CREAM, s.b * (.75 + .5 * Math.sin(f * .045 + s.phase)));
      ctx.beginPath(); ctx.arc(x, y, s.sz, 0, TAU); ctx.fill();
    }
    // rings
    [[R_INNER - 14, .35], [R_INNER - 19, .12], [R_RING, .18]].forEach(([r, base], i) => {
      const lv = S.doneAt !== null && i < 2 ? base * (1 + .7 * Math.sin(f * .07 + i * 1.3)) : base;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.strokeStyle = rgb(GOLD, lv * 1.15); ctx.lineWidth = 1; ctx.stroke();
    });
    // balloons (behind the wheel text)
    for (const b of balloons) {
      const sx = b.x + Math.sin(b.phase) * b.sway;
      ctx.beginPath(); ctx.moveTo(sx, b.y + 19);
      ctx.quadraticCurveTo(sx + Math.sin(b.phase - .8) * 12, b.y + 45, sx + Math.sin(b.phase - .8) * 7, b.y + 74);
      ctx.strokeStyle = rgb(CREAM, .35); ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(sx, b.y, 15, 19, 0, 0, TAU); ctx.fillStyle = rgb(b.color, .78); ctx.fill();
      ctx.beginPath(); ctx.moveTo(sx - 3, b.y + 24); ctx.lineTo(sx + 3, b.y + 24); ctx.lineTo(sx, b.y + 18); ctx.fillStyle = rgb(b.color, .78); ctx.fill();
      ctx.beginPath(); ctx.ellipse(sx - 6, b.y - 8, 3, 5, -.5, 0, TAU); ctx.fillStyle = rgb(FLASH, .55); ctx.fill();
    }
    // ORIGINAL BEHAVIOR: every wish stays in the circle once it is revealed.
    // Never filter by modulo, hide in groups, truncate, or skip a spoke on mobile.
    ctx.font = `700 ${fontPx}px ${UI}`;
    const finished = S.doneAt !== null, sweep = calm ? 0 : (f * SWEEP_SPEED) % n;
    for (let i = 0; i < n; i++) {
      const sp = spokes[i]; if (sp.born === null) continue;
      const u = clamp((f - sp.born) / FADE), e = u * u * (3 - 2 * u);
      const a = (((sp.angle + S.rot) % TAU) + TAU) % TAU, r = R_INNER + (1 - e) * SLIDE;
      let glow = 0;
      if (finished && !calm) { let d = Math.abs(i - sweep); d = Math.min(d, n - d); glow = Math.exp(-Math.pow(d / SWEEP_W, 2)) * .65; }
      const shimmer = Math.sin(Math.PI * u) * .22;
      const active = S.kind === 'wish' && i === S.cur ? .23 : 0;
      const fl = Math.max(glow, shimmer, active), base = .89 * e;
      ctx.fillStyle = rgb(mix(sp.color, FLASH, fl), clamp(base + (1 - base) * fl));
      const left = a > Math.PI / 2 && a < 3 * Math.PI / 2;
      ctx.save(); ctx.translate(r * Math.cos(a), -r * Math.sin(a)); ctx.rotate(left ? Math.PI - a : -a);
      ctx.textAlign = left ? 'right' : 'left'; ctx.fillText(sp.text, 0, 0, R_OUTER - R_INNER - 7); ctx.restore();
    }
    // centre: Canvas on desktop. On phones the same current message is shown
    // by ONE larger HTML layer at precisely the wheel center (never below it).
    if (window.innerWidth > 620) {
      const kc = clamp((f - 8) / 40);
      ctx.textAlign = 'center';
      // A gentle arc, lowered within the centre so the top no longer feels crowded.
      function arcHeading(line, y, fontSize, curve) {
        ctx.font = `800 ${fontSize}px ${UI}`;
        const chars = Array.from(line), widths = chars.map(ch => ctx.measureText(ch).width);
        const full = widths.reduce((a,b)=>a+b,0), scale = Math.min(1,294/full);
        let x = -full*scale/2;
        for (let i=0;i<chars.length;i++) {
          const w=widths[i]*scale, mid=x+w/2, t=mid/147;
          ctx.save(); ctx.translate(mid,y+curve*t*t); ctx.rotate(Math.atan2(2*curve*t,147));
          ctx.fillText(chars[i],0,0); ctx.restore(); x += w;
        }
      }
      ctx.fillStyle = rgb(GOLD, .94 * kc); ctx.textAlign = 'center';
      arcHeading('A HUNDRED WISHES', -103, 14, 9);
      arcHeading('FOR YOUR BRIGHTEST YEAR YET', -84, 10.8, 6);
      if (S.cur !== null) {
        const fe = clamp((f - S.curSince) / S.fadeLen);
        const phrase = (o, alpha) => {
          if (alpha <= 0) return;
          let size = 38, lines = [];
          while (size > 24) {
            ctx.font = `italic 400 ${size}px ${SERIF}`;
            lines = wrap(o.text, 296);
            if (lines.length <= 3 && ctx.measureText(lines[0] || '').width <= 296) break;
            size -= 2;
          }
          const lh = size * 1.05, y0 = -15 - (lines.length - 1) * lh / 2;
          ctx.fillStyle = rgb(o.tint, alpha);
          lines.forEach((ln,i) => ctx.fillText(ln, 0, y0 + i*lh));
          ctx.font = `800 13px ${UI}`;
          ctx.fillStyle = rgb(GOLD, alpha * .9);
          ctx.fillText(o.counter, 0, 76);
        };
        if (S.prev && fe < 1) phrase(S.prev, 1 - fe);
        phrase(S, fe);
      }
      ctx.strokeStyle = rgb(GOLD, .6 * kc); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-29, 56); ctx.lineTo(29, 56); ctx.stroke();
      if (person.name) {
        const nameSize = person.name.length > 16 ? 13 : 18;
        ctx.font = `italic 400 ${person.name.length > 16 ? 23 : 31}px ${SERIF}`;
        ctx.fillStyle = rgb(mix(GOLD, FLASH, .35), .99 * kc);
        ctx.fillText(prettyName(person.name), 0, 126, 295);
      }
      if (person.age) {
        ctx.font = `700 12px ${UI}`; ctx.fillStyle = rgb(GOLD, .8 * kc);
        ctx.fillText(`TURNING ${person.age}`, 0, 153);
      }
    }
    // progress arc and its glowing head
    if (S.arc > .001) {
      const end = -Math.PI / 2 + TAU * Math.min(S.arc, .9999);
      ctx.beginPath(); ctx.arc(0, 0, R_RING, -Math.PI / 2, end); ctx.strokeStyle = rgb(GOLD); ctx.lineWidth = 2; ctx.stroke();
      const tx = R_RING * Math.cos(end), ty = R_RING * Math.sin(end);
      const gl = ctx.createRadialGradient(tx, ty, 0, tx, ty, 14);
      gl.addColorStop(0, rgb(FLASH, .9)); gl.addColorStop(1, rgb(GOLD, 0));
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(tx, ty, 14, 0, TAU); ctx.fill();
    }
    // confetti
    if (S.doneAt !== null && !calm) {
      for (const c of confetti) {
        const x = c.x * view.hw + Math.sin(c.phase) * c.sway;
        ctx.save(); ctx.translate(x, c.y); ctx.rotate(c.phase * c.spin * 12);
        ctx.fillStyle = rgb(c.color, .95); ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2 * Math.abs(Math.cos(c.phase * 1.7)) + 1); ctx.restore();
      }
    }
    // shockwave
    if (shock) {
      const rr = R_INNER + shock.age * 9;
      ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.strokeStyle = rgb(GOLD, 1 - shock.age / 50); ctx.lineWidth = Math.max(1, 4 - shock.age / 14); ctx.stroke();
    }
    // shooting star
    if (meteor) {
      const fade = 1 - meteor.age / meteor.life, tx = meteor.x - meteor.dx * 6, ty = meteor.y - meteor.dy * 6;
      const lg = ctx.createLinearGradient(meteor.x, meteor.y, tx, ty);
      lg.addColorStop(0, rgb(FLASH, .9 * fade)); lg.addColorStop(1, rgb(FLASH, 0));
      ctx.strokeStyle = lg; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(meteor.x, meteor.y); ctx.lineTo(tx, ty); ctx.stroke();
    }
    // sparks (additive for a glow)
    if (sparks.length) {
      ctx.globalCompositeOperation = 'lighter';
      for (const s of sparks) {
        const fade = 1 - s.age / s.life, a = Math.pow(fade, .8), rr = s.size * (.45 + .55 * fade);
        ctx.fillStyle = rgb(s.age < 3 ? mix(s.color, FLASH, .8) : s.color, a);
        ctx.beginPath(); ctx.arc(s.x, s.y, rr, 0, TAU); ctx.fill();
        ctx.fillStyle = rgb(s.color, a * .14);
        ctx.beginPath(); ctx.arc(s.x, s.y, rr * 3.2, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  // ---------- main loop ----------
  let last = 0, acc = 0;
  function loop(t) {
    requestAnimationFrame(loop);
    if (!last) last = t;
    const dt = Math.min(100, t - last); last = t;
    if (!S.paused && !introActive) { acc += dt; while (acc >= STEP_MS) { acc -= STEP_MS; advance(); } }
    draw();
  }

  // ---------- controls ----------
  const nameIn = $('name'), ageIn = $('age'), birthIn = $('birthDate'), yearIn = $('celebrationYear'), statusEl = $('status');
  yearIn.value = String(new Date().getFullYear());
  const say = (msg, bad = false) => { statusEl.textContent = msg; statusEl.classList.toggle('bad', bad); };
  function syncPerson() {
    person = { name: nameIn.value.trim(), age: ageIn.value ? clamp(parseInt(ageIn.value, 10) || 0, 0, 150) || null : null };
    if (S.kind === 'greeting') showGreeting();
    else { $('mobileName').textContent = prettyName(person.name); $('mobileName').classList.toggle('compact', person.name.length > 15); $('mobileAge').textContent = person.age ? `TURNING ${person.age}` : ''; }
  }
  function readBirthdayDate() {
    const d = birthIn.value;
    const y = Number(yearIn.value);
    if (!d) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    if (!match || !Number.isInteger(y) || y < 1901 || y > 2100) return false;
    const [, ys, ms, ds] = match;
    const birthYear = Number(ys), month = Number(ms), day = Number(ds);
    const utc = new Date(Date.UTC(birthYear, month - 1, day));
    if (utc.getUTCFullYear() !== birthYear || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) return false;
    if (birthYear < 1900 || y - birthYear < 1 || y - birthYear > 150) return false;
    return { iso: d, birthYear, month, day, celebrationYear: y, years: y - birthYear };
  }
  function syncBirthFields() {
    const b = readBirthdayDate();
    ageIn.disabled = !!birthIn.value;
    if (b && b !== false) {
      ageIn.value = String(b.years);
      say('');
    } else if (birthIn.value) {
      ageIn.value = '';
      say('Choose a valid birth date and a celebration year 1–150 years later.', true);
    } else {
      ageIn.disabled = false;
      say('');
    }
    syncPerson();
  }
  birthIn.addEventListener('input', syncBirthFields);
  yearIn.addEventListener('input', syncBirthFields);
  nameIn.addEventListener('input', syncPerson);
  ageIn.addEventListener('input', syncPerson);

  $('replay').addEventListener('click', () => { reset(0); acc = 0; $('pause').textContent = 'Pause'; S.paused = false; say(''); });
  $('pause').addEventListener('click', togglePause);
  function togglePause() { S.paused = !S.paused; $('pause').textContent = S.paused ? 'Play' : 'Pause'; }
  addEventListener('keydown', (e) => {
    if (!document.documentElement.classList.contains('gift-view') && e.code === 'Space' && !/^(INPUT|TEXTAREA|BUTTON|SUMMARY)$/.test(document.activeElement.tagName)) { e.preventDefault(); togglePause(); }
  });

  cv.addEventListener('pointerdown', (e) => {
    const r = cv.getBoundingClientRect();
    burst((e.clientX - r.left - r.width / 2) / view.s, (e.clientY - r.top - r.height / 2) / view.s, palette(rng()));
  });

  $('copy').addEventListener('click', async () => {
    // Always share the current website (e.g. GitHub Pages), never a fixed artifact URL.
    if (location.protocol === 'file:') {
      say('Open your published GitHub Pages site, then click Copy link to share it.', true);
      return;
    }
    const url = new URL(location.href);
    url.hash = '';
    ['name', 'age', 'wishes', 'gift', 'inbox', 'note', 'dob', 'year'].forEach((key) => url.searchParams.delete(key));
    if (birthIn.value && readBirthdayDate() === false) { say('Correct the birth date and celebration year before sharing.', true); return; }
    const birth = readBirthdayDate();
    if (birth) { url.searchParams.set('dob', birth.iso); url.searchParams.set('year', String(birth.celebrationYear)); }
    if (person.name) url.searchParams.set('name', person.name);
    if (person.age) url.searchParams.set('age', String(person.age));
    const note = $('senderNoteInput').value.trim();
    if (note) url.searchParams.set('note', note.slice(0, 360));
    // Include edited wishes only; the default 100 are already in the page.
    if (wishes.length !== DEFAULT_WISHES.length || wishes.some((wish, i) => wish !== DEFAULT_WISHES[i])) {
      url.searchParams.set('wishes', wishes.join('\n'));
    }
    const inboxEmail = $('senderEmail').value.trim();
    if (inboxEmail) {
      if (!$('senderEmail').checkValidity()) { say('Enter a valid email address in Receive a wish settings.', true); $('inboxSettings').open = true; return; }
      url.searchParams.set('inbox', inboxEmail);
    }
    url.searchParams.set('gift', '1'); // Open the recipient's page without any editing controls.
    const link = url.toString();
    try {
      await navigator.clipboard.writeText(link);
      say(link.length > 8000 ? 'Link copied, but it is very long; some apps may shorten it.' : inboxEmail ? 'Gift link copied! The recipient can send you a wish (after you activate your email).' : 'Gift link copied! Add your email under Receive a wish to enable the reply box.');
    } catch {
      // Browsers can block clipboard access; give the user a selectable link.
      statusEl.replaceChildren('Copy this link: ');
      const s = document.createElement('span'); s.className = 'link'; s.textContent = link;
      statusEl.append(s); statusEl.classList.remove('bad');
    }
  });

  const box = $('wishes'), msg = $('wishmsg');
  const fill = () => { box.value = wishes.join('\n'); };
  $('apply').addEventListener('click', () => {
    const list = box.value.split('\n').map((l) => l.trim()).filter(Boolean);
    if (list.length < 2 || list.length > 200) { msg.textContent = `Need between 2 and 200 wishes, found ${list.length}.`; msg.classList.add('bad'); return; }
    wishes = list; reset(0); acc = 0; msg.classList.remove('bad'); msg.textContent = `Playing ${list.length} wishes.`;
  });
  $('defaults').addEventListener('click', () => { wishes = DEFAULT_WISHES.slice(); fill(); reset(0); acc = 0; msg.classList.remove('bad'); msg.textContent = 'Back to the original 100.'; });

  function readHash() {
    // Keep compatibility with older links using #First-Name.
    let h = '';
    try { h = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (/^[A-Za-z0-9-]{1,28}$/.test(h)) { nameIn.value = h.replace(/-/g, ' '); syncPerson(); }
  }
  function readSharedLink() {
    const params = new URLSearchParams(location.search);
    const sharedWishes = params.get('wishes');
    if (sharedWishes !== null && sharedWishes.length <= 30000) {
      const list = sharedWishes.split('\n').map((line) => line.trim()).filter(Boolean);
      if (list.length >= 2 && list.length <= 200) {
        wishes = list;
        fill();
        reset(0);
      }
    }
    const sharedName = params.get('name');
    if (sharedName !== null) nameIn.value = sharedName.slice(0, 28);
    const sharedAge = params.get('age');
    if (sharedAge && /^\d{1,3}$/.test(sharedAge) && +sharedAge >= 1 && +sharedAge <= 150) ageIn.value = sharedAge;
    const sharedDob = params.get('dob');
    const sharedYear = params.get('year');
    if (sharedDob && /^\d{4}-\d{2}-\d{2}$/.test(sharedDob) && sharedYear && /^\d{4}$/.test(sharedYear)) {
      birthIn.value = sharedDob; yearIn.value = sharedYear; syncBirthFields();
    }
    const sharedNote = params.get('note');
    if (sharedNote) { $('senderNoteInput').value = sharedNote.slice(0, 360); updateNote(); }
    const inbox = params.get('inbox');
    if (inbox && inbox.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inbox)) {
      $('senderEmail').value = inbox;
    }
    syncPerson();
    if (sharedName === null) readHash();
  }
  addEventListener('hashchange', readHash);

  // ---------- wish inbox: static-site email delivery via FormSubmit ----------
  const senderEmailIn = $('senderEmail');
  const inboxStatus = $('inboxStatus');
  const wishModal = $('wishModal');
  const wishForm = $('wishForm');
  const wishResult = $('wishResult');
  const sendWishButton = $('sendWish');
  let wishReturnFocus = null;
  function inboxAddress() {
    const email = senderEmailIn.value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? email : null;
  }
  async function submitToInbox(fields) {
    const inbox = inboxAddress();
    if (!inbox) throw new Error('No valid inbox has been set up for this gift.');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(inbox), {
        method: 'POST',
        headers: {'Content-Type':'application/json', 'Accept':'application/json'},
        body: JSON.stringify({
          ...fields, _template: 'table', _captcha: 'false',
          _url: location.origin + location.pathname
        }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('The wish service returned an error. Please try again.');
      const result = await response.json();
      if (!result || (result.success !== true && result.success !== 'true')) {
        throw new Error((result && result.message) || 'The wish service could not accept the message.');
      }
      return result;
    } finally { clearTimeout(timeout); }
  }
  $('activateInbox').addEventListener('click', async () => {
    const inbox = inboxAddress();
    if (!inbox) { inboxStatus.textContent = 'Please enter a valid email first.'; inboxStatus.classList.add('bad'); return; }
    $('activateInbox').disabled = true;
    inboxStatus.classList.remove('bad');
    inboxStatus.textContent = 'Requesting the activation email…';
    try {
      await submitToInbox({ name: 'Birthday wishes setup', message: 'Please verify this email address to receive birthday wishes from your gift page.',
        _subject: 'Activate your birthday wish inbox', _honey: '' });
      inboxStatus.textContent = 'Activation requested. Open your inbox (or Spam) and confirm the FormSubmit activation email. Then copy and share your gift link.';
    } catch (err) {
      inboxStatus.textContent = 'Activation request failed: ' + err.message + ' Try again after publishing on GitHub Pages.';
      inboxStatus.classList.add('bad');
    } finally { $('activateInbox').disabled = false; }
  });
  function openWishDialog() {
    wishReturnFocus = document.activeElement;
    wishModal.hidden = false;
    wishResult.textContent = '';
    wishResult.classList.remove('error');
    $('wishText').focus();
  }
  function closeWishDialog() {
    wishModal.hidden = true;
    if (wishReturnFocus && typeof wishReturnFocus.focus === 'function') wishReturnFocus.focus();
  }
  $('openWish').addEventListener('click', openWishDialog);
  $('closeWish').addEventListener('click', closeWishDialog);
  wishModal.addEventListener('click', (event) => { if (event.target === wishModal) closeWishDialog(); });
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !wishModal.hidden) closeWishDialog();
    if (event.key === 'Tab' && !wishModal.hidden) {
      const focusable = [...wishModal.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled)')]
        .filter(el => el.offsetParent !== null && el.tabIndex >= 0);
      if (focusable.length) {
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
  });
  wishForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!wishForm.reportValidity() || sendWishButton.disabled) return;
    if ($('wishTrap').value) { wishResult.textContent = 'Thank you for your wish!'; return; }
    const message = $('wishText').value.trim();
    if (message.length < 2) { wishResult.textContent = 'Please write a wish first.'; return; }
    sendWishButton.disabled = true;
    sendWishButton.textContent = 'Sending…';
    wishResult.classList.remove('error');
    wishResult.textContent = '';
    try {
      await submitToInbox({ name: 'Birthday wish reply', message,
        _subject: `A birthday wish for ${person.name || 'your birthday gift'}`, _honey: '' });
      wishResult.textContent = 'A little spark of happiness is on its way. ✨';
      wishForm.reset();
    } catch (err) {
      wishResult.classList.add('error');
      wishResult.textContent = 'Could not send your wish. ' + err.message;
    } finally { sendWishButton.disabled = false; sendWishButton.textContent = 'Send my wish ✨'; }
  });


  // ---------- sender note: visible only at the finale, never at the opening ----------
  function updateNote() {
    senderNote = $('senderNoteInput').value.trim().slice(0, 360);
    $('finaleMessage').textContent = senderNote;
    $('finaleNote').hidden = !senderNote;
  }
  $('senderNoteInput').addEventListener('input', updateNote);

  // ---------- music — mobile user-gesture unlock, supports taps on opening ----------
  const birthdayAudio = $('birthdayAudio');
  const musicToggle = $('musicToggle');
  let musicOptedOut = false;
  let musicStarting = false;
  birthdayAudio.volume = .48;
  birthdayAudio.preload = 'auto';
  function syncMusicUI() {
    const playing = !birthdayAudio.paused;
    if (playing) musicToggle.classList.remove('music-blocked');
    musicToggle.textContent = playing ? '♫ Pause music' : '♫ Tap for music';
    musicToggle.setAttribute('aria-pressed',String(playing));
  }
  function startWheelMusic() {
    if (musicOptedOut || musicStarting || !birthdayAudio.paused) return;
    musicStarting = true;
    // Must call HTMLMediaElement.play() synchronously in the gesture handler.
    // Awaiting any animation, timer or network request would lose the browser's gesture token.
    const started = birthdayAudio.play();
    Promise.resolve(started).then(() => {
      musicToggle.classList.remove('music-blocked');
      if (introActive) birthdayAudio.volume = 0; // keep the clock serene until the wheel
      else birthdayAudio.volume = .48;
      syncMusicUI();
    }).catch(() => {
      musicToggle.classList.add('music-blocked');
      musicToggle.textContent = '♫ Tap for music';
      musicToggle.setAttribute('aria-pressed','false');
    }).finally(() => { musicStarting = false; });
  }
  function onMusicGesture(event) {
    if (musicOptedOut || !birthdayAudio.paused || event.target === musicToggle) return;
    if (event.target.closest('input, textarea, select')) return;
    if (introActive) birthdayAudio.volume = 0;
    startWheelMusic();
  }
  document.addEventListener('pointerdown',onMusicGesture,{passive:true});
  // 'click' supports devices/assistive controls that don't emit pointerdown.
  document.addEventListener('click',onMusicGesture);
  document.addEventListener('keydown',event => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat && !event.target.closest('input,textarea'))
      onMusicGesture(event);
  });
  musicToggle.addEventListener('click', () => {
    if (!birthdayAudio.paused) {
      musicOptedOut = true;
      birthdayAudio.pause();
    } else {
      musicOptedOut = false;
      birthdayAudio.volume = introActive ? 0 : .48;
      startWheelMusic();
    }
    syncMusicUI();
  });
  birthdayAudio.addEventListener('play',syncMusicUI);
  birthdayAudio.addEventListener('pause',syncMusicUI);
  birthdayAudio.addEventListener('error', () => {
    musicToggle.classList.add('music-blocked');
    musicToggle.textContent = '♫ Music unavailable';
    musicToggle.title = 'Check that birthday-tune.mp3 is alongside index.html';
  });

  // ---------- automatic clock-to-wheel cinematic transition ----------
  // ---------- birthday orbit: date-to-year visual, only when sender provided a birth date ----------
  let journeyRaf = 0;
  function renderBirthdayJourney() {
    const detail = readBirthdayDate();
    const root = $('timeJourney');
    cancelAnimationFrame(journeyRaf);
    root.hidden = !detail || detail === false;
    if (!detail || detail === false) return;
    $('journeyFrom').textContent = detail.birthYear;
    $('journeyTo').textContent = detail.celebrationYear;
    $('journeyNumber').textContent = '0';
    const caption = new Intl.DateTimeFormat('en', { month:'long', timeZone:'UTC' })
      .format(new Date(Date.UTC(2000, detail.month-1, Math.min(detail.day, 28))));
    $('journeyCaption').textContent = `${detail.day} ${caption} · ${detail.years} ${detail.years === 1 ? 'year' : 'years'} of stories`;
    const pips = $('journeyPips');
    pips.replaceChildren();
    // Each glowing point is one passage through a year; for large ages, use a restrained sample.
    const count = Math.min(detail.years, 44);
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('i');
      dot.style.setProperty('--i',i);
      dot.style.setProperty('--count',count);
      pips.append(dot);
    }
    const start = performance.now();
    const duration = calm ? 250 : 5050;
    function frame(t) {
      if (!introActive || root.hidden) return;
      const k = Math.max(0, Math.min(1, (t-start)/duration));
      const ease = k*k*(3-2*k);
      $('journeyNumber').textContent = String(Math.round(ease*detail.years));
      pips.style.setProperty('--reveal',ease);
      if (k < 1) journeyRaf = requestAnimationFrame(frame);
    }
    journeyRaf = requestAnimationFrame(frame);
  }

  const opening = $('opening');
  let openingTimer = null;
  function finishOpening() {
    if (!introActive) return;
    if (opening.classList.contains('leaving')) return;
    clearTimeout(openingTimer);
    opening.classList.add('leaving');
    cancelAnimationFrame(journeyRaf);
    document.documentElement.classList.remove('intro-pending');
    // Let the opening dissolve fully, then begin wish #001; none are missed behind the transition.
    const ms = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 200 : 1550;
    setTimeout(() => {
      opening.hidden = true; introActive = false; reset(0); acc = 0; last = 0;
      birthdayAudio.volume = .48;
      if (!birthdayAudio.paused) { try { birthdayAudio.currentTime = 0; } catch {} syncMusicUI(); }
      else startWheelMusic();
    }, ms);
  }
  function beginOpening() {
    if (!introActive) return;
    opening.hidden = false;
    renderBirthdayJourney();
    $('openingSubtitle').textContent = person.name
      ? `A special day for ${person.name}.` : 'And today is one of them.';
    openingTimer = setTimeout(finishOpening, 7300);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      clearTimeout(openingTimer); openingTimer = setTimeout(finishOpening, 1200);
    }
  }


  // ---------- start ----------
  new ResizeObserver(resize).observe(stage);
  resize();
  fill();
  reset(0);
  readSharedLink();
  updateNote();
  const fontsReady = Promise.race([
    Promise.all([document.fonts.load(`500 12px ${UI}`), document.fonts.load(`italic 400 27px ${SERIF}`)]).catch(() => {}),
    new Promise((r) => setTimeout(r, 1500)),
  ]);
  fontsReady.then(() => {
    fitFont();
    // No preroll: the recipient sees wishes 001 through 100, in exact order.
    reset(0);
    beginOpening();
    requestAnimationFrame(loop);
  });
})();
