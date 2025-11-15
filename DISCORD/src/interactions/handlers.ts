import { ChatInputCommandInteraction, StringSelectMenuInteraction, ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ComponentType, EmbedBuilder } from 'discord.js';
import path from 'node:path';
import { discoverCourses, loadFile, parseQuestions } from '../parser/index.js';
import { Question } from '../types.js';
import { renderQuestion } from '../core/render.js';
import { setSession, getSession } from '../store/sessions.js';
import { isCorrect, correctText } from '../core/check.js';

const COURSES_DIR = (process.env?.COURSES_DIR as string | undefined) || path.resolve(process.cwd?.() || '', '../src/cours');

function summarizePath(p: string): string {
  return p.replace(/\\/g, '/').split('/').slice(-3).join('/');
}

export async function handleQuizListCourses(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  const files = await discoverCourses(COURSES_DIR);
  const list = files.map((f, i) => `${i + 1}. ${summarizePath(f)}`).slice(0, 30).join('\n');
  await interaction.editReply({ content: list || 'Aucun fichier trouvé.' });
}

function filterTypes(pool: Question[], types: Set<string>): Question[] {
  if (types.size === 0) return pool;
  return pool.filter((q) => types.has(q.type));
}

function filterThemes(pool: Question[], themes: Set<string>): Question[] {
  if (themes.size === 0) return pool;
  return pool.filter((q) => (q.topics || []).some((t) => themes.has(t)));
}

function pick<T>(arr: T[], n: number): T[] {
  return arr.slice(0, Math.max(0, Math.min(n, arr.length)));
}

export async function handleQuizStart(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  const course = interaction.options.getString('course', true);
  const mode = interaction.options.getString('mode') || 'entrainement';
  const count = interaction.options.getInteger('count') || 10;
  const typesRaw = interaction.options.getString('types') || '';
  const themesRaw = interaction.options.getString('themes') || '';
  const types = new Set<string>(typesRaw.split(',').map((s: string) => s.trim()).filter(Boolean));
  const themes = new Set<string>(themesRaw.split(',').map((s: string) => s.trim()).filter(Boolean));

  const filePath = path.isAbsolute(course) ? course : path.join(COURSES_DIR, course);
  const content = loadFile(filePath);
  let pool = parseQuestions(content);
  pool = filterTypes(pool, types);
  pool = filterThemes(pool, themes);
  const chosen = pick<Question>(pool, count);

  if (chosen.length === 0) {
    await interaction.editReply({ content: 'Aucune question après filtrage.' });
    return;
  }

  const first = chosen[0]!;
  const rendered = renderQuestion(first, 1);
  setSession(interaction.guildId!, { userId: interaction.user.id, course: filePath, mode: mode as any, queue: chosen, index: 0 });
  await interaction.editReply({ content: `Mode: ${mode}\nQuestions: ${chosen.length}`, embeds: rendered.embeds, components: rendered.components });
}

export async function handleAnswerInteraction(interaction: StringSelectMenuInteraction | ButtonInteraction) {
  const guildId = interaction.guildId!;
  const userId = interaction.user.id;
  const sess = getSession(guildId, userId);
  if (!sess) {
    if (interaction.isRepliable()) await interaction.reply({ content: 'Aucune session. Lancez /quiz-start.', ephemeral: true }).catch(() => {});
    return;
  }

  const q = sess.queue[sess.index];
  if (!q) {
    const content = 'Session terminée.';
    if ('update' in interaction) await interaction.update({ content, components: [] }).catch(() => {});
    return;
  }

  const cid = 'customId' in interaction ? (interaction as any).customId as string : '';
  let feedback = '';
  let advance = false;

  // VF via boutons ans:VF:V or ans:VF:F
  if (cid.startsWith('ans:VF:') && interaction.isButton()) {
    const v = cid.endsWith(':V') ? 'V' : 'F';
    const ok = isCorrect(q, { value: v });
    feedback = ok ? '✅ Correct' : `❌ Incorrect — Réponse: ${correctText(q)}`;
    if ((q as any).explication) feedback += `\n${(q as any).explication}`;
    advance = true;
  }

  // QR via select ans:QR
  if (cid === 'ans:QR' && interaction.isStringSelectMenu()) {
    const v = interaction.values[0];
    const ok = isCorrect(q, { value: v });
    feedback = ok ? '✅ Correct' : `❌ Incorrect — Réponse: ${correctText(q)}`;
    if ((q as any).explication) feedback += `\n${(q as any).explication}`;
    advance = true;
  }

  // QCM: selection then validate
  if (cid === 'ans:QCM' && interaction.isStringSelectMenu()) {
    // store selection and ask to validate
    (sess as any).qcmBuffer = interaction.values;
    await interaction.reply({ content: 'Sélection enregistrée. Cliquez sur « Valider ». ', ephemeral: true }).catch(() => {});
    return;
  }
  if (cid === 'ans:QCM:validate' && interaction.isButton()) {
    const sel = (sess as any).qcmBuffer as string[] | undefined;
    const ok = isCorrect(q, { values: sel ?? [] });
    feedback = ok ? '✅ Correct' : `❌ Incorrect — Réponse: ${correctText(q)}`;
    if ((q as any).explication) feedback += `\n${(q as any).explication}`;
    (sess as any).qcmBuffer = [];
    advance = true;
  }

  // DragMatch: per-item selection then global validate
  if (cid.startsWith('ans:DM:') && interaction.isStringSelectMenu()) {
  const item = cid.split(':')[2] || '';
    (sess as any).dmBuffer = (sess as any).dmBuffer || {};
    (sess as any).dmBuffer[item] = interaction.values[0];
    await interaction.reply({ content: `Association notée: ${item} → ${interaction.values[0]}`, ephemeral: true }).catch(() => {});
    return;
  }
  if (cid === 'ans:DM:validate' && interaction.isButton()) {
    const matches = (sess as any).dmBuffer || {};
    const ok = isCorrect(q, { matches });
    feedback = ok ? '✅ Correct' : `❌ Incorrect — Réponse: ${correctText(q)}`;
    if ((q as any).explication) feedback += `\n${(q as any).explication}`;
    (sess as any).dmBuffer = {};
    advance = true;
  }

  if (!advance) {
    if (interaction.isRepliable()) await interaction.reply({ content: 'Interaction non reconnue pour cette question.', ephemeral: true }).catch(() => {});
    return;
  }

  // Advance to next
  sess.index += 1;
  const next = sess.queue[sess.index];
  if (!next) {
    const content = `${feedback}\n\n🎉 Terminé.`;
    if ('update' in interaction) await interaction.update({ content, embeds: [], components: [] }).catch(() => {});
    return;
  }

  const rendered = renderQuestion(next, sess.index + 1);
  const content = `${feedback}`;
  if ('update' in interaction) {
    await interaction.update({ content, embeds: rendered.embeds, components: rendered.components }).catch(() => {});
  }
}
