/* RSP in Japan — shared behaviour across all pages */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initMobileNav();
    initReveal();
    initCounters();
    initLightbox();
    initContactForm();
    initActiveNav();
    initYear();
  });

  /* ---- Footer copyright year -------------------------------------------- */
  function initYear() {
    var yearEls = document.querySelectorAll("[data-year]");
    yearEls.forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---- Sticky header that condenses on scroll ---------------------------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var threshold = 60;

    function onScroll() {
      if (window.scrollY > threshold) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile hamburger nav ------------------------------------------------ */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-mobile");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---- Highlight the current page in nav ------------------------------------ */
  function initActiveNav() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a, .nav-mobile a").forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        link.classList.add("active");
      }
    });
  }

  /* ---- Scroll-triggered reveal for cards / sections -------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) { observer.observe(el); });

    // stagger children inside .reveal-stagger containers
    document.querySelectorAll(".reveal-stagger").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.setProperty("--i", i);
      });
    });
  }

  /* ---- Animated trust-strip counters ----------------------------------------- */
  function initCounters() {
    var counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1400;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(target * eased);
        el.textContent = value + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      }
      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ---- Certificate gallery lightbox ------------------------------------------ */
  function initLightbox() {
    var cards = document.querySelectorAll("[data-cert-trigger]");
    var lightbox = document.querySelector(".lightbox");
    if (!cards.length || !lightbox) return;

    var titleEl = lightbox.querySelector("[data-lightbox-title]");
    var metaEl = lightbox.querySelector("[data-lightbox-meta]");
    var closeEl = lightbox.querySelector(".lightbox-close");

    function open(card) {
      titleEl.textContent = card.getAttribute("data-cert-name") || "";
      metaEl.textContent = card.getAttribute("data-cert-meta") || "";
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    cards.forEach(function (card) {
      card.addEventListener("click", function () { open(card); });
      card.addEventListener("keypress", function (e) {
        if (e.key === "Enter" || e.key === " ") open(card);
      });
    });
    closeEl.addEventListener("click", close);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---- Contact form: front-end validation + success state --------------------- */
  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var fields = form.querySelectorAll("[required]");

      fields.forEach(function (field) {
        var group = field.closest(".form-group");
        var value = field.value.trim();
        var ok = value.length > 0;

        if (field.type === "email" && ok) {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        if (field.type === "tel" && ok) {
          ok = /^[0-9+\-\s()]{7,}$/.test(value);
        }

        if (group) group.classList.toggle("has-error", !ok);
        if (!ok) valid = false;
      });

      if (!valid) return;

      form.classList.add("is-submitted");
      var success = form.querySelector(".form-success");
      if (success) success.classList.add("is-visible");
      form.reset();
    });
  }
})();
