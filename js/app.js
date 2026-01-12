(function () {
  const $ = (id) => document.getElementById(id);

  // ===== Utilidades de URL (Drive / Sheets / MyMaps) =====
  function extractDriveFileId(url) {
    // https://drive.google.com/file/d/<ID>/view
    const m = url.match(/\/file\/d\/([^/]+)/i);
    return m ? m[1] : null;
  }

  function drivePreviewUrl(url) {
    const id = extractDriveFileId(url);
    return id ? `https://drive.google.com/file/d/${id}/preview` : url;
  }

  function extractSheetId(url) {
    // https://docs.google.com/spreadsheets/d/<ID>/edit?gid=...
    const m = url.match(/\/spreadsheets\/d\/([^/]+)/i);
    return m ? m[1] : null;
  }

  function extractGid(url) {
    const m = url.match(/[?&#]gid=(\d+)/i);
    return m ? m[1] : null;
  }

  function sheetPreviewUrl(url) {
    const id = extractSheetId(url);
    const gid = extractGid(url);
    if (!id) return url;
    // /preview suele funcionar mejor que /edit en iframes
    return gid
      ? `https://docs.google.com/spreadsheets/d/${id}/preview?gid=${gid}`
      : `https://docs.google.com/spreadsheets/d/${id}/preview`;
  }

  function myMapsEmbedUrl(url) {
    // https://www.google.com/maps/d/u/0/edit?mid=... -> embed?mid=...
    const midMatch = url.match(/[?&]mid=([^&]+)/i);
    const mid = midMatch ? midMatch[1] : null;
    if (!mid) return url;

    const llMatch = url.match(/[?&]ll=([^&]+)/i);
    const zMatch = url.match(/[?&]z=([^&]+)/i);

    const ll = llMatch ? llMatch[1] : "";
    const z = zMatch ? zMatch[1] : "";

    let embed = `https://www.google.com/maps/d/u/0/embed?mid=${mid}`;
    if (ll) embed += `&ll=${ll}`;
    if (z) embed += `&z=${z}`;
    return embed;
  }

  // ===== Datos (tus elementos) =====
  const ITEMS = [
    {
      key: "mapa-inicial",
      distrito: "MAPA",
      type: "MAPA",
      title: "Mapa de Captura de Promoción del Voto",
      subtitle: "Mapa inicial",
      description: "Mapa de Captura de Promoción del Voto.",
      url: "https://www.google.com/maps/d/u/0/edit?hl=es-419&mid=1pqIH5bpnATwgwdmQiB7I5IzoAJsyq6U&ll=32.337594444877055%2C-116.90788152182236&z=10",
      embed: null // se calcula
    },

    // ===== DISTRITO LOCAL 8 =====
    {
      key: "dl8-resultados",
      distrito: "8",
      type: "PDF",
      title: "Resultados de Diputados Locales",
      subtitle: "Distrito Local 8",
      description:
        "La Carpeta de Resultados Electorales Básicos contiene el número de secciones electorales por Distrito Local, con el análisis de los resultados en el contexto municipal.",
      url: "https://drive.google.com/file/d/109hvEl5d8VRIPEP5dPPwxNeh3FoseNWE/view",
      embed: null
    },
    {
      key: "dl8-secciones-distritos",
      distrito: "8",
      type: "SHEET",
      title: "Secciones y Distritos Electorales Federales y Locales",
      subtitle: "Distrito Local 8",
      description:
        "El apartado proporciona un análisis detallado del total de secciones electorales en el municipio de Mexicali, comparando su distribución entre los Distritos Federales y Locales de Baja California.",
      url: "https://docs.google.com/spreadsheets/d/11uurNwSlNKsNc0Khdvr0k8EOrfVZH0-6/edit?gid=655616106#gid=655616106",
      embed: null
    },
    {
      key: "dl8-colonias-distritos",
      distrito: "8",
      type: "SHEET",
      title: "Colonias con Distritos Electorales Federales y Locales",
      subtitle: "Distrito Local 8",
      description:
        "Este apartado presenta un listado completo de las colonias junto con su información geográfica de localización, organizadas por secciones que representan los Distritos Locales y Federales correspondientes.",
      url: "https://docs.google.com/spreadsheets/d/1vbyzitDy4peaq7qENIKEHEnf93e2ImeRk6OU-FTRiOE/edit?usp=sharing",
      embed: null
    },
    {
      key: "dl8-mapas-seccionales-individuales",
      distrito: "8",
      type: "PDF",
      title: "Mapas Seccionales Individuales",
      subtitle: "Distrito Local 8",
      description:
        "Visión detallada de manzanas y aspectos geográficos en una sección electoral federal y local de zona urbana específica, con claves electorales, colonias, calles, servicios y secciones adyacentes. Producto cartográfico basado en la división territorial electoral local de Baja California.",
      url: "https://drive.google.com/file/d/1NmSmqq9PZX7kvx87JMVHKCa3I8ZrOdct/view",
      embed: null
    },
    {
      key: "dl8-mapa-distrital-seccional",
      distrito: "8",
      type: "PDF",
      title: "Mapa Distrital Seccional",
      subtitle: "Distrito Local 8",
      description:
        "Muestra fronteras municipales y seccionales, distritos electorales federales, municipios colindantes y claves geo-electorales; incluye claves de sección y el total de municipios y secciones que conforman el distrito.",
      url: "https://drive.google.com/file/d/1a6YRauOAcs6wbglcHgXgAhpfN1YnvGbF/view",
      embed: null
    },
    {
      key: "dl8-carta-electoral-municipal",
      distrito: "8",
      type: "PDF",
      title: "Carta Electoral Municipal",
      subtitle: "Distrito Local 8",
      description:
        "Representa secciones y localidades, vías de comunicación y rasgos físicos/culturales; destaca cabeceras seccionales y localidades rurales; incluye límites seccionales, municipales y distritales electorales con claves geo-electorales.",
      url: "https://drive.google.com/file/d/16RiDyjostAu9fOQeSf6hYe6dK8bG8BYP/view?usp=sharing",
      embed: null
    },

    // ===== DISTRITO LOCAL 9 =====
    {
      key: "dl9-resultados",
      distrito: "9",
      type: "PDF",
      title: "Resultados de Diputados Locales",
      subtitle: "Distrito Local 9",
      description:
        "La Carpeta de Resultados Electorales Básicos contiene el número de secciones electorales por Distrito Local, con el análisis de los resultados en el contexto municipal.",
      url: "https://drive.google.com/file/d/1LnfV_4cfKL2aFU8HHs1mgMyKWLizOSs3/view",
      embed: null
    },
    {
      key: "dl9-secciones-distritos",
      distrito: "9",
      type: "SHEET",
      title: "Secciones y Distritos Electorales Federales y Locales",
      subtitle: "Distrito Local 9",
      description:
        "El apartado proporciona un análisis detallado del total de secciones electorales en el municipio de Mexicali, comparando su distribución entre los Distritos Federales y Locales de Baja California.",
      url: "https://docs.google.com/spreadsheets/d/16okHrwmBGPicO11bsZvxg9DJyCgMs2Nl/edit?gid=233483491#gid=233483491",
      embed: null
    },
    {
      key: "dl9-colonias-distritos",
      distrito: "9",
      type: "SHEET",
      title: "Colonias con Distritos Electorales Federales y Locales",
      subtitle: "Distrito Local 9",
      description:
        "Este apartado presenta un listado completo de las colonias junto con su información geográfica de localización, organizadas por secciones que representan los Distritos Locales y Federales correspondientes.",
      url: "https://docs.google.com/spreadsheets/d/12d2qSnAabVnDC_ZAAa1DCHcxr3Bww1vs/edit?gid=1913543128#gid=1913543128",
      embed: null
    },
    {
      key: "dl9-mapas-seccionales-individuales",
      distrito: "9",
      type: "PDF",
      title: "Mapas Seccionales Individuales",
      subtitle: "Distrito Local 9",
      description:
        "Visión detallada de manzanas y aspectos geográficos en una sección electoral federal y local de zona urbana específica, con claves electorales, colonias, calles, servicios y secciones adyacentes. Producto cartográfico basado en la división territorial electoral local de Baja California.",
      url: "https://drive.google.com/file/d/14ar7yA2KmkK5iGYF1bfnO2X24ohaK4oQ/view",
      embed: null
    },
    {
      key: "dl9-mapa-distrital-seccional",
      distrito: "9",
      type: "PDF",
      title: "Mapa Distrital Seccional",
      subtitle: "Distrito Local 9",
      description:
        "Muestra fronteras municipales y seccionales, distritos electorales federales, municipios colindantes y claves geo-electorales; incluye claves de sección y el total de municipios y secciones que conforman el distrito.",
      url: "https://drive.google.com/file/d/10eN-Ad1MOSKcapMV3JVAllSQn8lpmkCL/view",
      embed: null
    },
    {
      key: "dl9-carta-electoral-municipal",
      distrito: "9",
      type: "PDF",
      title: "Carta Electoral Municipal",
      subtitle: "Distrito Local 9",
      description:
        "Representa secciones y localidades, vías de comunicación y rasgos físicos/culturales; destaca cabeceras seccionales y localidades rurales; incluye límites seccionales, municipales y distritales electorales con claves geo-electorales.",
      url: "https://drive.google.com/file/d/16RiDyjostAu9fOQeSf6hYe6dK8bG8BYP/view?usp=sharing",
      embed: null
    }
  ];

  function computeEmbed(item) {
    if (item.type === "PDF") return drivePreviewUrl(item.url);
    if (item.type === "SHEET") return sheetPreviewUrl(item.url);
    if (item.type === "MAPA") return myMapsEmbedUrl(item.url);
    return item.url;
  }

  // precalcular embeds
  ITEMS.forEach(i => i.embed = computeEmbed(i));

  // ===== Render / Estado =====
  let currentDistrito = "ALL";
  let currentQuery = "";
  let selectedKey = "mapa-inicial";

  function badgeDistrito(d) {
    if (d === "8") return `<span class="badge badge--d8">DL 8</span>`;
    if (d === "9") return `<span class="badge badge--d9">DL 9</span>`;
    return `<span class="badge badge--type">MAPA</span>`;
  }

  function badgeType(t) {
    const label = (t === "SHEET") ? "SHEET" : t;
    return `<span class="badge badge--type">${label}</span>`;
  }

  function setActiveTab(tabId) {
    const tabs = [
      { id: "tabAll", value: "ALL" },
      { id: "tab8", value: "8" },
      { id: "tab9", value: "9" }
    ];
    tabs.forEach(t => {
      const el = $(t.id);
      const active = (t.id === tabId);
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function filteredItems() {
    return ITEMS.filter(it => {
      // Filtrado por distrito
      const distritoOk =
        currentDistrito === "ALL" ? (it.distrito !== "MAPA") : (it.distrito === currentDistrito);

      // En "Todos", no listamos el mapa inicial en el listado de documentos
      // (el mapa se gestiona desde el hero y el botón).
      if (!distritoOk) return false;

      // Búsqueda
      const q = currentQuery.trim().toLowerCase();
      if (!q) return true;

      const hay = (it.title + " " + it.subtitle + " " + it.description).toLowerCase();
      return hay.includes(q);
    });
  }

  function renderList() {
    const list = $("docList");
    const items = filteredItems();

    if (!items.length) {
      list.innerHTML = `<div class="note">No hay resultados con los filtros actuales.</div>`;
      return;
    }

    list.innerHTML = items.map(it => {
      const selected = it.key === selectedKey ? "is-selected" : "";
      return `
        <div class="item ${selected}" role="listitem" data-key="${it.key}">
          <div class="item__meta">
            <div class="item__title">${it.title}</div>
            <div class="item__desc">${it.subtitle}</div>
          </div>
          <div class="badges">
            ${badgeDistrito(it.distrito)}
            ${badgeType(it.type)}
          </div>
        </div>
      `;
    }).join("");
  }

  function selectItemByKey(key) {
    const item = ITEMS.find(i => i.key === key);
    if (!item) return;

    selectedKey = key;

    $("viewerTitle").textContent = item.title;
    $("viewerSubtitle").textContent = item.subtitle || "";
    $("docDescription").textContent = item.description || "";

    $("mainFrame").src = item.embed;
    $("openExternalBtn").href = item.url;

    renderList();
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Enlace copiado al portapapeles.");
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      alert("Enlace copiado al portapapeles.");
    }
  }

  // ===== Inicialización =====
  $("year").textContent = new Date().getFullYear();
  $("lastUpdated").textContent = new Date().toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "2-digit"
  });

  // Default: mapa inicial
  selectItemByKey("mapa-inicial");

  // Botón “Abrir mapa inicial”
  $("btnDefaultMap").addEventListener("click", () => {
    selectItemByKey("mapa-inicial");
    // llevar a la parte superior del visor
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Tabs
  $("tabAll").addEventListener("click", () => {
    currentDistrito = "ALL";
    setActiveTab("tabAll");
    renderList();
  });
  $("tab8").addEventListener("click", () => {
    currentDistrito = "8";
    setActiveTab("tab8");
    renderList();
  });
  $("tab9").addEventListener("click", () => {
    currentDistrito = "9";
    setActiveTab("tab9");
    renderList();
  });

  // Search
  $("searchInput").addEventListener("input", (e) => {
    currentQuery = e.target.value || "";
    renderList();
  });

  // Click en items del listado
  $("docList").addEventListener("click", (e) => {
    const card = e.target.closest(".item");
    if (!card) return;
    const key = card.getAttribute("data-key");
    selectItemByKey(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Copiar enlace del item seleccionado
  $("copyLinkBtn").addEventListener("click", () => {
    const item = ITEMS.find(i => i.key === selectedKey);
    if (!item) return;
    copyToClipboard(item.url);
  });

  // Default en documentos: mostrar todos
  currentDistrito = "ALL";
  setActiveTab("tabAll");
  renderList();

})();
