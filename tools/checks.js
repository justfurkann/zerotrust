// Deterministic integration checks. Run: node tools/checks.js
const assert = require('node:assert/strict');
const createGame = require('./node-env');
const { ZT } = createGame();
const D = ZT.debug;
const N = ZT.LEVEL_COUNT;
const K = (key) => ZT.LEVEL_KEYS.indexOf(key);
assert.equal(N, 36);
assert.equal(ZT.CHAPTERS.length, 8);
// Arşivdeki bölümler de hâlâ kurulabilmeli (geri eklenebilsinler diye)
for (const key of ZT.ALL_LEVEL_KEYS) {
  const level = ZT.buildLevelByKey(key);
  assert.equal(level.chars.length, 18, key);
  assert(level.chars.every((r) => r.length === level.cols), key);
}
for (let i = 0; i < N; i++) {
  D.load(i);
  let seed = i + 1;
  for (let j = 0; j < 600; j++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    D.tick((seed & 3) === 0, (seed & 3) === 1, (seed & 16) !== 0);
    const s = D.state();
    assert(Number.isFinite(s.x) && Number.isFinite(s.y), 'invalid position in level ' + (i + 1));
  }
}
console.log('PASS: all ' + ZT.ALL_LEVEL_KEYS.length + ' maps build; ' + N + ' campaign levels survive 600 deterministic input ticks');
for (const lang of ['tr', 'en']) {
  ZT.setLang(lang);
  const keys = ['die.gaze', 'story.betray1', 'story.betray2', 'story.betray3', 'story.ending', 'story.theEnd', 'story.thanks', 'f2.s1', 'f2.s2', 'f2.s3', 'f1.s1'];
  for (const ch of ZT.CHAPTERS) keys.push(ch.key + '.name', ch.key + '.title', ch.key + '.desc');
  for (const ch of ZT.CHAPTERS.slice(1)) keys.push('chapter.' + ch.key);
  for (const k of ZT.LEVEL_KEYS) keys.push(k + '.title', k + '.hint');
  for (const key of keys) assert.notEqual(ZT.t(key), key, lang + ' missing ' + key);
  // Diyalog satırları "kim:ruh|metin" biçiminde
  for (const k of ['story.betray1', 'story.betray2', 'story.betray3', 'story.ending', ...ZT.CHAPTERS.slice(1).map((c) => 'chapter.' + c.key)]) {
    const v = ZT.t(k);
    assert(Array.isArray(v) && v.every((l) => /^(zero|dot)(:\w+)?\|./.test(l)), lang + ' bad dialog ' + k);
  }
}
console.log('PASS: story, chapter and level translations in TR and EN');
// Turning away removes the bridge; releasing the keys preserves facing.
D.load(K('l43'));
D.warp(11);
D.tick(true, false, false);
for (let i = 0; i < 80 && !D.state().dead; i++) D.tick(false, false, false);
assert.equal(D.state().lastDeath, 'die.void');
assert.equal(D.state().facing, -1);
// Turning toward an enclosing ghost block kills; outside it is safe.
D.load(K('l48')); D.warp(58); D.tick(true, false, false);
assert.equal(D.state().lastDeath, 'die.gaze');
D.load(K('l48')); D.warp(54); D.tick(true, false, false);
assert.equal(D.state().dead, false);
console.log('PASS: facing persistence, disappearing support, enclosed turn, safe turn');
const old = { unlocked: 41, cleared: Array(42).fill(true), best: Array(42).fill(100), deaths: 123, ldeaths: Array(42).fill(2) };
const migrated = createGame({ saved: { 'zt.save.v3': JSON.stringify(old) } });
// 48'li eski kayıt: l1..l42 geçilmiş → hikâyede sıradaki l43 (#31)
assert.match(migrated.elements.get('btnPlayNote').textContent, new RegExp('^' + (K('l43') + 1)));
assert.equal(migrated.elements.get('menuProgress').textContent, String(K('l43')));
assert.equal(migrated.elements.get('menuTotal').textContent, '/' + N);
assert.equal(migrated.elements.get('menuDeaths').textContent, '123');
console.log('PASS: old 48-level save migrates by level key and continues at l43, with stats preserved');

// The introductory turnaround has a window, rather than one required frame.
let wins = 0;
for (let extra = 0; extra <= 8; extra++) {
  const L43 = K('l43'); const d = createGame().ZT.debug; d.load(L43);
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
  for(let i=0;i<150 && d.state().level===L43 && !d.state().dead;i++) tick(false,true,false,1);
  if(d.state().level===L43+1) wins++;
}
assert(wins >= 6, 'intro turn has too narrow a timing window: '+wins+'/9');
console.log('PASS: intro turn succeeds at '+wins+'/9 consecutive timing offsets');

const preview = createGame({ search: '?zttest&level=31' });
assert.equal(preview.ZT.debug.state().level, 30);
// Bir yerin ilk bölümüyse önce Sıfır'ın perde arası konuşması açılır
assert(['playing', 'story'].includes(preview.ZT.debug.state().screen));
assert.equal(createGame({ search: '?zttest&level=99' }).ZT.debug.state().screen, 'menu');
const normal = createGame({ search: '?level=43' });
assert.equal(normal.ZT.debug, undefined);
assert.equal(normal.elements.get('stage').dataset.screen, 'menu');
console.log('PASS: preview deep link starts 31 only in test mode; invalid/normal links stay at menu');
