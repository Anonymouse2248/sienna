(function(){
  function updateBrandVisibility(){
    var brand = document.getElementById('gameBrand');
    if(!brand) return;
    var stage = document.getElementById('stage');
    // Show brand when canvas is visible (i.e., in play); hide otherwise
    if(stage && stage.style.display !== 'none') { brand.style.display = ''; }
    else { brand.style.display = 'none'; }
  }
  function viewportSize(){
    var w = Math.max(window.innerWidth||0,(document.documentElement&&document.documentElement.clientWidth)||0,(document.body&&document.body.clientWidth)||0);
    var h = (window.innerHeight||0)||(document.documentElement&&document.documentElement.clientHeight)||((document.body&&document.body.clientHeight)||0);
    return {w:w,h:h};
  }
  function resizeGame(){
    var stage = document.getElementById('stage');
    var begin = document.getElementById('begin');
    var s = viewportSize();
    if(stage){
      // Canvas drawing resolution
      stage.width = s.w;
      stage.height = s.h;
      // CSS size to fill viewport
      stage.style.width = '100vw';
      // Use dynamic viewport height where supported
      stage.style.height = '100dvh';
    }
    if(begin){
      begin.style.width = s.w + 'px';
      begin.style.height = s.h + 'px';
    }
    updateBrandVisibility();
  }
  // Watch for begin overlay visibility changes
  var mo;
  function observeBegin(){
    var stage = document.getElementById('stage');
    if(!stage || typeof MutationObserver === 'undefined') return;
    if(mo) mo.disconnect();
    mo = new MutationObserver(updateBrandVisibility);
    mo.observe(stage, { attributes: true, attributeFilter: ['style', 'class'] });
  }
  window.addEventListener('resize', resizeGame);
  window.addEventListener('orientationchange', resizeGame);
  window.addEventListener('pageshow', resizeGame);
  document.addEventListener('DOMContentLoaded', function(){
    observeBegin();
    resizeGame();
  });
})();
