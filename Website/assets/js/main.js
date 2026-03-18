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
  const mobileMenuPairs = [
    {
      btn: document.getElementById("mobileMenuBtnIndex"),
      menu: document.getElementById("mobileMenuIndex")
    },
    {
      btn: document.getElementById("mobileMenuBtnContact"),
      menu: document.getElementById("mobileMenuContact")
    }
  ];

  mobileMenuPairs.forEach(({ btn, menu }) => {
    if (!btn || !menu) return;

    const getFocusableElements = () => {
      return Array.from(
        menu.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')
      );
    };

    const closeMenu = () => {
      menu.classList.add("hidden");
      menu.setAttribute("aria-hidden", "true");
      btn.setAttribute("aria-expanded", "false");
      btn.focus();
    };

    const openMenu = () => {
      menu.classList.remove("hidden");
      menu.setAttribute("aria-hidden", "false");
      btn.setAttribute("aria-expanded", "true");

      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    };

    menu.setAttribute("aria-hidden", menu.classList.contains("hidden") ? "true" : "false");
    btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("click", function () {
      if (menu.classList.contains("hidden")) {
        openMenu();
      } else {
        closeMenu();
      }
    });

    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    menu.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab" || menu.classList.contains("hidden")) return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.classList.contains("hidden")) {
        closeMenu();
      }
    });
  });

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

  // ===== Form Subject Routing =====
  const subjectByInquiryType = {
    support: "[Support Request] RushIn Technologies Website",
    career: "[Career Application] RushIn Technologies Website",
    lead: "[New Lead] RushIn Technologies Website",
    general: "[New Lead] RushIn Technologies Website"
  };

  document.querySelectorAll('form[data-subject-routing="true"]').forEach((form) => {
    const subjectInput = form.querySelector('input[name="_subject"]');
    const inquirySelect = form.querySelector('[data-subject-select]');

    if (!subjectInput || !inquirySelect) return;

    const applySubject = () => {
      const selected = inquirySelect.value;
      subjectInput.value = subjectByInquiryType[selected] || subjectByInquiryType.lead;
    };

    inquirySelect.addEventListener("change", applySubject);
    form.addEventListener("submit", applySubject);
    applySubject();
  });

  // ===== Async Form Submission UX =====
  document.querySelectorAll('form[data-ajax-form="true"]').forEach((form) => {
    const submitButton = form.querySelector('button[type="submit"]');
    const statusEl = form.querySelector("[data-form-status]");
    const action = form.getAttribute("action");
    const thankyouUrl = form.getAttribute("data-thankyou-url") || "thankyou.html";

    if (!submitButton || !statusEl || !action) return;

    const defaultButtonText = submitButton.textContent.trim();

    const setStatus = (type, text) => {
      statusEl.classList.remove("hidden", "bg-green-50", "text-green-700", "bg-red-50", "text-red-700", "bg-blue-50", "text-blue-700");

      if (type === "success") {
        statusEl.classList.add("bg-green-50", "text-green-700");
      } else if (type === "error") {
        statusEl.classList.add("bg-red-50", "text-red-700");
      } else {
        statusEl.classList.add("bg-blue-50", "text-blue-700");
      }

      statusEl.innerHTML = text;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      submitButton.disabled = true;
      submitButton.classList.add("opacity-70", "cursor-not-allowed");
      submitButton.textContent = "Sending...";
      setStatus("loading", "Sending your message...");

      try {
        const formData = new FormData(form);
        const response = await fetch(action, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Form submission failed");
        }

        form.reset();
        setStatus(
          "success",
          `Thanks, your message has been sent successfully. We'll get back within 24 hours. <a href="${thankyouUrl}" class="underline font-medium">View confirmation page</a>.`
        );
      } catch (error) {
        setStatus(
          "error",
          "We could not send your message right now. Please try again in a moment or email info@rushintech.in."
        );
      } finally {
        submitButton.disabled = false;
        submitButton.classList.remove("opacity-70", "cursor-not-allowed");
        submitButton.textContent = defaultButtonText;
      }
    });
  });

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