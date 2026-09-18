const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const svg = fs.readFileSync('favicon-ipo.svg', 'utf8');
  const html = `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;}body{width:180px;height:180px;background:transparent;}</style></head><body>${svg.replace('viewBox="0 0 64 64"', 'viewBox="0 0 64 64" width="180" height="180"')}</body></html>`;
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 180, height: 180, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'site-icon-8.png', type: 'png', clip: { x:0,y:0,width:180,height:180 }, omitBackground: true });
  await browser.close();
  console.log('done');
})();
