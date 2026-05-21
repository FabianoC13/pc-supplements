(function () {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const state = {
    cart: [],
    reviewIndex: 0,
    selectedCategory: "all",
    toastTimer: null,
  };

  const PRODUCT_PRICE = 100;
  const PRODUCT_PRICE_LABEL = "S/ 100.00";

  const reviews = [
    {
      quote: "The storefront feels local, polished, and easy to browse.",
      author: "Lima customer",
      date: "11 May 2026",
    },
    {
      quote: "Prices in soles make the purchase decision clearer.",
      author: "Peru buyer",
      date: "04 May 2026",
    },
    {
      quote: "The product spaces are clean and ready for final catalog content.",
      author: "Retail partner",
      date: "28 April 2026",
    },
  ];

  function initIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function formatPrice(amount) {
    return `S/ ${amount.toFixed(2)}`;
  }

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    updateActiveNav(id);
  }

  function updateActiveNav(id) {
    $$(".nav-link").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  }

  function closeDrawers() {
    $("#mobileDrawer").classList.remove("open");
    $("#mobileDrawer").setAttribute("aria-hidden", "true");
    $("#cartDrawer").classList.remove("open");
    $("#cartDrawer").setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function openDrawer(drawer) {
    closeDrawers();
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function renderCart() {
    const count = state.cart.length;
    $("#cartCount").textContent = String(count);
    $("#cartTotal").textContent = `Total: ${formatPrice(count * PRODUCT_PRICE)}`;
    const lines = $("#cartLines");

    if (!count) {
      lines.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    lines.innerHTML = state.cart
      .map(
        (item, index) => `
          <div class="cart-line">
            <span class="cart-line__thumb" aria-hidden="true"></span>
            <span>
              <strong aria-label="Blank product name"></strong>
              <small>${PRODUCT_PRICE_LABEL}</small>
            </span>
            <button type="button" data-remove-cart="${index}" aria-label="Remove item">
              <i data-lucide="trash-2" aria-hidden="true"></i>
            </button>
          </div>
        `,
      )
      .join("");
    initIcons();
  }

  function filterProducts(category) {
    state.selectedCategory = category;
    $$(".category-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.category === category);
    });

    const cards = $$("[data-product-card]");
    let visible = 0;
    cards.forEach((card) => {
      const show = category === "all" || card.dataset.category === category;
      card.hidden = !show;
      if (show) visible += 1;
    });

    $("#searchStatus").textContent =
      category === "all" ? "" : `${visible} blank supplement spaces shown.`;
  }

  function renderReview() {
    const review = reviews[state.reviewIndex];
    $("#reviewCard").innerHTML = `
      <p>"${review.quote}"</p>
      <div>
        <strong>${review.author}</strong>
        <span>${review.date}</span>
      </div>
    `;
    $("#reviewIndex").textContent = `${state.reviewIndex + 1} / ${reviews.length}`;
  }

  function openDialog(dialog) {
    if (!dialog.open) dialog.showModal();
  }

  function bindNavigation() {
    $$("a[href^='#']").forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href").slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        event.preventDefault();
        closeDrawers();
        scrollToId(id);
      });
    });

    $$("[data-scroll-target]").forEach((button) => {
      button.addEventListener("click", () => scrollToId(button.dataset.scrollTarget));
    });
  }

  function bindHeader() {
    $("#menuButton").addEventListener("click", () => openDrawer($("#mobileDrawer")));
    $("[data-close-menu]").addEventListener("click", closeDrawers);
    $("#cartButton").addEventListener("click", () => openDrawer($("#cartDrawer")));
    $("[data-close-cart]").addEventListener("click", closeDrawers);
    $("#accountButton").addEventListener("click", () => openDialog($("#accountModal")));

    $$(".mobile-drawer, .cart-drawer").forEach((drawer) => {
      drawer.addEventListener("click", (event) => {
        if (event.target === drawer) closeDrawers();
      });
    });

    $$(".language-switch button").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".language-switch button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        document.documentElement.lang = button.dataset.language;
        showToast(`${button.dataset.label || button.dataset.language.toUpperCase()} selected`);
      });
    });
  }

  function bindProducts() {
    $$(".category-card").forEach((card) => {
      card.addEventListener("click", () => {
        filterProducts(card.dataset.category);
        scrollToId("products");
      });
    });

    $("[data-view-all]").addEventListener("click", () => {
      filterProducts("all");
      scrollToId("products");
    });

    $$(".add-cart").forEach((button) => {
      button.addEventListener("click", () => {
        state.cart.push({ id: button.dataset.productId });
        renderCart();
        showToast(`${PRODUCT_PRICE_LABEL} supplement space added to cart`);
      });
    });

    $("#cartLines").addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-cart]");
      if (!removeButton) return;
      state.cart.splice(Number(removeButton.dataset.removeCart), 1);
      renderCart();
      showToast("Item removed");
    });

    $("#checkoutButton").addEventListener("click", async () => {
      if (!state.cart.length) {
        showToast("Cart is empty");
        return;
      }

      const button = $("#checkoutButton");
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Opening Paddle...";

      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: state.cart }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Unable to start checkout");
        }

        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }

        showToast("Paddle transaction created, but no checkout URL was returned");
      } catch (error) {
        showToast(error.message || "Checkout failed");
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  }

  function bindSearch() {
    $("#searchForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const query = $("#searchInput").value.trim();
      filterProducts("all");
      $("#searchStatus").textContent = query
        ? `Search ready for "${query}". Supplement slots are intentionally blank.`
        : "";
      scrollToId("products");
    });
  }

  function bindFaqAndReviews() {
    $$(".faq__item").forEach((item) => {
      item.addEventListener("click", () => {
        const expanded = item.getAttribute("aria-expanded") === "true";
        item.setAttribute("aria-expanded", String(!expanded));
      });
    });

    $("#reviewPrev").addEventListener("click", () => {
      state.reviewIndex = (state.reviewIndex - 1 + reviews.length) % reviews.length;
      renderReview();
    });

    $("#reviewNext").addEventListener("click", () => {
      state.reviewIndex = (state.reviewIndex + 1) % reviews.length;
      renderReview();
    });
  }

  function bindForms() {
    $("#newsletterForm").addEventListener("submit", (event) => {
      event.preventDefault();
      $("#newsletterEmail").value = "";
      showToast("Sign-up received");
    });

    $("#calculatorForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const amount = Number($("#amountInput").value);
      const volume = Number($("#volumeInput").value);
      const output = $("#calculatorOutput");
      if (!amount || !volume) {
        output.textContent = "Enter amount and volume.";
        return;
      }
      output.textContent = `${(amount / volume).toFixed(2)} units per volume.`;
    });

    $("#accountModal").addEventListener("close", () => {
      if ($("#accountModal").returnValue === "signin") showToast("Account flow opened");
    });

    $("#contactModal").addEventListener("close", () => {
      if ($("#contactModal").returnValue === "send") showToast("Message sent");
    });

    $$("[data-open-contact]").forEach((button) => {
      button.addEventListener("click", () => openDialog($("#contactModal")));
    });

    $("[data-open-results]").addEventListener("click", () => {
      showToast("Quality certificate panel opened");
    });

    $$("[data-toast]").forEach((button) => {
      button.addEventListener("click", () => showToast(button.dataset.toast));
    });
  }

  function bindNotices() {
    const researchNotice = $("#researchNotice");
    const cookieBanner = $("#cookieBanner");

    $("#acceptResearch").addEventListener("click", () => {
      researchNotice.close();
      window.localStorage.setItem("pcSupplementNoticeAccepted", "1");
    });

    $("#leaveSite").addEventListener("click", () => {
      showToast("Notice remains open until accepted");
    });

    $("#acceptCookies").addEventListener("click", () => {
      cookieBanner.classList.add("hidden");
      window.localStorage.setItem("cookiesAccepted", "1");
    });

    if (window.localStorage.getItem("cookiesAccepted") === "1") {
      cookieBanner.classList.add("hidden");
    }

    if (window.localStorage.getItem("pcSupplementNoticeAccepted") !== "1") {
      setTimeout(() => openDialog(researchNotice), 350);
    }
  }

  function bindScrollSpy() {
    const sections = ["home", "products", "about", "test-results", "calculator", "forum", "b2b", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) updateActiveNav(visible.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0.1, 0.2, 0.4] },
    );

    sections.forEach((section) => observer.observe(section));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initIcons();
    bindNavigation();
    bindHeader();
    bindProducts();
    bindSearch();
    bindFaqAndReviews();
    bindForms();
    bindNotices();
    bindScrollSpy();
    renderCart();
    renderReview();
  });
})();
