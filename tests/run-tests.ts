// Minimal test harness for parser & scheduling
import { parseQuestions, isCorrect, correctText } from '../src/parser.ts';
import { updateStatAfterAnswer, loadStats } from '../src/scheduling.ts';
import type { Question, UserAnswer } from '../src/types.ts';

// localStorage shim for Node
if (typeof (globalThis as any).localStorage === 'undefined') {
  const store: Record<string,string> = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

let failures: string[] = [];
function assert(cond: any, msg: string) { if (!cond) failures.push(msg); }
function eq(a: any, b: any, msg: string) { if (JSON.stringify(a) !== JSON.stringify(b)) failures.push(msg + ` -> ${JSON.stringify(a)} != ${JSON.stringify(b)}`); }

// Sample content lines covering all types
const sample = `
VF || La terre est ronde || V || exp || geo
QR || Cap de la France ? || V:Paris|Lyon|Marseille || capitale || geo
QCM || Couleurs primaires ? || V:Rouge|V:Bleu|V:Jaune|Vert || exp || art
DragMatch || Associe pays-capitale || France:Paris, Allemagne:Berlin, Espagne:Madrid || exp || geo
`;

let questions: Question[] = [];
try {
  questions = parseQuestions(sample);
} catch (e) {
  console.error('Error parsing sample:', e);
  process.exit(1);
}
assert(questions.length === 4, 'Should parse 4 questions');

// VF correctness
const vf = questions.find(q => q.type === 'VF')!;
assert(isCorrect(vf as any, { value: 'V' }) === true, 'VF should be correct for V');
assert(correctText(vf as any) === 'Vrai', 'VF correctText');

// QR single correct
const qr = questions.find(q => q.type === 'QR')!;
assert(isCorrect(qr as any, { value: 'Paris' }) === true, 'QR Paris correct');
assert(isCorrect(qr as any, { value: 'Lyon' }) === false, 'QR Lyon incorrect');

// QCM multiple
const qcm = questions.find(q => q.type === 'QCM')!;
assert(isCorrect(qcm as any, { values: ['Rouge','Bleu','Jaune'] }) === true, 'QCM full set correct');
assert(isCorrect(qcm as any, { values: ['Rouge','Bleu'] }) === false, 'QCM missing one incorrect');

// DragMatch
const dm = questions.find(q => q.type === 'DragMatch')!;
assert(isCorrect(dm as any, { matches: { France:'Paris', Allemagne:'Berlin', Espagne:'Madrid' } }) === true, 'DragMatch complete correct');
assert(isCorrect(dm as any, { matches: { France:'Paris', Allemagne:'Berlin' } }) === false, 'DragMatch incomplete incorrect');

// Scheduling stats update
let stats: Record<string, any> = {};
try {
  updateStatAfterAnswer(vf as any, true, 0.1, 1500);
  updateStatAfterAnswer(qr as any, false, 0.9, 5000);
  stats = loadStats();
} catch (e) {
  console.error('Error scheduling stats:', e);
  process.exit(1);
}
const statKeys = Object.keys(stats);
assert(statKeys.length >= 2, 'Should have stats stored for answered questions');

// Strength evolution basic sanity
const vfKey = statKeys.find(k => k.includes('la terre est ronde'))!;
const qrKey = statKeys.find(k => k.includes('cap de la france'))!;
assert(stats[vfKey].correct! >= 1, 'VF correct count');
assert((stats[qrKey].correct || 0) <= 0.5, 'QR penalty after wrong answer');

if (failures.length) {
  console.error('TEST FAILURES:\n' + failures.map(f => '- ' + f).join('\n'));
  process.exit(1);
} else {
  console.log('All tests passed (' + questions.length + ' parsed).');
}
