const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DEST = 'C:/Users/testuser/Documents/tdnet-web/docs';

const html = (size) => {
  const isSmall = size <= 32;
  const rad = isSmall ? Math.round(size * 0.18) : Math.round(size * 0.22);
  const fontSize = isSmall ? Math.round(size * 0.72) : Math.round(size * 0.62);
  const bg = isSmall
    ? `background: #0d2e1a;`
    : `background: linear-gradient(145deg, #0d2e1a 0%, #0f3d20 55%, #082010 100%);`;
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:${size}px; height:${size}px; overflow:hidden; background:transparent; }
.wrap {
  width:${size}px; height:${size}px;
  border-radius:${rad}px;
  ${bg}
  display:flex; align-items:center; justify-content:center;
  position:relative; overflow:hidden;
}
${!isSmall ? `.shine {
  position:absolute; top:-${Math.round(size*.1)}px; left:-${Math.round(size*.1)}px;
  width:${Math.round(size*.65)}px; height:${Math.round(size*.45)}px;
  background:rgba(85,204,119,0.07); border-radius:50%; transform:rotate(-15deg);
}` : ''}
.char {
  font-family:'Hiragino Kaku Gothic ProN','Yu Gothic','Noto Sans JP',sans-serif;
  font-size:${fontSize}px; font-weight:900;
  color:#55cc77; line-height:1;
  position:relative; z-index:1;
  ${isSmall ? '' : 'text-shadow: 0 0 20px rgba(85,204,119,0.5), 0 2px 6px rgba(0,0,0,0.6);'}
}
</style></head>
<body><div class="wrap">
  ${!isSmall ? '<div class="shine"></div>' : ''}
  <div class="char">適</div>
</div></body></html>`;
};

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
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
    const dest = path.join(DEST, name);
    await page.screenshot({ path: dest, type: 'png', clip: { x:0,y:0,width:size,height:size }, omitBackground: true });
    await page.close();
    console.log(`wrote ${dest}`);
  }

  // favicon.ico
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let i=0;i<256;i++){let c=i;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[i]=c;}
    return t;
  })();
  function crc32(buf){let c=0xffffffff;for(let i=0;i<buf.length;i++)c=CRC_TABLE[(c^buf[i])&0xff]^(c>>>8);return(c^0xffffffff)>>>0;}

  const p32 = fs.readFileSync(path.join(DEST,'favicon-32.png'));
  const p16 = fs.readFileSync(path.join(DEST,'favicon-16.png'));
  const pngs=[p32,p16]; const n=pngs.length;
  const hSz=6+n*16; let offset=hSz;
  const hdr=Buffer.alloc(hSz);
  hdr.writeUInt16LE(0,0);hdr.writeUInt16LE(1,2);hdr.writeUInt16LE(n,4);
  [[32,0],[16,1]].forEach(([sz,i])=>{
    const p=6+i*16;
    hdr[p]=sz;hdr[p+1]=sz;hdr[p+2]=0;hdr[p+3]=0;
    hdr.writeUInt16LE(1,p+4);hdr.writeUInt16LE(32,p+6);
    hdr.writeUInt32LE(pngs[i].length,p+8);hdr.writeUInt32LE(offset,p+12);
    offset+=pngs[i].length;
  });
  fs.writeFileSync(path.join(DEST,'favicon.ico'), Buffer.concat([hdr,...pngs]));
  console.log('wrote favicon.ico');

  // site-icon-7 をツールディレクトリにもコピー
  fs.copyFileSync(path.join(DEST,'apple-touch-icon.png'), 'site-icon-7.png');
  console.log('copied site-icon-7.png');

  await browser.close();
  console.log('Done.');
})();
