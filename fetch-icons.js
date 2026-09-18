const puppeteer = require('puppeteer');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const sites = [
  { url: 'https://x-post-tools.github.io/x-search/',                    name: 'site-icon-1.png' },
  { url: 'https://jpn-x.github.io/kabu-screener/desktop.html',          name: 'site-icon-2.png' },
  { url: 'https://jpn-x.github.io/kabu-stop/',                          name: 'site-icon-3.png' },
  { url: 'https://jpn-x.github.io/taisyaku-news/?v=1781172754283',      name: 'site-icon-4.png' },
  { url: 'https://jpn-x.github.io/holdings-radar/',                     name: 'site-icon-5.png' },
  { url: 'https://jpn-x.github.io/kabu-watch/',                        name: 'site-icon-6.png' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    proto.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  for (const site of sites) {
    const page = await browser.newPage();
    try {
      await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // ページのfaviconを探す
      const iconUrl = await page.evaluate(() => {
        const selectors = [
          'link[rel="apple-touch-icon"]',
          'link[rel="icon"][sizes="192x192"]',
          'link[rel="icon"][sizes="512x512"]',
          'link[rel="icon"][type="image/png"]',
          'link[rel="shortcut icon"]',
          'link[rel="icon"]',
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el && el.href) return el.href;
        }
        return null;
      });

      if (iconUrl) {
        console.log(`${site.name}: ${iconUrl}`);
        await download(iconUrl, path.join(__dirname, site.name));
        console.log(`  -> saved`);
      } else {
        // fallback: /favicon.ico
        const base = new URL(site.url).origin;
        const fallback = base + '/favicon.ico';
        console.log(`${site.name}: fallback ${fallback}`);
        await download(fallback, path.join(__dirname, site.name));
        console.log(`  -> saved`);
      }
    } catch(e) {
      console.error(`  ERROR ${site.name}: ${e.message}`);
    }
    await page.close();
  }

  await browser.close();
  console.log('Done.');
})();
