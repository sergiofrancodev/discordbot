// index.js
import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { OpenAI } from 'openai';
import { franc } from 'franc';

// 1️⃣ Load environment variables
const DISCORD_TOKEN  = process.env.DISCORD_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SERVER_ID      = process.env.SERVER_ID;

if (!DISCORD_TOKEN || !OPENAI_API_KEY || !SERVER_ID) {
    console.error('❌ Missing DISCORD_TOKEN, OPENAI_API_KEY or SERVER_ID in .env');
    process.exit(1);
}

// 2️⃣ Initialize Discord.js
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// 3️⃣ Initialize OpenAI
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// 4️⃣ Ready event
client.once('ready', () => {
    console.log(`🤖 Bot connected as ${client.user.tag}, server ${SERVER_ID}`);
});

// 5️⃣ Message handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild || message.guild.id !== SERVER_ID) return;

    const text = message.content.trim();
    if (!text) return;

    // Detect language (only eng, spa, kor)
    let code = franc(text, { minLength: 3, only: ['eng','spa','kor'] });
    if (!['eng','spa','kor'].includes(code)) {
        // Fallback to ChatGPT for better detection
        try {
            const detect = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Detect the predominant language of the following text. Answer exactly one of: English, Spanish, or Korean.' },
                    { role: 'user',   content: text }
                ]
            });
            const lang = detect.choices[0].message.content.trim().toLowerCase();
            if (lang === 'english') code = 'eng';
            else if (lang === 'spanish') code = 'spa';
            else if (lang === 'korean') code = 'kor';
        } catch {
            return;
        }
    }

    // Map codes to names and targets
    const names = { eng: 'English', spa: 'Spanish', kor: 'Korean' };
    const map   = { eng: 'en', spa: 'es', kor: 'ko' };
    const codes = ['eng','spa','kor'];
    const dests = codes.filter(c => c !== code);
    const srcName = names[code];
    const trgNames = dests.map(c => names[c]).join(' and ');
    const trgKeys  = dests.map(c => map[c]).join(' and ');

    // System prompt: translate whole text to both target languages
    const systemPrompt =
        `You are a translator. You will receive text in ${srcName}. ` +
        `Translate the entire text into ${trgNames}, translating every word or phrase as needed. ` +
        `Respond with **only** a JSON object with keys "${map[dests[0]]}" and "${map[dests[1]]}", whose values are the full translated text. ` +
        `Do NOT include any additional commentary.`;

    // Call OpenAI
    let completion;
    try {
        completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user',   content: text }
            ]
        });
    } catch {
        await message.reply('❌ Error translating, please try again later.');
        return;
    }

    // Parse JSON response
    let data;
    try {
        data = JSON.parse(completion.choices[0].message.content);
    } catch {
        await message.reply('❌ Could not interpret translation response.');
        return;
    }

    // Build reply
    let reply = '';
    if (data.en) reply += `🦅 ${data.en}\n`;
    if (data.es) reply += `🇪🇸 ${data.es}\n`;
    if (data.ko) reply += `🇰🇷 ${data.ko}\n`;

    await message.reply(reply);
});

// 6️⃣ Log in the bot
client.login(DISCORD_TOKEN);