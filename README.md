# discordbot
<body>

  <h1>Discord Translator Bot</h1>
  <p>
    A simple Discord bot that uses OpenAI’s <code>gpt-3.5-turbo</code> to detect and translate messages
    between English, Spanish and Korean—automatically, in all channels of your server.
  </p>

  <h2>Features</h2>
  <ul>
    <li>Automatic translation of every user message (no slash commands).</li>
    <li>Supports English, Spanish and Korean out of the box.</li>
    <li>Emoji-based output: 🦅 for English, 🇪🇸 for Spanish, 🇰🇷 for Korean.</li>
    <li>Smart detection: <code>franc</code> whitelist + GPT fallback for mixed text.</li>
    <li>Ignores pure-emoji or pure-link messages.</li>
    <li>Strict translation mode: returns only JSON → avoids Q&A or extras.</li>
  </ul>

  <hr>

  <h2>Getting Started</h2>

  <h3>Prerequisites</h3>
  <ul>
    <li>Node.js v16+</li>
    <li>An OpenAI API key</li>
    <li>A Discord bot with <strong>Message Content Intent</strong> enabled</li>
    <li>Your Discord server ID</li>
  </ul>

  <h3>Installation</h3>
  <ol>
    <li>
      <strong>Clone the repo:</strong><br>
      <pre><code>git clone https://github.com/sergiofrancodev/discordbot.git
cd discordbot</code></pre>
    </li>
    <li>
      <strong>Install dependencies:</strong><br>
      <pre><code>npm install</code></pre>
    </li>
    <li>
      <strong>Create your <code>.env</code> file:</strong><br>
      <pre><code>DISCORD_TOKEN=sk-…
OPENAI_API_KEY=sk-…
SERVER_ID=123456789012345678</code></pre>
    </li>
    <li>
      <strong>Run locally:</strong><br>
      <pre><code>npm start</code></pre>
      You should see <code>🤖 Bot connected as …</code> in console.
    </li>
  </ol>

  <hr>

  <h2>Deployment with PM2</h2>
  <ol>
    <li><code>npm install -g pm2</code></li>
    <li><code>pm2 start index.js --name translator-bot --update-env</code></li>
    <li><code>pm2 save</code></li>
    <li><code>pm2 startup systemd</code> (follow printed instructions)</li>
  </ol>
  <p>Check logs with <code>pm2 logs translator-bot --lines 20</code>.</p>

  <hr>

  <h2>Configuration</h2>
  <ul>
    <li><strong>DISCORD_TOKEN</strong>: Your bot token</li>
    <li><strong>OPENAI_API_KEY</strong>: Your OpenAI key</li>
    <li><strong>SERVER_ID</strong>: Your Discord server ID</li>
  </ul>

  <hr>

  <h2>Adding New Languages</h2>
  <p>To support additional languages (e.g. French, German, Japanese):</p>
  <ol>
    <li>
      <strong>Expand the <code>franc</code> whitelist</strong> in <code>index.js</code>:
      <pre><code>franc(text, { minLength: 3, only: ['eng','spa','kor','fra','deu','jpn'] })</code></pre>
    </li>
    <li>
      <strong>Map new codes:</strong> Add entries in the <code>names</code> and <code>map</code> objects:
      <pre><code>names.fra = 'French'; map.fra = 'fr';
names.deu = 'German'; map.deu = 'de';</code></pre>
    </li>
    <li>
      <strong>Include in your codes array:</strong>
      <pre><code>const codes = ['eng','spa','kor','fra','deu','jpn'];</code></pre>
    </li>
    <li>
      <strong>Add emojis or flags:</strong> In the reply builder:
      <pre><code>if (data.fr) reply += `🇫🇷 ${data.fr}\n`;
if (data.de) reply += `🇩🇪 ${data.de}\n`;</code></pre>
    </li>
    <li><strong>Deploy changes</strong> (push, pull, reinstall, restart PM2).</li>
  </ol>

  <hr>

  <h2>Troubleshooting</h2>
  <ul>
    <li>No logs? Make sure <code>console.log</code> is present and <code>type: "module"</code> in <code>package.json</code>.</li>
    <li>No message events? Enable <strong>Message Content Intent</strong> and check bot permissions.</li>
    <li>Invalid JSON? Inspect the GPT prompt and response format.</li>
  </ul>

  <hr>

  <h2>License</h2>
  <p>MIT © Your Name</p>

</body>
