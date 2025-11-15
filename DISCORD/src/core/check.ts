import { Question } from '../types.js';

export function isCorrect(q: Question, ua: { value?: any; values?: string[]; matches?: Record<string, string> }): boolean {
  if (q.type === 'VF') return ua.value === q.vf;

  if (q.type === 'QR') {
    const v = (ua.value ?? '') as string;
    const good = q.answers.find((a) => a.correct);
    return !!good && v === (good.text ?? '');
  }

  if (q.type === 'QCM') {
    const chosen = new Set<string>((ua.values ?? []) as string[]);
    const goods = q.answers.filter((a) => a.correct).map((a) => a.text);
    const bads  = q.answers.filter((a) => !a.correct).map((a) => a.text);
    const allGoodChecked = goods.every((g) => chosen.has(g));
    const noBadChecked   = bads.every((b) => !chosen.has(b));
    return chosen.size > 0 && allGoodChecked && noBadChecked;
  }

  if (q.type === 'DragMatch') {
    const userMatches = ua.matches ?? {};
    return q.pairs.every((pair) => userMatches[pair.item] === pair.match);
  }

  return false;
}

export function correctText(q: Question): string {
  if (q.type === 'VF') return q.vf === 'V' ? 'Vrai' : 'Faux';
  if (q.type === 'QR') return q.answers.find((a) => a.correct)?.text ?? '';
  if (q.type === 'QCM') return q.answers.filter((a) => a.correct).map((a) => a.text).join(' | ');
  if (q.type === 'DragMatch') return q.pairs.map((p) => `${p.item} → ${p.match}`).join(', ');
  return '';
}
