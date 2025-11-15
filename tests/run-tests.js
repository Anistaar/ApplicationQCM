// JS test harness for parser & scheduling (compiled sources)
import { parseQuestions, isCorrect, correctText } from '../build-tests/parser.js';
import { updateStatAfterAnswer, loadStats } from '../build-tests/scheduling.js';

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

const sample = `
VF || La terre est ronde || V || exp || geo
QR || Cap de la France ? || V:Paris|Lyon|Marseille || capitale || geo
QCM || Couleurs primaires ? || V:Rouge|V:Bleu|V:Jaune|Vert || exp || art
DragMatch || Associe pays-capitale || France:Paris, Allemagne:Berlin, Espagne:Madrid || exp || geo
`;

const questions = parseQuestions(sample);
assert(questions.length === 4, 'Should parse 4 questions');

const vf = questions.find(q => q.type === 'VF');
assert(isCorrect(vf, { value: 'V' }) === true, 'VF correct');
assert(correctText(vf) === 'Vrai', 'VF text');

const qr = questions.find(q => q.type === 'QR');
assert(isCorrect(qr, { value: 'Paris' }) === true, 'QR Paris');
assert(isCorrect(qr, { value: 'Lyon' }) === false, 'QR Lyon');

const qcm = questions.find(q => q.type === 'QCM');
assert(isCorrect(qcm, { values: ['Rouge','Bleu','Jaune'] }) === true, 'QCM full');
assert(isCorrect(qcm, { values: ['Rouge','Bleu'] }) === false, 'QCM partial');

const dm = questions.find(q => q.type === 'DragMatch');
assert(isCorrect(dm, { matches: { France:'Paris', Allemagne:'Berlin', Espagne:'Madrid' } }) === true, 'DragMatch full');
assert(isCorrect(dm, { matches: { France:'Paris', Allemagne:'Berlin' } }) === false, 'DragMatch partial');

updateStatAfterAnswer(vf, true, 0.1, 1500);
updateStatAfterAnswer(qr, false, 0.9, 5000);
const stats = loadStats();
assert(Object.keys(stats).length >= 2, 'Stats stored');

// Aggregate other test files
import './parser-edge-tests.js';
import './scheduling-severity-tests.js';
import './droit-dragmatch-tests.js';

if (failures.length) {
  console.error('\nCORE TEST FAILURES');
  failures.forEach(f => console.error(' - ' + f));
  process.exit(1);
} else {
  console.log('Core parser/scheduling tests passed: ' + questions.length + ' questions validated.');
}
