import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;
const guildId = process.env.GUILD_ID!;

async function main() {
  const rest = new REST({ version: '10' }).setToken(token);

  const cmds = [
    new SlashCommandBuilder()
      .setName('quiz-list-courses')
      .setDescription('Liste les cours disponibles'),

    new SlashCommandBuilder()
      .setName('quiz-start')
      .setDescription('Démarrer une session de quiz')
      .addStringOption((o) => o.setName('course').setDescription('Chemin du cours').setRequired(true))
      .addStringOption((o) => o.setName('mode').setDescription('Mode').addChoices(
        { name: 'entrainement', value: 'entrainement' },
        { name: 'examen', value: 'examen' }
      ))
      .addIntegerOption((o) => o.setName('count').setDescription('Nombre de questions').setMinValue(1).setMaxValue(200))
      .addStringOption((o) => o.setName('types').setDescription('Types (ex: QCM,QR,VF,DragMatch)'))
      .addStringOption((o) => o.setName('themes').setDescription('Thèmes (séparés par ,)'))
  ].map((c) => c.toJSON());

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: cmds });
  console.log('Slash commands registered for guild', guildId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
