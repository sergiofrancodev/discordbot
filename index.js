import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { OpenAI } from 'openai';
import { franc } from 'franc';

const DISCORD_TOKEN  = process.env.DISCORD_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SERVER_IDS     = process.env.SERVER_IDS; // ahora plural

if (!DISCORD_TOKEN || !OPENAI_API_KEY || !SERVER_IDS) {
    console.error('❌ Missing DISCORD_TOKEN, OPENAI_API_KEY or SERVER_IDS in .env');
    process.exit(1);
}

// parseamos la lista de IDs separadas por coma
const allowedServers = SERVER_IDS.split(',')
    .map(id => id.trim())
    .filter(id => id.length);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

client.once('ready', () => {
    console.log(`🤖 Bot connected as ${client.user.tag}`);
    console.log(`   Serving servers: ${allowedServers.join(', ')}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // ignoramos si no es de uno de los servidores permitidos
    if (!message.guild || !allowedServers.includes(message.guild.id)) return;

    const text = message.content.trim();
    if (!text) return;

    // skip pure links
    if (/^https?:\/\/\S+$/.test(text)) return;

    // skip pure Unicode emojis
    if (/^\p{Extended_Pictographic}+$/u.test(text)) return;

    // skip Discord custom emojis
    if (/^:\w+?:$/.test(text) || /^<a?:\w+:\d+>$/.test(text)) return;

    let code = franc(text, { minLength: 3, only: ['eng','spa','kor'] });
    if (!['eng','spa','kor'].includes(code)) {
        try {
            const detect = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Detect the predominant language: English, Spanish, or Korean.' },
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

    const names = { eng: 'English', spa: 'Spanish', kor: 'Korean' };
    const map   = { eng: 'en', spa: 'es', kor: 'ko' };
    const codes = ['eng','spa','kor'];
    const dests = codes.filter(c => c !== code);
    const srcName = names[code];
    const trgNames = dests.map(c => names[c]).join(' and ');

    const systemPrompt =
        `You are a translator. You will receive text in ${srcName}. ` +
        `Translate the entire text into ${trgNames}. ` +
        `Return only a JSON object with keys "${map[dests[0]]}" and "${map[dests[1]]}". ` +
        `Each key’s value must be a single string with the full translation.`;

    let completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: text }
        ]
    });

    let data;
    try {
        data = JSON.parse(completion.choices[0].message.content);
    } catch {
        return message.reply('❌ Could not interpret translation.');
    }

    const flatten = v =>
        typeof v === 'object'
            ? Object.values(v).join(' ')
            : v;

    let reply = '';
    if (data.en) reply += `🦅 ${flatten(data.en)}\n`;
    if (data.es) reply += `🇪🇸 ${flatten(data.es)}\n`;
    if (data.ko) reply += `🇰🇷 ${flatten(data.ko)}\n`;

    await message.reply(reply);
});

client.login(DISCORD_TOKEN);