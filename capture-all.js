const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const sites = [
  { url: 'https://kabu-stop.pages.dev', file: 'stop-gap.jpg' },
  { url: 'https://jpn-x.github.io/kabu-screener/desktop.html', file: 'screener.jpg' },
  { url: 'https://stop-data.cadillac600.workers.dev', file: 'stop-data.jpg' },
  { url: 'https://taisyaku-news.cadillac600.workers.dev', file: 'taisyaku.jpg' },
  { url: 'https://tdnet-web.cadillac600.workers.dev', file: 'tdnet.jpg' },
  { url: 'https://kabu-watch-7og.pages.dev', file: 'watch.jpg' },
  { url: 'https://holdings-radar.pages.dev', file: 'holdings.jpg' },
  { url: 'https://ipo-lockup-radar.pages.dev', file: 'ipo.jpg' },
  { url: 'https://x-search.cadillac600.workers.dev', file: 'xsearch.jpg' },
  { url: 'https://jpn-x.github.io/moshimo-nisa/', file: 'nisa.jpg' },
];

const outDir = path.join(__dirname, 'thumbs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ja-JP'],
  });

  for (const site of sites) {
    console.log(`Capturing: ${site.url}`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    try {
      await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2500));
      await page.screenshot({
        path: path.join(outDir, site.file),
        type: 'jpeg',
        quality: 88,
        clip: { x: 0, y: 0, width: 1280, height: 720 }
      });
      console.log(`  -> saved ${site.file}`);
    } catch (e) {
      console.error(`  ERROR (${site.url}): ${e.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('Done.');
})();
