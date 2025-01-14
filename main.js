import server from './server.js'
server()
import { Client, GatewayIntentBits, Partials } from "discord.js"
import { weapons } from "./assets/weapons.js"
import { sendReply, outputRandomWeapon, outputNoDuplicationRandomWeapon } from "./assets/functions.js"

const token = process.env.DISCORD_BOT_TOKEN
if (token == undefined) {
  console.log("DISCORD_BOT_TOKENが設定されていません。");
  process.exit(0);
}

const client = new Client({
  intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b),
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
})
client.login(token);

client.on("ready", () => {
  console.log(`${client.user.tag}がサーバーにログインしました。`);
  client.user.setActivity('テスト');
});


// メッセージを検知した時
const emojiArray = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣']
let isActionFlag = false
const botMessage = /ルーレットするブキ数のリアクションを押してください。|2023春シーズン新武器のルーレットです。|2023夏シーズン新武器のルーレットです。|2023秋シーズン新武器のルーレットです。|2023冬ChillSeason追加武器のルーレットです。|2024春FreshSeason追加武器のルーレットです。|2024夏SizzleSeason追加武器のルーレットです。/

// /reaction、/newweaponのリアクション付与処理
client.on("messageCreate", async (message) => {
  if (message.author.id == client.user.id && botMessage.test(message.content)) {
    isActionFlag = true
    await Promise.all(
      emojiArray.map(async emoji => await message.react(emoji))
    )
    isActionFlag = false
  }
  // メッセージを送ったユーザーが当botのIDと一緒だったら || メッセージを送ったユーザーがbot判定だったら || bot宛にメンションしていなかったら
  // TODO: [@everyoneや役職を考慮してメンションされているか確認する](https://scrapbox.io/discordjs-japan/@everyone%E3%82%84%E5%BD%B9%E8%81%B7%E3%82%92%E8%80%83%E6%85%AE%E3%81%97%E3%81%A6%E3%83%A1%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%82%8B%E3%81%8B%E7%A2%BA%E8%AA%8D%E3%81%99%E3%82%8B)
  if (message.author.id == client.user.id || message.author.bot || !message.mentions.has(client.user) ||
      message.cleanContent.includes('@everyone') || message.cleanContent.includes('@here')) return
  let replaceUidMessage = message.cleanContent.replace('@スプラ3ルーレットBot', '')
  // メンション後数字入力で数分ルーレットする機能
  // メンション後のメッセージを何か送っていたら && 数値を送っていたら
  if (replaceUidMessage && !isNaN(replaceUidMessage)) {
    if(replaceUidMessage > 10 || replaceUidMessage < 1) {
      sendReply(message, '1~10の間で入力してください')
    } else {
      const resultArray = outputRandomWeapon(replaceUidMessage, weapons.allWeapon)
      // const resultArray = outputNoDuplicationRandomWeapon(replaceUidMessage, allWeapon)
      client.channels.cache.get(message.channel.id).send(resultArray.toString().replace(/,/g, '\n'))
    }
  } else {
    sendReply(message, "数値を1~10の間で入力してください。");
  }
})

// リアクションされたときの処理
client.on('messageReactionAdd', async (reaction, user) => {
  // TODO: 別ユーザー発言に数字リアクションした時、勝手にBotが反応してしまう
  console.log(`${reaction.message.guild}で${user.tag}が${reaction.emoji.name}とリアクションしました`)
  // リアクションしたのがBotの場合 || emojiArrayの中の絵文字以外が押された場合はreturn
  if (user.bot || emojiArray.indexOf(reaction.emoji.name) === -1) return
  const channel = await client.channels.fetch(reaction.message.channelId)
  const message = await channel.messages.fetch(reaction.message.id)
  let rouletteWeapon = []
  if (/ルーレットするブキ数のリアクションを押してください。|武器ルーレット/.test(message.content)) {
    rouletteWeapon = weapons.allWeapon
  } else if (new RegExp(`${process.env.CURRENT_SEASON}追加武器のルーレットです。`).test(message.content)) {
    const weaponsKey = Object.keys(weapons)
    // weaponsの後ろから2番目のobjectを使用する(新シーズン武器object)
    rouletteWeapon = weapons[weaponsKey[weaponsKey.length - 2]]
  } else {
    console.log('関係のないメッセージ')
    return
  }
  const reactionNumber = emojiArray.indexOf(reaction.emoji.name) + 1
  // 武器重複ありかなしか
  const resultArray = outputRandomWeapon(reactionNumber, rouletteWeapon)
  // const resultArray = outputNoDuplicationRandomWeapon(reactionNumber, rouletteWeapon)
  resultArray.push('----------')
  await client.channels.cache.get(reaction.message.channel.id).send(resultArray.toString().replace(/,/g, '\n'))
})

// コマンド
import { commands } from "./assets/commands.js"
client.on("interactionCreate", async (interaction) => {
  // リアクション中は以下コマンド無効にさせる
  if (isActionFlag) {
    await interaction.reply('リアクション中です。しばらくお待ち下さい。')
    return
  }
  if (!interaction.isChatInputCommand()) return
  if (interaction.commandName in commands) {
    commands[interaction.commandName].execute(interaction)
  } else {
    console.error(`存在しないコマンドを入力されました。${interaction.commandName}`)
    return
  }
})
