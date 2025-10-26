// Intercept requests for game.unx and serve a concatenation of parts from jsDelivr
// Safe to include before runner.js; it shims XMLHttpRequest only for the specific URL.
(function () {
  const CDN_BASE = 'https://cdn.jsdelivr.net/gh/yellowdevelopmnt/jsdelivr-cdns/deltarunebossrush/';
  const PARTS = [
    'game.unx.part1',
    'game.unx.part2',
    'game.unx.part3',
    'game.unx.part4',
    'game.unx.part5',
    'game.unx.part6',
    'game.unx.part7',
    'game.unx.part8',
  ];

  // In-memory cache of assembled buffer
  let assembledBuffer = null;

  // Helper: fetch as ArrayBuffer with retries
  async function fetchPart(url, attempts = 2) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
      try {
        const res = await fetch(url, { cache: 'force-cache' });
        if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
        return await res.arrayBuffer();
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr;
  }

  async function assembleGameUnx() {
    if (assembledBuffer) return assembledBuffer;
    const buffers = await Promise.all(
      PARTS.map((name) => fetchPart(`${CDN_BASE}/${name}`))
    );
    const total = buffers.reduce((sum, b) => sum + b.byteLength, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const b of buffers) {
      out.set(new Uint8Array(b), offset);
      offset += b.byteLength;
    }
    assembledBuffer = out.buffer;
    return assembledBuffer;
  }

  // XHR shim: only intercept GET for 'game.unx' (relative or absolute) and respond with assembled buffer
  const OriginalXHR = window.XMLHttpRequest;
  function shouldIntercept(url) {
    try {
      // Normalize against document.baseURI
      const u = new URL(url, document.baseURI);
      return /(^|\/)game\.unx(\?|#|$)/i.test(u.pathname);
    } catch (_) {
      // Fallback for odd URLs
      return /(^|\/)game\.unx(\?|#|$)/i.test(String(url));
    }
  }

  class XHRShim extends OriginalXHR {
    open(method, url, async = true, user, password) {
      this.__isGameUnx = method === 'GET' && async !== false && shouldIntercept(url);
      this.__interceptUrl = url;
      return super.open(method, url, async, user, password);
    }
    send(body) {
      if (!this.__isGameUnx) {
        return super.send(body);
      }
      // Re-open with a blob URL so native XHR provides correct status/response
      (async () => {
        try {
          const buffer = await assembleGameUnx();
          const blob = new Blob([new Uint8Array(buffer)], { type: 'application/octet-stream' });
          const blobUrl = URL.createObjectURL(blob);

          // Preserve current handlers and responseType set by caller prior to send
          const handlers = {
            onload: this.onload,
            onerror: this.onerror,
            onprogress: this.onprogress,
            onreadystatechange: this.onreadystatechange,
            onloadend: this.onloadend,
          };
          const desiredResponseType = this.responseType || 'arraybuffer';

          // Re-open to point at the blob URL and restore state
          OriginalXHR.prototype.open.call(this, 'GET', blobUrl, true);
          try { this.responseType = desiredResponseType; } catch (_) {}
          this.onload = handlers.onload;
          this.onerror = handlers.onerror;
          this.onprogress = handlers.onprogress;
          this.onreadystatechange = handlers.onreadystatechange;
          this.onloadend = handlers.onloadend;

          // Clean up blob URL when done
          this.addEventListener('loadend', () => {
            try { URL.revokeObjectURL(blobUrl); } catch (_) {}
          }, { once: true });

          // Proceed with native send (no body for GET)
          OriginalXHR.prototype.send.call(this, null);
        } catch (err) {
          // Bubble an error similar to network failure
          try { this.dispatchEvent(new Event('error')); } catch (_) {}
          try { this.dispatchEvent(new Event('readystatechange')); } catch (_) {}
        }
      })();
    }
  }

  // Install shim only once
  if (!window.__gameUnxCdnShimInstalled) {
    window.XMLHttpRequest = XHRShim;
    // Also intercept fetch()
    const originalFetch = window.fetch ? window.fetch.bind(window) : null;
    if (originalFetch) {
      window.fetch = async function(input, init) {
        try {
          const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
          if (shouldIntercept(url)) {
            const buffer = await assembleGameUnx();
            return new Response(buffer, {
              status: 200,
              headers: {
                'Content-Type': 'application/octet-stream'
              }
            });
          }
        } catch (_) {}
        return originalFetch(input, init);
      };
    }
    window.__gameUnxCdnShimInstalled = true;
    console.log('[cdn-gameunx-loader] Interceptor installed.');
  }
})();
