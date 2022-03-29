import { Client, Intents } from "discord.js";
import { config } from "dotenv";

config();

const client = new Client({intents: 0});

client.on("ready", () => {
    console.log("logged in!");
});

client.login(process.env.BOT_SECRET)