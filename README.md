# Splatoon3WeaponRouletteBot

## 使い方

- `yarn start`

## 新ブキ追加時処理追加フロー

- `weapons.js`に新しい配列を作り、エキスポートする。
- `commands.js`の`newweapon`コマンドの説明文とリプライ文を変更する。
- `main.js`の`botmessage`変数に新シーズン用説明文を追加する。
  - `messageReactionAdd`内の条件分岐で新シーズン用説明文と変数の変更をする。

## 招待URL

- [URL](https://discord.com/api/oauth2/authorize?client_id=1062933263724847246&permissions=537381952&scope=bot)

## 今後の開発計画

- ブキ解放シーズン毎にルーレットできるようにする。
