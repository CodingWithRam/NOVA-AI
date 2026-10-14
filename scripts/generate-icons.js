import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // Simple uncompressed or deflate PNG generator
  const buffer = Buffer.alloc(8 + 25 + (height * (width * 4 + 1)) + 12);
  
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits per channel
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression deflate
  ihdrData.writeUInt8(0, 11); // filter default
  ihdrData.writeUInt8(0, 12); // interlace none

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    // CRC
    let c = 0xffffffff;
    const typeAndData = buf.subarray(4, 8 + len);
    for (let i = 0; i < typeAndData.length; i++) {
      c ^= typeAndData[i];
      for (let k = 0; k < 8; k++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    c ^= 0xffffffff;
    buf.writeInt32BE(c, 8 + len);
    return buf;
  }

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with 0 filter byte per scanline
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      // Draw background dark zinc (#09090b) with glowing center spark
      const dx = (x - width / 2) / (width / 2);
      const dy = (y - height / 2) / (height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Star shape check
      const angle = Math.atan2(dy, dx);
      const star = 0.45 + 0.35 * Math.cos(angle * 4);
      
      let pr = 9, pg = 9, pb = 11, pa = 255;
      if (dist < star * 0.7) {
        // glowing gradient
        const t = Math.max(0, 1 - dist / (star * 0.7));
        pr = Math.min(255, Math.floor(99 * t + 168 * (1 - t)));
        pg = Math.min(255, Math.floor(102 * t + 85 * (1 - t)));
        pb = Math.min(255, Math.floor(241 * t + 247 * (1 - t)));
        if (dist < 0.15) {
          pr = 255; pg = 255; pb = 255;
        }
      }

      rawData[offset++] = pr;
      rawData[offset++] = pg;
      rawData[offset++] = pb;
      rawData[offset++] = pa;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.resolve('public');
if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir, { recursive: true });
}

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPng(192, 192, 99, 102, 241));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPng(512, 512, 99, 102, 241));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 99, 102, 241));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPng(180, 180, 99, 102, 241));

console.log('Successfully generated all PWA icons in /public');
