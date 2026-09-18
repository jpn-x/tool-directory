const zlib = require('zlib');
const fs = require('fs');

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function makePNG(size, drawFn) {
  const px = new Uint8Array(size * size * 4);

  // fill background #13161e
  for (let i = 0; i < size * size; i++) {
    px[i*4]   = 0x13;
    px[i*4+1] = 0x16;
    px[i*4+2] = 0x1e;
    px[i*4+3] = 0xff;
  }

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    const fa = a / 255;
    px[i]   = Math.round(px[i]   * (1-fa) + r * fa);
    px[i+1] = Math.round(px[i+1] * (1-fa) + g * fa);
    px[i+2] = Math.round(px[i+2] * (1-fa) + b * fa);
    px[i+3] = 255;
  }

  function fillRect(x, y, w, h, r, g, b, a = 255) {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        setPixel(x+dx, y+dy, r, g, b, a);
  }

  function roundRect(x, y, w, h, rad, r, g, b, a = 255) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const cx = x + dx, cy = y + dy;
        let inCorner = false;
        if (dx < rad && dy < rad) inCorner = Math.hypot(dx - rad, dy - rad) > rad;
        else if (dx >= w-rad && dy < rad) inCorner = Math.hypot(dx - (w-rad-1), dy - rad) > rad;
        else if (dx < rad && dy >= h-rad) inCorner = Math.hypot(dx - rad, dy - (h-rad-1)) > rad;
        else if (dx >= w-rad && dy >= h-rad) inCorner = Math.hypot(dx - (w-rad-1), dy - (h-rad-1)) > rad;
        if (!inCorner) setPixel(cx, cy, r, g, b, a);
      }
    }
  }

  function fillCircle(cx, cy, radius, r, g, b, a = 255) {
    for (let dy = -radius; dy <= radius; dy++)
      for (let dx = -radius; dx <= radius; dx++)
        if (dx*dx + dy*dy <= radius*radius)
          setPixel(cx+dx, cy+dy, r, g, b, a);
  }

  function line(x0, y0, x1, y1, thick, r, g, b, a = 255) {
    const dx = x1-x0, dy = y1-y0;
    const len = Math.hypot(dx, dy);
    const steps = Math.ceil(len * 2);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px2 = x0 + dx*t, py2 = y0 + dy*t;
      for (let ty = -thick; ty <= thick; ty++)
        for (let tx = -thick; tx <= thick; tx++)
          if (tx*tx + ty*ty <= thick*thick)
            setPixel(Math.round(px2)+tx, Math.round(py2)+ty, r, g, b, a);
    }
  }

  drawFn({ size, fillRect, roundRect, fillCircle, line, setPixel });

  // build PNG
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size*4)] = 0;
    for (let x = 0; x < size; x++) {
      const si = (y*size+x)*4;
      const di = y*(1+size*4)+1+x*4;
      raw[di]   = px[si];
      raw[di+1] = px[si+1];
      raw[di+2] = px[si+2];
      raw[di+3] = px[si+3];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  function chunk(type, data) {
    const typeB = Buffer.from(type);
    const lenB = Buffer.alloc(4); lenB.writeUInt32BE(data.length);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
    return Buffer.concat([lenB, typeB, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8]=8; ihdr[9]=6; // RGBA

  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// ── icon design: dark card + candlestick bars + upward trend line ──
function drawIcon({ size, fillRect, roundRect, fillCircle, line }) {
  const s = size / 64; // scale factor

  // outer rounded rect card  #1a1e28
  roundRect(
    Math.round(4*s), Math.round(4*s),
    Math.round(56*s), Math.round(56*s),
    Math.round(10*s),
    0x1a, 0x1e, 0x28
  );

  // grid lines (subtle)
  for (let gx = 10; gx < 60; gx += 16) {
    for (let y = 8; y < 56; y++) {
      const ax = Math.round(gx*s), ay = Math.round(y*s);
      fillRect(ax, ay, Math.max(1, Math.round(s)), Math.max(1, Math.round(s)), 0x1e, 0x25, 0x30, 180);
    }
  }

  // candles  (x, yLow, yHigh, yOpen, yClose, green?)
  const candles = [
    { x:12, yH:38, yL:52, yO:50, yC:40, up:true },
    { x:21, yH:28, yL:45, yO:43, yC:30, up:true },
    { x:30, yH:34, yL:50, yO:36, yC:48, up:false },
    { x:39, yH:22, yL:40, yO:38, yC:24, up:true },
    { x:48, yH:14, yL:32, yO:30, yC:16, up:true },
  ];

  for (const c of candles) {
    const [r, g, b] = c.up ? [0x26, 0xc1, 0x7b] : [0xef, 0x50, 0x50];
    const cx = Math.round(c.x*s);
    const w  = Math.max(2, Math.round(5*s));
    // wick
    line(cx + Math.round(2.5*s), Math.round(c.yH*s), cx + Math.round(2.5*s), Math.round(c.yL*s), Math.max(1, Math.round(0.6*s)), r, g, b, 180);
    // body
    const top  = Math.round(Math.min(c.yO, c.yC)*s);
    const bh   = Math.max(2, Math.round(Math.abs(c.yC-c.yO)*s));
    roundRect(cx, top, w, bh, Math.max(1, Math.round(1.5*s)), r, g, b);
  }

  // upward trend line  blue glow
  const pts = [[12,48],[21,38],[30,42],[39,30],[48,20]];
  for (let i = 0; i < pts.length-1; i++) {
    line(
      Math.round(pts[i][0]*s + 2.5*s), Math.round(pts[i][1]*s),
      Math.round(pts[i+1][0]*s + 2.5*s), Math.round(pts[i+1][1]*s),
      Math.max(1, Math.round(1.2*s)),
      0x4f, 0x8e, 0xf7, 200
    );
  }
}

// generate all sizes
const sizes = [16, 32, 180, 192, 512];
for (const sz of sizes) {
  const buf = makePNG(sz, drawIcon);
  const name = sz === 180 ? 'apple-touch-icon.png'
             : sz === 192 ? 'icon-192.png'
             : sz === 512 ? 'icon-512.png'
             : `favicon-${sz}.png`;
  fs.writeFileSync(name, buf);
  console.log(`wrote ${name} (${buf.length} bytes)`);
}

// write favicon.ico (wraps 32x32 PNG)
const ico32 = makePNG(32, drawIcon);
const ico16 = makePNG(16, drawIcon);
function makeIco(...pngs) {
  const n = pngs.length;
  const headerSize = 6 + n * 16;
  let offset = headerSize;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(n, 4);
  for (let i = 0; i < n; i++) {
    const sz = [32, 16][i];
    const p = 6 + i*16;
    header[p]   = sz === 256 ? 0 : sz;
    header[p+1] = sz === 256 ? 0 : sz;
    header[p+2] = 0; header[p+3] = 0;
    header.writeUInt16LE(1, p+4);
    header.writeUInt16LE(32, p+6);
    header.writeUInt32LE(pngs[i].length, p+8);
    header.writeUInt32LE(offset, p+12);
    offset += pngs[i].length;
  }
  return Buffer.concat([header, ...pngs]);
}
fs.writeFileSync('favicon.ico', makeIco(ico32, ico16));
console.log('wrote favicon.ico');
