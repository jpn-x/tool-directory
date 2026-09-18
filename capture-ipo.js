const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const path = require('path');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('https://jpn-x.github.io/ipo-lockup-radar/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // Screenshot
  await page.screenshot({ path: 'thumb-8-ipo.jpg', type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 1280, height: 720 } });
  console.log('screenshot done');

  // Try to get apple-touch-icon
  const iconUrl = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel*="icon"]'));
    const apple = links.find(l => l.rel.includes('apple-touch'));
    if (apple) return apple.href;
    const ico = links.find(l => l.rel.includes('icon'));
    if (ico) return ico.href;
    return null;
  });
  console.log('iconUrl:', iconUrl);

  if (iconUrl) {
    await download(iconUrl, 'site-icon-8.png');
    console.log('icon downloaded');
  }

  // Page title
  const title = await page.title();
  console.log('title:', title);

  await browser.close();
})();
