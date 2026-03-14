(function () {
  "use strict";

  // ===== Sticky Header =====
  const header = document.querySelector("header");

  window.addEventListener("scroll", function () {
    if (!header) return;

    if (window.scrollY > 50) {
      header.classList.add("shadow-md");
    } else {
      header.classList.remove("shadow-md");
    }

    // Back to top button
    const backToTop = document.querySelector(".back-to-top");
    if (backToTop) {
      if (window.scrollY > 200) {
        backToTop.style.display = "flex";
      } else {
        backToTop.style.display = "none";
      }
    }
  });

  // ===== Mobile Menu =====
  const mobileBtn = document.querySelector('[id^="mobileMenuBtn"]');
  const mobileMenu = document.querySelector('[id^="mobileMenu"]');

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    // Close menu when link clicked
    const links = mobileMenu.querySelectorAll("a");

    links.forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }

  // ===== Smooth Scroll =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {

      const target = document.querySelector(this.getAttribute("href"));

      if (target) {
        e.preventDefault();

        window.scrollTo({
          top: target.offsetTop - 70,
          behavior: "smooth"
        });
      }

    });
  });

  // ===== Theme Switcher =====
  const themeSwitcher = document.getElementById("themeSwitcher");

  const userTheme = localStorage.getItem("theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const themeCheck = () => {
    if (userTheme === "dark" || (!userTheme && systemTheme)) {
      document.documentElement.classList.add("dark");
    }
  };

  const themeSwitch = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  if (themeSwitcher) {
    themeSwitcher.addEventListener("click", themeSwitch);
  }

  themeCheck();

  // ===== Back To Top Button =====
  const backToTopBtn = document.querySelector(".back-to-top");

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  // ===== Auto Copyright Year =====
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ===== Debug: verify Tailwind CSS loaded and applied =====
  // This check inspects a commonly-used utility (.grid). If the CSS isn't applied,
  // the computed display will not be 'grid'. We log the result to the console to
  // help diagnose why pages might appear unstyled in some browsers.
  setTimeout(() => {
    try {
      const testEl = document.querySelector('.grid');
      const applied = testEl ? (window.getComputedStyle(testEl).display === 'grid') : false;
      console.info('[debug] tailwind.css applied?', applied);
      if (!applied) {
        console.warn('[debug] tailwind.css may not be loaded or applied. Check network tab for /src/css/tailwind.css');
      }
      // Expose for interactive debugging in the console
      window.__tailwind_applied = applied;
    } catch (err) {
      console.error('[debug] error checking tailwind.css application', err);
    }
  }, 150);

})();