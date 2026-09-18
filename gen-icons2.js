const puppeteer = require('puppeteer');
const fs = require('fs');

const html = (size) => {
  const rad = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.58);
  const subSize = Math.round(size * 0.13);
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
  background: linear-gradient(145deg, #1a1020 0%, #0d0f14 60%, #0a0d18 100%);
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  position:relative; overflow:hidden;
}
.glow {
  position:absolute;
  width:${Math.round(size*0.7)}px; height:${Math.round(size*0.7)}px;
  border-radius:50%;
  background: radial-gradient(circle, rgba(220,50,50,0.18) 0%, transparent 70%);
  top: ${Math.round(size*0.05)}px; left: ${Math.round(size*0.15)}px;
}
.char {
  font-family: 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', sans-serif;
  font-size:${fontSize}px;
  font-weight:900;
  color:#f0f0f0;
  line-height:1;
  letter-spacing:-0.02em;
  position:relative; z-index:1;
  text-shadow: 0 0 ${Math.round(size*0.08)}px rgba(220,80,80,0.6),
               0 2px ${Math.round(size*0.04)}px rgba(0,0,0,0.8);
}
.bar {
  width:${Math.round(size*0.52)}px;
  height:${Math.max(2, Math.round(size*0.025))}px;
  background: linear-gradient(90deg, transparent, #cc3333, transparent);
  margin-top:${Math.round(size*0.04)}px;
  border-radius:2px;
  position:relative; z-index:1;
}
</style>
</head>
<body>
<div class="wrap">
  <div class="glow"></div>
  <div class="char">廃</div>
  <div class="bar"></div>
</div>
</body>
</html>`;
};

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=1']
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

  // favicon.ico: 32x32 PNG wrapped
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let i=0; i<256; i++) {
      let c=i; for(let k=0;k<8;k++) c=(c&1)?0xedb88320^(c>>>1):c>>>1; t[i]=c;
    }
    return t;
  })();
  function crc32(buf){ let c=0xffffffff; for(let i=0;i<buf.length;i++) c=CRC_TABLE[(c^buf[i])&0xff]^(c>>>8); return(c^0xffffffff)>>>0; }

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
