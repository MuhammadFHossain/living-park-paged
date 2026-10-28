// Living Park's plain pages come alive a little, as the game's home page does: a bed of
// the park's own flowers along the foot, a bumblebee that wanders over the page, and now
// and then a cardinal that comes to sit on the title. All painted by the game itself.
// With Reduce Motion on, only the flowers show, and they keep still.
(function () {
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var base = document.currentScript.src.replace(/pages\.js.*$/, 'art/');

  // The bed: a row of the park's flowers, no two neighbours alike, taller toward the middle.
  var bed = document.querySelector('.bed');
  if (bed) {
    // Close together, so their leaves overlap a little and the bed has no gaps.
    var n = Math.max(7, Math.round(bed.clientWidth / 52));
    for (var k = 0; k < n; k++) {
      var t = (k + 0.5) / n;
      var img = document.createElement('img');
      img.src = base + 'flower-' + (((k * 5) % 11) + 1) + '.png';
      img.alt = '';
      var h = 88 + Math.random() * 22;
      img.style.height = h + 'px';
      img.style.left = 'calc(' + (t * 100).toFixed(1) + '% - ' + (h * 0.45).toFixed(0) + 'px)';
      // Rising in from the middle out as the page arrives, then swaying, each at its own pace.
      img.style.animationDelay = Math.round(Math.abs(t - 0.5) * 2 * 420 + 150) + 'ms, -' + (Math.random() * 3).toFixed(2) + 's';
      bed.appendChild(img);
    }
  }
  if (calm) return;

  // Where the browser cannot fade from page to page by itself, the page fades out before
  // a link to another of our pages is followed, and the new one fades in.
  if (!('onpagereveal' in window)) {
    var root = document.documentElement;
    root.classList.add('arriving');
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('arriving'); }); });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.protocol === 'mailto:' || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      root.classList.add('leaving');
      setTimeout(function () { location.href = url.href; }, 280);
    });
    // Coming back with the back button, the page is shown again as it was left: clear the fade.
    window.addEventListener('pageshow', function () { root.classList.remove('leaving'); });
  }

  var life = document.createElement('div');
  life.className = 'life';
  life.setAttribute('aria-hidden', 'true');
  document.body.appendChild(life);
  function critter(parts, box) {
    var el = document.createElement('div');
    el.className = 'critter';
    var out = {};
    parts.forEach(function (p) {
      var img = document.createElement('img');
      img.src = base + p[0] + '.png';
      img.alt = '';
      img.className = p[1];
      img.style.width = img.style.height = box + 'px';
      el.appendChild(img);
      out[p[1]] = img;
    });
    life.appendChild(el);
    out.el = el;
    return out;
  }

  // The bee: drifts from place to place with a little weave, rests, and goes on.
  var BEE = 42;
  var bee = critter([['bee-wings', 'wings'], ['bee', 'body']], BEE);
  // It steers: turns toward where it is going, slows as it comes near, and hovers.
  var b = { x: innerWidth * 0.8, y: innerHeight * 0.3, vx: 0, vy: 0, tx: 0, ty: 0, rest: 0, face: 1, faceTo: 1 };
  function pickBee() {
    b.tx = innerWidth * (0.08 + Math.random() * 0.84);
    b.ty = innerHeight * (0.15 + Math.random() * 0.7);
  }
  pickBee();

  // The cardinal: flies in, sits on the title a while, hops round once or twice, flies off.
  var BIRD = 72;
  var bird = critter([['cardinal-legs', 'legs'], ['cardinal', 'body'], ['cardinal-wing', 'wing']], BIRD);
  // The paintings are 96 points square, shown smaller: the shoulder is scaled with them.
  var k96 = BIRD / 96;
  bird.wing.style.transformOrigin = (BIRD / 2 + 3.1 * k96) + 'px ' + (BIRD / 2 - 2.3 * k96) + 'px';
  var c = { phase: 'away', wait: 3 + Math.random() * 3, leg: null, x: -200, y: -200, face: 1, shown: 1, sat: 0, hop: 0, frac: 0.5, wing: 0, legs: 0 };
  function perch() {
    var h1 = document.querySelector('h1');
    if (!h1) return null;
    var r = document.createRange();
    r.selectNodeContents(h1);
    var t = r.getBoundingClientRect();
    if (!t.width || t.bottom < 0 || t.top > innerHeight) return null;
    c.frac = 0.2 + Math.random() * 0.6;
    return [t.left + t.width * c.frac, t.top + t.height * 0.2];
  }
  /** Where the bird sits now: on the title as it is now, so it stays there if the page scrolls. */
  function seat() {
    var h1 = document.querySelector('h1');
    var r = document.createRange();
    r.selectNodeContents(h1);
    var t = r.getBoundingClientRect();
    return [t.left + t.width * c.frac, t.top + t.height * 0.2];
  }

  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // The bee eases its speed up and down, never jumping, and turns round over a moment.
    var dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy) || 1, want = 0;
    if (b.rest > 0) b.rest -= dt;
    else if (d < 10) { b.rest = 0.8 + Math.random() * 1.6; pickBee(); }
    else want = Math.min(58, d * 0.9);
    var steer = Math.min(1, dt * 1.6);
    b.vx += ((dx / d) * want - b.vx) * steer;
    b.vy += ((dy / d) * want - b.vy) * steer;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (Math.abs(b.vx) > 6) b.faceTo = b.vx > 0 ? 1 : -1;
    b.face += (b.faceTo - b.face) * Math.min(1, dt * 5);
    bee.el.style.transform = 'translate(' + (b.x - BEE / 2).toFixed(2) + 'px,' + (b.y - BEE / 2 + Math.sin(now / 320) * 2.5).toFixed(2) + 'px) scaleX(' + b.face.toFixed(3) + ')';

    if (c.phase === 'away') {
      c.wait -= dt;
      var to = c.wait <= 0 ? perch() : null;
      if (to) {
        var fromLeft = Math.random() < 0.5;
        c.leg = { from: [fromLeft ? -BIRD : innerWidth + BIRD, to[1] - innerHeight * 0.12], to: to, lift: 40, t: 0, dur: 2.6 };
        c.face = fromLeft ? 1 : -1;
        c.phase = 'in';
      } else if (c.wait <= 0) c.wait = 2;
    } else if (c.phase === 'sit') {
      var at = seat();
      c.x = at[0];
      c.y = at[1];
      c.sat -= dt;
      c.hop = Math.max(0, c.hop - dt);
      if (c.hop === 0 && Math.random() < dt * 0.25) { c.hop = 0.3; c.face *= -1; }
      if (c.sat <= 0) {
        c.leg = { from: [c.x, c.y], to: [c.face > 0 ? innerWidth + BIRD : -BIRD, c.y - innerHeight * 0.15], lift: 30, t: 0, dur: 2.4 };
        c.phase = 'out';
      }
    }
    if (c.leg && (c.phase === 'in' || c.phase === 'out')) {
      var L = c.leg;
      L.t = Math.min(1, L.t + dt / L.dur);
      var e = c.phase === 'in' ? 1 - Math.pow(1 - L.t, 2.2) : (L.t < 0.5 ? 2 * L.t * L.t : 1 - Math.pow(-2 * L.t + 2, 2) / 2);
      c.x = L.from[0] + (L.to[0] - L.from[0]) * e;
      c.y = L.from[1] + (L.to[1] - L.from[1]) * e - Math.sin(Math.PI * e) * L.lift;
      if (L.t >= 1) {
        if (c.phase === 'in') { c.phase = 'sit'; c.sat = 3.5 + Math.random() * 3; }
        else { c.phase = 'away'; c.wait = 9 + Math.random() * 12; }
        c.leg = null;
      }
    }
    var flying = c.phase === 'in' || c.phase === 'out';
    // Wings beat in flight, slower as it lands, and settle closed once it sits; its feet
    // come down as it lands; a hop turns it round over the hop.
    var landing = c.phase === 'in' && c.leg ? Math.max(0, (c.leg.t - 0.75) / 0.25) : 0;
    var beatTo = flying ? (-12 + Math.sin(now / (60 + landing * 50)) * 34) * (1 - landing * 0.7) : 0;
    c.wing += (beatTo - c.wing) * Math.min(1, dt * (flying ? 30 : 8));
    bird.wing.style.transform = 'rotate(' + c.wing.toFixed(1) + 'deg)';
    c.legs += ((flying && landing < 0.5 ? 0 : 1) - c.legs) * Math.min(1, dt * 6);
    bird.legs.style.opacity = c.legs.toFixed(2);
    c.shown += (c.face - c.shown) * Math.min(1, dt * 7);
    var hop = c.hop > 0 ? Math.sin((c.hop / 0.3) * Math.PI) * 4 : 0;
    bird.el.style.transform = 'translate(' + (c.x - BIRD / 2).toFixed(2) + 'px,' + (c.y - BIRD * 0.62 - hop).toFixed(2) + 'px) scaleX(' + c.shown.toFixed(3) + ')';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
