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
    
    console.log("Testing 'gemini-flash-latest'...");
    try {
      const modelFlash = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const resFlash = await modelFlash.generateContent("Hi");
      console.log("Success: 'gemini-flash-latest' is active.");
    } catch (e) {
      console.log("Failed: 'gemini-flash-latest' (Error: " + e.message + ")");
    }

    console.log("\nTesting 'gemini-3-flash-preview'...");
    try {
      const model3 = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      const res3 = await model3.generateContent("Hi");
      console.log("Success: 'gemini-3-flash-preview' is active.");
    } catch (e) {
      console.log("Failed: 'gemini-3-flash-preview' (Error: " + e.message + ")");
    }
    
  } catch (error) {
    console.error("Debug Info:", error);
    if (error.status === 404) {
      console.log("\n💡 404 Error suggests the model name might be wrong or the API key doesn't have access to this version.");
    }
  }
}

listModels();
