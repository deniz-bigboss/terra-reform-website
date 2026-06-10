document.addEventListener("DOMContentLoaded", () => {
  const nav     = document.getElementById("mainNav");
  const burger  = document.getElementById("navBurger");
  const links   = document.getElementById("navLinks");

  // ── Theme toggle (dark default, light optional) ──
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
  const root = document.documentElement;
  const applyTheme = (t) => {
    if (t === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    if (themeBtn) themeBtn.innerHTML = t === "light" ? MOON : SUN;
  };
  const navInner = document.querySelector(".nav-inner");
  let themeBtn = null;
  if (navInner) {
    themeBtn = document.createElement("button");
    themeBtn.className = "theme-toggle";
    themeBtn.setAttribute("aria-label", "Toggle color theme");
    navInner.appendChild(themeBtn);
    themeBtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      localStorage.setItem("tr-theme", next);
      applyTheme(next);
    });
  }
  applyTheme(localStorage.getItem("tr-theme") || "dark");

  // Navbar scroll shadow
  window.addEventListener("scroll", () => {
    nav && nav.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  // Mobile menu
  if (burger && links) {
    burger.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    links.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        links.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Open menu");
      });
    });
  }

  // Scroll reveal
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -36px 0px" });

  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 55}ms`;
    io.observe(el);
  });

  // ── Formspree forms: AJAX submit with inline success message ──
  document.querySelectorAll('form[action*="formspree.io"]').forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("send failed");
        form.innerHTML = '<p class="form-success">&#10003;&nbsp; Thank you! Your message is on its way — we\'ll be in touch soon.</p>';
      } catch {
        if (btn) { btn.disabled = false; btn.textContent = original; }
        let err = form.querySelector(".form-error");
        if (!err) {
          err = document.createElement("p");
          err.className = "form-error";
          form.appendChild(err);
        }
        err.textContent = "Something went wrong — please try again, or email us at info@terra-reform.org.";
      }
    });
  });

  // ── Timeline: scroll-driven line fill + item lighting ──
  const tlTrack = document.getElementById("tlTrack");
  const tlFill = document.getElementById("tlFill");
  if (tlTrack && tlFill) {
    const items = tlTrack.querySelectorAll(".tl-item");
    const update = () => {
      const rect = tlTrack.getBoundingClientRect();
      const focus = window.innerHeight * 0.72;
      const progress = Math.min(Math.max((focus - rect.top) / rect.height, 0), 1);
      tlFill.style.height = (progress * 100) + "%";
      const frontY = rect.top + rect.height * progress;
      items.forEach(item => {
        const dot = item.querySelector(".tl-dot");
        if (dot && dot.getBoundingClientRect().top <= frontY) {
          item.classList.add("lit");
        }
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // ── Interactive Globe (hero) ──
  const canvas = document.getElementById("heroGlobe");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize);
    resize();

    // Build a lat/long wireframe sphere of points
    const RINGS = 12, SEGS = 22;
    const points = [];
    for (let i = 0; i <= RINGS; i++) {
      const lat = (i / RINGS) * Math.PI - Math.PI / 2;
      for (let j = 0; j < SEGS; j++) {
        const lon = (j / SEGS) * Math.PI * 2;
        points.push({
          x: Math.cos(lat) * Math.cos(lon),
          y: Math.sin(lat),
          z: Math.cos(lat) * Math.sin(lon),
        });
      }
    }

    // A handful of "node" points representing global collaboration hubs
    const nodeIdx = [12, 47, 88, 130, 165, 201, 238, 19, 102];
    const nodes = nodeIdx.filter(i => i < points.length).map(i => points[i]);

    let rotY = 0;
    let baseTilt = 0.32;
    let mouseX = 0, mouseY = 0;
    let curTiltX = 0, curTiltY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    function rotate(p, ry, rx) {
      // rotate around Y axis
      let x = p.x * Math.cos(ry) - p.z * Math.sin(ry);
      let z = p.x * Math.sin(ry) + p.z * Math.cos(ry);
      let y = p.y;
      // rotate around X axis
      let y2 = y * Math.cos(rx) - z * Math.sin(rx);
      let z2 = y * Math.sin(rx) + z * Math.cos(rx);
      return { x, y: y2, z: z2 };
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const radius = Math.min(w, h) * 0.42;

      rotY += 0.0018;
      curTiltX += ((baseTilt + mouseY * 0.4) - curTiltX) * 0.04;
      curTiltY += (mouseX * 0.5 - curTiltY) * 0.04;

      const ry = rotY + curTiltY;
      const rx = curTiltX;

      // outer rim
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,223,107,0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const projected = points.map(p => {
        const r = rotate(p, ry, rx);
        return {
          x: cx + r.x * radius,
          y: cy - r.y * radius,
          z: r.z,
        };
      });

      // grid points
      projected.forEach(p => {
        const depth = (p.z + 1) / 2; // 0..1
        if (depth < 0.42) return; // hide far-side points
        const size = 0.6 + depth * 1.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,223,107,${0.08 + depth * 0.32})`;
        ctx.fill();
      });

      // collaboration nodes + connecting lines
      const projNodes = nodes.map(p => {
        const r = rotate(p, ry, rx);
        return { x: cx + r.x * radius, y: cy - r.y * radius, z: r.z };
      });

      for (let i = 0; i < projNodes.length; i++) {
        for (let j = i + 1; j < projNodes.length; j++) {
          const a = projNodes[i], b = projNodes[j];
          if (a.z < 0.15 || b.z < 0.15) continue;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > radius * 0.95) continue;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,223,107,${0.12 * Math.min(a.z, b.z)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      projNodes.forEach(p => {
        if (p.z < 0.1) return;
        const depth = (p.z + 1) / 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.6 + depth * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.5 + depth * 0.5})`;
        ctx.shadowColor = "#00df6b";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(draw);
    }
    draw();
  }
});

/* ── Poster lightbox ───────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const posters = document.querySelectorAll('.proj-poster img');
  if (!posters.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = '<img alt="" /><button class="lightbox-close" aria-label="Close">&times;</button>';
  document.body.appendChild(overlay);
  const overlayImg = overlay.querySelector('img');

  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  posters.forEach(img => {
    img.closest('.proj-poster').addEventListener('click', () => {
      overlayImg.src = img.src;
      overlayImg.alt = img.alt;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
});
