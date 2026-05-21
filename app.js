(function () {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const state = {
    cart: [],
    language: "es",
    reviewIndex: 0,
    selectedCategory: "all",
    toastTimer: null,
  };

  const LANGUAGE_STORAGE_KEY = "pcLanguage";
  const PRODUCT_PRICE = 100;
  const PRODUCT_PRICE_LABEL = "S/ 100.00";

  const translations = {
    es: {
      pageTitle: "P&C Supplements | Laboratorio Cientifico Peru",
      pageDescription:
        "P&C Supplements es una tienda cientifica de laboratorio en Peru con espacios de producto en blanco y precios en soles.",
      topStripAria: "Datos de servicio",
      topPeru: "Laboratorio cientifico en Peru.",
      topSoles: "Precios en soles peruanos.",
      topDelivery: "Entrega en todo el Peru.",
      topSupport: "Soporte desde Lima.",
      homeAria: "Inicio",
      searchPlaceholder: "Buscar suplementos...",
      searchAria: "Buscar suplementos",
      submitSearchAria: "Enviar busqueda",
      headerActionsAria: "Acciones de cuenta y carrito",
      languageLabel: "Idioma",
      languageSelectAria: "Seleccionar idioma",
      accountAria: "Cuenta",
      cartAria: "Carrito",
      openMenuAria: "Abrir menu",
      mainNavAria: "Navegacion principal",
      navHome: "Inicio",
      navProducts: "Todos los suplementos",
      navAbout: "Nosotros",
      navCertificates: "Certificados de calidad",
      navCalculator: "Calculadora de laboratorio",
      navCommunity: "Comunidad",
      navContact: "Contacto",
      primaryAria: "Principal",
      heroEyebrow: "Lima, Peru · Laboratorio cientifico de suplementos",
      heroCopy:
        "Un catalogo de enfoque cientifico para Peru, con presentacion de laboratorio, espacios listos para certificados y pago en soles.",
      heroBrowse: "Ver suplementos",
      heroCertificates: "Ver certificados de calidad",
      trustSignalsAria: "Senales de confianza",
      featureDelivery: "Entrega en Peru",
      featureLab: "Revision de laboratorio",
      featureRecords: "Registros de calidad",
      featureSupport: "Soporte cientifico",
      categoryTitle: "Comprar por categoria",
      catMicroscopy: "Microscopia",
      catAnalytes: "Analitos",
      catFormulas: "Formulas",
      catCompounds: "Compuestos",
      catMethods: "Metodos",
      catSupplies: "Insumos de laboratorio",
      productsTitle: "Suplementos destacados",
      viewAll: "Ver todo",
      addCart: "Agregar al carrito",
      processTitle: "Construido para revision cientifica",
      processCopy:
        "Un layout cientifico para suplementos, con espacio para notas de origen, registros analiticos, metodos y documentacion de calidad.",
      processPoint1: "Precios y entrega pensados para Peru",
      processPoint2: "Espacios en blanco listos para fotos de catalogo",
      processPoint3: "Espacio para microscopia y certificados por lote",
      learnMore: "Conocer mas",
      labImageAlt: "Cientifico trabajando con microscopio de laboratorio",
      blankTitleAria: "Titulo de seccion en blanco",
      qualityCopy:
        "Aqui puede ir un bloque breve de credibilidad de marca, con espacio para el texto final de lanzamiento.",
      moreAbout: "Mas sobre nosotros",
      statsAria: "Estadisticas de calidad",
      statLocation: "Ubicacion Peru",
      statPricing: "Precios locales",
      statSupport: "Cola de soporte",
      analysisTitle: "Analisis Purple Label",
      analysisCopy:
        "Usa este panel para un metodo analitico destacado, una historia de certificados o una nota de laboratorio peruana.",
      shopNow: "Comprar ahora",
      trustTitle: "Por que los clientes confian en nosotros",
      trustCopy: "Tarjetas de confianza para compra cientifica de suplementos en Peru.",
      trustPricingTitle: "Precios locales",
      trustPricingCopy: "Cada espacio de producto esta en S/ 100.00 para una grilla limpia.",
      trustQualityTitle: "Calidad primero",
      trustQualityCopy: "Estructurado para notas analiticas, certificados y soporte.",
      trustCertificateTitle: "Listo para certificados",
      trustCertificateCopy: "Incluye espacio dedicado para certificados de calidad.",
      trustSupportTitle: "Soporte",
      trustSupportCopy: "Cuenta y contacto permanecen disponibles en toda la tienda.",
      qualityInfoTitle: "Informacion de calidad y etiqueta",
      qualityInfoCopy:
        "Usa esta area para notas analiticas, certificados, detalles de importacion, condiciones de entrega y cumplimiento en Peru.",
      qualityCertificates: "Certificados de calidad",
      faqAria: "Preguntas frecuentes",
      faqLocationQ: "Donde esta ubicada la tienda?",
      faqLocationA: "P&C Supplements esta configurada como tienda enfocada en Peru.",
      faqCurrencyQ: "Que moneda usa el checkout?",
      faqCurrencyA: "Todos los espacios de producto cuestan S/ 100.00 en PEN.",
      faqDocsQ: "Donde van los documentos de calidad?",
      faqDocsA: "Usa la seccion de certificados y las paginas de detalle de producto.",
      faqDeliveryQ: "Este layout soporta entregas en Peru?",
      faqDeliveryA: "Si. El header, footer y checkout estan pensados para Peru.",
      reviewsTitle: "Lo que dicen nuestros clientes",
      reviewsRating: "4.7/5 · 136+ resenas",
      prevReviewAria: "Resena anterior",
      nextReviewAria: "Siguiente resena",
      calculatorTitle: "Calculadora de laboratorio",
      calculatorCopy: "Area simple para calculos de concentracion en flujos de laboratorio.",
      amountLabel: "Cantidad",
      volumeLabel: "Volumen",
      calculateButton: "Calcular",
      calculatorOutputDefault: "El resultado aparecera aqui.",
      additionalSectionsAria: "Secciones adicionales",
      communityTitle: "Comunidad",
      communityCopy: "Aqui pueden ir notas cientificas, metodos y enlaces a articulos.",
      openCommunity: "Abrir comunidad",
      b2bCopy: "Aqui pueden ir compras por volumen y consultas de socios comerciales.",
      startInquiry: "Iniciar consulta",
      contactTitle: "Contacto",
      contactCopy: "Usa contacto para cuenta, entregas y soporte de pedidos.",
      contactButton: "Contacto",
      newsletterTitle: "Accede a lanzamientos de P&C en Peru",
      newsletterCopy: "Registrate para recibir novedades de lanzamiento, entrega y promociones.",
      emailLabel: "Correo",
      emailPlaceholder: "Correo electronico",
      signUp: "Registrarse",
      footerCopy:
        "Una tienda cientifica premium enfocada en Peru, con espacios de catalogo en blanco, precios en soles y puntos de soporte.",
      footerCompanyAria: "Enlaces de compania",
      companyTitle: "Compania",
      footerPoliciesAria: "Enlaces de politicas",
      policiesTitle: "Politicas",
      privacyPolicy: "Politica de privacidad",
      termsConditions: "Terminos y condiciones",
      returnsRefunds: "Cambios y devoluciones",
      disclaimer: "Descargo de responsabilidad",
      footerContactCopy: "Espacio para soporte desde Lima y atencion al cliente.",
      mobileMenuAria: "Menu movil",
      menuTitle: "Menu",
      closeMenuAria: "Cerrar menu",
      cartTitle: "Carrito",
      closeCartAria: "Cerrar carrito",
      cartEmpty: "Tu carrito esta vacio.",
      totalLabel: "Total",
      checkoutButton: "Pagar con Paddle",
      closeAccountAria: "Cerrar cuenta",
      accountTitle: "Cuenta",
      signIn: "Iniciar sesion",
      closeContactAria: "Cerrar contacto",
      messageLabel: "Mensaje",
      messagePlaceholder: "Mensaje",
      sendButton: "Enviar",
      noticeTitle: "Aviso importante — Tienda de suplementos",
      noticeSub: "Lee antes de entrar a este sitio.",
      noticeCopy:
        "Esta tienda es un layout cientifico de suplementos e integracion de pago para Peru. Las etiquetas, afirmaciones analiticas, ingredientes y reglas de compra finales deben revisarse antes del lanzamiento.",
      noticePoint1: "Tienes al menos 18 anos.",
      noticePoint2: "Revisaras las etiquetas antes de comprar.",
      noticePoint3: "Aceptas responsabilidad por cumplimiento local y decisiones de uso.",
      acceptTerms: "He leido los terminos y acepto",
      leaveSite: "Si no aceptas, sal de este sitio.",
      cookiesTitle: "Cookies y privacidad",
      cookiesCopy:
        "Las cookies necesarias mantienen el sitio funcionando. Las preferencias opcionales se pueden configurar despues.",
      acceptCookies: "Aceptar y continuar",
      itemRemoved: "Articulo eliminado",
      cartProductNameAria: "Nombre de producto en blanco",
      removeItemAria: "Quitar articulo",
      blankSupplementSpacesShown: "espacios de suplemento en blanco visibles",
      addCartToast: "espacio de suplemento agregado al carrito",
      cartEmptyToast: "El carrito esta vacio",
      openingPaddle: "Abriendo Paddle...",
      unableStartCheckout: "No se pudo iniciar el checkout",
      noCheckoutUrl: "La transaccion de Paddle fue creada, pero no devolvio URL de checkout",
      checkoutFailed: "Fallo el checkout",
      searchReady: 'Busqueda lista para "{query}". Los espacios de suplemento estan intencionalmente en blanco.',
      newsletterToast: "Registro recibido",
      enterAmountVolume: "Ingresa cantidad y volumen.",
      unitsPerVolume: "{value} unidades por volumen.",
      accountToast: "Flujo de cuenta abierto",
      messageSent: "Mensaje enviado",
      qualityToast: "Panel de certificados de calidad abierto",
      communityToast: "Accion de comunidad abierta",
      privacyToast: "Panel de privacidad abierto",
      termsToast: "Panel de terminos abierto",
      returnsToast: "Panel de devoluciones abierto",
      disclaimerToast: "Panel de descargo abierto",
      cookiePrefsToast: "Preferencias de cookies abiertas",
      noticeStillOpen: "El aviso permanece abierto hasta aceptar",
      languageChanged: "Idioma cambiado a Espanol",
    },
    en: {
      pageTitle: "P&C Supplements | Scientific Lab Peru",
      pageDescription:
        "P&C Supplements scientific lab storefront for Peru with blank product spaces and local sol pricing.",
      topStripAria: "Service highlights",
      topPeru: "Peru-based scientific lab.",
      topSoles: "Prices in Peruvian soles.",
      topDelivery: "Delivery across Peru.",
      topSupport: "Support from Lima.",
      homeAria: "Home",
      searchPlaceholder: "Search supplements...",
      searchAria: "Search supplements",
      submitSearchAria: "Submit search",
      headerActionsAria: "Account and cart actions",
      languageLabel: "Language",
      languageSelectAria: "Select language",
      accountAria: "Account",
      cartAria: "Cart",
      openMenuAria: "Open menu",
      mainNavAria: "Main navigation",
      navHome: "Home",
      navProducts: "All Supplements",
      navAbout: "About Us",
      navCertificates: "Quality Certificates",
      navCalculator: "Lab Calculator",
      navCommunity: "Community",
      navContact: "Contact",
      primaryAria: "Primary",
      heroEyebrow: "Lima, Peru · Scientific supplement lab",
      heroCopy:
        "A lab-forward catalog for Peru with scientific presentation, certificate-ready product spaces, and local sol checkout.",
      heroBrowse: "Browse Supplements",
      heroCertificates: "View Quality Certificates",
      trustSignalsAria: "Trust signals",
      featureDelivery: "Peru Delivery",
      featureLab: "Lab Reviewed",
      featureRecords: "Quality Records",
      featureSupport: "Scientific Support",
      categoryTitle: "Shop by Category",
      catMicroscopy: "Microscopy",
      catAnalytes: "Analytes",
      catFormulas: "Formulas",
      catCompounds: "Compounds",
      catMethods: "Methods",
      catSupplies: "Lab Supplies",
      productsTitle: "Featured Supplements",
      viewAll: "View All",
      addCart: "Add to Cart",
      processTitle: "Built for Scientific Review",
      processCopy:
        "A scientific supplement layout with room for sourcing notes, analytical records, method details, and quality documentation.",
      processPoint1: "Peru-first pricing and delivery language",
      processPoint2: "Blank product slots ready for catalog photos",
      processPoint3: "Microscope and certificate placement for every batch",
      learnMore: "Learn More About Us",
      labImageAlt: "Scientist working with laboratory microscope",
      blankTitleAria: "Blank section title",
      qualityCopy:
        "A short brand credibility block can sit here, with room for final launch copy while keeping the page distinct.",
      moreAbout: "More about us",
      statsAria: "Quality statistics",
      statLocation: "Peru location",
      statPricing: "Local pricing",
      statSupport: "Support queue",
      analysisTitle: "Purple Label Analysis",
      analysisCopy:
        "Use this panel for a featured analytical method, certificate story, or Peruvian lab note without copying the reference brand.",
      shopNow: "Shop Now",
      trustTitle: "Why Customers Trust Us",
      trustCopy: "Compact trust cards for scientific supplement shopping in Peru.",
      trustPricingTitle: "Local Pricing",
      trustPricingCopy: "Every product slot is set to S/ 100.00 for a clean launch grid.",
      trustQualityTitle: "Quality First",
      trustQualityCopy: "Structured for analytical notes, certificates, and support context.",
      trustCertificateTitle: "Certificate Ready",
      trustCertificateCopy: "Dedicated quality-certificate placement is included.",
      trustSupportTitle: "Support",
      trustSupportCopy: "Account and contact actions stay available across the storefront.",
      qualityInfoTitle: "Quality & Label Information",
      qualityInfoCopy:
        "Use this area for analytical notes, certificates, import details, local delivery conditions, and compliance copy for Peru.",
      qualityCertificates: "Quality Certificates",
      faqAria: "Frequently asked questions",
      faqLocationQ: "Where is the store located?",
      faqLocationA: "P&C Supplements is set up as a Peru-focused storefront.",
      faqCurrencyQ: "What currency does checkout use?",
      faqCurrencyA: "All product spaces are priced at S/ 100.00 using PEN.",
      faqDocsQ: "Where do quality documents belong?",
      faqDocsA: "Use the certificate section and product detail pages.",
      faqDeliveryQ: "Can this layout support delivery in Peru?",
      faqDeliveryA: "Yes. Header, footer, and checkout copy are framed around Peru.",
      reviewsTitle: "What Our Customers Say",
      reviewsRating: "4.7/5 · 136+ reviews",
      prevReviewAria: "Previous review",
      nextReviewAria: "Next review",
      calculatorTitle: "Lab Calculator",
      calculatorCopy: "Simple concentration calculation area for future lab workflows.",
      amountLabel: "Amount",
      volumeLabel: "Volume",
      calculateButton: "Calculate",
      calculatorOutputDefault: "Result will appear here.",
      additionalSectionsAria: "Additional sections",
      communityTitle: "Community",
      communityCopy: "Scientific notes, methods, and article links can be placed here.",
      openCommunity: "Open community",
      b2bCopy: "Bulk purchasing and retail partner inquiry flows can live here.",
      startInquiry: "Start inquiry",
      contactTitle: "Contact",
      contactCopy: "Use the contact action for account, delivery, and order support.",
      contactButton: "Contact",
      newsletterTitle: "Unlock P&C Drops for Peru",
      newsletterCopy: "Sign up now and receive launch, delivery, and promotion updates.",
      emailLabel: "Email",
      emailPlaceholder: "Email address",
      signUp: "Sign Up",
      footerCopy:
        "A premium Peru-focused scientific supplement storefront with blank catalog spaces, local sol pricing, and support touchpoints.",
      footerCompanyAria: "Footer company links",
      companyTitle: "Company",
      footerPoliciesAria: "Footer policy links",
      policiesTitle: "Policies",
      privacyPolicy: "Privacy Policy",
      termsConditions: "Terms & Conditions",
      returnsRefunds: "Returns & Refunds",
      disclaimer: "Disclaimer",
      footerContactCopy: "Lima support line and customer service space.",
      mobileMenuAria: "Mobile menu",
      menuTitle: "Menu",
      closeMenuAria: "Close menu",
      cartTitle: "Cart",
      closeCartAria: "Close cart",
      cartEmpty: "Your cart is empty.",
      totalLabel: "Total",
      checkoutButton: "Checkout with Paddle",
      closeAccountAria: "Close account",
      accountTitle: "Account",
      signIn: "Sign In",
      closeContactAria: "Close contact",
      messageLabel: "Message",
      messagePlaceholder: "Message",
      sendButton: "Send",
      noticeTitle: "Important Notice — Supplement Store",
      noticeSub: "Please read before entering this website.",
      noticeCopy:
        "This storefront is a scientific supplement layout and checkout integration for Peru. Final labels, analytical claims, ingredients, and purchasing rules should be reviewed before launch.",
      noticePoint1: "You are at least 18 years of age.",
      noticePoint2: "You will review product labels before purchasing.",
      noticePoint3: "You accept responsibility for local compliance and usage decisions.",
      acceptTerms: "I have read the terms and I agree",
      leaveSite: "If you do not agree, please leave this website.",
      cookiesTitle: "Cookies & privacy",
      cookiesCopy:
        "Necessary cookies keep the site running. Optional preferences can be configured later.",
      acceptCookies: "Accept & continue",
      itemRemoved: "Item removed",
      cartProductNameAria: "Blank product name",
      removeItemAria: "Remove item",
      blankSupplementSpacesShown: "blank supplement spaces shown",
      addCartToast: "supplement space added to cart",
      cartEmptyToast: "Cart is empty",
      openingPaddle: "Opening Paddle...",
      unableStartCheckout: "Unable to start checkout",
      noCheckoutUrl: "Paddle transaction created, but no checkout URL was returned",
      checkoutFailed: "Checkout failed",
      searchReady: 'Search ready for "{query}". Supplement slots are intentionally blank.',
      newsletterToast: "Sign-up received",
      enterAmountVolume: "Enter amount and volume.",
      unitsPerVolume: "{value} units per volume.",
      accountToast: "Account flow opened",
      messageSent: "Message sent",
      qualityToast: "Quality certificate panel opened",
      communityToast: "Community action opened",
      privacyToast: "Privacy panel opened",
      termsToast: "Terms panel opened",
      returnsToast: "Returns panel opened",
      disclaimerToast: "Disclaimer panel opened",
      cookiePrefsToast: "Cookie preferences opened",
      noticeStillOpen: "Notice remains open until accepted",
      languageChanged: "Language changed to English",
    },
  };

  const reviews = {
    es: [
      {
        quote: "La tienda se siente local, pulida y facil de navegar.",
        author: "Cliente de Lima",
        date: "11 mayo 2026",
      },
      {
        quote: "Los precios en soles hacen mas clara la decision de compra.",
        author: "Comprador en Peru",
        date: "04 mayo 2026",
      },
      {
        quote: "Los espacios de producto estan limpios y listos para el catalogo final.",
        author: "Socio comercial",
        date: "28 abril 2026",
      },
    ],
    en: [
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
    ],
  };

  function initIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function t(key, replacements = {}) {
    const value = translations[state.language]?.[key] || translations.es[key] || key;
    return Object.entries(replacements).reduce(
      (text, [name, replacement]) => text.replaceAll(`{${name}}`, replacement),
      value,
    );
  }

  function applyLanguage() {
    document.documentElement.lang = state.language === "es" ? "es-PE" : "en";
    document.title = t("pageTitle");
    const description = $('meta[name="description"]');
    if (description) description.setAttribute("content", t("pageDescription"));

    $$("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });

    $$("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
    });

    $$("[data-i18n-aria]").forEach((element) => {
      element.setAttribute("aria-label", t(element.dataset.i18nAria));
    });

    $$("[data-i18n-alt]").forEach((element) => {
      element.setAttribute("alt", t(element.dataset.i18nAlt));
    });

    const languageSelect = $("#languageSelect");
    if (languageSelect) languageSelect.value = state.language;
  }

  function setLanguage(language, options = {}) {
    state.language = translations[language] ? language : "es";
    if (options.persist) {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, state.language);
      showToast(t("languageChanged"));
    }
    applyLanguage();
    renderCart();
    renderReview();
    const calculatorOutput = $("#calculatorOutput");
    if (calculatorOutput && !calculatorOutput.dataset.hasResult) {
      calculatorOutput.textContent = t("calculatorOutputDefault");
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
    $("#cartTotal").textContent = `${t("totalLabel")}: ${formatPrice(count * PRODUCT_PRICE)}`;
    const lines = $("#cartLines");

    if (!count) {
      lines.innerHTML = `<p>${t("cartEmpty")}</p>`;
      return;
    }

    lines.innerHTML = state.cart
      .map(
        (item, index) => `
          <div class="cart-line">
            <span class="cart-line__thumb" aria-hidden="true"></span>
            <span>
              <strong aria-label="${t("cartProductNameAria")}"></strong>
              <small>${PRODUCT_PRICE_LABEL}</small>
            </span>
            <button type="button" data-remove-cart="${index}" aria-label="${t("removeItemAria")}">
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
      category === "all" ? "" : `${visible} ${t("blankSupplementSpacesShown")}.`;
  }

  function renderReview() {
    const languageReviews = reviews[state.language] || reviews.es;
    const review = languageReviews[state.reviewIndex % languageReviews.length];
    $("#reviewCard").innerHTML = `
      <p>"${review.quote}"</p>
      <div>
        <strong>${review.author}</strong>
        <span>${review.date}</span>
      </div>
    `;
    $("#reviewIndex").textContent = `${state.reviewIndex + 1} / ${languageReviews.length}`;
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

    $("#languageSelect").addEventListener("change", (event) => {
      setLanguage(event.target.value, { persist: true });
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
        showToast(`${PRODUCT_PRICE_LABEL} ${t("addCartToast")}`);
      });
    });

    $("#cartLines").addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-cart]");
      if (!removeButton) return;
      state.cart.splice(Number(removeButton.dataset.removeCart), 1);
      renderCart();
      showToast(t("itemRemoved"));
    });

    $("#checkoutButton").addEventListener("click", async () => {
      if (!state.cart.length) {
        showToast(t("cartEmptyToast"));
        return;
      }

      const button = $("#checkoutButton");
      const originalText = t("checkoutButton");
      button.disabled = true;
      button.textContent = t("openingPaddle");

      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: state.cart }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || t("unableStartCheckout"));
        }

        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }

        showToast(t("noCheckoutUrl"));
      } catch (error) {
        showToast(error.message || t("checkoutFailed"));
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
        ? t("searchReady", { query })
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
      const languageReviews = reviews[state.language] || reviews.es;
      state.reviewIndex = (state.reviewIndex - 1 + languageReviews.length) % languageReviews.length;
      renderReview();
    });

    $("#reviewNext").addEventListener("click", () => {
      const languageReviews = reviews[state.language] || reviews.es;
      state.reviewIndex = (state.reviewIndex + 1) % languageReviews.length;
      renderReview();
    });
  }

  function bindForms() {
    $("#newsletterForm").addEventListener("submit", (event) => {
      event.preventDefault();
      $("#newsletterEmail").value = "";
      showToast(t("newsletterToast"));
    });

    $("#calculatorForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const amount = Number($("#amountInput").value);
      const volume = Number($("#volumeInput").value);
      const output = $("#calculatorOutput");
      if (!amount || !volume) {
        output.textContent = t("enterAmountVolume");
        output.dataset.hasResult = "true";
        return;
      }
      output.textContent = t("unitsPerVolume", { value: (amount / volume).toFixed(2) });
      output.dataset.hasResult = "true";
    });

    $("#accountModal").addEventListener("close", () => {
      if ($("#accountModal").returnValue === "signin") showToast(t("accountToast"));
    });

    $("#contactModal").addEventListener("close", () => {
      if ($("#contactModal").returnValue === "send") showToast(t("messageSent"));
    });

    $$("[data-open-contact]").forEach((button) => {
      button.addEventListener("click", () => openDialog($("#contactModal")));
    });

    $("[data-open-results]").addEventListener("click", () => {
      showToast(t("qualityToast"));
    });

    $$("[data-toast-key]").forEach((button) => {
      button.addEventListener("click", () => showToast(t(button.dataset.toastKey)));
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
      showToast(t("noticeStillOpen"));
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
    setLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || "es");
  });
})();
