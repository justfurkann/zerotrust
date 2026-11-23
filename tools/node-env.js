// Runs the real game scripts with a minimal DOM. No browser or dependencies.
// This verifies deterministic physics, not browser layout or Web Audio.
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
module.exports = function createGame(options = {}) {
  const elements = new Map();
  const noop = () => {};
  const context2d = new Proxy({
    measureText: (s) => ({ width: String(s).length * 12 }),
    createRadialGradient: () => ({ addColorStop: noop }),
    createLinearGradient: () => ({ addColorStop: noop })
  }, { get: (o, k) => k in o ? o[k] : noop });
  function element(tag = 'div') {
    const e = {
      dataset: {}, children: [], style: { setProperty: noop },
      classList: { add: noop, remove: noop, toggle: noop },
      addEventListener: noop, remove: noop, focus: noop, blur: noop,
      appendChild(c) { this.children.push(c); return c; },
      append(...cs) { this.children.push(...cs); },
      querySelector: () => element(), querySelectorAll: () => [],
      getAttribute: () => null, getBoundingClientRect: () => ({ width: 1920, height: 1080, left: 0, top: 0 }),
      getContext: () => context2d
    };
    if (tag === 'canvas' && options.canvasFactory) {
      const canvas = options.canvasFactory();
      const { getContext, ...dom } = e;
      Object.assign(canvas, dom);
      canvas.canvas = canvas;
      return canvas;
    }
    return e;
  }
  const document = {
    getElementById(id) { if (!elements.has(id)) elements.set(id, element(id === 'game' ? 'canvas' : 'div')); return elements.get(id); },
    createElement: element, querySelector: () => element(), querySelectorAll: () => [],
    addEventListener: noop, documentElement: element(), body: element()
  };
  const saved = new Map(Object.entries(options.saved || {}));
  const env = {
    document, navigator: { language: 'tr', userAgent: 'Node physics test', maxTouchPoints: 0 },
    location: { search: options.search || '?zttest' }, localStorage: { getItem: (k) => saved.get(k) || null, setItem: (k,v) => saved.set(k,v) },
    performance: { now: () => 0 }, requestAnimationFrame: noop, setTimeout: () => 0, clearTimeout: noop,
    addEventListener: noop, matchMedia: () => ({ matches: false }), console
  };
  env.window = env;
  vm.createContext(env);
  for (const name of ['i18n', 'levels', 'audio', 'story', 'game']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/' + name + '.js'), 'utf8'), env, { filename: name + '.js' });
  }
  return { ZT: env.ZT, evaluate: (fn, arg) => vm.runInContext('(' + fn.toString() + ')(' + JSON.stringify(arg) + ')', env), elements, saved };
};
