document.addEventListener("DOMContentLoaded", () => {
  const nav     = document.getElementById("mainNav");
  const burger  = document.getElementById("navBurger");
  const links   = document.getElementById("navLinks");

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
});
