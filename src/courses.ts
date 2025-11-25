import { parseQuestions } from './parser';
import { dedupeQuestions, toTitleCase } from './utils';
import { parserCache } from './cache/ParserCache';

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
const COURSE_RAW = (import.meta as any).glob('./questions/**/*.txt', {
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

/**
 * Get parsed questions for a course (with caching)
 */
export function getQuestionsForCourse(path: string) {
  const course = courses.find(c => c.path === path || c.file === path);
  if (!course) return [];
  return parserCache.getParsedQuestions(course.path, course.content);
}

/**
 * Get themes for a course (with caching)
 */
export function getThemesForCourse(path: string): string[] {
  const questions = getQuestionsForCourse(path);
  const set = new Set<string>();
  questions.forEach(q => (q.tags ?? []).forEach(t => set.add(t)));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Preload all courses in background (optional performance boost)
 */
export function preloadAllCourses() {
  parserCache.preloadCourses(courses);
}
