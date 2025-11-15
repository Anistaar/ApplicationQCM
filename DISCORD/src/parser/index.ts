import fs from 'node:fs';
import fg from 'fast-glob';
import { Answer, DragPair, Question } from '../types.js';

const SEP_COL = '||';
const CORR_PREFIX = /^V:/i;

function clean(s: string | undefined | null): string {
  return (s ?? '').replace(/\u00A0/g, ' ').trim();
}
function splitCols(line: string): string[] {
  return line.split(SEP_COL).map((s) => s.trim());
}
function parseTopicList(raw: string): string[] {
  const t = clean(raw);
  if (!t) return [];
  return t
    .split(/[;,]/)
    .map((x) => x.trim())
    .filter(Boolean);
}
function extractInlineTags(question: string): string[] {
  const out: string[] = [];
  const re = /\[#([^\]]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(question))) {
    const tag = clean(m[1]);
    if (tag) out.push(tag);
  }
  return out;
}
function parseAnswers(raw: string): Answer[] {
  return clean(raw)
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((opt) => {
      const correct = CORR_PREFIX.test(opt);
      const text = opt.replace(CORR_PREFIX, '').trim();
      return { text, correct };
    });
}

export function parseQuestions(content: string): Question[] {
  const out: Question[] = [];
  if (!content) return out;

  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !/^\/{2}/.test(l));

  let currentThemes: string[] = [];

  for (const line of lines) {
  const mSet = line.match(/^@themes?\s*:\s*(.+)$/i);
  if (mSet) { currentThemes = parseTopicList(mSet[1] ?? ''); continue; }
  const mAdd = line.match(/^@add-?theme\s*:\s*(.+)$/i);
  if (mAdd) { currentThemes = Array.from(new Set([...currentThemes, ...parseTopicList(mAdd[1] ?? '') ])); continue; }

    const cols = splitCols(line);
    const kind = clean(cols[0]).toUpperCase();

    if (kind === 'VF' && cols.length >= 3) {
      const question = clean(cols[1]);
      const vfVal: 'V' | 'F' = clean(cols[2]).toUpperCase() === 'V' ? 'V' : 'F';
      const explication = clean(cols[3]);
      const topics = Array.from(new Set([
        ...currentThemes,
        ...parseTopicList(cols[4] ?? ''),
        ...extractInlineTags(question)
      ]));
      out.push({ type: 'VF', question, vf: vfVal, explication, topics });
      continue;
    }

    if (kind === 'QR' && cols.length >= 3) {
      const question = clean(cols[1]);
      const answers = parseAnswers(cols[2] ?? '');
      const explication = clean(cols[3]);
      const topics = Array.from(new Set([
        ...currentThemes,
        ...parseTopicList(cols[4] ?? ''),
        ...extractInlineTags(question)
      ]));
      const nbGood = answers.filter((a) => a.correct).length;
      if (nbGood === 0) continue;
      if (nbGood > 1) {
        let keepOne = false;
        for (const a of answers) {
          if (a.correct && !keepOne) { keepOne = true; }
          else { a.correct = false; }
        }
      }
      out.push({ type: 'QR', question, answers, explication, topics });
      continue;
    }

    if (kind === 'QCM' && cols.length >= 3) {
      const question = clean(cols[1]);
      const answers = parseAnswers(cols[2] ?? '');
      const explication = clean(cols[3]);
      const topics = Array.from(new Set([
        ...currentThemes,
        ...parseTopicList(cols[4] ?? ''),
        ...extractInlineTags(question)
      ]));
      if (answers.every((a) => !a.correct)) continue;
      out.push({ type: 'QCM', question, answers, explication, topics });
      continue;
    }

    if (kind === 'DRAGMATCH' && cols.length >= 2) {
      const question = clean(cols[1]);
      const pairsRaw = clean(cols[2]);
      const explication = clean(cols[3]);
      const topics = Array.from(new Set([
        ...currentThemes,
        ...parseTopicList(cols[4] ?? ''),
        ...extractInlineTags(question)
      ]));
      const pairs: DragPair[] = pairsRaw.split(/[;,]/).map((p) => {
        const [item, match] = p.split(':').map((s) => s.trim());
        return item && match ? { item, match } : null;
      }).filter((p): p is DragPair => p !== null);
      if (pairs.length > 0) out.push({ type: 'DragMatch', question, pairs, explication, topics });
      continue;
    }
  }

  return out;
}

export async function discoverCourses(baseDir: string): Promise<string[]> {
  const pattern = '**/*.txt';
  const entries = await fg(pattern, { cwd: baseDir, dot: false, onlyFiles: true, absolute: true });
  return entries.sort((a: string, b: string) => a.localeCompare(b));
}

export function loadFile(p: string): string {
  return fs.readFileSync(p, 'utf8');
}
