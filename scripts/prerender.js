import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prerender() {
  console.log('🚀 Starting custom prerender for multi-page...');
  
  // 1. 簡易サーバーを起動（SPA対応）
  const baseUrl = '/inakaclub-web/';
  const port = 4173;
  const server = http.createServer((req, res) => {
    let url = req.url.split('?')[0];
    // ベースURLを削除
    if (url.startsWith(baseUrl)) {
      url = url.replace(baseUrl, '/');
    }
    // SPAフォールバック: 拡張子がない場合は index.html を返す
    if (url !== '/' && !url.includes('.')) {
      url = '/index.html';
    }
    if (url === '/') url = '/index.html';

    const filePath = path.join(__dirname, '../dist', url);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.jpg': 'image/jpeg',
        '.png': 'image/png'
      };
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  await new Promise(resolve => server.listen(port, resolve));
  
  const routes = [
    { path: '/', file: 'index.html' },
    { path: '/masters-room', file: 'masters-room/index.html' },
    { path: '/instagram', file: 'instagram/index.html' }
  ];

  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    for (const route of routes) {
      // ベースURLを含めたURLにアクセス
      const url = `http://localhost:${port}${baseUrl}${route.path.replace(/^\//, '')}`;
      console.log(`🌐 Navigating to ${url}...`);
      
      const response = await page.goto(url, { waitUntil: 'networkidle0' });
      
      // 404チェック
      if (!response || response.status() === 404) {
        console.error(`❌ Page not found (404): ${url}`);
        continue;
      }

      await new Promise(r => setTimeout(r, 2000));
      
      const content = await page.content();
      const distPath = path.join(__dirname, '../dist', route.file);
      
      // ディレクトリがない場合は作成
      const dir = path.dirname(distPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(distPath, content);
      console.log(`✅ Successfully prerendered to ${distPath}`);
    }
  } catch (e) {
    console.error('❌ Prerender failed:', e);
  } finally {
    await browser.close();
    server.close();
    console.log('🛑 Preview server closed.');
  }
}

prerender();
