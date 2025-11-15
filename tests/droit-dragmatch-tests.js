// Test DragMatch parsing for Introduction_Droit_Prive_DragMatch_v1.txt
import { parseQuestions } from '../build-tests/parser.js';
import fs from 'node:fs';

const content = fs.readFileSync('src/cours/DROIT/Introduction_Droit_Prive_DragMatch_v1.txt','utf8');
const qs = parseQuestions(content);
const drag = qs.filter(q => q.type === 'DragMatch');
if (drag.length === 0) {
  console.error('DRAGMATCH TEST FAIL: No DragMatch questions parsed');
  process.exit(1);
} else {
  console.log(`DragMatch test: ${drag.length} DragMatch questions parsed, first has ${drag[0].pairs.length} pairs.`);
}
