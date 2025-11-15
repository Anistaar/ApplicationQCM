import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Interaction, Events, REST, Routes } from 'discord.js';
import { registerGuildCommands } from './registerCommands.js';
import { handleQuizListCourses, handleQuizStart, handleAnswerInteraction } from './interactions/handlers.js';

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;
const guildId = process.env.GUILD_ID!;

if (!token || !clientId || !guildId) {
  console.error('Missing env: DISCORD_TOKEN, DISCORD_CLIENT_ID, GUILD_ID');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel]
});

client.once(Events.ClientReady, async (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const name = interaction.commandName;
      if (name === 'quiz-list-courses') return handleQuizListCourses(interaction);
      if (name === 'quiz-start') return handleQuizStart(interaction);
    } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
      return handleAnswerInteraction(interaction);
    }
  } catch (err) {
    console.error('Interaction error:', err);
    if (interaction.isRepliable()) {
      await interaction.reply({ content: 'Erreur lors du traitement.', ephemeral: true }).catch(() => {});
    }
  }
});

async function main() {
  // Ensure commands are registered only on demand via npm script, not at runtime here.
  await client.login(token);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
