/**
 * いなかくらぶ AI Web Manager Engine (ESM Prototype)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_PATH = path.join(__dirname, '../src/data/content.json');

/**
 * データの読み込み
 */
function readContent() {
  return JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf8'));
}

/**
 * データの保存
 */
function saveContent(data) {
  fs.writeFileSync(CONTENT_PATH, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * AIによる解析
 */
export async function processMessage(message) {
  console.log(`\n🤖 AI解析中... 「${message}」`);
  
  const content = readContent();
  let updateFound = false;
  let reply = "";

  // プロトタイプ用の簡易キーワード判別ロジック
  if (message.includes("閉める") || message.includes("営業")) {
    const timeMatch = message.match(/(\d{1,2})時/);
    if (timeMatch) {
      content.storeInfo.businessHours.close = `${timeMatch[1].padStart(2, '0')}:00`;
      updateFound = true;
      reply = `マスター、承知いたしました！サイトの閉店時間を ${timeMatch[1]}時 に更新しておきました。`;
    }
  } else if (message.includes("お知らせ") || message.includes("今日")) {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    content.content.news.unshift({
      date: today,
      title: "マスターからのお知らせ",
      content: message
    });
    updateFound = true;
    reply = "マスター、ありがとうございます！新しいお知らせをサイトのニュース欄に載せました！";
  }

  if (updateFound) {
    saveContent(content);
    return { success: true, reply };
  } else {
    return { success: false, reply: "すみませんマスター、それはどういう意味でしょうか...？" };
  }
}

// CLIからの実行用
const msg = process.argv[2];
if (msg) {
  processMessage(msg).then(res => {
    console.log(`\n💬 返信: ${res.reply}`);
    if (res.success) console.log("✅ content.json を更新しました。");
  });
}
