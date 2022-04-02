import { Client, Guild, Intents, Permissions, TextChannel, VoiceChannel } from "discord.js";
import { config } from "dotenv";
import { schedule } from "node-cron";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { sample } from "lodash"

type Response =                "sleeping" | "under bed" | "jackson" | "poll" | "illegible" | "bHGVw" | "zXgy" | "bAeVN" | "toes" | "9am" | "funfact" | "eggman" | "rem" | "nightman" | "spotify" | "rember" | "bedoclock" | "monopoly" | "poem1" | "poem2" |
                                      "-15";
const responses: Response[] = ["sleeping" , "under bed" , "jackson" , "poll" , "illegible" , "bHGVw" , "zXgy" , "bAeVN" , "toes" , "9am" , "funfact" , "eggman" , "rem" , "nightman" , "spotify" , "rember" , "bedoclock" , "monopoly" , "poem1" , "poem2"];
const mentionResponses: Response[] = ["-15"];

const CHANNELS_PATH = "channels.json";
const LAST_PATH = "last.json";

const tts = false;

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
            
            try {
                const guild = await guildPromise.fetch();
                const channels = await guild.channels.fetch();

                channels
                    .filter((_,id) => id === knownChannel)
                    .forEach(async channelPromise => {
                        try {
                          const channel = await channelPromise.fetch();
                          if (channel.type === "GUILD_TEXT") {
                              send2AM(guild, channel);
                          }
                        }
                        catch (e) {}
                    });
            } catch (e) {}
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
        return await channel.send("<@175351872822050816> is sleeping in the Esports centre right now");

    if (response === "under bed")
        return await channel.send({content: "Check under your bed tonight!", tts: tts});

    if (response === "jackson")
        return await channel.send("https://www.youtube.com/watch?v=SDCqgHLX8Ys");

    if (response === "poll") {
        const message = await channel.send({content: "Are you asleep?  ☑️ Yes ❎ No", tts: tts});
        await message.react("☑️");
        await message.react("❎");
        return message;
    }

    if (response === "illegible")
        return await channel.send({content: "现在是凌晨 2 点，你还没有睡着。光荣的总统会怎么想？", tts: tts});

    if (response === "-15")
        return await channel.send({content: await mentionSomeoneInVC(guild, "{user}, we have noticed it is 2am and you are still gaming. -15 social credits."), tts: tts});

    if (response === "bHGVw")
        return await channel.send("https://tenor.com/bHGVw.gif");

    if (response === "zXgy")
        return await channel.send("https://tenor.com/zXgy.gif");

    if (response === "bAeVN")
        return await channel.send("https://tenor.com/bAeVN.gif");

    if (response === "toes")
        return await channel.send({content: "Get to bed or your toes will be gobbled", tts: tts});

    if (response === "funfact")
        return await channel.send({content: "Fun Fact! Did you know that people who stay awake gaming are found to be less likely to be attractive to their preferred gender?", tts: tts});

    if (response === "9am") {
        const hours = new Date().getHours();

        const hoursTill9AM = hours < 9 ? 9 - hours : 33 - hours
        return await channel.send({content: `There are ${hoursTill9AM} hours until your 9am tomorrow :) Maybe get some sleep`, tts: tts});
    }

    if (response === "eggman") {
        await channel.send({content: "I've come to make an announcement; The Sandman's a bitch ass motherfucker, he dream cucked my fucking wife. Thats right, he took his Scandinavian bag of sand out and he threw sleep sand at my fucking wife, and he said his dreams were \"This long\" and I said that's disgusting, so I'm making a callout post on my twitter dot com, Sandman, you've got short dreams, it's the length of a Compsci students sleep except WAY smaller, and guess what? Here's what my dreams look like: PFFFT, THAT'S RIGHT, BABY. ALL FUN, NO NIGHTMARES, ALOTTA PILLOWS. Look at that, it looks like Inception, but the lead wouldt date 2nd years. He dream cucked wife so guess what? I'm gonna put the Earth to sleep. THAT'S RIGHT THIS IS WHAT YOU GET, MY SUPER LASER SLEEP! Except I'm not gonna put the Earth to Sleep. I'm gonna go higher. I'M DOZING OFF ON THE MOON! HOW DO YOU LIKE THAT, METALLICA? I PUT THE MOON TO SLEEP YOU IDIOT! YOU HAVE 23 HOURS BEFORE THE SLEEP DROPLETS HIT THE FUCKING EARTH NOW GET OUT OF MY SIGHT BEFORE I SEND YOU TO DREAMLAND TOO.", tts: tts});
        return await channel.send("https://tenor.com/bhOMg.gif");
    }

    if (response === "nightman") 
        return await channel.send({content: "The Nightman Cometh.....", tts: tts});

    if (response === "rem") 
        return await channel.send("https://cdn.discordapp.com/attachments/958369561307131965/959143838163804190/Screenshot_2022-03-31_183500.png");

    if (response === "rember")
        return await channel.send({content: "Hello I'm the Bedtime Bot and I remember it so you don't have to!", tts: tts});

    if (response === "spotify")
        return await channel.send("https://open.spotify.com/track/5sICkBXVmaCQk5aISGR3x1?si=dc8aa47fd9774824");

    if (response === "bedoclock")
        return await channel.send("https://cdn.discordapp.com/attachments/958369561307131965/959309869133991967/unknown.png");

    if (response === "monopoly")
        return await channel.send("https://cdn.discordapp.com/attachments/958369561307131965/959310167625850930/unknown.png");

    if (response === "poem1")
        return await channel.send({content: `to help you sleep, I will now sing you a lullaby

        Analysing records
        
        Suitable song found
        
        Now singing Golden Slumbers by Thomas Dekker, dated 1603
        
        Golden slumbers kiss your eyes,
        Smiles awake you when you rise;
        Sleep, pretty wantons, do not cry,
        And I will sing a lullaby,
        Rock them, rock them, lullaby.
        
        Care is heavy, therefore sleep you,
        You are care, and care must keep you;
        Sleep, pretty wantons, do not cry,
        And I will sing a lullaby,
        Rock them, rock them, lullaby.`, tts: tts});

    if (response === "poem2")
        return await channel.send({content: `to help you sleep, I will now sing you a lullaby

        Analysing records
        
        Suitable song found
        
        Now singing Cradle Song by William Blake, dated 1789
        
        Sleep, sleep, beauty bright,
        Dreaming in the joys of night;
        Sleep, sleep; in thy sleep
        Little sorrows sit and weep.
        
        Sweet babe, in thy face
        Soft desires I can trace,
        Secret joys and secret smiles,
        Little pretty infant wiles.
        
        As thy softest limbs I feel
        Smiles as of the morning steal
        O’er thy cheek, and o’er thy breast
        Where thy little heart doth rest.
        
        O the cunning wiles that creep
        In thy little heart asleep!
        When thy little heart doth wake,
        Then the dreadful night shall break.`, tts: tts});

    assertNever(response);
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
    //findChannels();
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    if (!interaction.memberPermissions?.has([Permissions.FLAGS.ADMINISTRATOR])) {
        interaction.reply({content: "You must be an administrator to run this command.", ephemeral: true});
        return;
    }

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

            interaction.reply({content:"Success! Reminders will now be sent to this channel.", ephemeral: true});
        } else if (interaction.commandName === "stopreminding") {
            writeChannelsToSend(channelsToSend.filter(channelToSend => channelToSend.guild !== interaction.guildId));

            interaction.reply({content:"Success! Reminders will no longer be sent to this server.", ephemeral: true});
        }
    } else interaction.reply({content: "This service is not set to receive private messages.", ephemeral: true});
});

schedule('0 2 * * *', async () => {
    findChannels();
});

client.login(process.env.BOT_SECRET)
