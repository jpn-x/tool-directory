const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('https://jpn-x.github.io/tdnet-web/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // Call navigateDate(-1) to go to previous day
  const result = await page.evaluate(() => {
    if (typeof navigateDate === 'function') {
      navigateDate(-1);
      return 'called navigateDate(-1)';
    }
    return 'not found';
  });
  console.log(result);
  await new Promise(r => setTimeout(r, 5000));

  const info = await page.evaluate(() => {
    return { text: document.body.innerText.substring(100, 400), rows: document.querySelectorAll('tbody tr').length };
  });
  console.log('info:', JSON.stringify(info));

  await page.screenshot({ path: 'thumb-7-tdnet.jpg', type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 1280, height: 720 } });
  await browser.close();
  console.log('done');
})();
