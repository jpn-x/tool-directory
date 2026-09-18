const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('https://jpn-x.github.io/tdnet-web/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // Find and click the prev button by looking at all clickable elements
  const clicked = await page.evaluate(() => {
    // Try multiple selectors
    const candidates = ['#prev-date', '.prev-btn', '[data-action="prev"]', 'button'];
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el) { el.click(); return `clicked: ${sel} - ${el.textContent}`; }
    }
    // Find by text ◄ or ◀
    const all = Array.from(document.querySelectorAll('span,a,button,div'));
    const prev = all.find(el => /◄|◀|前日|prev/i.test(el.textContent) && el.offsetParent);
    if (prev) { prev.click(); return `clicked text: ${prev.tagName} "${prev.textContent}"`; }
    return 'not found';
  });
  console.log('click result:', clicked);
  await new Promise(r => setTimeout(r, 4000));

  const dateText = await page.evaluate(() => document.body.innerText.substring(0, 200));
  console.log('after click:', dateText);

  // Try setting date via localStorage or global function
  const result2 = await page.evaluate(() => {
    // Try calling internal functions
    if (typeof setDate === 'function') { setDate('2026-06-16'); return 'called setDate'; }
    if (typeof loadDate === 'function') { loadDate('2026-06-16'); return 'called loadDate'; }
    if (typeof window.goToDate === 'function') { window.goToDate('2026-06-16'); return 'called goToDate'; }
    // Check global vars
    return Object.keys(window).filter(k => /date|prev|nav/i.test(k)).slice(0,20).join(',');
  });
  console.log('result2:', result2);

  await browser.close();
})();
