// Deterministic integration checks. Run: node tools/checks.js
const assert = require('node:assert/strict');
const createGame = require('./node-env');
const { ZT } = createGame();
const D = ZT.debug;
assert.equal(ZT.LEVEL_COUNT, 48);
assert.equal(ZT.CHAPTERS.length, 7);
for (let i = 0; i < 48; i++) {
  const level = ZT.buildLevel(i);
  assert.equal(level.chars.length, 18);
  assert(level.chars.every((r) => r.length === level.cols));
  D.load(i);
  let seed = i + 1;
  for (let j = 0; j < 600; j++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    D.tick((seed & 3) === 0, (seed & 3) === 1, (seed & 16) !== 0);
    const s = D.state();
    assert(Number.isFinite(s.x) && Number.isFinite(s.y), 'invalid position in level ' + (i + 1));
  }
}
console.log('PASS: all 48 maps, 600 deterministic input ticks each');
for (const lang of ['tr', 'en']) {
  ZT.setLang(lang);
  for (const key of ['ch7.name', 'ch7.title', 'ch7.desc', 'die.gaze', ...Array.from({ length: 6 }, (_, n) => ['title', 'hint', 's1'].map((s) => 'l' + (43+n) + '.' + s)).flat()]) {
    assert.notEqual(ZT.t(key), key, lang + ' missing ' + key);
  }
}
console.log('PASS: new act translations in TR and EN');
// Turning away removes the bridge; releasing the keys preserves facing.
D.load(42);
D.warp(11);
D.tick(true, false, false);
for (let i = 0; i < 80 && !D.state().dead; i++) D.tick(false, false, false);
assert.equal(D.state().lastDeath, 'die.void');
assert.equal(D.state().facing, -1);
// Turning toward an enclosing ghost block kills; outside it is safe.
D.load(47); D.warp(58); D.tick(true, false, false);
assert.equal(D.state().lastDeath, 'die.gaze');
D.load(47); D.warp(54); D.tick(true, false, false);
assert.equal(D.state().dead, false);
console.log('PASS: facing persistence, disappearing support, enclosed turn, safe turn');
const old = { unlocked: 41, cleared: Array(42).fill(true), best: Array(42).fill(100), deaths: 123, ldeaths: Array(42).fill(2) };
const migrated = createGame({ saved: { 'zt.save.v3': JSON.stringify(old) } });
assert.match(migrated.elements.get('btnPlayNote').textContent, /^43/);
assert.equal(migrated.elements.get('menuProgress').textContent, '42');
assert.equal(migrated.elements.get('menuTotal').textContent, '/48');
assert.equal(migrated.elements.get('menuDeaths').textContent, '123');
console.log('PASS: completed 42-level save continues at 43, with stats preserved');

// The introductory turnaround has a window, rather than one required frame.
let wins = 0;
for (let extra = 0; extra <= 8; extra++) {
  const d = createGame().ZT.debug; d.load(42);
  const tick = (l,r,j,n) => { for(let i=0;i<n;i++) d.tick(l,r,j); };
  let guard=0;
  while(d.state().x<14.3 && guard++<200) tick(false,true,false,1);
  tick(false,true,true,18); tick(false,true,false,extra);
  tick(true,false,false,1);
  for(let i=0;i<80 && !d.state().ground && !d.state().dead;i++) tick(false,false,false,1);
  if(d.state().dead) continue;
  tick(false,true,true,18);
  for(let i=0;i<100 && !d.state().ground && !d.state().dead;i++) tick(false,true,false,1);
  if(d.state().dead) continue;
  for(let i=0;i<150 && d.state().level===42 && !d.state().dead;i++) tick(false,true,false,1);
  if(d.state().level===43) wins++;
}
assert(wins >= 6, 'intro turn has too narrow a timing window: '+wins+'/9');
console.log('PASS: intro turn succeeds at '+wins+'/9 consecutive timing offsets');

const preview = createGame({ search: '?zttest&level=43' });
assert.equal(preview.ZT.debug.state().level, 42);
assert.equal(preview.ZT.debug.state().screen, 'playing');
assert.equal(createGame({ search: '?zttest&level=99' }).ZT.debug.state().screen, 'menu');
const normal = createGame({ search: '?level=43' });
assert.equal(normal.ZT.debug, undefined);
assert.equal(normal.elements.get('stage').dataset.screen, 'menu');
console.log('PASS: preview deep link starts 43 only in test mode; invalid/normal links stay at menu');
