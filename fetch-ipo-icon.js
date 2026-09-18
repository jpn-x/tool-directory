const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const get = (u) => https.get(u, res => {
      if (res.statusCode === 301 || res.statusCode === 302) { file.close(); get(res.headers.location); return; }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
    get(url);
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://jpn-x.github.io/ipo-lockup-radar/', { waitUntil: 'networkidle2' });

  const icons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('link[rel*="icon"]')).map(l => ({ rel: l.rel, href: l.href, sizes: l.sizes?.value }));
  });
  console.log('icons:', JSON.stringify(icons, null, 2));

  // Try favicon.png, favicon-32.png etc.
  const candidates = [
    'https://jpn-x.github.io/ipo-lockup-radar/favicon.png',
    'https://jpn-x.github.io/ipo-lockup-radar/favicon-32.png',
    'https://jpn-x.github.io/ipo-lockup-radar/favicon.ico',
  ];

  for (const url of candidates) {
    try {
      await download(url, 'site-icon-8-test.png');
      const buf = fs.readFileSync('site-icon-8-test.png');
      if (!buf.toString('utf8', 0, 15).includes('<!DOCTYPE')) {
        fs.copyFileSync('site-icon-8-test.png', 'site-icon-8.png');
        console.log('downloaded:', url);
        break;
      }
    } catch(e) {}
  }

  await browser.close();
})();
