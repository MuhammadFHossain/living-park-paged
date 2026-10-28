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
    var n = Math.max(6, Math.round(bed.clientWidth / 64));
    for (var k = 0; k < n; k++) {
      var t = n === 1 ? 0.5 : k / (n - 1);
      var img = document.createElement('img');
      img.src = base + 'flower-' + (((k * 5) % 11) + 1) + '.png';
      img.alt = '';
      var h = 92 + Math.sin(t * Math.PI) * 30 + Math.random() * 12;
      img.style.height = h + 'px';
      img.style.left = 'calc(' + (t * 100).toFixed(1) + '% - ' + (h * 0.45).toFixed(0) + 'px)';
      img.style.animationDelay = '-' + (Math.random() * 3).toFixed(2) + 's';
      bed.appendChild(img);
    }
  }
  if (calm) return;

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
  var BEE = 64;
  var bee = critter([['bee-wings', 'wings'], ['bee', 'body']], BEE);
  var b = { x: innerWidth * 0.8, y: innerHeight * 0.3, tx: 0, ty: 0, rest: 0, face: 1 };
  function pickBee() {
    b.tx = innerWidth * (0.08 + Math.random() * 0.84);
    b.ty = innerHeight * (0.15 + Math.random() * 0.7);
  }
  pickBee();

  // The cardinal: flies in, sits on the title a while, hops round once or twice, flies off.
  var BIRD = 96;
  var bird = critter([['cardinal-legs', 'legs'], ['cardinal', 'body'], ['cardinal-wing', 'wing']], BIRD);
  bird.wing.style.transformOrigin = (BIRD / 2 + 3.1) + 'px ' + (BIRD / 2 - 2.3) + 'px';
  var c = { phase: 'away', wait: 3 + Math.random() * 3, leg: null, x: -200, y: -200, face: 1, sat: 0, hop: 0, frac: 0.5 };
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
    if (b.rest > 0) b.rest -= dt;
    else {
      var dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy);
      if (d < 6) { b.rest = 0.6 + Math.random() * 1.6; pickBee(); }
      else {
        var v = Math.min(90, 40 + d * 0.5) * dt;
        b.x += (dx / d) * v;
        b.y += (dy / d) * v;
        if (Math.abs(dx) > 4) b.face = dx > 0 ? 1 : -1;
      }
    }
    bee.el.style.transform = 'translate(' + (b.x - BEE / 2).toFixed(1) + 'px,' + (b.y - BEE / 2 + Math.sin(now / 260) * 3).toFixed(1) + 'px) scaleX(' + b.face + ')';

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
      if (c.hop === 0 && Math.random() < dt * 0.4) { c.hop = 0.25; c.face *= -1; }
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
    var beat = flying ? Math.sin(now / 60) : 0;
    bird.wing.style.transform = 'rotate(' + (flying ? -12 + beat * 34 : 0).toFixed(1) + 'deg)';
    bird.legs.style.opacity = flying ? '0' : '1';
    var hop = c.hop > 0 ? Math.sin((c.hop / 0.25) * Math.PI) * 6 : 0;
    bird.el.style.transform = 'translate(' + (c.x - BIRD / 2).toFixed(1) + 'px,' + (c.y - BIRD * 0.62 - hop).toFixed(1) + 'px) scaleX(' + c.face + ')';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
