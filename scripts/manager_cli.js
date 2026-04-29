import { fetchContent, updateContent } from "./github_api.js";
import { processUpdate } from "./ai_processor.js";

/**
 * CLIから更新を実行するメイン処理
 */
async function main() {
  const userMessage = process.argv[2];

  if (!userMessage) {
    console.error("Please provide a message. Example: node scripts/manager_cli.js \"明日お休みします\"");
    process.exit(1);
  }

  console.log(`🚀 Starting update for message: "${userMessage}"`);

  try {
    // 1. GitHubから現在のデータを取得
    console.log("📥 Fetching current content from GitHub...");
    const { json: currentJson, sha } = await fetchContent();

    // 2. AIで更新内容を生成
    console.log("🧠 Thinking with Gemini AI...");
    const updatedJson = await processUpdate(currentJson, userMessage);

    // 3. GitHubに反映
    console.log("📤 Sending updates to GitHub...");
    await updateContent(updatedJson, sha, `Update: ${userMessage}`);

    console.log("✨ All done! Check the website in a few minutes.");
  } catch (error) {
    console.error("❌ Failed to update content:", error);
  }
}

main();
