import { summer2024, allWeapon }  from "./weapons.js"
// リプライを送る
const sendReply = (message, text) => {
  message.reply(text)
    .then(console.log("リプライ送信: " + text))
    .catch(e => console.error(e));
}
// 乱数を元にブキをルーレットして返す
const outputRandomWeapon = (repeatNumber, sourceArray) => {
  let outputArray = []
  for(var i = 0; i < repeatNumber; i++) {
    let random = Math.floor(Math.random() * sourceArray.length)
    outputArray.push(sourceArray[random].name)
  }
  return outputArray
}
// 重複なしのブキルーレット
const outputNoDuplicationRandomWeapon = (repeatNumber, sourceArray) => {
  let outputArray = []
  for(var i = 0; i < repeatNumber; i++) {
    let random = Math.floor(Math.random() * sourceArray.length)
    outputArray.push(sourceArray.splice(random, 1)[0].name)
  }
  return outputArray
}
// VCへブキ振り分け処理
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
  const weaponSelect = interaction.options.getString('ブキ種選択')
  if (weaponSelect === 'all') {
    // ブキ種が全ての場合
    randomResultList = outputRandomWeapon(vcMemberList.size, allWeapon)
  } else if (weaponSelect === null) {
    // /newweapon使用の場合
    randomResultList = outputRandomWeapon(vcMemberList.size, summer2024)
  } else {
    // ブキ種指定の場合
    randomResultList = outputRandomWeapon(
      vcMemberList.size,
      allWeapon.filter(weapon => weapon.type === weaponSelect)
    )
  }
  mentionMemberList.forEach((member,i) => {
    replyList.push(`${member}: ${randomResultList[i]}`)
  })
  interaction.reply(`${replyList.toString().replace(/,/g, '\n')}`)
}
// ブキ統一杯用処理
const weaponUnification = (interaction) => {
  let randomResultList = []
  const weaponSelect = interaction.options.getString('ブキ種選択')
  if (weaponSelect === 'all') {
    // ブキ種が全ての場合
    randomResultList = outputRandomWeapon(2, allWeapon)
  } else {
    // ブキ種指定の場合
    randomResultList = outputRandomWeapon(
      2,
      allWeapon.filter(weapon => weapon.type === weaponSelect)
    )
  }
  interaction.reply(`${randomResultList[0]} vs ${randomResultList[1]}`)
}

export {
  sendReply,
  outputRandomWeapon,
  outputNoDuplicationRandomWeapon,
  weaponDistribution,
  weaponUnification
}