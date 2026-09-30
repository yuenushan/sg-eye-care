var DEFAULTS = { enabled: true, preset: 'eve', customTemp: 47, customDim: 10, disabledSites: [] };
var PRESETS = { day: { name: '明亮办公室', temp: 22, dim: 3 }, eve: { name: '室内灯光', temp: 47, dim: 10 }, night: { name: '关灯房间', temp: 67, dim: 22 } };
var cfg = null, host = '';
function $(id) { return document.getElementById(id); }
function eff() {
  return cfg.preset === 'custom' ? { temp: cfg.customTemp, dim: cfg.customDim } : PRESETS[cfg.preset];
}
function save() { chrome.storage.sync.set(cfg); }
function render() {
  $('sw').checked = cfg.enabled;
  var on = cfg.enabled;
  $('mode').textContent = !on ? '已关闭' : (cfg.preset === 'custom' ? '自定义' : PRESETS[cfg.preset].name);
  $('panelBody').classList.toggle('grayed', !on);
  var v = eff();
  $('vt').textContent = v.temp; $('vd').textContent = v.dim;
  $('t').value = v.temp; $('d').value = v.dim;
  var btns = document.querySelectorAll('.preset-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.toggle('on', on && btns[i].dataset.p === cfg.preset);
  }
  if (host) $('siteChk').checked = cfg.disabledSites.indexOf(host) !== -1;
}
function toCustom(t, d) {
  cfg.preset = 'custom'; cfg.customTemp = t; cfg.customDim = d; save(); render();
}
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var tab = tabs[0];
  try { host = new URL(tab.url).hostname; } catch (e) { host = ''; }
  if (host) {
    $('siteRow').style.display = '';
    $('site').textContent = host;
  }
  chrome.storage.sync.get(DEFAULTS, function (c) { cfg = c; render(); });
});
$('sw').addEventListener('change', function () { cfg.enabled = this.checked; save(); render(); });
document.querySelectorAll('.preset-btn').forEach(function (b) {
  b.addEventListener('click', function () { cfg.preset = b.dataset.p; save(); render(); });
});
['t', 'd'].forEach(function (k) {
  var inp = $(k);
  inp.addEventListener('input', function () {
    if (k === 't') toCustom(+inp.value, eff().dim); else toCustom(eff().temp, +inp.value);
  });
});
document.querySelectorAll('.step-btn').forEach(function (btn) {
  var delta = +btn.dataset.d;
  var inp = $(btn.dataset.target === 't' ? 't' : 'd');
  var timer = null;
  function step() {
    var v = Math.min(100, Math.max(0, +inp.value + delta));
    inp.value = v;
    if (btn.dataset.target === 't') toCustom(v, eff().dim); else toCustom(eff().temp, v);
  }
  btn.addEventListener('pointerdown', function () { step(); timer = setInterval(step, 120); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
    btn.addEventListener(ev, function () { clearInterval(timer); timer = null; });
  });
});
$('siteChk').addEventListener('change', function () {
  var list = cfg.disabledSites.slice();
  if (this.checked) { if (list.indexOf(host) === -1) list.push(host); }
  else { var i = list.indexOf(host); if (i !== -1) list.splice(i, 1); }
  cfg.disabledSites = list; save();
});