"use strict";

/* ==========================================================
   VORTEX42 CONTROL CENTER
   Public Demo
   ==========================================================

   Esta aplicación utiliza únicamente datos simulados.

   NO realiza llamadas al homelab real.
   NO consume APIs privadas.
   NO conoce IPs internas.
   NO contiene credenciales.

   ========================================================== */


document.addEventListener("DOMContentLoaded", () => {

  /* ========================================================
     ELEMENTOS PRINCIPALES
     ======================================================== */

  const tabButtons = document.querySelectorAll(".tab-button");
  const tabPanels = document.querySelectorAll(".tab-panel");

  const searchInput = document.getElementById("global-search");

  const currentDate = document.getElementById("current-date");

  const demoToast = document.getElementById("demo-toast");

  const demoActions = document.querySelectorAll(".demo-action");

  const searchableCards = document.querySelectorAll(".searchable");


  /* ========================================================
     ESTADO
     ======================================================== */

  let activeTab = "command";

  let lastManualTab = "command";

  let toastTimer = null;


  /* ========================================================
     TABS
     ======================================================== */

  function switchTab(tabId, remember = true) {

    const targetPanel = document.getElementById(tabId);

    if (!targetPanel) {
      return;
    }


    tabButtons.forEach((button) => {

      const isActive =
        button.dataset.tab === tabId;

      button.classList.toggle(
        "active",
        isActive
      );

      button.setAttribute(
        "aria-selected",
        String(isActive)
      );

    });


    tabPanels.forEach((panel) => {

      panel.classList.toggle(
        "active",
        panel.id === tabId
      );

    });


    activeTab = tabId;


    if (remember) {
      lastManualTab = tabId;
    }

  }


  tabButtons.forEach((button) => {

    button.addEventListener("click", () => {

      const targetTab =
        button.dataset.tab;

      switchTab(
        targetTab,
        true
      );

    });

  });


  /* ========================================================
     FECHA Y HORA
     ======================================================== */

  function updateDateTime() {

    const now = new Date();


    const formatter =
      new Intl.DateTimeFormat(
        "es-AR",
        {
          weekday: "long",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }
      );


    let formatted =
      formatter.format(now);


    formatted =
      formatted.charAt(0).toUpperCase() +
      formatted.slice(1);


    currentDate.textContent =
      formatted;

  }


  updateDateTime();


  setInterval(
    updateDateTime,
    30000
  );


  /* ========================================================
     TOAST DEMO
     ======================================================== */

  function showDemoToast(
    message = "Modo demo: esta tarjeta no accede a ningún servicio real."
  ) {

    if (!demoToast) {
      return;
    }


    demoToast.textContent =
      message;


    demoToast.classList.add(
      "visible"
    );


    if (toastTimer) {
      clearTimeout(toastTimer);
    }


    toastTimer =
      setTimeout(
        () => {

          demoToast.classList.remove(
            "visible"
          );

        },
        2600
      );

  }


  demoActions.forEach((card) => {

    card.addEventListener("click", () => {

      const title =
        card.querySelector("h3")
          ?.textContent
          ?.trim();


      if (title) {

        showDemoToast(
          `${title} · Modo demo: no se realiza ninguna conexión real.`
        );

      } else {

        showDemoToast();

      }

    });


    card.setAttribute(
      "tabindex",
      "0"
    );


    card.setAttribute(
      "role",
      "button"
    );


    card.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          card.click();

        }

      }
    );

  });


  /* ========================================================
     BÚSQUEDA
     ======================================================== */

  function getCardSearchText(card) {

    const customText =
      card.dataset.search || "";


    const visibleText =
      card.textContent || "";


    return (
      customText +
      " " +
      visibleText
    )
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );

  }


  function normalizeSearch(value) {

    return value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );

  }


  function restoreAllCards() {

    searchableCards.forEach((card) => {

      card.classList.remove(
        "hidden"
      );

    });


    document
      .querySelectorAll(
        ".dashboard-section"
      )
      .forEach((section) => {

        section.style.display = "";

      });

  }


  function panelHasVisibleCards(panel) {

    return Array
      .from(
        panel.querySelectorAll(
          ".searchable"
        )
      )
      .some(
        (card) =>
          !card.classList.contains(
            "hidden"
          )
      );

  }


  function sectionHasVisibleCards(section) {

    return Array
      .from(
        section.querySelectorAll(
          ".searchable"
        )
      )
      .some(
        (card) =>
          !card.classList.contains(
            "hidden"
          )
      );

  }


  function searchDashboard(query) {

    const normalizedQuery =
      normalizeSearch(query);


    restoreAllCards();


    if (!normalizedQuery) {

      switchTab(
        lastManualTab,
        false
      );

      hideEmptyMessage();

      return;

    }


    searchableCards.forEach((card) => {

      const haystack =
        getCardSearchText(card);


      const matches =
        haystack.includes(
          normalizedQuery
        );


      card.classList.toggle(
        "hidden",
        !matches
      );

    });


    document
      .querySelectorAll(
        ".dashboard-section"
      )
      .forEach((section) => {

        const hasMatches =
          sectionHasVisibleCards(
            section
          );


        section.style.display =
          hasMatches
            ? ""
            : "none";

      });


    const matchingPanel =
      Array
        .from(tabPanels)
        .find(
          (panel) =>
            panelHasVisibleCards(
              panel
            )
        );


    if (matchingPanel) {

      switchTab(
        matchingPanel.id,
        false
      );

      hideEmptyMessage();

    } else {

      showEmptyMessage(
        normalizedQuery
      );

    }

  }


  if (searchInput) {

    searchInput.addEventListener(
      "input",
      (event) => {

        searchDashboard(
          event.target.value
        );

      }
    );

  }


  /* ========================================================
     MENSAJE SIN RESULTADOS
     ======================================================== */

  const emptyMessage =
    document.createElement(
      "div"
    );


  emptyMessage.className =
    "search-empty";


  document
    .querySelector(".dashboard")
    ?.prepend(
      emptyMessage
    );


  function showEmptyMessage(query) {

    emptyMessage.textContent =
      `No se encontraron resultados para "${query}".`;


    emptyMessage.classList.add(
      "visible"
    );

  }


  function hideEmptyMessage() {

    emptyMessage.classList.remove(
      "visible"
    );

  }


  /* ========================================================
     ATAJOS DE TECLADO
     ======================================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      /*
       * "/" enfoca el buscador.
       */

      if (
        event.key === "/" &&
        document.activeElement !==
          searchInput
      ) {

        event.preventDefault();

        searchInput?.focus();

      }


      /*
       * ESC limpia la búsqueda.
       */

      if (
        event.key === "Escape" &&
        searchInput &&
        searchInput.value
      ) {

        searchInput.value = "";

        searchDashboard("");

        searchInput.blur();

      }

    }
  );


  /* ========================================================
     PEQUEÑA SIMULACIÓN DE MÉTRICAS
     ========================================================

     Esto es puramente visual.

     Las variaciones son pequeñas para que el dashboard
     parezca vivo sin resultar molesto.

     ======================================================== */

  const simulatedCpuValues = [
    12,
    7,
    5
  ];


  function clamp(
    value,
    minimum,
    maximum
  ) {

    return Math.min(
      maximum,
      Math.max(
        minimum,
        value
      )
    );

  }


  function randomVariation(
    current,
    amount = 2
  ) {

    const variation =
      Math.floor(
        Math.random() *
          (amount * 2 + 1)
      ) - amount;


    return clamp(
      current + variation,
      1,
      95
    );

  }


  function updateSimulatedMetrics() {

    const nodeCards =
      document.querySelectorAll(
        ".node-card"
      );


    nodeCards.forEach(
      (card, index) => {

        const metricValues =
          card.querySelectorAll(
            ".metrics strong"
          );


        /*
         * Posición:
         * 0 = Estado
         * 1 = CPU
         * 2 = MEM
         * 3 = DISCO
         */

        if (
          metricValues.length < 4
        ) {
          return;
        }


        simulatedCpuValues[index] =
          randomVariation(
            simulatedCpuValues[index],
            2
          );


        metricValues[1].textContent =
          `${simulatedCpuValues[index]}%`;

      }
    );

  }


  /*
   * Se actualiza cada 8 segundos.
   * No existe ninguna consulta externa.
   */

  setInterval(
    updateSimulatedMetrics,
    8000
  );


  /* ========================================================
     BANNER DEMO
     ======================================================== */

  const demoBadge =
    document.querySelector(
      ".demo-badge"
    );


  if (demoBadge) {

    demoBadge.addEventListener(
      "click",
      () => {

        showDemoToast(
          "Todos los datos mostrados son simulados. Ningún servicio del homelab está expuesto."
        );

      }
    );


    demoBadge.style.cursor =
      "pointer";

  }


  /* ========================================================
     INICIALIZACIÓN
     ======================================================== */

  switchTab(
    "command",
    true
  );


  console.info(
    "%cVortex42 Control Center",
    "color:#21c8ff;font-size:18px;font-weight:bold;"
  );


  console.info(
    "Demo pública · todos los datos son simulados."
  );


  console.info(
    "No existe conexión con infraestructura privada."
  );

});