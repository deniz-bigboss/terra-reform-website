document.addEventListener("DOMContentLoaded", () => {
  const navbar    = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const nav       = document.getElementById("nav");

  // Navbar shadow on scroll
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 48);
  }, { passive: true });

  // Mobile nav toggle
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen);
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  // Close mobile nav on link click
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
    });
  });

  // Scroll reveal
  const targets = document.querySelectorAll(
    ".about-main, .about-block, .value-tag, .impact-card, .project-card, .program-item, .join-inner, .contact-block"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
    observer.observe(el);
  });
});
