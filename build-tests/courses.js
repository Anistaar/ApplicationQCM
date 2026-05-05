import { toTitleCase } from './utils';
import { parserCache } from './cache/ParserCache';
// discover courses from filesystem via Vite import.meta.glob
const COURSE_RAW = import.meta.glob('./questions/**/*.txt', {
    query: '?raw', import: 'default', eager: true
});
export const courses = Object.entries(COURSE_RAW)
    .map(([path, content]) => {
    const parts = path.split('/');
    const file = parts.pop();
    const folder = parts.pop() ?? '(Sans matière)';
    const base = file.replace(/\.txt$/i, '');
    const label = toTitleCase(base.replace(/[-_]/g, ' '));
    // Meta chapitre: première ligne optionnelle
    let chapterPath;
    let chapterFull;
    let chapterTop;
    const firstLine = (content.split(/\r?\n/, 1)[0] || '').trim();
    const m = /^chapter\s*:\s*(.+)$/i.exec(firstLine);
    if (m) {
        chapterPath = m[1].split('>').map(s => s.trim()).filter(Boolean);
        if (chapterPath.length > 0) {
            chapterFull = chapterPath.join(' · ');
            chapterTop = chapterPath[0];
        }
    }
    return { path, file, label, content, folder, chapterPath, chapterFull, chapterTop };
})
    .sort((a, b) => a.label.localeCompare(b.label));
/**
 * Get parsed questions for a course (with caching)
 */
export function getQuestionsForCourse(path) {
    const course = courses.find(c => c.path === path || c.file === path);
    if (!course)
        return [];
    return parserCache.getParsedQuestions(course.path, course.content);
}
/**
 * Get themes for a course (with caching)
 */
export function getThemesForCourse(path) {
    const questions = getQuestionsForCourse(path);
    const set = new Set();
    questions.forEach(q => (q.tags ?? []).forEach(t => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
}
/**
 * Preload all courses in background (optional performance boost)
 */
export function preloadAllCourses() {
    parserCache.preloadCourses(courses);
}
