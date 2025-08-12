const fs = require('fs').promises;
const path = require('node:path');

module.exports = {
    name: '$users',
    description: '指定サーバーのBOT以外のユーザーIDを取得',

    async execute(client, message, args) {
        const guildId = args[0];
        if (!guildId) {
            return message.reply('コマンドが無効です。\n`$users <serverID>` と送信してください');
        }

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return message.reply('指定されたサーバーに参加していません');
        }

        try {
            await guild.members.fetch();
            const userIds = guild.members.cache
                .filter(member => !member.user.bot)
                .map(member => member.user.id);

            if (userIds.length === 0) {
                return message.reply('BOT以外のメンバーが見つかりませんでした');
            }

            const filePath = path.join(__dirname, '..', 'userID.txt');
            await fs.writeFile(filePath, userIds.join('\n'), 'utf8');
            
            console.log(`${userIds.length}件のユーザーIDを保存しました (server: ${guild.name})`);
            await message.reply(`IDの保存が完了しました (${userIds.length}件)`);
        } catch (error) {
            console.error('member fetch error:', error.message);
            message.reply('メンバーの取得中にエラーが発生しました');
        }
    }
};