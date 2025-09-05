// Lightweight PJAX: swaps `#pjax-container` without reloading the page
// Keeps global UI (e.g., audio player) alive between navigations.

(function () {
  // Debug logger installer: persists across PJAX and exposes dumpDVLogs().
  (function installDVLoggerOnce() {
    if (window.__dvLoggerInstalled) return;
    const hasParam = (() => {
      try { return new URLSearchParams(window.location.search).get('debug') === '1'; } catch (_) { return false; }
    })();
    const enabled = hasParam || localStorage.getItem('dv:debug') === '1';
    if (!enabled) return;
    window.__dvLoggerInstalled = true;
    localStorage.setItem('dv:debug', '1');
    const KEY = 'dv:logs';
    const MAX = 3000;
    const orig = { log: console.log.bind(console), warn: console.warn.bind(console), error: console.error.bind(console), debug: console.debug.bind(console) };
    function safeSerialize(v) {
      try { return typeof v === 'string' ? v : JSON.stringify(v); }
      catch (_) { try { return String(v); } catch (_) { return '[unserializable]'; } }
    }
    function push(level, args) {
      try {
        const logs = JSON.parse(sessionStorage.getItem(KEY) || '[]');
        logs.push({ t: new Date().toISOString(), level, args: Array.from(args).map(safeSerialize) });
        if (logs.length > MAX) logs.splice(0, logs.length - MAX);
        sessionStorage.setItem(KEY, JSON.stringify(logs));
      } catch (_) {}
    }
    ;['log','warn','error','debug'].forEach(level => {
      console[level] = function (...args) { push(level, args); orig[level](...args); };
    });
    window.dumpDVLogs = function () {
      try {
        const logs = sessionStorage.getItem(KEY) || '[]';
        const blob = new Blob([logs], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'dv-logs.json'; a.click(); URL.revokeObjectURL(url);
      } catch (e) { orig.error('[DV] dumpDVLogs failed', e); }
    };
    window.clearDVLogs = function () { sessionStorage.removeItem(KEY); };
    window.disableDVDebug = function () { localStorage.removeItem('dv:debug'); };
    try { console.log('[DV] Log capture enabled. Use dumpDVLogs(), clearDVLogs(), disableDVDebug()'); } catch(_) {}
  })();

  // Provide global helpers even if debug is not enabled yet
  if (typeof window.enableDVDebug !== 'function') {
    window.enableDVDebug = function () {
      try { localStorage.setItem('dv:debug', '1'); console.log('[DV] Debug enabled. Reloading…'); location.reload(); }
      catch (e) { console.error('[DV] enableDVDebug failed', e); }
    };
  }
  if (typeof window.dumpDVLogs !== 'function') {
    window.dumpDVLogs = function () {
      console.warn('[DV] Logging not enabled. Open the site with ?debug=1 or run enableDVDebug() then reproduce and call dumpDVLogs().');
    };
  }
  if (typeof window.clearDVLogs !== 'function') {
    window.clearDVLogs = function () {
      try { sessionStorage.removeItem('dv:logs'); console.log('[DV] Cleared captured logs (if any)'); }
      catch (e) { console.error('[DV] clearDVLogs failed', e); }
    };
  }
  if (window.__pjaxInitialized) return;
  window.__pjaxInitialized = true;

  const containerSelector = '#pjax-container';

  function isSameOrigin(href) {
    try {
      const url = new URL(href, window.location.href);
      return url.origin === window.location.origin;
    } catch (_) {
      return false;
    }
  }

  function isHtmlLikePath(path) {
    if (!path) return true; // '' allowed
    if (path === '/' || path === '') return true;
    if (path.endsWith('.html')) return true;
    // Accept extensionless pretty URLs like "/songs" or with trailing slash
    const last = path.replace(/\/$/, '').split('/').pop();
    if (!last) return true; // root or trailing slash
    if (!last.includes('.')) return true; // no extension => treat as HTML page
    return false;
  }

  function shouldHandleClick(e, a) {
    if (!a) return false;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return false; // allow in-page anchors
    if (a.target && a.target !== '' && a.target !== '_self') return false;
    if (a.hasAttribute('download') || a.hasAttribute('data-no-pjax')) return false;
    if (!isSameOrigin(href)) return false;

    // Only handle .html or root paths
    const url = new URL(href, window.location.href);
    const path = url.pathname;
    if (!isHtmlLikePath(path)) return false;

    return true;
  }

  // Verbose decision trace for debugging why a click was not handled
  function debugClickDecision(e, a) {
    try {
      if (!window.localStorage || localStorage.getItem('dv:debug') !== '1') return;
      const info = { reason: null };
      if (!a) { info.reason = 'no-anchor'; console.debug('[PJAX] skip', info); return; }
      const href = a.getAttribute('href');
      if (!href) { info.reason = 'no-href'; console.debug('[PJAX] skip', info); return; }
      if (href.startsWith('#')) { info.reason = 'hash-link'; console.debug('[PJAX] skip', info); return; }
      if (a.target && a.target !== '' && a.target !== '_self') { info.reason = 'target-'+a.target; console.debug('[PJAX] skip', info); return; }
      if (a.hasAttribute('download') || a.hasAttribute('data-no-pjax')) { info.reason = 'download-or-no-pjax'; console.debug('[PJAX] skip', info); return; }
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button !== undefined && e.button !== 0)) { info.reason = 'modifier-or-non-left-click'; console.debug('[PJAX] skip', info); return; }
      if (!isSameOrigin(href)) { info.reason = 'cross-origin'; console.debug('[PJAX] skip', info); return; }
      const url = new URL(href, window.location.href);
      const path = url.pathname;
      // Use the same decision as shouldHandleClick
      const last = path.replace(/\/$/, '').split('/').pop();
      const htmlLike = (path === '/' || path === '' || path.endsWith('.html') || !last.includes('.'));
      if (!htmlLike) { info.reason = 'path-not-html-or-root'; info.path = path; console.debug('[PJAX] skip', info); return; }
      console.debug('[PJAX] will-handle', { href, path });
    } catch (_) {}
  }

  async function fetchPage(url) {
    const doTiming = (localStorage.getItem('dv:debug') === '1');
    if (doTiming) { try { console.time('[PJAX] fetch'); } catch(_) {} }
    const res = await fetch(url, { headers: { 'X-PJAX': 'true' } });
    if (!res.ok) throw new Error('Failed to load: ' + url);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    if (doTiming) { try { console.timeEnd('[PJAX] fetch'); } catch(_) {} }
    return doc;
  }

  function executeScriptsFrom(container) {
    // Execute only inline scripts to avoid reloading global JS repeatedly
    const scripts = Array.from(container.querySelectorAll('script'));
    const seen = (window.__pjaxExecutedInlineScripts = window.__pjaxExecutedInlineScripts || new Set());
    scripts.forEach((oldScript) => {
      if (oldScript.src) return; // skip external scripts; globals should already be loaded
      const code = (oldScript.textContent || '').trim();
      const sig = code.length + ':' + (code.slice(0, 256));
      if (seen.has(sig)) {
        try { console.debug('[PJAX] skip inline script (already executed)'); } catch(_) {}
        oldScript.remove();
        return;
      }
      seen.add(sig);
      const newScript = document.createElement('script');
      // Copy attributes (type, etc.) except src
      for (const attr of oldScript.attributes) {
        if (attr.name.toLowerCase() === 'src') continue;
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.textContent = code;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  function swapContent(newDoc) {
    const doTiming = (localStorage.getItem('dv:debug') === '1');
    if (doTiming) { try { console.time('[PJAX] swap'); } catch(_) {} }
    const newContainer = newDoc.querySelector(containerSelector);
    const currentContainer = document.querySelector(containerSelector);
    if (!newContainer || !currentContainer) return false;

    // Sync page-specific styles from <head> that opt-in to PJAX
    try {
      // Remove existing page styles
      document.head.querySelectorAll('style[data-pjax-style]').forEach((el) => el.remove());
      // Add incoming page styles
      newDoc.head.querySelectorAll('style[data-pjax-style]').forEach((styleEl) => {
        const cloned = document.createElement('style');
        for (const attr of styleEl.attributes) cloned.setAttribute(attr.name, attr.value);
        cloned.textContent = styleEl.textContent || '';
        document.head.appendChild(cloned);
      });
    } catch (e) {
      console.warn('PJAX style sync failed', e);
    }

    // Update document title
    if (newDoc.title) document.title = newDoc.title;

    // Replace content
    currentContainer.innerHTML = newContainer.innerHTML;

    // Execute inline scripts that were part of the new content
    executeScriptsFrom(currentContainer);

    // Dispatch a custom event so page code can re-initialize if needed
    document.dispatchEvent(new CustomEvent('pjax:load'));

    // Scroll to top for new page
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (doTiming) { try { console.timeEnd('[PJAX] swap'); } catch(_) {} }
    return true;
  }

  async function navigate(url, push = true) {
    try {
      const doTiming = (localStorage.getItem('dv:debug') === '1');
      // Debug + lifecycle event before navigation
      try { console.log('[PJAX] navigate start', url); } catch(_) {}
      try { document.dispatchEvent(new CustomEvent('pjax:before', { detail: { url } })); } catch(_) {}
      if (doTiming) { try { console.time('[PJAX] total'); } catch(_) {} }
      const newDoc = await fetchPage(url);
      const swapped = swapContent(newDoc);
      if (swapped && push) {
        history.pushState({ url }, '', url);
        try { console.log('[PJAX] history pushState', url); } catch(_) {}
      }
      if (doTiming) { try { console.timeEnd('[PJAX] total'); } catch(_) {} }
    } catch (err) {
      console.error('[PJAX] navigate error', err);
      window.location.href = url; // Fallback to full navigation
    }
  }

  // Intercept link clicks
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    debugClickDecision(e, a);
    if (!shouldHandleClick(e, a)) return;
    e.preventDefault();
    const href = a.getAttribute('href');
    const url = new URL(href, window.location.href).toString();
    try { console.log('[PJAX] intercept click', url); } catch(_) {}
    navigate(url, true);
  });

  // Handle back/forward
  window.addEventListener('popstate', (e) => {
    const url = (e.state && e.state.url) || window.location.href;
    navigate(url, false);
  });
})();
