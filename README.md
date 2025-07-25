# discordbot
<body>

  <h1>Discord Translator Bot</h1>
  <p>
    This little bot sits in your server and automatically translates every message between
    English, Spanish and Korean. Under the hood it uses OpenAI’s GPT-3.5-turbo, but you
    don’t need to do anything—just invite it and let it run.
  </p>

  <h2>How It Works</h2>
  <ul>
    <li>Watches every message in all channels of your server.</li>
    <li>Detects the language (English, Spanish or Korean).</li>
    <li>Replies with translations into the other two languages.</li>
    <li>Ignores messages that are only emojis or links.</li>
  </ul>

  <hr>

  <h2>Setup</h2>
  <h3>1. Clone the repo</h3>
  <pre><code>git clone https://github.com/sergiofrancodev/discordbot.git
cd discordbot</code></pre>

  <h3>2. Install dependencies</h3>
  <pre><code>npm install</code></pre>

  <h3>3. Create your <code>.env</code> file</h3>
  <p>In the project root, make a file named <code>.env</code> with these three lines:</p>
  <pre><code>DISCORD_TOKEN=sk-…your_bot_token…
OPENAI_API_KEY=sk-…your_openai_key…
SERVER_ID=123456789012345678</code></pre>
  <p>• <strong>DISCORD_TOKEN</strong>: your bot’s token from the Discord Developer Portal.<br>
     • <strong>OPENAI_API_KEY</strong>: your secret key from OpenAI.<br>
     • <strong>SERVER_ID</strong>: right-click your server icon in Discord, “Copy ID”.</p>

  <h3>4. Run locally</h3>
  <pre><code>npm start</code></pre>
  <p>You should see <code>🤖 Bot connected as …</code> in your terminal.</p>

  <hr>

  <h2>Deployment</h2>
  <p>We recommend <code>pm2</code> for production:</p>
  <ol>
    <li><code>npm install -g pm2</code></li>
    <li><code>pm2 start index.js --name translator-bot --update-env</code></li>
    <li><code>pm2 save</code> and then <code>pm2 startup</code> (follow the printed instructions)</li>
  </ol>
  <p>Check its status with <code>pm2 list</code> and tail logs via <code>pm2 logs translator-bot</code>.</p>

  <hr>

  <h2>Adding More Languages</h2>
  <p>You can extend the bot to support any language GPT understands:</p>
  <ol>
    <li>In <code>index.js</code>, where <code>franc</code> is called, add the new codes to the list:
      <pre><code>franc(text, { minLength: 3, only: ['eng','spa','kor','fra','deu'] })</code></pre>
    </li>
    <li>Also add entries to <code>names</code> and <code>map</code>:
      <pre><code>names.fra = 'French'; map.fra = 'fr';</code></pre>
    </li>
    <li>Include the new codes in the <code>codes</code> array:
      <pre><code>const codes = ['eng','spa','kor','fra','deu'];</code></pre>
    </li>
    <li>Finally, pick an emoji or flag in the reply output:
      <pre><code>if (data.fr) reply += `🇫🇷 ${data.fr}\n`;</code></pre>
    </li>
  </ol>
  <p>Then push, pull on your server, reinstall and restart <code>pm2</code>.</p>

  <hr>

  <h2>Troubleshooting</h2>
  <ul>
    <li>If the bot doesn’t show as “connected”, confirm your <code>.env</code> values.</li>
    <li>Enable “Message Content Intent” in the Discord Developer Portal.</li>
    <li>Check that the bot’s role can read and send messages.</li>
    <li>Any errors will show up in <code>pm2 logs translator-bot</code>.</li>
  </ul>

  <hr>

  <h2>License</h2>
  <p>MIT License — feel free to use, modify and share!</p>

</body>
