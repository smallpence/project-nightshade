import { Client, Guild, Intents, Permissions, TextChannel, VoiceChannel } from "discord.js";
import { config } from "dotenv";
import { schedule } from "node-cron";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { sample } from "lodash"

type Response =                "sleeping" | "under bed" | "jackson" | "poll" | "illegible" | "bHGVw" | "zXgy" | "bAeVN" | "toes" | "9am" | "funfact" |
                                      "-15";
const responses: Response[] = ["sleeping" , "under bed" , "jackson" , "poll" , "illegible" , "bHGVw" , "zXgy" , "bAeVN" , "toes" , "9am" , "funfact"];
const mentionResponses: Response[] = ["-15"];

const CHANNELS_PATH = "channels.json";
const LAST_PATH = "last.json";

interface ChannelToSend {
    guild: string
    channel: string
}

function readChannelsToSend(): ChannelToSend[] {
    return existsSync(CHANNELS_PATH) 
    ? JSON.parse(readFileSync(CHANNELS_PATH, "utf-8")) 
    : [];
}

function writeChannelsToSend(channels: ChannelToSend[]) {
    writeFileSync(CHANNELS_PATH, JSON.stringify(channels), "utf-8");
}

function readLastResponses(): string[] {
    return existsSync(LAST_PATH) 
    ? JSON.parse(readFileSync(LAST_PATH, "utf-8")) 
    : [];
}

function writeLastResponses(messages: string[]) {
    writeFileSync(LAST_PATH, JSON.stringify(messages), "utf-8");
}

function getKnownGuildIDs(): string[] {
    return readChannelsToSend().map(x => x.guild);
}

async function findChannels() {
    const guilds = await client.guilds.fetch();
    const knownGuildIDs = getKnownGuildIDs();

    guilds
        .filter((_, id) => knownGuildIDs.includes(id))
        .forEach(async (guildPromise, id) => {
            const knownChannel = readChannelsToSend().find(channelToSend => channelToSend.guild === id)!!.channel;
            
            const guild = await guildPromise.fetch();
            const channels = await guild.channels.fetch();

            channels
                .filter((_,id) => id === knownChannel)
                .forEach(async channelPromise => {
                    const channel = await channelPromise.fetch();
                    if (channel.type === "GUILD_TEXT") {
                        send2AM(guild, channel);
                    }
                });
        });
}

async function send2AM(guild: Guild, channel: TextChannel) {
    const lastResponses = readLastResponses();
    const usableResponses = 
        ((await isSomeoneInVC(guild)) ? responses.concat(mentionResponses) : responses)
        .filter(response => !lastResponses.includes(response));

    const response = sample(usableResponses)!!;
    // const response: string = "9am";

    writeLastResponses(lastResponses.length !== 3 ? 
        (
            [response, response, response]
        ) : (
            [...lastResponses.slice(1), response]
        ))


    if (response === "sleeping")
        return await channel.send("James is sleeping in the Esports centre right now");

    if (response === "under bed")
        return await channel.send("Check under your bed tonight!");

    if (response === "jackson")
        return await channel.send("https://www.youtube.com/watch?v=SDCqgHLX8Ys");

    if (response === "poll") {
        const message = await channel.send("Are you asleep?  ☑️ Yes ❎ No");
        await message.react("☑️");
        await message.react("❎");
        return message;
    }

    if (response === "illegible")
        return await channel.send("现在是凌晨 2 点，你还没有睡着。光荣的总统会怎么想？");

    if (response === "-15")
        return await channel.send(await mentionSomeoneInVC(guild, "{user}, we have noticed it is 2am and you are still gaming. -15 social credits."));

    if (response === "bHGVw")
        return await channel.send("https://tenor.com/bHGVw.gif");

    if (response === "zXgy")
        return await channel.send("https://tenor.com/zXgy.gif");

    if (response === "bAeVN")
        return await channel.send("https://tenor.com/bAeVN.gif");

    if (response === "toes")
        return await channel.send("Get to bed or your toes will be gobbled");

    if (response === "funfact")
        return await channel.send("Fun Fact! Did you know that people who stay awake gaming are found to be less likely to be attractive to their preferred gender?");

    if (response === "9am") {
        const hours = new Date().getHours();

        const hoursTill9AM = hours < 9 ? 9 - hours : 33 - hours
        return await channel.send(`There are ${hoursTill9AM} hours until your 9am tomorrow :) Maybe get some sleep`)
    }

    // assertNever(response);
}

async function getVCUsers(guild: Guild) {
    const channels = await guild.channels.fetch();

    const allUsers = channels
        .filter(channel => channel.type === "GUILD_VOICE")
        .map<VoiceChannel>(channel => channel as VoiceChannel)
        .flatMap(channel => [...channel.members])
        .map(pair => pair[1]);

    return allUsers
}

async function isSomeoneInVC(guild: Guild) {
    const allUsers = await getVCUsers(guild);

    return allUsers.length > 0;
}

async function mentionSomeoneInVC(guild: Guild, message: string) {
    const allUsers = await getVCUsers(guild);

    const user = sample(allUsers)!!;

    return message.replace("{user}", `<@${user.id}>`);
}

function assertNever(x: never) {}

config();

const client = new Client({intents: Intents.FLAGS.GUILDS | Intents.FLAGS.GUILD_VOICE_STATES});

client.once("ready", () => {
    console.log("logged in!");
    // findChannels();
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    // if (!interaction.memberPermissions?.has([Permissions.FLAGS.ADMINISTRATOR])) {
    //     interaction.reply({content: "admin only", ephemeral: true});
    //     return;
    // }

    if (interaction.guildId) {
        const channelsToSend = readChannelsToSend();

        if (interaction.commandName === "remindhere") {
            writeChannelsToSend(
                [
                    ...channelsToSend.filter(channelToSend => channelToSend.guild !== interaction.guildId),
                    {
                        guild: interaction.guildId,
                        channel: interaction.channelId
                    }
                ]
            );

            interaction.reply({content:"done", ephemeral: true});
        } else if (interaction.commandName === "stopreminding") {
            writeChannelsToSend(channelsToSend.filter(channelToSend => channelToSend.guild !== interaction.guildId));

            interaction.reply({content:"done", ephemeral: true});
        }
    } else interaction.reply({content: "no private messages please", ephemeral: true});
});

schedule('1 * * * *', async () => {
    findChannels();
});

client.login(process.env.BOT_SECRET)