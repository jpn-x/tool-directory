const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  const abs = path.resolve('index.html').split('\\').join('/');
  await page.goto('file:///' + abs, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'preview-pc.jpg', type: 'jpeg', quality: 90 });
  await browser.close();
  console.log('done');
})();
