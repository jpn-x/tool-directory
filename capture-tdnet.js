const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('https://jpn-x.github.io/tdnet-web/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // Click ◄ to go to previous day (6/16)
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const prev = all.find(el => el.textContent.trim() === '◄' && el.offsetWidth > 0);
    if (prev) prev.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  // Check current date shown and data count
  const info = await page.evaluate(() => {
    const date = document.querySelector('span[style*="font-weight"]') || document.querySelector('.date-display');
    const rows = document.querySelectorAll('tr').length;
    return { title: document.title, bodyText: document.body.innerText.substring(0, 300), rows };
  });
  console.log('info:', JSON.stringify(info));

  await page.screenshot({ path: 'thumb-7-tdnet.jpg', type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 1280, height: 720 } });
  await browser.close();
  console.log('done');
})();
