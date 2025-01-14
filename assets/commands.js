import { SlashCommandBuilder, ChannelType, REST, Routes } from "discord.js"
import { weaponDistribution, weaponUnification } from "./functions.js"

// コマンド一覧
const info = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('コマンドの詳細な説明を表示します。'),
  async execute(interaction) {
  await interaction.reply(`コマンド説明
[/roulette]
「/roulette」と入力後にボイスチャンネルを選択して発言すると、選択したボイスチャンネルに参加しているメンバーにメンションしてランダムな武器を振り分けます。

[/reaction]
「/reaction」と入力し発言すると、1~8のリアクションがBotのメッセージに付きます。お好みの数字のリアクションを押すことで、その数字分ランダムな武器を振り分けます。

[/newweapon]
「/newweapon」と入力し発言すると、発言時の現シーズン追加武器のみが対象のランダムな武器を振り分けます。使い方は「/reaction」と同様です。`)
  }
}
const reaction = {
  data: new SlashCommandBuilder()
    .setName('reaction')
    .setDescription('リアクションでのルーレット用メッセージを送信します。'),
  async execute(interaction) {
    await interaction.reply('ルーレットするブキ数のリアクションを押してください。')
  }
}
const newweapon = {
  data: new SlashCommandBuilder()
    .setName('newweapon')
    .setDescription(`${process.env.CURRENT_SEASON}追加武器のルーレット用メッセージを送信します。`)
    .addChannelOption(option =>
      option
        .setName('ボイスチャンネル')
        .setDescription('選択したボイスチャンネルに参加しているメンバーに武器を振り分けます。')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    ),
  async execute(interaction) {
    // await interaction.reply(`${process.env.CURRENT_SEASON}追加武器のルーレットです。`)
    weaponDistribution(interaction)
  }
}
const roulette = {
  data: new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('VCを選択し、武器をランダムに割り振ります。')
    .addChannelOption(option =>
      option
        .setName('ボイスチャンネル')
        .setDescription('選択したボイスチャンネルに参加しているメンバーに武器を振り分けます。')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    )
    .addStringOption(option =>
      option
        .setName('武器種選択')
        .setDescription('選択した武器種のみで武器を振り分けます。')
        .setRequired(true)
        .addChoices(
          {name: '全て', value: 'all'},
          {name: 'シューター', value: 'shooter'},
          {name: 'マニューバー', value: 'maneuver'},
          {name: 'ブラスター', value: 'blaster'},
          {name: 'フデ', value: 'hude'},
          {name: 'ローラー', value: 'roller'},
          {name: 'スロッシャー', value: 'slosher'},
          {name: 'スピナー', value: 'spinner'},
          {name: 'シェルター', value: 'shelter'},
          {name: 'チャージャー', value: 'charger'},
          {name: 'ストリンガー', value: 'stringer'},
          {name: 'ワイパー', value: 'wiper'}
        )
    ),
  async execute(interaction) {
    weaponDistribution(interaction)
  }
}
const unification = {
  data: new SlashCommandBuilder()
    .setName('unification')
    .setDescription(`「ブキ統一vsブキ統一」用のメッセージを送信します。`),
  async execute(interaction) {
    weaponUnification(interaction)
  }
}
const commandList = [
  info.data,
  reaction.data,
  newweapon.data,
  roulette.data,
  unification.data
]


// コマンド情報を登録する
try {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN)
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID),{ body: commandList })
  console.log('コマンド追加完了!')
} catch (e) {
  console.error('コマンド追加失敗', e)
}

const commands = {
  info,
  reaction,
  newweapon,
  roulette,
  unification
}
export { commands }