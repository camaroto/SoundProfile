
/* eslint-disable */
// SakuraFrame - overlay transparente para o perfil SoundProfile.

class SakuraFrame {
  constructor(canvas, options = {}) {
    this.c = canvas;
    this.x = canvas.getContext("2d");
    this.level = options.level ?? 1;

    this.W0 = 2167;
    this.H0 = 726;

    this.t = 0;
    this.last = 0;
    this.raf = 0;
    this.vis = true;
    this.P = [];
    this.B = [];

    this.NP = [6, 14, 26];
    this.AMP = [0.5, 1, 1.8];

    this.dead = false;
    this.mq = matchMedia("(prefers-reduced-motion: reduce)");

    this.build();
    this.sprite();

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);

    this.io = new IntersectionObserver((entries) => {
      this.vis = entries[0].isIntersecting;
      this.sync();
    });

    this.io.observe(canvas);

    this.onMotion = () => this.sync();
    this.onVisibility = () => this.sync();

    this.mq.addEventListener("change", this.onMotion);
    document.addEventListener("visibilitychange", this.onVisibility);

    this.resize();
    this.sync();
  }


  build() {
    let seed = 11;

    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    const flower = (x, y, size) => ({
      x,
      y,
      size,
      rotation: random() * Math.PI * 2,
      phase: random() * Math.PI * 2,
    });

    // Agrupamento superior esquerdo.
    for (let i = 0; i < 11; i++) {
      this.B.push(
        flower(
          55 + random() * 360,
          35 + random() * 150,
          13 + random() * 14
        )
      );
    }

    // Agrupamento superior direito.
    for (let i = 0; i < 11; i++) {
      this.B.push(
        flower(
          1750 + random() * 360,
          35 + random() * 150,
          13 + random() * 14
        )
      );
    }

    // Flores menores na lateral esquerda.
    for (let i = 0; i < 5; i++) {
      this.B.push(
        flower(
          35 + random() * 80,
          250 + random() * 250,
          10 + random() * 10
        )
      );
    }

    // Flores menores na lateral direita.
    for (let i = 0; i < 5; i++) {
      this.B.push(
        flower(
          2050 + random() * 80,
          250 + random() * 250,
          10 + random() * 10
        )
      );
    }
  }


  sprite() {
    const s = (this.S = document.createElement("canvas"));
    s.width = s.height = 128;

    const x = s.getContext("2d");
    x.translate(64, 64);

    for (let i = 0; i < 5; i++) {
      x.save();
      x.rotate((i * Math.PI * 2) / 5);

      x.beginPath();
      x.moveTo(0, 0);
      x.bezierCurveTo(-26, -10, -30, -50, -9, -58);
      x.lineTo(0, -50);
      x.lineTo(9, -58);
      x.bezierCurveTo(30, -50, 26, -10, 0, 0);

      const gradient = x.createRadialGradient(
        0, -8, 2,
        0, -30, 48
      );

      gradient.addColorStop(0, "#ffe6f1");
      gradient.addColorStop(0.55, "#ff9cc6");
      gradient.addColorStop(1, "#ee4f98");

      x.fillStyle = gradient;
      x.fill();

      x.strokeStyle = "rgba(255,255,255,.45)";
      x.lineWidth = 1;
      x.stroke();

      x.restore();
    }

    x.fillStyle = "#b3225f";
    x.beginPath();
    x.arc(0, 0, 5, 0, Math.PI * 2);
    x.fill();

    for (let i = 0; i < 6; i++) {
      const a = i * 1.047;

      x.beginPath();
      x.arc(Math.cos(a) * 13, Math.sin(a) * 13, 2.2, 0, Math.PI * 2);
      x.fillStyle = "#ffd35e";
      x.fill();
    }
  }

  resize() {
    const w = Math.min(
      Math.round(this.c.clientWidth * Math.min(devicePixelRatio || 1, 2)),
      1800
    );

    if (!w) return;

    this.c.width = w;
    this.c.height = Math.round(w * this.H0 / this.W0);

    this.draw(this.t, this.mq.matches);
  }

  setLevel(n) {
    this.level = Math.max(0, Math.min(2, n));
    if (this.mq.matches) this.draw(0, true);
  }

  sync() {
    if (this.dead) return;

    const on = this.vis && !document.hidden && !this.mq.matches;

    if (on && !this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame((n) => this.loop(n));
    }

    if (!on) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;

      if (this.mq.matches) {
        this.draw(0, true);
      }
    }
  }

  loop(n) {
    if (this.dead) return;

    this.raf = requestAnimationFrame((next) => this.loop(next));

    if (n - this.last < 33) return;

    const dt = Math.min(0.1, (n - this.last) / 1000);

    this.last = n;
    this.t += dt;

    this.draw(this.t, false, dt);
  }

  petal(initial = false) {
    return {
      x: Math.random() * this.W0,
      y: initial ? Math.random() * this.H0 : -20,
      vy: 28 + Math.random() * 38,
      size: 4 + Math.random() * 4,
      rotation: Math.random() * 6,
      vr: (Math.random() - 0.5) * 2,
      phase: Math.random() * 6,
    };
  }

  draw(t, staticMode, dt = 0) {
    if (!this.c.width) return;

    const x = this.x;
    const w = this.c.width;
    const h = this.c.height;
    const k = w / this.W0;
    const level = this.level;

    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, w, h);

    // O canvas permanece transparente.
    x.globalCompositeOperation = "source-over";

    // Flores decorativas nas extremidades.
    this.B.forEach((b) => {
      const movement = staticMode
        ? 0
        : Math.sin(t * 0.8 + b.phase) * this.AMP[level];

      x.save();

      x.translate(
        (b.x + movement) * k,
        (b.y + Math.sin(t * 0.6 + b.phase) * 2) * k
      );

      x.rotate(b.rotation + movement * 0.05);
      x.scale(b.size / 58, b.size / 58);

      x.globalAlpha = 0.95;
      x.drawImage(this.S, -64, -64);

      x.restore();
    });

    // Anel decorativo ao redor do avatar.
    x.save();
    x.globalCompositeOperation = "lighter";

    const avatarX = 207 * k;
    const avatarY = 625 * k;
    const radius = 88 * k;

    x.strokeStyle = "rgba(255,179,218,.9)";
    x.lineWidth = 5 * k;
    x.shadowColor = "rgba(255,90,170,.9)";
    x.shadowBlur = 14 * k;

    x.beginPath();
    x.arc(avatarX, avatarY, radius, 0, Math.PI * 2);
    x.stroke();

    x.shadowBlur = 0;
    x.strokeStyle = "rgba(255,230,245,.9)";
    x.lineWidth = 2 * k;

    x.beginPath();
    x.arc(avatarX, avatarY, 79 * k, 0, Math.PI * 2);
    x.stroke();

    // Brilho giratório no anel.
    if (!staticMode) {
      const angle = t * 0.7;

      x.strokeStyle = "rgba(255,255,255,.9)";
      x.lineWidth = 5 * k;

      x.beginPath();
      x.arc(avatarX, avatarY, radius, angle, angle + 0.9);
      x.stroke();
    }

    x.restore();

    if (staticMode) return;

    // Pétalas caindo.
    while (this.P.length < this.NP[level]) {
      this.P.push(this.petal(true));
    }

    if (this.P.length > this.NP[level]) {
      this.P.length = this.NP[level];
    }

    this.P.forEach((p, i) => {
      p.y += p.vy * dt;
      p.rotation += p.vr * dt;

      if (p.y > this.H0 + 20) {
        this.P[i] = this.petal();
        return;
      }

      const px = p.x + Math.sin(p.y * 0.012 + p.phase) * 28;
      const alpha =
        Math.min(1, p.y / 80) *
        Math.min(1, (this.H0 - p.y) / 80) *
        0.85;

      x.save();
      x.translate(px * k, p.y * k);
      x.rotate(p.rotation);
      x.globalAlpha = alpha;

      x.fillStyle = "#ff9fcb";
      x.beginPath();
      x.ellipse(0, 0, p.size * k, p.size * 0.55 * k, 0, 0, Math.PI * 2);
      x.fill();

      x.fillStyle = "rgba(255,255,255,.45)";
      x.beginPath();
      x.ellipse(-p.size * 0.2 * k, -p.size * 0.12 * k, p.size * 0.45 * k, p.size * 0.18 * k, 0, 0, Math.PI * 2);
      x.fill();

      x.restore();
    });
  }

  destroy() {
    this.dead = true;

    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.io.disconnect();

    this.mq.removeEventListener("change", this.onMotion);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }
}

export { SakuraFrame };
