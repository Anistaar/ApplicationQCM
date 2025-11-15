import { parseQuestions } from './parser';
import { dedupeQuestions, toTitleCase } from './utils';
export type CourseItem = {
  path: string;
  file: string;
  label: string;
  content: string;
  folder: string;
  // Chapitrage optionnel via première ligne: `chapter: A > B > C`
  chapterPath?: string[];   // [A, B, C]
  chapterFull?: string;     // "A · B · C"
  chapterTop?: string;      // A
};

// discover courses from filesystem via Vite import.meta.glob
const COURSE_RAW = (import.meta as any).glob('./cours/**/*.txt', {
  query: '?raw', import: 'default', eager: true
}) as Record<string, string>;

export const courses: CourseItem[] = Object.entries(COURSE_RAW)
  .map(([path, content]) => {
    const parts = path.split('/');
    const file = parts.pop()!;
    const folder = parts.pop() ?? '(Sans matière)';
    const base = file.replace(/\.txt$/i, '');
    const label = toTitleCase(base.replace(/[-_]/g, ' '));
    // Meta chapitre: première ligne optionnelle
    let chapterPath: string[] | undefined;
    let chapterFull: string | undefined;
    let chapterTop: string | undefined;
    const firstLine = (content.split(/\r?\n/, 1)[0] || '').trim();
    const m = /^chapter\s*:\s*(.+)$/i.exec(firstLine);
    if (m) {
      chapterPath = m[1].split('>').map(s => s.trim()).filter(Boolean);
      if (chapterPath.length > 0) {
        chapterFull = chapterPath.join(' · ');
        chapterTop = chapterPath[0];
      }
    }
    return { path, file, label, content, folder, chapterPath, chapterFull, chapterTop } as CourseItem;
  })
  .sort((a, b) => a.label.localeCompare(b.label));

export function getThemesForCourse(path: string): string[] {
  const course = courses.find(c => c.path === path || c.file === path);
  if (!course) return [];
  const parsed = parseQuestions(course.content);
  const unique = dedupeQuestions(parsed);
  const set = new Set<string>();
  unique.forEach(q => (q.tags ?? []).forEach(t => set.add(t)));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
