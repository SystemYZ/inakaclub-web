import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { preview } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prerender() {
  console.log('🚀 Starting custom prerender for multi-page...');
  
  // 1. Preview サーバーを起動
  const previewServer = await preview({
    root: path.join(__dirname, '..'),
    build: { outDir: 'dist' }
  });
  
  const port = previewServer.config.preview.port || 4173;
  const baseUrl = previewServer.config.base || '/';
  
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
      const url = `http://localhost:${port}${baseUrl}${route.path.replace(/^\//, '')}`;
      console.log(`🌐 Navigating to ${url}...`);
      
      await page.goto(url, { waitUntil: 'networkidle0' });
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
    previewServer.httpServer.close();
    console.log('🛑 Preview server closed.');
  }
}

prerender();
