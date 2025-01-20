import server from './server.js'
server()
import { Client, GatewayIntentBits, Partials } from "discord.js"
import { summer2024, allWeapon } from "./assets/weapons.js"
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

client.on("ready", () => {
  console.log(`${client.user.tag}がサーバーにログインしました。`);
  client.user.setActivity('スプラトゥーン3');
})


// メッセージを検知した時
const emojiArray = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣']
let isActionFlag = false
// const botMessage = /ルーレットするブキ数のリアクションを押してください。|2023春シーズン新ブキのルーレットです。|2023夏シーズン新ブキのルーレットです。|2023秋シーズン新ブキのルーレットです。|2023冬ChillSeason追加ブキのルーレットです。|2024春FreshSeason追加ブキのルーレットです。|2024夏SizzleSeason追加ブキのルーレットです。/

client.on("messageCreate", async (message) => {
  // Bot宛にメンションしていない場合
  if (!message.mentions.has(client.user, { ignoreEveryone: true })) {
    // 該当メッセージを発言していない　または 当Bot以外が発言した時はreturn
    if(!/ルーレットするブキ数のリアクションを押してください。/.test(message.content) || message.author.id !== client.user.id) return
    // /reactionのリアクション付与処理
    isActionFlag = true
    for (const emoji of emojiArray) {
      await message.react(emoji)
    }
    isActionFlag = false
  } else {
    // メンション後1~10の数値を送っていたらランダムブキルーレットする機能
    let replaceUidMessage = message.cleanContent.replace(`@${client.user.username}`, '')
    if(!replaceUidMessage || replaceUidMessage > 10 || replaceUidMessage < 1 || isNaN(replaceUidMessage)) {
      sendReply(message, "数値を1~10の間で入力してください。")
    } else {
      const resultArray = outputRandomWeapon(replaceUidMessage, allWeapon)
      // const resultArray = outputNoDuplicationRandomWeapon(replaceUidMessage, allWeapon)
      client.channels.cache.get(message.channel.id).send(resultArray.toString().replace(/,/g, '\n'))
    }
  }
})

// リアクションされたときの処理
client.on('messageReactionAdd', async (reaction, user) => {
  // リアクションしたのがBotの場合 || emojiArrayの中の絵文字以外が押された場合はreturn
  if (user.bot || emojiArray.indexOf(reaction.emoji.name) === -1) return
  // console.log(`${reaction.message.guild}で${user.tag}が${reaction.emoji.name}とリアクションしました`)
  const channel = await client.channels.fetch(reaction.message.channelId)
  const message = await channel.messages.fetch(reaction.message.id)
  // メッセージ元が当Botじゃなかったらreturn
  if (message.author.id !== client.user.id) return
  let rouletteWeapon = []
  if (/ルーレットするブキ数のリアクションを押してください。/.test(message.content)) {
    rouletteWeapon = allWeapon
  // リアクションで/newweaponを使用していた時の名残↓
  // } else if (new RegExp(`${process.env.CURRENT_SEASON}追加ブキのルーレットです。`).test(message.content)) {
  //   rouletteWeapon = summer2024
  } else {
    console.log('関係のないメッセージ')
    return
  }
  const reactionNumber = emojiArray.indexOf(reaction.emoji.name) + 1
  // ブキ重複ありかなしか
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
  const inputCommandName = interaction.commandName
  // 入力されたコマンドがcommandsにあったら
  if (inputCommandName in commands) {
    // commands.入力されたコマンド.executeを実行
    commands[inputCommandName].execute(interaction)
  } else {
    console.error(`存在しないコマンドを入力されました。${inputCommandName}`)
    return
  }
})

client.login(token)
