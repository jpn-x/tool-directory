const puppeteer = require('puppeteer');
const path = require('path');

const sites = [
  { url: 'https://x-post-tools.github.io/x-search/', file: 'thumb-1-xsearch.jpg' },
  { url: 'https://jpn-x.github.io/kabu-screener/desktop.html', file: 'thumb-2-screener.jpg' },
  { url: 'https://jpn-x.github.io/kabu-stop/', file: 'thumb-3-stop.jpg' },
  { url: 'https://jpn-x.github.io/taisyaku-news/?v=1781172754283', file: 'thumb-4-taisyaku.jpg' },
  { url: 'https://jpn-x.github.io/holdings-radar/', file: 'thumb-5-holdings.jpg' },
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
