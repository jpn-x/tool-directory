const puppeteer = require('puppeteer');
const path = require('path');

const sites = [
  { url: 'https://x-search.jp-x.workers.dev/', file: 'thumb-1-xsearch.jpg' },
  { url: 'https://kabu-screener.pages.dev/desktop', file: 'thumb-2-screener.jpg' },
  { url: 'https://kabu-stop.pages.dev/', file: 'thumb-3-stop.jpg' },
  { url: 'https://taisyaku-news.jp-x.workers.dev/?v=1781172754283', file: 'thumb-4-taisyaku.jpg' },
  { url: 'https://holdings-radar.pages.dev/', file: 'thumb-5-holdings.jpg' },
];

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
      await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({
        path: path.join(__dirname, site.file),
        type: 'jpeg',
        quality: 90,
        clip: { x: 0, y: 0, width: 1280, height: 720 }
      });
      console.log(`  -> saved ${site.file}`);
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('Done.');
})();
