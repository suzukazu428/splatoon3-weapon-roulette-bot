import { weapons }  from "./weapons.js"
// リプライを送る
const sendReply = (message, text) => {
  message.reply(text)
    .then(console.log("リプライ送信: " + text))
    .catch(e => console.error(e));
}
// 乱数を元に武器をルーレットして返す
const outputRandomWeapon = (repeatNumber, sourceArray) => {
  let outputArray = []
  for(var i = 0; i < repeatNumber; i++) {
    let random = Math.floor(Math.random() * sourceArray.length)
    outputArray.push(sourceArray[random].name)
  }
  return outputArray
}
// 重複なしの武器ルーレット
const outputNoDuplicationRandomWeapon = (repeatNumber, sourceArray) => {
  let outputArray = []
  for(var i = 0; i < repeatNumber; i++) {
    let random = Math.floor(Math.random() * sourceArray.length)
    outputArray.push(sourceArray.splice(random, 1)[0].name)
  }
  return outputArray
}
// VCへ武器振り分け処理
const weaponDistribution = (interaction) => {
  const vcMemberList = interaction.options._hoistedOptions[0].channel.members
  if (!vcMemberList.size) {
    interaction.reply('選択したボイスチャンネルに参加しているメンバーがいませんでした。')
    return
  }
  const mentionMemberList = []
  let randomResultList = []
  const replyList = []
  // mapから必要な要素だけ取り出し、配列へ変換
  vcMemberList.forEach(member => {
    mentionMemberList.push(member.user.toString())
  })
  const weaponSelect = interaction.options.getString('武器種選択')
  if (weaponSelect === 'all') {
    // 武器種が全ての場合
    randomResultList = outputRandomWeapon(vcMemberList.size, weapons.allWeapon)
  } else if (weaponSelect === null) {
    // /newweapon使用の場合
    const weaponsKey = Object.keys(weapons)
    // weaponsの後ろから2番目のobjectを使用する(新シーズン武器object)
    const rouletteWeapon = weapons[weaponsKey[weaponsKey.length - 2]]
    randomResultList = outputRandomWeapon(vcMemberList.size, rouletteWeapon)
  } else {
    // 武器種指定の場合
    randomResultList = outputRandomWeapon(
      vcMemberList.size,
      weapons.allWeapon.filter(weapon => weapon.type === weaponSelect)
    )
  }
  mentionMemberList.forEach((member,i) => {
    replyList.push(`${member}: ${randomResultList[i]}`)
  })
  interaction.reply(`${replyList.toString().replace(/,/g, '\n')}`)
}
// 武器統一杯用処理
const weaponUnification = (interaction) => {
  const weapon = module.exports.outputRandomWeapon(2, weapons.allWeapon)
  interaction.reply(`${weapon[0]} vs ${weapon[1]}`)
}

export {
  sendReply,
  outputRandomWeapon,
  outputNoDuplicationRandomWeapon,
  weaponDistribution,
  weaponUnification
}