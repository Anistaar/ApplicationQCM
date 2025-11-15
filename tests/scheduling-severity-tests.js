// Scheduling severity bucket & progression tests
import { parseQuestions } from '../build-tests/parser.js';
import { computeSeverity, updateStatAfterAnswer, loadStats } from '../build-tests/scheduling.js';

// localStorage shim (tests may run before harness defines it)
if (typeof globalThis.localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k,v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

const sample = 'VF || Test rapide || V || exp || speed';
const q = parseQuestions(sample)[0];

// Simulate fast correct answer (1s)
const uaFast = { kind: 'VF', value: 'V', timeMs: 1000 };
const sevFast = computeSeverity(q, uaFast);
assert(sevFast < 0.4, 'Fast correct VF should have low severity');

// Simulate slow incorrect answer (9s wrong)
const uaSlowWrong = { kind: 'VF', value: 'F', timeMs: 9000 };
const sevSlowWrong = computeSeverity(q, uaSlowWrong);
assert(sevSlowWrong > 0.9, 'Slow wrong VF should have high severity');

// Update stats and verify box demotion / promotion logic
updateStatAfterAnswer(q, true, sevFast, uaFast.timeMs);
updateStatAfterAnswer(q, true, sevFast, uaFast.timeMs);
updateStatAfterAnswer(q, true, sevFast, uaFast.timeMs);
let stats = loadStats();
const key = Object.keys(stats)[0];
assert(stats[key].box >= 2, 'Box promoted after streak');

// Force demotion with severe error
updateStatAfterAnswer(q, false, sevSlowWrong, uaSlowWrong.timeMs);
stats = loadStats();
assert(stats[key].box === 1, 'Box demoted on severe error');

if (failures.length) {
  console.error('\nSCHEDULING TEST FAILURES');
  failures.forEach(f => console.error(' - ' + f));
  process.exit(1);
} else {
  console.log('Scheduling severity tests passed');
}
