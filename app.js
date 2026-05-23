(function () {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const state = {
    cart: [],
    language: "es",
    reviewIndex: 0,
    selectedCategory: "all",
    catalogMode: "featured",
    searchQuery: "",
    paymentMethod: "card",
    culqiCheckout: null,
    checkoutInFlight: false,
    toastTimer: null,
  };

  const LANGUAGE_STORAGE_KEY = "pcLanguage";
  const PRODUCT_PRICE = 100;
  const PRODUCT_PRICE_LABEL = "S/ 100.00";
  const PRODUCT_PRICE_CENTS = 10000;
  const CONFIG = window.PC_CONFIG || {};
  const CULQI_PUBLIC_KEY_PLACEHOLDER = "pk_test_REPLACE_WITH_CULQI_PUBLIC_KEY";
  const PRODUCTS = Array.isArray(window.PC_PRODUCTS) ? window.PC_PRODUCTS : [];
  const PRODUCTS_BY_ID = new Map(PRODUCTS.map((product) => [product.id, product]));
  const FEATURED_PRODUCT_IDS = [
    "retratrutide-5mg-vial",
    "bac-water-10ml-vial",
    "bpc157-10mg-vial",
    "ghk-cu-50mg-vial",
    "mots-c-10mg-vial",
    "cagrilintide-10mg",
    "tb500-10mg-vial",
    "nad-500mg-vial",
    "epitalon-10mg-vial",
    "cjc-1295-with-dac-10mg-vial",
    "selank-10mg-vial",
    "kpv-10mg-vial",
  ];
  const CATEGORY_LABELS = {
    es: {
      "all-products": "Todos",
      bioregulators: "Bioreguladores",
      "gh-analogs-and-secretagogues": "GH analogos",
      "glp-1": "GLP-1",
      gonadotropins: "Gonadotropinas",
      "monoclonal-antibodies-mabs": "Anticuerpos monoclonales",
      "myostatin-inhibitors": "Inhibidores de miostatina",
      nasal: "Nasal",
      nootropics: "Nootropicos",
      "other-products": "Otros productos",
      "pellets-pill": "Pellets",
      peptides: "Peptidos",
      powder: "Polvo",
      "research-supplies": "Insumos de laboratorio",
      sarms: "SARMs",
    },
    en: {
      sarms: "SARMs",
      "glp-1": "GLP-1",
      "monoclonal-antibodies-mabs": "Monoclonal Antibodies",
    },
  };

  const translations = {
    es: {
      pageTitle: "P&C Supplements | Laboratorio Cientifico Peru",
      pageDescription:
        "P&C Supplements es una tienda cientifica de laboratorio en Peru con catalogo de productos y precios en soles.",
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
      navProducts: "Todos los productos",
      navAbout: "Nosotros",
      navCertificates: "Certificados de calidad",
      navCalculator: "Calculadora de laboratorio",
      navCommunity: "Comunidad",
      navContact: "Contacto",
      primaryAria: "Principal",
      heroEyebrow: "Lima, Peru · Peptidos e insumos de investigacion",
      heroCopy:
        "Materiales de investigacion con presentacion clinica, trazabilidad por lote y checkout local en soles para Peru.",
      heroBrowse: "Explorar productos",
      heroCertificates: "Ver certificados de calidad",
      trustSignalsAria: "Senales de confianza",
      featureDelivery: "Envio a todo el Peru",
      featureLab: "Formulas con respaldo cientifico",
      featureRecords: "Transparencia por lote",
      featureSupport: "Soporte 24/7",
      categoryTitle: "Colecciones principales",
      categoryCopy: "El inicio muestra solo colecciones y productos destacados; el catalogo completo queda separado.",
      catMicroscopy: "Peptidos",
      catAnalytes: "GH analogos",
      catFormulas: "GLP-1",
      catCompounds: "Inhibidores de miostatina",
      catMethods: "Nootropicos",
      catSupplies: "Insumos de laboratorio",
      featuredProductsTitle: "Productos destacados",
      productsTitle: "Catalogo completo",
      viewAll: "Ver todo el catalogo",
      viewFeatured: "Volver a destacados",
      addCart: "Agregar al carrito",
      processTitle: "Fuente confiable para materiales de investigacion",
      processCopy:
        "P&C Supplements esta estructurada para laboratorios, investigadores y compradores profesionales que necesitan presentacion clara, documentacion y manejo responsable.",
      processPoint1: "Productos organizados para uso de investigacion y laboratorio",
      processPoint2: "Espacio para certificados, reportes y datos por lote",
      processPoint3: "Operacion local pensada para Peru, con pago en soles",
      learnMore: "Ver estandares",
      labImageAlt: "Cientifico trabajando con microscopio de laboratorio",
      qualityTitle: "Peptidos de investigacion de alta calidad",
      blankTitleAria: "Titulo de calidad",
      qualityCopy:
        "El posicionamiento de marca queda centrado en pureza, consistencia y documentacion. Los textos finales de claims, fabricantes y lotes se pueden completar cuando existan certificados reales.",
      moreAbout: "Mas sobre nosotros",
      statsAria: "Estadisticas de calidad",
      statLocation: "Ubicacion Peru",
      statPricing: "Precios locales",
      statSupport: "Cola de soporte",
      analysisTitle: "Pureza 99%+ documentada",
      analysisCopy:
        "Un bloque destacado para explicar HPLC, MS, certificados de analisis y controles por lote cuando la documentacion final este lista.",
      shopNow: "Comprar ahora",
      trustTitle: "Transparencia y profesionalismo",
      trustCopy: "El home resume la promesa de servicio antes de enviar al catalogo completo.",
      trustPricingTitle: "Envio nacional",
      trustPricingCopy: "La tienda esta preparada para cobertura Peru y precios en PEN.",
      trustQualityTitle: "Base cientifica",
      trustQualityCopy: "Mensajes centrados en investigacion, laboratorio y trazabilidad.",
      trustCertificateTitle: "Documentacion clara",
      trustCertificateCopy: "Espacios listos para certificados, fechas, lotes y metodos.",
      trustSupportTitle: "Atencion continua",
      trustSupportCopy: "Acciones de cuenta, contacto y carrito disponibles en toda la tienda.",
      qualityInfoTitle: "Informacion de calidad y etiqueta",
      qualityInfoCopy:
        "Usa esta area para notas analiticas, certificados, detalles de importacion, condiciones de entrega y cumplimiento en Peru.",
      qualityCertificates: "Certificados de calidad",
      faqAria: "Preguntas frecuentes",
      faqLocationQ: "Donde esta ubicada la tienda?",
      faqLocationA: "P&C Supplements esta configurada como tienda enfocada en Peru.",
      faqCurrencyQ: "Que moneda usa el checkout?",
      faqCurrencyA: "Todos los productos cuestan S/ 100.00 en PEN.",
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
        "Una tienda cientifica premium enfocada en Peru, con catalogo de laboratorio, precios en soles y puntos de soporte.",
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
      paymentMethodLabel: "Metodo de pago",
      payByCard: "Tarjeta",
      payByCrypto: "Cripto",
      checkoutEmailLabel: "Correo para el pago",
      checkoutEmailPlaceholder: "correo@ejemplo.com",
      checkoutButton: "Pagar con tarjeta",
      checkoutButtonCrypto: "Pagar con cripto",
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
        "Esta tienda es un layout cientifico de suplementos e integracion de pagos con tarjeta y cripto para Peru. Las etiquetas, afirmaciones analiticas, ingredientes y reglas de compra finales deben revisarse antes del lanzamiento.",
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
      cartProductNameAria: "Nombre de producto",
      removeItemAria: "Quitar articulo",
      productCount: "{count} productos disponibles.",
      featuredProductCount: "{count} productos destacados. Usa Ver todo el catalogo para abrir la lista completa.",
      filteredProductCount: "{count} productos encontrados.",
      searchProductCount: '{count} productos para "{query}".',
      noProductsFound: "No encontramos productos para esa busqueda.",
      productDetailAria: "Ver detalles de {name}",
      addCartToast: "producto agregado al carrito",
      cartEmptyToast: "El carrito esta vacio",
      checkoutEmailRequired: "Ingresa un correo valido para pagar",
      openingCulqi: "Abriendo Culqi...",
      openingCrypto: "Creando factura cripto...",
      unableStartCheckout: "No se pudo iniciar el checkout",
      culqiPublicKeyMissing: "Falta configurar la llave publica de Culqi",
      culqiScriptMissing: "No se pudo cargar Culqi Checkout",
      culqiTokenMissing: "Culqi no devolvio un token de pago",
      culqiProcessing: "Procesando pago...",
      paymentSuccess: "Pago recibido. Carrito vaciado.",
      backendPlaceholder: "El backend de Culqi aun no tiene llave privada configurada",
      nowpaymentsPlaceholder: "El backend de NOWPayments aun no tiene API key configurada",
      cryptoInvoiceMissing: "NOWPayments no devolvio una URL de pago",
      checkoutFailed: "Fallo el checkout",
      searchReady: 'Busqueda lista para "{query}".',
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
        "P&C Supplements scientific lab storefront for Peru with a product catalog and local sol pricing.",
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
      navProducts: "All Products",
      navAbout: "About Us",
      navCertificates: "Quality Certificates",
      navCalculator: "Lab Calculator",
      navCommunity: "Community",
      navContact: "Contact",
      primaryAria: "Primary",
      heroEyebrow: "Lima, Peru · Research peptides and lab supplies",
      heroCopy:
        "Research materials with clinical presentation, batch traceability, and local sol checkout for Peru.",
      heroBrowse: "Explore Products",
      heroCertificates: "View Quality Certificates",
      trustSignalsAria: "Trust signals",
      featureDelivery: "Peru-wide shipping",
      featureLab: "Science-backed formulas",
      featureRecords: "Batch transparency",
      featureSupport: "24/7 Support",
      categoryTitle: "Main Collections",
      categoryCopy: "The landing page shows curated collections and featured products; the full catalog stays separate.",
      catMicroscopy: "Peptides",
      catAnalytes: "GH Analogs",
      catFormulas: "GLP-1",
      catCompounds: "Myostatin Inhibitors",
      catMethods: "Nootropics",
      catSupplies: "Lab Supplies",
      featuredProductsTitle: "Featured Products",
      productsTitle: "Full Catalog",
      viewAll: "View Full Catalog",
      viewFeatured: "Back to Featured",
      addCart: "Add to Cart",
      processTitle: "Trusted Source for Research Materials",
      processCopy:
        "P&C Supplements is structured for laboratories, researchers, and professional buyers who need clear presentation, documentation, and responsible handling.",
      processPoint1: "Products organized for research and laboratory use",
      processPoint2: "Room for certificates, reports, and batch data",
      processPoint3: "Peru-first operation with checkout in soles",
      learnMore: "View Standards",
      labImageAlt: "Scientist working with laboratory microscope",
      qualityTitle: "High-Quality Research Peptides",
      blankTitleAria: "Quality heading",
      qualityCopy:
        "Brand positioning stays centered on purity, consistency, and documentation. Final claim, manufacturer, and batch language can be completed when real certificates are available.",
      moreAbout: "More about us",
      statsAria: "Quality statistics",
      statLocation: "Peru location",
      statPricing: "Local pricing",
      statSupport: "Support queue",
      analysisTitle: "Documented 99%+ Purity",
      analysisCopy:
        "A featured block for HPLC, MS, certificates of analysis, and batch controls once final documentation is ready.",
      shopNow: "Shop Now",
      trustTitle: "Transparency & Professionalism",
      trustCopy: "The homepage summarizes the service promise before opening the full catalog.",
      trustPricingTitle: "National Shipping",
      trustPricingCopy: "The storefront is prepared for Peru coverage and PEN pricing.",
      trustQualityTitle: "Scientific Foundation",
      trustQualityCopy: "Messaging stays focused on research, laboratory use, and traceability.",
      trustCertificateTitle: "Clear Documentation",
      trustCertificateCopy: "Spaces are ready for certificates, dates, batches, and methods.",
      trustSupportTitle: "Always-on Support",
      trustSupportCopy: "Account, contact, and cart actions stay available across the store.",
      qualityInfoTitle: "Quality & Label Information",
      qualityInfoCopy:
        "Use this area for analytical notes, certificates, import details, local delivery conditions, and compliance copy for Peru.",
      qualityCertificates: "Quality Certificates",
      faqAria: "Frequently asked questions",
      faqLocationQ: "Where is the store located?",
      faqLocationA: "P&C Supplements is set up as a Peru-focused storefront.",
      faqCurrencyQ: "What currency does checkout use?",
      faqCurrencyA: "All products are priced at S/ 100.00 using PEN.",
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
        "A premium Peru-focused scientific supplement storefront with a lab catalog, local sol pricing, and support touchpoints.",
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
      paymentMethodLabel: "Payment method",
      payByCard: "Card",
      payByCrypto: "Crypto",
      checkoutEmailLabel: "Payment email",
      checkoutEmailPlaceholder: "email@example.com",
      checkoutButton: "Pay by card",
      checkoutButtonCrypto: "Pay with crypto",
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
        "This storefront is a scientific supplement layout with card and crypto checkout integration for Peru. Final labels, analytical claims, ingredients, and purchasing rules should be reviewed before launch.",
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
      cartProductNameAria: "Product name",
      removeItemAria: "Remove item",
      productCount: "{count} products available.",
      featuredProductCount: "{count} featured products. Use View Full Catalog to open the complete list.",
      filteredProductCount: "{count} products found.",
      searchProductCount: '{count} products for "{query}".',
      noProductsFound: "No products matched that search.",
      productDetailAria: "View details for {name}",
      addCartToast: "product added to cart",
      cartEmptyToast: "Cart is empty",
      checkoutEmailRequired: "Enter a valid email to pay",
      openingCulqi: "Opening Culqi...",
      openingCrypto: "Creating crypto invoice...",
      unableStartCheckout: "Unable to start checkout",
      culqiPublicKeyMissing: "Culqi public key is not configured",
      culqiScriptMissing: "Culqi Checkout could not be loaded",
      culqiTokenMissing: "Culqi did not return a payment token",
      culqiProcessing: "Processing payment...",
      paymentSuccess: "Payment received. Cart cleared.",
      backendPlaceholder: "The Culqi backend still needs its private key",
      nowpaymentsPlaceholder: "The NOWPayments backend still needs its API key",
      cryptoInvoiceMissing: "NOWPayments did not return a payment URL",
      checkoutFailed: "Checkout failed",
      searchReady: 'Search ready for "{query}".',
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
        quote: "El catalogo se ve limpio y listo para revision final.",
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
        quote: "The catalog feels clean and ready for final review.",
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
    renderProducts();
    renderCart();
    renderPaymentMethod();
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

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return replacements[character];
    });
  }

  function normalizeText(value) {
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function getCategoryLabel(product) {
    return CATEGORY_LABELS[state.language]?.[product.category] || product.categoryLabel || product.category;
  }

  function getProductCode(productName) {
    const words = productName.match(/[a-z0-9]+/gi) || [];
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .padEnd(2, "P");
  }

  function isFeaturedCatalogView() {
    return !state.searchQuery && state.selectedCategory === "all" && state.catalogMode === "featured";
  }

  function showAllProducts() {
    state.catalogMode = "all";
    state.selectedCategory = "all";
    state.searchQuery = "";
    const searchInput = $("#searchInput");
    if (searchInput) searchInput.value = "";
    setActiveCategory("all");
    renderProducts();
  }

  function getApiUrl(path) {
    const baseUrl = String(CONFIG.API_BASE_URL || "").replace(/\/$/, "");
    return baseUrl ? `${baseUrl}${path}` : path;
  }

  function getCheckoutEmail() {
    return ($("#checkoutEmail")?.value || "").trim();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getCheckoutButtonText() {
    return state.paymentMethod === "crypto" ? t("checkoutButtonCrypto") : t("checkoutButton");
  }

  function renderPaymentMethod() {
    $$("[data-payment-method]").forEach((button) => {
      button.classList.toggle("active", button.dataset.paymentMethod === state.paymentMethod);
      button.setAttribute("aria-pressed", String(button.dataset.paymentMethod === state.paymentMethod));
    });

    const checkoutButton = $("#checkoutButton");
    if (checkoutButton && !checkoutButton.disabled) {
      checkoutButton.textContent = getCheckoutButtonText();
    }
  }

  function getCartAmountCents() {
    return state.cart.length * PRODUCT_PRICE_CENTS;
  }

  function getCartLineSummary() {
    const quantities = new Map();
    state.cart.forEach((item) => {
      quantities.set(item.id, (quantities.get(item.id) || 0) + 1);
    });
    return Array.from(quantities, ([id, quantity]) => {
      const product = PRODUCTS_BY_ID.get(id);
      return {
        id,
        quantity,
        title: product?.name || id,
        unitAmount: PRODUCT_PRICE_CENTS,
      };
    });
  }

  function isCulqiPublicKeyConfigured() {
    return Boolean(CONFIG.CULQI_PUBLIC_KEY) && CONFIG.CULQI_PUBLIC_KEY !== CULQI_PUBLIC_KEY_PLACEHOLDER;
  }

  function getCulqiAppearance() {
    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue("--accent").trim() || "#7c2d3a";
    const ink = styles.getPropertyValue("--ink").trim() || "#2a2420";
    const paper = styles.getPropertyValue("--paper").trim() || "#faf9f5";

    return {
      theme: "default",
      hiddenCulqiLogo: false,
      hiddenBannerContent: false,
      hiddenBanner: false,
      hiddenToolBarAmount: false,
      hiddenEmail: false,
      menuType: "select",
      buttonCardPayText: t("checkoutButton"),
      logo: new URL("./logo.svg", window.location.href).href,
      defaultStyle: {
        bannerColor: accent,
        buttonBackground: ink,
        menuColor: accent,
        linksColor: accent,
        buttonTextColor: paper,
        priceColor: ink,
      },
    };
  }

  function buildCulqiCheckout(email) {
    if (!window.CulqiCheckout) throw new Error(t("culqiScriptMissing"));
    if (!isCulqiPublicKeyConfigured()) throw new Error(t("culqiPublicKeyMissing"));

    const settings = {
      title: "P&C Supplements",
      currency: "PEN",
      amount: getCartAmountCents(),
    };

    if (CONFIG.CULQI_RSA_ID && CONFIG.CULQI_RSA_PUBLIC_KEY) {
      settings.xculqirsaid = CONFIG.CULQI_RSA_ID;
      settings.rsapublickey = CONFIG.CULQI_RSA_PUBLIC_KEY;
    }

    const paymentMethods = {
      tarjeta: true,
      yape: false,
      billetera: false,
      bancaMovil: false,
      agente: false,
      cuotealo: false,
    };

    const checkout = new window.CulqiCheckout(CONFIG.CULQI_PUBLIC_KEY, {
      settings,
      client: { email },
      options: {
        lang: state.language === "es" ? "es" : "en",
        installments: false,
        modal: true,
        paymentMethods,
        paymentMethodsSort: ["tarjeta"],
      },
      appearance: getCulqiAppearance(),
    });

    checkout.culqi = handleCulqiAction;
    return checkout;
  }

  async function submitCulqiCharge(token) {
    if (!token) throw new Error(t("culqiTokenMissing"));
    state.checkoutInFlight = true;
    showToast(t("culqiProcessing"));

    const response = await fetch(getApiUrl("/api/checkout/card"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        email: getCheckoutEmail(),
        items: getCartLineSummary(),
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.code === "CULQI_SECRET_MISSING"
          ? t("backendPlaceholder")
          : data.error || t("unableStartCheckout"),
      );
    }

    state.cart = [];
    renderCart();
    closeDrawers();
    showToast(t("paymentSuccess"));
  }

  async function openCryptoInvoice() {
    const response = await fetch(getApiUrl("/api/checkout/crypto"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: getCheckoutEmail(),
        items: getCartLineSummary(),
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.code === "NOWPAYMENTS_API_KEY_MISSING"
          ? t("nowpaymentsPlaceholder")
          : data.error || t("unableStartCheckout"),
      );
    }

    if (!data.invoiceUrl) throw new Error(t("cryptoInvoiceMissing"));
    window.location.href = data.invoiceUrl;
  }

  async function handleCulqiAction() {
    const checkout = state.culqiCheckout;

    try {
      if (checkout?.token?.id) {
        const token = checkout.token.id;
        checkout.close();
        await submitCulqiCharge(token);
        return;
      }

      if (checkout?.error) {
        throw new Error(checkout.error.user_message || checkout.error.message || t("checkoutFailed"));
      }

      throw new Error(t("culqiTokenMissing"));
    } catch (error) {
      showToast(error.message || t("checkoutFailed"));
    } finally {
      state.checkoutInFlight = false;
    }
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
              <strong aria-label="${t("cartProductNameAria")}">${escapeHtml(item.title || t("cartProductNameAria"))}</strong>
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

  function getFilteredProducts() {
    const query = normalizeText(state.searchQuery);
    const sourceProducts = isFeaturedCatalogView()
      ? FEATURED_PRODUCT_IDS.map((id) => PRODUCTS_BY_ID.get(id)).filter(Boolean)
      : PRODUCTS;

    return sourceProducts.filter((product) => {
      const categoryMatches = state.selectedCategory === "all" || product.category === state.selectedCategory;
      if (!categoryMatches) return false;
      if (!query) return true;

      const searchText = normalizeText(
        [product.name, product.category, product.categoryLabel, getCategoryLabel(product)].join(" "),
      );
      return searchText.includes(query);
    });
  }

  function updateProductStatus(count) {
    const searchStatus = $("#searchStatus");
    if (!searchStatus) return;
    if (!count) {
      searchStatus.textContent = t("noProductsFound");
      return;
    }

    if (state.searchQuery) {
      searchStatus.textContent = t("searchProductCount", {
        count: String(count),
        query: state.searchQuery,
      });
      return;
    }

    if (isFeaturedCatalogView()) {
      searchStatus.textContent = t("featuredProductCount", { count: String(count) });
      return;
    }

    searchStatus.textContent =
      state.selectedCategory === "all"
        ? t("productCount", { count: String(count) })
        : t("filteredProductCount", { count: String(count) });
  }

  function renderProducts() {
    const grid = $("#productGrid");
    if (!grid) return;

    const products = getFilteredProducts();
    const productsTitle = $("#productsTitle");
    const viewAllButton = $("[data-view-all] span");
    if (productsTitle) {
      productsTitle.textContent = isFeaturedCatalogView() ? t("featuredProductsTitle") : t("productsTitle");
    }
    if (viewAllButton) {
      viewAllButton.textContent = isFeaturedCatalogView() ? t("viewAll") : t("viewFeatured");
    }
    updateProductStatus(products.length);

    if (!products.length) {
      grid.innerHTML = `<div class="product-empty" role="status">${t("noProductsFound")}</div>`;
      return;
    }

    grid.innerHTML = products
      .map((product) => {
        const productName = escapeHtml(product.name);
        const productLabel = escapeHtml(getCategoryLabel(product));
        return `
          <article class="product-card" data-product-card data-category="${escapeHtml(product.category)}">
            <a class="product-card__visual" href="#products" aria-label="${escapeHtml(t("productDetailAria", { name: product.name }))}">
              <span class="product-card__monogram">${escapeHtml(getProductCode(product.name))}</span>
            </a>
            <div class="product-card__body">
              <span class="product-card__category">${productLabel}</span>
              <a class="product-card__title" href="#products">${productName}</a>
              <span class="product-price">${PRODUCT_PRICE_LABEL}</span>
              <button class="button button--dark add-cart" type="button" data-product-id="${escapeHtml(product.id)}">${t("addCart")}</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function setActiveCategory(category) {
    state.selectedCategory = category;
    $$(".category-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.category === category);
    });
  }

  function filterProducts(category) {
    setActiveCategory(category);
    renderProducts();
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
        if (link.hasAttribute("data-show-all-products")) showAllProducts();
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
        state.catalogMode = "all";
        filterProducts(card.dataset.category);
        scrollToId("products");
      });
    });

    $("[data-view-all]").addEventListener("click", () => {
      if (isFeaturedCatalogView()) {
        showAllProducts();
      } else {
        state.catalogMode = "featured";
        state.selectedCategory = "all";
        state.searchQuery = "";
        const searchInput = $("#searchInput");
        if (searchInput) searchInput.value = "";
        setActiveCategory("all");
        renderProducts();
      }
      scrollToId("products");
    });

    $$("[data-payment-method]").forEach((button) => {
      button.addEventListener("click", () => {
        state.paymentMethod = button.dataset.paymentMethod === "crypto" ? "crypto" : "card";
        renderPaymentMethod();
      });
    });

    $("#productGrid").addEventListener("click", (event) => {
      const button = event.target.closest(".add-cart");
      if (!button) return;
      const product = PRODUCTS_BY_ID.get(button.dataset.productId);
      if (!product) return;
      state.cart.push({ id: product.id, title: product.name });
      renderCart();
      showToast(`${PRODUCT_PRICE_LABEL} ${t("addCartToast")}`);
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

      const email = getCheckoutEmail();
      if (!isValidEmail(email)) {
        showToast(t("checkoutEmailRequired"));
        $("#checkoutEmail")?.focus();
        return;
      }

      const button = $("#checkoutButton");
      const originalText = getCheckoutButtonText();
      button.disabled = true;
      button.textContent = state.paymentMethod === "crypto" ? t("openingCrypto") : t("openingCulqi");

      try {
        if (state.paymentMethod === "crypto") {
          await openCryptoInvoice();
          return;
        }

        state.culqiCheckout = buildCulqiCheckout(email);
        state.culqiCheckout.open();
      } catch (error) {
        showToast(error.message || t("checkoutFailed"));
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  }

  function bindSearch() {
    $("#searchInput").addEventListener("input", (event) => {
      state.searchQuery = event.target.value.trim();
      if (state.searchQuery) state.catalogMode = "all";
      if (state.searchQuery) setActiveCategory("all");
      renderProducts();
    });

    $("#searchForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const query = $("#searchInput").value.trim();
      state.searchQuery = query;
      if (state.searchQuery) state.catalogMode = "all";
      if (state.searchQuery) setActiveCategory("all");
      renderProducts();
      if (query) showToast(t("searchReady", { query }));
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

  function initMotionEffects() {
    document.body.classList.add("is-loaded");

    const revealTargets = [
      ".category-card",
      ".product-card",
      ".process-copy",
      ".image-panel",
      ".split-band__inner > *",
      ".image-feature__content",
      ".trust-grid article",
      ".info-card",
      ".faq__item",
      ".review-shell",
      ".calculator",
      ".link-panels article",
      ".newsletter__inner > *",
    ];

    const elements = $$(revealTargets.join(","));
    elements.forEach((element, index) => {
      element.classList.add("reveal");
      element.style.setProperty("--reveal-delay", `${Math.min((index % 6) * 45, 225)}ms`);
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target.animate) {
            entry.target.animate(
              [
                { opacity: 0, transform: "translateY(22px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              {
                duration: 560,
                delay: Number.parseInt(entry.target.style.getPropertyValue("--reveal-delay"), 10) || 0,
                easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
                fill: "both",
              },
            );
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    state.revealObserver = observer;
    elements.forEach((element) => observer.observe(element));
  }

  document.addEventListener("DOMContentLoaded", () => {
    state.paymentMethod = CONFIG.DEFAULT_PAYMENT_METHOD === "crypto" ? "crypto" : "card";
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
    initMotionEffects();
  });
})();
