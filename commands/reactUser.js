const fs = require('node:fs').promises;
const path = require('node:path');

module.exports = {
    name: '$reactusers',
    description: '指定メッセージに特定の絵文字でリアクションしたユーザーを取得',

    async execute(client, message, args) {
        const [channelId, messageId, emoji] = args;
        if (!channelId || !messageId || !emoji) {
            return message.reply('コマンドが無効です。\n`$reactusers <channelID> <messageID> <emoji>` と送信してください');
        }

        const channel = client.channels.cache.get(channelId);
        if (!channel || !channel.isText()) {
            return message.reply('指定されたチャンネルが見つかりません');
        }

        try {
            const targetMessage = await channel.messages.fetch(messageId);
            const reaction = targetMessage.reactions.cache.get(emoji);

            if (!reaction) {
                return message.reply(`${emoji} リアクションが見つかりません`);
            }

            let allUsers = [];
            let lastId = null;
            while (true) {
                const fetched = await reaction.users.fetch({ limit: 100, after: lastId });
                if (fetched.size === 0) break;
                allUsers.push(...fetched.filter(u => !u.bot).map(u => u.username));
                lastId = fetched.last().id;
            }

            if (allUsers.length === 0) {
                return message.reply(`${emoji} リアクションをしたユーザーはいません`);
            }

            const filePath = path.join(__dirname, '..', 'usernames.txt');
            await fs.writeFile(filePath, allUsers.join('\n'), 'utf8');
            
            console.log(`${emoji} リアクションをしたユーザーを ${allUsers.length} 件保存しました`);
            await message.reply(`ユーザー名の保存が完了しました (${allUsers.length}件)`);
        } catch (error) {
            console.error('reaction fetch error:', error.message);
            message.reply('取得中にエラーが発生しました');
        }
    }
};