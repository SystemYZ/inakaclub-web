import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { preview } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prerender() {
  console.log('🚀 Starting custom prerender...');
  
  // 1. Preview サーバーを起動
  const previewServer = await preview({
    root: path.join(__dirname, '..'),
    build: { outDir: 'dist' }
  });
  
  const port = previewServer.config.preview.port || 4173;
  const baseUrl = previewServer.config.base || '/';
  const url = `http://localhost:${port}${baseUrl}`;

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  try {
    console.log(`🌐 Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // アニメーションなどのために少し待機
    await new Promise(r => setTimeout(r, 2000));
    
    const content = await page.content();
    
    const distPath = path.join(__dirname, '../dist/index.html');
    fs.writeFileSync(distPath, content);
    
    console.log(`✅ Successfully prerendered to ${distPath}`);
  } catch (e) {
    console.error('❌ Prerender failed:', e);
  } finally {
    await browser.close();
    previewServer.httpServer.close();
    console.log('🛑 Preview server closed.');
  }
}

prerender();
