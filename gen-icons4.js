const puppeteer = require('puppeteer');
const fs = require('fs');

const html = (size) => {
  const isSmall = size <= 32;
  const rad = isSmall ? Math.round(size * 0.18) : Math.round(size * 0.22);
  const fontSize = isSmall ? Math.round(size * 0.78) : Math.round(size * 0.68);
  // 小さいサイズはシンプルに、大きいサイズはリッチに
  const bg = isSmall
    ? `background: #1a4fa8;`
    : `background: linear-gradient(145deg, #1e3a8a 0%, #1a4fa8 50%, #0f3285 100%);`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:${size}px; height:${size}px; overflow:hidden; background:transparent; }
.wrap {
  width:${size}px; height:${size}px;
  border-radius:${rad}px;
  ${bg}
  display:flex;
  align-items:center; justify-content:center;
  position:relative; overflow:hidden;
}
${!isSmall ? `
.shine {
  position:absolute; top:-${Math.round(size*0.1)}px; left:-${Math.round(size*0.1)}px;
  width:${Math.round(size*0.7)}px; height:${Math.round(size*0.5)}px;
  background: rgba(255,255,255,0.07);
  border-radius:50%;
  transform: rotate(-20deg);
}` : ''}
.char {
  font-family: 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Noto Sans JP', sans-serif;
  font-size:${fontSize}px;
  font-weight:900;
  color:#ffffff;
  line-height:1;
  letter-spacing:-0.02em;
  position:relative; z-index:1;
  ${isSmall ? '' : 'text-shadow: 0 1px 4px rgba(0,0,0,0.4);'}
}
</style>
</head>
<body>
<div class="wrap">
  ${!isSmall ? '<div class="shine"></div>' : ''}
  <div class="char">全</div>
</div>
</body>
</html>`;
};

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const sizes = [
    { size: 16,  name: 'favicon-16.png' },
    { size: 32,  name: 'favicon-32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
  ];

  for (const { size, name } of sizes) {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.setContent(html(size), { waitUntil: 'networkidle0' });
    await page.screenshot({ path: name, type: 'png', clip: { x:0, y:0, width:size, height:size }, omitBackground: true });
    await page.close();
    console.log(`wrote ${name} (${size}x${size})`);
  }

  // favicon.ico
  const png32 = fs.readFileSync('favicon-32.png');
  const png16 = fs.readFileSync('favicon-16.png');
  const pngs = [png32, png16];
  const n = pngs.length;
  const headerSize = 6 + n*16;
  let offset = headerSize;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0,0); header.writeUInt16LE(1,2); header.writeUInt16LE(n,4);
  [[32,0],[16,1]].forEach(([sz,i]) => {
    const p = 6+i*16;
    header[p]=sz; header[p+1]=sz; header[p+2]=0; header[p+3]=0;
    header.writeUInt16LE(1,p+4); header.writeUInt16LE(32,p+6);
    header.writeUInt32LE(pngs[i].length,p+8); header.writeUInt32LE(offset,p+12);
    offset+=pngs[i].length;
  });
  fs.writeFileSync('favicon.ico', Buffer.concat([header,...pngs]));
  console.log('wrote favicon.ico');

  await browser.close();
  console.log('Done.');
})();
