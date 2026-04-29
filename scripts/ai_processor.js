import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * マスターのメッセージを解釈し、content.jsonを更新する
 */
export async function processUpdate(currentJson, userMessage) {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
あなたはスナック「いなかくらぶ」のウェブサイト管理アシスタントです。
以下の「現在のサイトデータ(JSON)」と「マスターからのメッセージ」を元に、データを更新してください。

【現在のデータ】
${JSON.stringify(currentJson, null, 2)}

【マスターのメッセージ】
「${userMessage}」

【指示】
1. メッセージの内容を理解し、JSONの中の適切な箇所を更新してください。
2. もしニュースやイベントに関することなら、"news"配列の先頭に新しいオブジェクトを追加してください。日付は今日の日付（2026.04.29）にしてください。
3. 営業時間や定休日の変更なら、"storeInfo.businessHours"を更新してください。
4. 更新が必要ない箇所はそのままにしてください。
5. 出力は、更新後のJSON全体のみを返してください。解説やマークダウンの装飾（\`\`\`jsonなど）は一切不要です。JSONのみを出力してください。
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // AIがマークダウン形式で返してくる場合があるため、JSON部分だけを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("AI returned invalid JSON format");
    }
  } catch (error) {
    console.error("Error processing AI update:", error);
    throw error;
  }
}
