// Additional parser edge case tests
import { parseQuestions } from '../build-tests/parser.js';

const failures = [];
const assert = (cond, msg) => { if (!cond) failures.push(msg); };

// Edge: QR with multiple V: flags should collapse to single correct
const multiQR = 'QR || Question multi bonne ? || V:Bonne1|V:Bonne2|Mauvaise || exp || tag1';
const qMulti = parseQuestions(multiQR)[0];
assert(qMulti.answers.filter(a => a.correct).length === 1, 'QR multiple goods reduced to one');

// Edge: QCM with zero correct answers should be skipped
const badQcm = 'QCM || Toutes fausses ? || Faux1|Faux2|Faux3 || exp || test';
const parsedBad = parseQuestions(badQcm);
assert(parsedBad.length === 0, 'QCM with no correct answers skipped');

// DragMatch malformed pair (missing colon) filtered
const dragMalformed = 'DragMatch || Associe ? || A:Alpha, B:Beta, Invalide, C:Gamma || exp || dm';
const dmQs = parseQuestions(dragMalformed);
assert(dmQs.length === 1, 'DragMatch line parsed');
assert(dmQs[0].pairs.length === 3, 'Malformed pair removed, 3 valid remain');

if (failures.length) {
  console.error('\nEDGE TEST FAILURES');
  failures.forEach(f => console.error(' - ' + f));
  process.exit(1);
} else {
  console.log('Parser edge tests passed');
}
