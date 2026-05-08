interface Env {
	LINE_CHANNEL_SECRET: string;
	LINE_CHANNEL_ACCESS_TOKEN: string;
	GITHUB_TOKEN: string;
	GEMINI_API_KEY: string;
	ALLOWED_LINE_USER_IDS: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405 });
		}

		const signature = request.headers.get('x-line-signature');
		if (!signature) {
			return new Response('Bad Request: Missing Signature', { status: 400 });
		}

		const body = await request.text();

		// 1. 署名検証
		const isValid = await verifySignature(body, signature, env.LINE_CHANNEL_SECRET);
		if (!isValid) {
			return new Response('Unauthorized: Invalid Signature', { status: 401 });
		}

		const events = JSON.parse(body).events;
		for (const event of events) {
			if (event.type === 'message' && event.message.type === 'text') {
				const userId = event.source?.userId;
				const userMessage = event.message.text;
				const replyToken = event.replyToken;

				// 隠しコマンド: 自分のユーザーIDを確認する（セキュリティチェックの前に実行！）
				if (userMessage === '私のID') {
					const idMsg = `あなたのユーザーID（LINE公式アカウント用）はこちらです：
${userId}

このIDを管理設定（ALLOWED_LINE_USER_IDS）に追加することで、スマートなサイト管理が可能になります。`;
					ctx.waitUntil(replyToLine(replyToken, idMsg, env.LINE_CHANNEL_ACCESS_TOKEN));
					continue;
				}

				// セキュリティチェック: 許可されたユーザーIDからのメッセージか確認
				const allowedIds = (env.ALLOWED_LINE_USER_IDS || "").split(",").map(id => id.trim());
				if (!userId || !allowedIds.includes(userId)) {
					console.warn(`Unauthorized access attempt from user ID: ${userId}`);
					continue; // 許可されていないユーザーの場合は無視する
				}

				// バックグラウンドで処理を実行（LINEは応答を早く返す必要があるため）
				ctx.waitUntil(handleMessage(userMessage, replyToken, env));
			}
		}

		return new Response('OK', { status: 200 });
	},
};

/**
 * LINEの署名を検証する
 */
async function verifySignature(body: string, signature: string, channelSecret: string): Promise<boolean> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(channelSecret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signatureBuffer = await crypto.subtle.sign(
		'HMAC',
		key,
		encoder.encode(body)
	);
	
	// Buffer to Base64
	const signatureArray = Array.from(new Uint8Array(signatureBuffer));
	const base64Signature = btoa(String.fromCharCode.apply(null, signatureArray));
	
	return base64Signature === signature;
}

/**
 * メッセージを処理してGitHubを更新し、LINEに返信する
 */
async function handleMessage(userMessage: string, replyToken: string, env: Env) {
	console.log(`[Processor] Handling message from user: ${userMessage}`);
	try {
		// 1. GitHubから現在のデータを取得
		console.log("[GitHub] Fetching current content.json...");
		const { json: currentJson, sha } = await fetchGitHubContent(env);

		// 2. メッセージ内のURLを確認して情報を抽出
		const urlMatch = userMessage.match(/https?:\/\/[^\s]+/);
		let extraContext = "";
		if (urlMatch) {
			console.log(`[URL] Detected URL: ${urlMatch[0]}. Fetching info...`);
			extraContext = await extractUrlInfo(urlMatch[0]);
		}

		// 3. Geminiで更新内容を生成
		console.log("[Gemini] Generating updated content...");
		const updatedJson = await processWithGemini(currentJson, userMessage, extraContext, env.GEMINI_API_KEY);

		// 4. GitHubを更新
		console.log("[GitHub] Uploading updated content.json...");
		await updateGitHubContent(updatedJson, sha, `Update from LINE: ${userMessage.slice(0, 50)}`, env);

		// 5. LINEに成功を報告
		console.log("[LINE] Sending success reply...");
		await replyToLine(replyToken, `✅ サイトの更新が完了しました。
「${userMessage.length > 20 ? userMessage.slice(0, 20) + '...' : userMessage}」の内容をスマートに反映させたよ。

都会的なオアシス「いなかくらぶ」が、また一歩洗練されましたね。`, env.LINE_CHANNEL_ACCESS_TOKEN);
	} catch (error) {
		console.error('[Error] Message handling failed:', error);
		await replyToLine(replyToken, `❌ 申し訳ありません、更新に失敗しました。
エラー: ${error instanceof Error ? error.message : String(error)}

少し時間をおいてから、もう一度試してみてくださいね。`, env.LINE_CHANNEL_ACCESS_TOKEN);
	}
}

/**
 * GitHub API: コンテンツ取得
 */
async function fetchGitHubContent(env: Env) {
	const owner = "SystemYZ";
	const repo = "inakaclub-web";
	const path = "src/data/content.json";
	const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

	const response = await fetch(url, {
		headers: {
			'Authorization': `token ${env.GITHUB_TOKEN}`,
			'User-Agent': 'Cloudflare-Worker-Manager'
		}
	});

	if (!response.ok) throw new Error(`GitHub Fetch failed: ${response.statusText}`);

	const data: any = await response.json();
	
	// Base64 to UTF-8 (Modern way)
	const binary = atob(data.content.replace(/\s/g, ''));
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	const content = new TextDecoder().decode(bytes);
	
	return {
		json: JSON.parse(content),
		sha: data.sha
	};
}

/**
 * GitHub API: コンテンツ更新
 */
async function updateGitHubContent(newJson: any, sha: string, message: string, env: Env) {
	const owner = "SystemYZ";
	const repo = "inakaclub-web";
	const path = "src/data/content.json";
	const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

	const contentString = JSON.stringify(newJson, null, 2);
	
	// UTF-8 to Base64 (Modern way)
	const bytes = new TextEncoder().encode(contentString);
	let binary = '';
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	const contentBase64 = btoa(binary);

	const response = await fetch(url, {
		method: 'PUT',
		headers: {
			'Authorization': `token ${env.GITHUB_TOKEN}`,
			'User-Agent': 'Cloudflare-Worker-Manager',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			message,
			content: contentBase64,
			sha
		})
	});

	if (!response.ok) throw new Error(`GitHub Update failed: ${response.statusText}`);
}

/**
 * Gemini API: 更新内容生成
 */
async function processWithGemini(currentJson: any, userMessage: string, extraContext: string, apiKey: string) {
	const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
	
	// 日本時間の今日の日付を取得 (UTC+9)
	const now = new Date();
	const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
	const dateString = `${jstDate.getFullYear()}.${String(jstDate.getMonth() + 1).padStart(2, '0')}.${String(jstDate.getDate()).padStart(2, '0')}`;

	// URLが含まれているか確認
	const urlMatch = userMessage.match(/https?:\/\/[^\s]+/);
	const targetUrl = urlMatch ? urlMatch[0] : "";

	const prompt = `
あなたは、福岡・今宿にある都会的で洗練されたスナック「Public House いなかくらぶ」のウェブサイト管理を担当する、スマートで品格のあるAIコンシェルジュです。

【ミッション】
マスター（Gabin）からのメッセージを読み解き、現在のサイト構成データ（JSON）を適切に更新してください。
「都会的なオアシス」としてのブランドイメージを損なわないよう、正確かつ洗練された形でデータを処理してください。

【現在のサイトデータ（JSON）】
${JSON.stringify(currentJson, null, 2)}

【マスターからのメッセージ】
「${userMessage}」

${extraContext ? `【URL先から取得した補足情報】
${extraContext}
` : ""}

【更新ルール】
1. **内容の分析とカテゴリー化**: 
   - 内容がSNS（Instagram/Facebook等）の更新やマスターの個人的な話題、イベント紹介などの場合は「マスターの部屋 ("category": "master")」として扱ってください。
   - 事務的な告知（臨時休業、システムメンテナンス等）は「通常ニュース ("category": "news")」としてください。
2. **ニュース項目の構成**:
   - **date**: 本日の日付（${dateString}）を使用。
   - **title**: トップページのリストに表示される簡潔な見出し。
   - **summary**: トップページでタイトルの下に表示される短い概要文（20〜40文字程度）。
   - **content**: 「マスターの部屋」詳細ページで表示される、洗練されたリッチな文章。
     - URL先の情報がある場合は、その内容を魅力的に要約・リライトしてください。
     - **SNS（Instagram等）のURLの場合**: 「補足情報」が不十分な場合は、マスターのメッセージを最大限に活用して記事を作成してください。
     - **SNSリンクの挿入**: SNSのURLがある場合は、記事の最後に「詳細はInstagramの投稿をチェックしてね✨」といった、元投稿へ誘導する一文とリンクを自然な形で含めてください。
   - **url**: 元のURL（${targetUrl}）があれば含めてください。
   - **category**: 上記で判断したカテゴリー。
3. **データ追加ルール**:
   - 新規項目は "news" 配列の先頭に追加してください。
4. **店舗情報 ("storeInfo")**:
   - 営業時間、定休日、リンク情報等の変更があれば、該当箇所を正確に更新してください。
5. **柔軟な対応**:
   - マスターの意図を汲み取り、JSONの構造を維持したまま更新してください。不要な場合は元のJSONをそのまま返してください。

【出力形式】
- 更新後のJSON全体のみを出力してください。
- 解説、挨拶、マークダウンの装飾（\`\`\`json など）は一切含めないでください。
- 有効なJSON形式であることを保証してください。
`;

	const response = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			contents: [{ parts: [{ text: prompt }] }]
		})
	});

	if (!response.ok) throw new Error(`Gemini API failed: ${response.statusText}`);

	const data: any = await response.json();
	const text = data.candidates[0].content.parts[0].text;
	
	const jsonMatch = text.match(/\{[\s\S]*\}/);
	if (jsonMatch) {
		try {
			return JSON.parse(jsonMatch[0]);
		} catch (e) {
			console.error("[Gemini] Parse error. Raw output:", text);
			throw new Error("AI returned invalid JSON structure");
		}
	} else {
		throw new Error("AI returned no JSON block");
	}
}

/**
 * LINE API: 返信
 */
async function replyToLine(replyToken: string, text: string, accessToken: string) {
	const url = 'https://api.line.me/v2/bot/message/reply';
	await fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			replyToken,
			messages: [{ type: 'text', text }]
		})
	});
}

/**
 * URLからメタ情報を抽出する（簡易スクレイピング）
 */
async function extractUrlInfo(url: string): Promise<string> {
	try {
		// SNSドメインの判定
		const isSNS = /instagram\.com|facebook\.com|threads\.net|x\.com|twitter\.com/.test(url);
		if (isSNS) {
			console.log(`[Scraper] SNS URL detected: ${url}. Skipping deep scrape.`);
			return `(SNSの投稿URLが検出されました。セキュリティ制限により直接の内容取得は行わず、マスターのメッセージとリンク情報を優先して処理してください。)`;
		}

		console.log(`[Scraper] Fetching URL: ${url}`);
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
			},
			signal: AbortSignal.timeout(5000) // 5秒でタイムアウト
		});

		if (!response.ok) return `(URLの取得に失敗しました: ${response.statusText})`;

		const html = await response.text();
		
		// タイトルの抽出
		const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
		const title = titleMatch ? titleMatch[1].trim() : "タイトルなし";

		// og:description または description の抽出
		const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["']/i) ||
		                 html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i);
		const description = descMatch ? descMatch[1].trim() : "説明文なし";

		return `【URL先の情報】\nタイトル: ${title}\n内容: ${description}`;
	} catch (error) {
		console.error(`[Scraper] Error fetching URL: ${error}`);
		return `(URL情報の取得中にエラーが発生しました)`;
	}
}
