import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { Question } from '../types.js';

export type Rendered = { content?: string; embeds?: EmbedBuilder[]; components?: any[] };

export function renderQuestion(q: Question, index: number): Rendered {
  const embed = new EmbedBuilder().setTitle(`Question ${index}`).setDescription(q.question);
  if (q.type === 'VF') {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('ans:VF:V').setLabel('Vrai').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('ans:VF:F').setLabel('Faux').setStyle(ButtonStyle.Danger),
    );
    return { embeds: [embed], components: [row] };
  }
  if (q.type === 'QR') {
    const sel = new StringSelectMenuBuilder().setCustomId('ans:QR').setPlaceholder('Choisir une réponse').setMinValues(1).setMaxValues(1);
    q.answers.forEach((a) => sel.addOptions({ label: a.text, value: a.text }));
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(sel);
    return { embeds: [embed], components: [row] };
  }
  if (q.type === 'QCM') {
    const sel = new StringSelectMenuBuilder().setCustomId('ans:QCM').setPlaceholder('Choisir une ou plusieurs réponses').setMinValues(1).setMaxValues(q.answers.length);
    q.answers.forEach((a) => sel.addOptions({ label: a.text, value: a.text }));
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(sel);
    const val = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('ans:QCM:validate').setLabel('Valider').setStyle(ButtonStyle.Primary));
    return { embeds: [embed], components: [row, val] };
  }
  if (q.type === 'DragMatch') {
    // Simple rendu: un select par item pour choisir la « match »
    const rows: any[] = [];
    const matches = Array.from(new Set(q.pairs.map((p) => p.match)));
    q.pairs.forEach((p, i) => {
      const sel = new StringSelectMenuBuilder().setCustomId(`ans:DM:${p.item}`).setPlaceholder(`Associer: ${p.item}`).setMinValues(1).setMaxValues(1);
      matches.forEach((m) => sel.addOptions({ label: m, value: m }));
      rows.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(sel));
    });
    const val = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('ans:DM:validate').setLabel('Valider associations').setStyle(ButtonStyle.Primary));
    return { embeds: [embed], components: [...rows, val] };
  }
  return { embeds: [embed] };
}
