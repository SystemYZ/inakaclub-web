import { Octokit } from "octokit";
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// リポジトリ情報（Gabinのリポジトリに合わせて設定）
const owner = "SystemYZ";
const repo = "inakaclub-web";
const path = "src/data/content.json";

/**
 * GitHubから現在のcontent.jsonを取得する
 */
export async function fetchContent() {
  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    // GitHub APIはBase64でエンコードされた内容を返すのでデコードする
    const content = Buffer.from(response.data.content, "base64").toString("utf-8");
    return {
      json: JSON.parse(content),
      sha: response.data.sha, // 更新時に必要
    };
  } catch (error) {
    console.error("Error fetching content from GitHub:", error);
    throw error;
  }
}

/**
 * 書き換えたJSONをGitHubに保存する
 */
export async function updateContent(newJson, sha, message = "Update content.json via Manager") {
  try {
    const contentString = JSON.stringify(newJson, null, 2);
    const contentBase64 = Buffer.from(contentString).toString("base64");

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: contentBase64,
      sha,
    });

    console.log("Successfully updated content.json on GitHub!");
  } catch (error) {
    console.error("Error updating content on GitHub:", error);
    throw error;
  }
}
