import { SlashCommandBuilder } from "@discordjs/builders";
import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import { config } from "dotenv";

const slashCommands = [
    new SlashCommandBuilder().setName("remindhere").setDescription("reminds here"),
    new SlashCommandBuilder().setName("stopreminding").setDescription("no longer remind in this guild"),
].map(command => command.toJSON());

config();

const rest = new REST({ version: '9' }).setToken(process.env.BOT_SECRET!!);

const clientId = "958405283095388260";
const guildId = "794223171431170088";

// rest.put(Routes.applicationCommands(clientId), { body: slashCommands })
// 	.then(() => console.log('Successfully registered application commands.'))
// 	.catch(console.error);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: slashCommands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);