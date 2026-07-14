(function () {
  'use strict';

  var state = {
    productos: [],
    categorias: [],
    activeCat: 'Todas',
    query: '',
    globalLang: 'both', // 'both' | 'es' | 'it'
    detailLang: 'both',
  };

  var CATEGORY_ICONS = {
    'Aceites': '🫒',
    'Aceitunas': '🫒',
    'Condimentos': '🧂',
    'Conservas de verdura': '🍅',
    'Cremas': '🧈',
    'Cremas / Quesos': '🧀',
    'Especias': '🌿',
    'Frutta': '🍓',
    'Pasta': '🍝',
    'Pesti': '🌱',
    'Ragù / Carnes': '🍖',
    'Riso': '🍚',
    'Salsas': '🥫',
    'Salsas de trufa': '🍄',
    'Salsas dulces / frutos secos': '🍯',
    'Salsas picantes': '🌶️',
    'Sughi': '🍅',
    'Vinagres': '🍾',
  };

  var mainView = document.getElementById('mainView');
  var catNav = document.getElementById('catNav');
  var searchInput = document.getElementById('searchInput');
  var btnLangGlobal = document.getElementById('btnLangGlobal');
  var langGlobalLabel = document.getElementById('langGlobalLabel');
  var detailOverlay = document.getElementById('detailOverlay');
  var detailCard = document.getElementById('detailCard');
  var offlineToast = document.getElementById('offlineToast');
  var installToast = document.getElementById('installToast');
  var btnDismissInstall = document.getElementById('btnDismissInstall');
  var btnHome = document.getElementById('btnHome');

  function norm(s) {
    return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  fetch('data/productos.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      state.productos = data;
      state.categorias = uniqueCategories(data);
      renderCatNav();
      renderMain();
    })
    .catch(function (err) {
      mainView.innerHTML = '<div class="empty-state"><div class="big">⚠️</div><p>No se pudo cargar el catálogo. Revisá tu conexión e intentá de nuevo.</p></div>';
      console.error(err);
    });

  function uniqueCategories(data) {
    var seen = {};
    var list = [];
    data.forEach(function (p) {
      if (!seen[p.categoria]) { seen[p.categoria] = true; list.push(p.categoria); }
    });
    list.sort(function (a, b) { return a.localeCompare(b, 'es'); });
    return list;
  }

  function renderCatNav() {
    var html = '<button class="cat-chip' + (state.activeCat === 'Todas' ? ' active' : '') + '" data-cat="Todas">Todas</button>';
    state.categorias.forEach(function (c) {
      var icon = CATEGORY_ICONS[c] || '🍽️';
      html += '<button class="cat-chip' + (state.activeCat === c ? ' active' : '') + '" data-cat="' + escAttr(c) + '">' + icon + ' ' + escHtml(c) + '</button>';
    });
    catNav.innerHTML = html;
    Array.prototype.forEach.call(catNav.querySelectorAll('.cat-chip'), function (btn) {
      btn.addEventListener('click', function () {
        state.activeCat = btn.getAttribute('data-cat');
        renderCatNav();
        renderMain();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function getFiltered() {
    var q = norm(state.query);
    return state.productos.filter(function (p) {
      if (state.activeCat !== 'Todas' && p.categoria !== state.activeCat) return false;
      if (!q) return true;
      var haystack = norm([p.nombre_es, p.nombre_it, p.categoria].join(' '));
      return haystack.indexOf(q) !== -1;
    });
  }

  function renderMain() {
    var filtered = getFiltered();
    if (filtered.length === 0) {
      mainView.innerHTML = '<div class="empty-state"><div class="big">🔍</div><p>No encontramos productos con esa búsqueda.<br>Probá con otro nombre, en español o italiano.</p></div>';
      return;
    }

    if (state.activeCat !== 'Todas' || state.query) {
      // flat grid
      mainView.innerHTML = '<div class="grid">' + filtered.map(cardHtml).join('') + '</div>';
    } else {
      // grouped by category
      var byCat = {};
      filtered.forEach(function (p) {
        (byCat[p.categoria] = byCat[p.categoria] || []).push(p);
      });
      var html = '';
      state.categorias.forEach(function (cat) {
        var items = byCat[cat];
        if (!items || !items.length) return;
        var icon = CATEGORY_ICONS[cat] || '🍽️';
        html += '<div class="section-title"><h2>' + icon + ' ' + escHtml(cat) + '</h2><span class="count">' + items.length + '</span></div>';
        html += '<div class="grid">' + items.map(cardHtml).join('') + '</div>';
      });
      mainView.innerHTML = html;
    }

    bindCardEvents();
  }

  function cardHtml(p) {
    var photo = p.imagen
      ? '<img src="' + escAttr(p.imagen) + '" alt="' + escAttr(p.nombre_es || p.nombre_it) + '" loading="lazy">'
      : '<span class="ph-fallback">🍽️</span>';
    var pendCls = p.pendiente_revision ? ' pendiente' : '';
    var pendBadge = p.pendiente_revision ? '<span class="badge-pendiente">Pendiente</span>' : '';
    return (
      '<button class="card' + pendCls + '" data-codigo="' + escAttr(p.codigo) + '">' +
        '<div class="card-photo">' + photo + '<span class="card-cat-tag">' + escHtml(p.categoria) + '</span>' + pendBadge + '</div>' +
        '<div class="card-body">' +
          '<div class="card-name-es">' + escHtml(p.nombre_es || p.nombre_it) + '</div>' +
          '<div class="card-name-it">' + escHtml(p.nombre_it) + '</div>' +
          '<div class="card-presentacion">' + escHtml(p.presentacion || '') + '</div>' +
        '</div>' +
      '</button>'
    );
  }

  function bindCardEvents() {
    Array.prototype.forEach.call(mainView.querySelectorAll('.card'), function (btn) {
      btn.addEventListener('click', function () {
        var codigo = btn.getAttribute('data-codigo');
        var p = state.productos.find(function (x) { return x.codigo === codigo; });
        if (p) openDetail(p);
      });
    });
  }

  function openDetail(p) {
    state.detailLang = state.globalLang === 'both' ? 'both' : state.globalLang;
    detailCard.innerHTML = detailHtml(p);
    detailOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    bindDetailEvents(p);
  }

  function closeDetail() {
    detailOverlay.hidden = true;
    document.body.style.overflow = '';
  }

  function detailHtml(p) {
    var photo = p.imagen
      ? '<img src="' + escAttr(p.imagen) + '" alt="' + escAttr(p.nombre_es || p.nombre_it) + '">'
      : '<span class="ph-fallback">🍽️</span>';

    var descBlock;
    if (p.pendiente_revision) {
      descBlock = '<div class="pendiente-note"><strong>Ficha en revisión.</strong><br>' + escHtml(p.motivo_pendiente || 'No se encontró información completa de este producto en el catálogo fuente.') + '</div>';
    } else {
      var showEs = state.detailLang === 'both' || state.detailLang === 'es';
      var showIt = state.detailLang === 'both' || state.detailLang === 'it';
      descBlock = '<div class="desc-block">' +
        (showEs ? '<div class="desc-lang es-block"><h3>Español</h3><p>' + escHtml(p.descripcion_es || 'Descripción no disponible.') + '</p></div>' : '') +
        (showIt ? '<div class="desc-lang it-block"><h3>Italiano</h3><p>' + escHtml(p.descripcion_it || 'Descrizione non disponibile.') + '</p></div>' : '') +
      '</div>';
    }

    return (
      '<div class="detail-photo">' + photo + '<button class="detail-close" id="btnCloseDetail" aria-label="Cerrar">✕</button></div>' +
      '<div class="detail-info">' +
        '<span class="detail-cat-tag">' + escHtml(p.categoria) + '</span>' +
        '<div class="detail-title-block">' +
          '<h1>' + escHtml(p.nombre_es || p.nombre_it) + '</h1>' +
          '<div class="it-name">' + escHtml(p.nombre_it) + '</div>' +
        '</div>' +
        '<div class="detail-meta">' +
          '<span class="meta-pill"><strong>Presentación:</strong> ' + escHtml(p.presentacion || '—') + '</span>' +
          '<span class="meta-pill"><strong>Código:</strong> ' + escHtml(p.codigo) + '</span>' +
        '</div>' +
        (!p.pendiente_revision ?
          '<div class="lang-switch">' +
            '<button class="lang-btn' + (state.detailLang === 'both' ? ' active' : '') + '" data-lang="both">ES + IT</button>' +
            '<button class="lang-btn' + (state.detailLang === 'es' ? ' active' : '') + '" data-lang="es">Español</button>' +
            '<button class="lang-btn' + (state.detailLang === 'it' ? ' active' : '') + '" data-lang="it">Italiano</button>' +
          '</div>' : '') +
        descBlock +
        '<div class="price-note">Uso interno · precio de compra a Ristoris: ' + (p.precio_ristoris_eur != null ? ('€ ' + p.precio_ristoris_eur.toFixed(2)) : '—') + ' (no es el precio al público)</div>' +
      '</div>'
    );
  }

  function bindDetailEvents(p) {
    document.getElementById('btnCloseDetail').addEventListener('click', closeDetail);
    var langBtns = detailCard.querySelectorAll('.lang-btn');
    Array.prototype.forEach.call(langBtns, function (btn) {
      btn.addEventListener('click', function () {
        state.detailLang = btn.getAttribute('data-lang');
        detailCard.innerHTML = detailHtml(p);
        bindDetailEvents(p);
      });
    });
  }

  detailOverlay.addEventListener('click', function (e) {
    if (e.target === detailOverlay) closeDetail();
  });

  btnHome.addEventListener('click', function () {
    state.activeCat = 'Todas';
    state.query = '';
    searchInput.value = '';
    renderCatNav();
    renderMain();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var searchDebounce;
  searchInput.addEventListener('input', function () {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(function () {
      state.query = searchInput.value;
      renderMain();
    }, 150);
  });

  var LANG_CYCLE = ['both', 'es', 'it'];
  var LANG_LABELS = { both: 'ES + IT', es: 'ESPAÑOL', it: 'ITALIANO' };
  btnLangGlobal.addEventListener('click', function () {
    var idx = LANG_CYCLE.indexOf(state.globalLang);
    state.globalLang = LANG_CYCLE[(idx + 1) % LANG_CYCLE.length];
    langGlobalLabel.textContent = LANG_LABELS[state.globalLang];
  });

  function escHtml(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function escAttr(s) { return escHtml(s); }

  // ---------- Offline / install ----------
  window.addEventListener('offline', function () { offlineToast.hidden = false; });
  window.addEventListener('online', function () { offlineToast.hidden = true; });
  if (!navigator.onLine) offlineToast.hidden = false;

  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  var isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (!isStandalone && isIos && !localStorage.getItem('installToastDismissed')) {
    setTimeout(function () { installToast.hidden = false; }, 2500);
  }
  btnDismissInstall.addEventListener('click', function () {
    installToast.hidden = true;
    localStorage.setItem('installToastDismissed', '1');
  });

  var deferredPrompt;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (!localStorage.getItem('installToastDismissed')) {
      installToast.hidden = false;
      installToast.querySelector('span').textContent = 'Instalá esta app en la tablet para usarla sin conexión';
    }
  });
  installToast.addEventListener('click', function (e) {
    if (e.target.closest('button')) return;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt = null;
    }
  });

  // ---------- Service worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('SW registration failed', err);
      });
    });
  }
})();
