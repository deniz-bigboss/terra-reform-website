// Follow the browser language on a first visit, retaining deep links.
(function () {
  try {
    const path = window.location.pathname;
    const suffix = window.location.search + window.location.hash;
    const isTurkish = path === '/tr' || path.startsWith('/tr/');
    if (localStorage.getItem('lang-pref')) return;
    const browserTurkish = (navigator.language || '').toLowerCase().startsWith('tr');
    if (browserTurkish && !isTurkish) {
      window.location.replace((path === '/' ? '/tr/' : '/tr' + path) + suffix);
    } else if (!browserTurkish && isTurkish) {
      const target = path.startsWith('/tr/') ? path.slice(3) : '/';
      window.location.replace((target || '/') + suffix);
    }
  } catch (error) {
    // Storage restrictions should not prevent the page from loading.
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const nav     = document.getElementById("mainNav");
  const burger  = document.getElementById("navBurger");
  const links   = document.getElementById("navLinks");
  const isTurkish = document.documentElement.lang === 'tr';
  const readPreference = key => { try { return localStorage.getItem(key); } catch (error) { return null; } };
  const writePreference = (key, value) => { try { localStorage.setItem(key, value); } catch (error) {} };

  // ── Theme toggle (dark default, light optional) ──
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
  const root = document.documentElement;
  const applyTheme = (t) => {
    if (t === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    if (themeBtn) {
      themeBtn.innerHTML = t === "light" ? MOON : SUN;
      themeBtn.setAttribute('aria-label', t === 'light'
        ? (isTurkish ? 'Koyu temaya geç' : 'Switch to dark theme')
        : (isTurkish ? 'Açık temaya geç' : 'Switch to light theme'));
    }
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
      writePreference("tr-theme", next);
      applyTheme(next);
    });
  }
  applyTheme(readPreference("tr-theme") || "dark");

  // ── Language toggle (EN <-> TR) ──
  if (navInner) {
    const path = window.location.pathname;
    const isTR = path === "/tr" || path.startsWith("/tr/");
    const altPath = isTR
      ? (path.startsWith("/tr/") ? (path.slice(3) || "/") : "/")
      : (path === "/" ? "/tr/" : "/tr" + path);
    const langBtn = document.createElement("a");
    langBtn.className = "lang-toggle";
    langBtn.href = altPath + window.location.search + window.location.hash;
    langBtn.textContent = isTR ? "EN" : "TR";
    langBtn.setAttribute("aria-label", isTR ? "Switch to English" : "Türkçeye geç");
    langBtn.addEventListener("click", () => {
      writePreference("lang-pref", isTR ? "en" : "tr");
    });
    navInner.appendChild(langBtn);
  }

  // Navbar scroll shadow
  window.addEventListener("scroll", () => {
    nav && nav.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  // Mobile menu
  if (burger && links) {
    burger.setAttribute('aria-controls', 'navLinks');
    const closeMenu = (returnFocus = false) => {
      links.classList.remove('open');burger.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
      burger.setAttribute('aria-label',isTurkish ? 'Menüyü aç' : 'Open menu');
      if(returnFocus)burger.focus();
    };
    closeMenu();
    burger.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? (isTurkish ? 'Menüyü kapat' : 'Close menu') : (isTurkish ? 'Menüyü aç' : 'Open menu'));
      if(open)links.querySelector('a')?.focus();
    });
    links.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        closeMenu();
      });
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&links.classList.contains('open')){e.preventDefault();closeMenu(true)}});
    document.addEventListener('click',e=>{if(links.classList.contains('open')&&!nav?.contains(e.target))closeMenu()});
    document.addEventListener('focusin',e=>{if(links.classList.contains('open')&&!nav?.contains(e.target))closeMenu()});
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

  const isTurkish = document.documentElement.lang === 'tr';
  const overlay = document.createElement('dialog');
  overlay.className = 'lightbox';
  overlay.setAttribute('aria-label',isTurkish ? 'Büyütülmüş proje görseli' : 'Enlarged project image');
  overlay.innerHTML = '<img alt="" /><button type="button" class="lightbox-close" aria-label="'+(isTurkish?'Görseli kapat':'Close image')+'">&times;</button>';
  document.body.appendChild(overlay);
  const overlayImg = overlay.querySelector('img');
  let activeTrigger = null;
  overlay.addEventListener('close', () => activeTrigger?.focus());

  const close = () => {
    overlay.close();
  };

  posters.forEach(img => {
    const trigger=img.closest('.proj-poster');
    trigger.tabIndex=0;trigger.setAttribute('role','button');trigger.setAttribute('aria-haspopup','dialog');
    trigger.setAttribute('aria-label',(isTurkish?'Görseli büyüt: ':'Enlarge image: ')+img.alt);
    const open = () => {
      activeTrigger = trigger;
      overlayImg.src = img.src;
      overlayImg.alt = img.alt;
      overlay.showModal();
    };
    trigger.addEventListener('click',open);
    trigger.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
  });

  overlay.querySelector('button').addEventListener('click',close);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
});

// Contribution starting points and reviewed form submission.
document.addEventListener('DOMContentLoaded', () => {
  const isTurkish = document.documentElement.lang === 'tr';
  const t = (turkish, english) => isTurkish ? turkish : english;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
  const joinForm = document.querySelector('#join-form');
  const joinPath = joinForm?.querySelector('#join-path');
  const ideaTemplate = t(
    'Çözmek istediğim sorun:\n\nKimler faydalanabilir:\n\nİlk yaklaşımım veya araştırma sorum:\n\nİhtiyaç duyduğum destek:\n',
    'Problem I want to solve:\n\nWho could benefit:\n\nMy initial approach or research question:\n\nSupport I would find useful:\n'
  );

  function toast(message) {
    document.querySelector('.site-toast')?.remove();
    const element = document.createElement('div');
    element.className = 'site-toast';
    element.setAttribute('role', 'status');
    element.textContent = message;
    document.body.append(element);
    setTimeout(() => element.remove(), 5000);
  }

  function fillMessage(message, value) {
    if (!message) return;
    // Retain a student's writing when another starting point is selected.
    if (message.value.trim() && message.value !== message.dataset.messagePrefill) {
      if (!message.value.includes(value)) message.value += '\n\n' + value;
      delete message.dataset.messagePrefill;
    } else {
      message.value = value;
      message.dataset.messagePrefill = value;
    }
    message.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function updateJoinPath() {
    if (!joinPath) return;
    const idea = joinPath.value === 'idea';
    const guidance = joinForm.querySelector('#idea-form-guidance');
    const message = joinForm.querySelector('#join-message');
    const label = joinForm.querySelector('label[for="join-message"]');
    if (guidance) guidance.hidden = !idea;
    if (label) label.textContent = idea ? t('Proje fikrin', 'Your project idea') : t('Kendinden bahset', 'About you');
    if (message) {
      message.placeholder = idea
        ? t('Sorun, kimlerin faydalanacağı, ilk yaklaşımın ve ihtiyaç duyduğun destek.', 'The problem, who could benefit, your initial approach, and the help you need.')
        : t('Kendin, ilgi alanların ve üzerinde çalışmak istediklerin hakkında birkaç satır.', 'A few lines about yourself, your interests, and what you would like to work on.');
      if (idea) message.setAttribute('aria-describedby', 'idea-form-guidance');
      else message.removeAttribute('aria-describedby');
    }
    const submit = joinForm.querySelector('button[type="submit"]');
    if (submit) submit.textContent = idea ? t('Öneriyi gözden geçir', 'Review proposal') : t('Başvuruyu gözden geçir', 'Review application');
  }

  joinPath?.addEventListener('change', () => {
    updateJoinPath();
    if (joinPath.value === 'idea') fillMessage(joinForm.querySelector('#join-message'), ideaTemplate);
  });
  updateJoinPath();

  document.querySelectorAll('[data-propose-project]').forEach(button => button.addEventListener('click', () => {
    if (!joinForm || !joinPath || joinForm.getAttribute('aria-busy') === 'true') return;
    joinPath.value = 'idea';
    updateJoinPath();
    const message = joinForm.querySelector('#join-message');
    fillMessage(message, ideaTemplate);
    joinForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    message?.focus({ preventScroll: true });
    toast(t('Proje önerisi seçildi. Erken bir fikirle başlayabilirsin; mevcut yazın korundu.', 'Project proposal selected. An early idea is welcome; any text you wrote has been kept.'));
  }));

  document.querySelectorAll('[data-fill-message]').forEach(button => button.addEventListener('click', () => {
    const form = document.querySelector('#join-form, #contact-form');
    if (!form || form.getAttribute('aria-busy') === 'true') return;
    if (joinPath && form === joinForm) {
      joinPath.value = 'contribute';
      updateJoinPath();
    }
    const interest = form.querySelector('#join-interest');
    if (interest && button.dataset.fillInterest) interest.value = button.dataset.fillInterest;
    const subject = form.querySelector('#ct-subject');
    if (subject && button.dataset.fillSubject) subject.value = button.dataset.fillSubject;
    const message = form.querySelector('textarea');
    fillMessage(message, button.dataset.fillMessage);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    message?.focus({ preventScroll: true });
    toast(t('Seçimin forma eklendi. İstersen metni değiştirebilirsin.', 'Your selection is in the form. You can edit the message.'));
  }));

  const contact = document.querySelector('#contact-form');
  const projectNames = {
    'air': 'AIR',
    'battle-of-verdun': 'Battle of Verdun',
    'braille-circuits': 'Braille Circuits',
    'cern-bl4s': t('CERN BL4S projesi', 'CERN BL4S project'),
    'safe-explorer': 'Safe Explorer',
    'solar-microgrid': t('Güneş Mikro Şebekesi', 'Solar-Powered School Microgrid'),
    'virtual-physics-lab': t('Sanal Fizik Laboratuvarı', 'Virtual Physics Laboratory')
  };
  const projectKey = new URLSearchParams(window.location.search).get('project');
  const project = Object.prototype.hasOwnProperty.call(projectNames, projectKey) ? projectNames[projectKey] : null;
  if (contact && project) {
    const subject = contact.querySelector('#ct-subject');
    if (subject) subject.value = t('Geliştirme fikri: ', 'Improvement idea: ') + project;
    fillMessage(contact.querySelector('textarea'),
      t('Bu çalışmayı geliştirmek veya genişletmek istiyorum: ', 'I would like to improve or extend: ') + project +
      t('\n\nFikrim:\n\nNasıl katkı verebilirim:\n\nİhtiyaç duyduğum destek:\n', '\n\nMy idea:\n\nHow I could contribute:\n\nSupport I would find useful:\n'));
  }

  document.querySelectorAll('#join-form, #contact-form, .newsletter-form').forEach((form, index) => {
    const primary = form.querySelector('button[type="submit"]');
    const newsletter = form.classList.contains('newsletter-form');
    if (primary && form !== joinForm) primary.textContent = newsletter
      ? t('Aboneliği gözden geçir', 'Review signup')
      : t('Mesajı gözden geçir', 'Review message');

    const feedback = document.createElement('p');
    feedback.className = 'form-feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.tabIndex = -1;
    feedback.hidden = true;
    form.append(feedback);
    let summary = null;
    let reviewedData = null;
    let reviewedSignature = '';
    let sending = false;

    const signature = data => JSON.stringify([...data.entries()].map(([name, value]) => [name, String(value)]));
    const showFeedback = (message, state = '') => {
      feedback.textContent = message;
      feedback.className = 'form-feedback' + (state ? ' is-' + state : '');
      feedback.hidden = !message;
    };
    const dismissReview = () => {
      if (sending) return;
      summary?.remove();
      summary = null;
      reviewedData = null;
      reviewedSignature = '';
      showFeedback('');
    };
    form.addEventListener('input', dismissReview);
    form.addEventListener('change', dismissReview);
    form.addEventListener('reset', () => {
      dismissReview();
      form.querySelectorAll('textarea').forEach(message => delete message.dataset.messagePrefill);
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (sending || !form.reportValidity()) return;
      dismissReview();
      reviewedData = new FormData(form);
      reviewedSignature = signature(reviewedData);
      const idea = form === joinForm && joinPath?.value === 'idea';
      const labels = {
        name: t('Ad', 'Name'), email: t('E-posta', 'Email'), school: t('Okul', 'School'),
        interest: t('İlgi alanı', 'Interest'), participation_path: t('Katılım yolu', 'Participation path'),
        subject: t('Konu', 'Subject'), message: t('Mesaj', 'Message')
      };
      const items = [...reviewedData.entries()].filter(([name, value]) => labels[name] && String(value).trim());
      const title = newsletter ? t('Aboneliğini gözden geçir', 'Review your signup')
        : idea ? t('Proje önerini gözden geçir', 'Review your project proposal')
        : form === joinForm ? t('Başvurunu gözden geçir', 'Review your application')
        : t('Mesajını gözden geçir', 'Review your message');
      summary = document.createElement('section');
      summary.className = 'submission-review';
      summary.tabIndex = -1;
      const titleId = 'submission-review-title-' + index;
      summary.setAttribute('aria-labelledby', titleId);
      summary.innerHTML = `<h3 id="${titleId}">${title}</h3><p>${t('Henüz gönderilmedi. Bilgilerini kontrol et, ardından göndermeyi seç.', 'Nothing has been sent yet. Check your details, then choose Send.')}</p><dl class="submission-summary">${items.map(([name, value]) => {
        const display = name === 'participation_path'
          ? (value === 'idea' ? t('Yeni proje önerisi', 'New project idea') : t('Mevcut çalışmaya katkı', 'Contribute to existing work'))
          : String(value);
        return `<div><dt>${escapeHtml(labels[name])}</dt><dd>${escapeHtml(display)}</dd></div>`;
      }).join('')}</dl>`;
      const actions = document.createElement('div');
      actions.className = 'submission-actions';
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'btn btn-ghost';
      edit.textContent = t('Düzenle', 'Edit');
      edit.addEventListener('click', () => {
        dismissReview();
        form.querySelector('input:not([type="hidden"]):not([name="_gotcha"]), select, textarea')?.focus();
      });
      const send = document.createElement('button');
      send.type = 'button';
      send.className = 'btn btn-green';
      const sendLabel = newsletter ? t('Abone ol', 'Send signup')
        : idea ? t('Öneriyi gönder', 'Send proposal')
        : form === joinForm ? t('Başvuruyu gönder', 'Send application')
        : t('Mesajı gönder', 'Send message');
      send.textContent = sendLabel;
      send.addEventListener('click', async () => {
        if (sending || !reviewedData) return;
        // Recheck the current values in case another script changed a field.
        if (signature(new FormData(form)) !== reviewedSignature || !form.reportValidity()) {
          dismissReview();
          showFeedback(t('Bilgilerin değişti. Göndermeden önce tekrar gözden geçir.', 'Your details have changed. Please review them again before sending.'));
          primary?.focus();
          return;
        }
        const payload = reviewedData;
        sending = true;
        form.setAttribute('aria-busy', 'true');
        const controls = [...form.querySelectorAll('input, select, textarea, button')].map(control => [control, control.disabled]);
        controls.forEach(([control]) => { control.disabled = true; });
        send.textContent = t('Gönderiliyor…', 'Sending…');
        showFeedback(t('Gönderiliyor…', 'Sending…'));
        try {
          const response = await fetch(form.action, {
            method: 'POST', body: payload, headers: { Accept: 'application/json' }
          });
          if (!response.ok) throw new Error('Submission was not accepted');
          sending = false;
          form.reset();
          if (form === joinForm) updateJoinPath();
          showFeedback(newsletter
            ? t('Abonelik talebin gönderildi. Teşekkürler!', 'Your signup request was sent. Thank you!')
            : t('Mesajın gönderildi. En kısa sürede sana geri döneceğiz.', 'Your message was sent. We will get back to you soon.'), 'success');
          feedback.focus({ preventScroll: true });
        } catch (error) {
          showFeedback(t(
            'Gönderilemedi. Bilgilerin korundu; tekrar deneyebilir veya mrdenizyilmaz0@gmail.com adresine e-posta gönderebilirsin.',
            'Your submission could not be sent. Your details are preserved; try again or email mrdenizyilmaz0@gmail.com.'
          ), 'error');
          feedback.focus({ preventScroll: true });
        } finally {
          sending = false;
          form.removeAttribute('aria-busy');
          controls.forEach(([control, wasDisabled]) => { control.disabled = wasDisabled; });
          send.textContent = sendLabel;
        }
      });
      actions.append(edit, send);
      summary.append(actions);
      form.append(summary);
      summary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      summary.focus({ preventScroll: true });
    });
  });

  const current = window.location.pathname;
  document.querySelectorAll('#navLinks a').forEach(anchor => {
    const target = new URL(anchor.href, window.location.origin);
    if (target.pathname === current && !target.hash) anchor.setAttribute('aria-current', 'page');
  });
});
