const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const client = new Client();

client.commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/\s+/);
    const commandName = args.shift();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(client, message, args);
    } catch (error) {
        console.error(`command error [${commandName}]:`, error.message);
        message.reply('コマンド実行中にエラーが発生しました');
    }
});

client.login(process.env.TOKEN);