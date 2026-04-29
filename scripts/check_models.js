import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // モデル一覧を取得する（APIキーが有効なら動くはず）
    // ※SDKのバージョンによっては挙動が違うので、まずは単純なリクエストを試す
    console.log("Checking available models...");
    
    // モデル一覧を取得するメソッド（公式ドキュメント準拠）
    // 注意: 現在のSDKバージョンでは直接listModelsがない場合があるため
    // ひとまず gemini-1.5-flash を再トライするためのデバッグ情報を出す
    console.log("API Key found:", process.env.GEMINI_API_KEY ? "Yes (starts with " + process.env.GEMINI_API_KEY.substring(0, 8) + "...)" : "No");
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("Success! gemini-1.5-flash is working.");
    console.log("Response:", result.response.text());
    
  } catch (error) {
    console.error("Debug Info:", error);
    if (error.status === 404) {
      console.log("\n💡 404 Error suggests the model name might be wrong or the API key doesn't have access to this version.");
    }
  }
}

listModels();
