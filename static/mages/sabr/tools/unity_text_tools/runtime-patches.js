(function(){
  // Runtime text replacement tool for Unity WebGL
  // Define your replacements here. Keys are exact Russian source strings, values are English.
  // You can also define regex rules for broader matches.
  const TextPatcher = {
    enabled: true,
    map: {
      // "Играть": "Play",
      // "Настройки": "Settings",
      // "Выход": "Exit",
    },
    regex: [
      // { pattern: /уровень\s*(\d+)/gi, replace: (m, n)=>`Level ${n}` },
    ],
    replaceAll(s){
      if (!this.enabled || typeof s !== 'string' || !s) return s;
      let out = s;
      // Exact matches first
      for (const [k,v] of Object.entries(this.map)){
        if (!k) continue;
        out = out.split(k).join(v);
      }
      // Regex rules
      for (const r of this.regex){
        try { out = out.replace(r.pattern, r.replace); } catch(_){}
      }
      return out;
    }
  };

  // Hook XHR responses during Addressables load to patch plain-text assets
  // This will not touch binary blobs (images, audio), only text-like responses.
  (function installXHRHook(){
    if (window.__unityTextPatchedXHR) return; // idempotent
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url){
      this.__unityTextUrl = url;
      return origOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(){
      try {
        this.addEventListener('load', function(){
          try {
            const ct = this.getResponseHeader('Content-Type') || '';
            const isText = /text|json|javascript|application\\/json/i.test(ct) || /\.json($|\?)/i.test(this.__unityTextUrl||'');
            if (!isText) return;
            // Try to get the text body (may be responseText or arrayBuffer)
            let body = '';
            if (typeof this.responseText === 'string') {
              body = this.responseText;
            } else if (this.response instanceof ArrayBuffer){
              body = new TextDecoder('utf-8').decode(new Uint8Array(this.response));
            }
            if (!body) return;
            const patched = TextPatcher.replaceAll(body);
            if (patched !== body){
              Object.defineProperty(this, 'responseText', {value: patched});
              Object.defineProperty(this, 'response', {value: patched});
            }
          } catch(e){
            console.warn('[runtime-patches] patch error:', e);
          }
        });
      } catch(e){ /* ignore */ }
      return origSend.apply(this, arguments);
    };
    window.__unityTextPatchedXHR = true;
  })();

  // Expose for live editing via DevTools
  window.UnityTextPatcher = TextPatcher;
})();
