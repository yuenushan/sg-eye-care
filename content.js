(function () {
  var PRESETS = { day: { temp: 22, dim: 3 }, eve: { temp: 47, dim: 10 }, night: { temp: 67, dim: 22 } };
  var DEFAULTS = { enabled: true, preset: 'eve', customTemp: 47, customDim: 10, disabledSites: [] };
  var HOST = location.hostname;
  var warm = null, dim = null;

  function resolve(cfg) {
    return cfg.preset === 'custom'
      ? { temp: cfg.customTemp, dim: cfg.customDim }
      : (PRESETS[cfg.preset] || PRESETS.eve);
  }
  function ensureLayers() {
    if (warm && dim) return;
    warm = document.createElement('div');
    warm.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483646;mix-blend-mode:multiply;background:#FFA550;opacity:0';
    dim = document.createElement('div');
    dim.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483646;mix-blend-mode:multiply;background:#000;opacity:0';
    document.documentElement.appendChild(warm);
    document.documentElement.appendChild(dim);
  }
  function removeLayers() {
    if (warm) warm.remove();
    if (dim) dim.remove();
    warm = dim = null;
  }
  function apply(cfg) {
    var blocked = !cfg.enabled || (cfg.disabledSites || []).indexOf(HOST) !== -1;
    if (blocked) { removeLayers(); return; }
    ensureLayers();
    var v = resolve(cfg);
    warm.style.opacity = (v.temp / 100 * 0.5).toFixed(3);
    dim.style.opacity = (v.dim / 100 * 0.5).toFixed(3);
  }
  chrome.storage.onChanged.addListener(function (ch, area) {
    if (area === 'sync') chrome.storage.sync.get(DEFAULTS, apply);
  });
  chrome.storage.sync.get(DEFAULTS, apply);
})();