/* Portfolio interactions: mobile nav, scroll reveal, footer year. */
(function () {
  "use strict";

  // --- Current year in footer ---
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // --- Mobile nav toggle ---
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");

  var navOverlay = document.querySelector(".nav-overlay");

  function setNav(open) {
    if (!menu || !toggle) return;
    menu.classList.toggle("open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (navOverlay) navOverlay.classList.toggle("show", open);
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setNav(!menu.classList.contains("open"));
    });

    // Close after tapping a link, tapping the backdrop, or pressing Escape
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setNav(false);
    });
    if (navOverlay) {
      navOverlay.addEventListener("click", function () {
        setNav(false);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) setNav(false);
    });
  }

  // --- Dark mode toggle ---
  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      var next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    });
  }

  // --- Count-up stats ---
  var prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var counters = document.querySelectorAll("[data-count-to]");
  counters.forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (prefersReduced) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var duration = 1100;
    var start = null;
    el.textContent = prefix + "0" + suffix;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(step);
  });

  // --- Scroll reveal ---
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: just show everything
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // --- Project detail dialogs ---
  var lastFocused = null;

  function openDialog(id) {
    var dlg = document.getElementById(id);
    if (!dlg) return;
    lastFocused = document.activeElement;
    dlg.hidden = false;
    document.body.classList.add("dialog-open");
    var closeBtn = dlg.querySelector(".dialog-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeDialog(dlg) {
    if (!dlg) return;
    dlg.hidden = true;
    document.body.classList.remove("dialog-open");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  // Delegate from the document so dialog triggers work in any section.
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-dialog]");
    if (trigger) {
      e.preventDefault();
      openDialog(trigger.getAttribute("data-dialog"));
    }
  });

  var backdrops = document.querySelectorAll(".dialog-backdrop");
  backdrops.forEach(function (dlg) {
    dlg.addEventListener("click", function (e) {
      // Close on backdrop click or close-button click
      if (e.target === dlg || e.target.closest(".dialog-close")) {
        closeDialog(dlg);
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    var open = document.querySelector(".dialog-backdrop:not([hidden])");
    if (!open) return;

    if (e.key === "Escape") {
      closeDialog(open);
      return;
    }

    // Simple focus trap inside the open dialog
    if (e.key === "Tab") {
      var focusables = open.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // --- Interactive spotlight grid on the hero and every section ---
  if (!prefersReduced) {
    document.querySelectorAll(".hero, .section").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100).toFixed(2) + "%");
        el.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100).toFixed(2) + "%");
      });
    });
  }
})();
