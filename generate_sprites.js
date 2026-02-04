// Generates all pixel-art sprite sheets as PNG files using raw PNG encoding
// No external dependencies — pure Node.js Buffer manipulation with zlib

const fs = require('fs');
const zlib = require('zlib');

// ─── Minimal PNG Writer ────────────────────────────────────────────────────
function createPNG(width, height, pixels) {
  // pixels: Uint8Array of [R,G,B,A, R,G,B,A, ...] row by row

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type);
    const crcData = Buffer.concat([typeB, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData));
    return Buffer.concat([len, typeB, data, crc]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // IDAT — raw pixel data with filter byte 0 per row
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      raw[dstIdx]     = pixels[srcIdx];
      raw[dstIdx + 1] = pixels[srcIdx + 1];
      raw[dstIdx + 2] = pixels[srcIdx + 2];
      raw[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }
  const compressed = zlib.deflateSync(raw);

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// ─── Color Palette ──────────────────────────────────────────────────────────
const C = {
  TRANSPARENT: [0, 0, 0, 0],
  // Luchador body
  SKIN:     [0xE8, 0xB8, 0x8A, 255],
  SKIN_S:   [0xC4, 0x8A, 0x5C, 255],  // shadow
  // Mask
  MASK_R:   [0xD6, 0x2A, 0x2A, 255],  // red
  MASK_W:   [0xFF, 0xFF, 0xFF, 255],  // white
  MASK_G:   [0x2A, 0x8C, 0x2A, 255],  // green accent
  MASK_EYE: [0x1A, 0x1A, 0x1A, 255],  // eye holes
  // Outfit
  VEST_R:   [0xB8, 0x1C, 0x1C, 255],
  VEST_G:   [0x1E, 0x7A, 0x1E, 255],
  PANTS:    [0x2C, 0x2C, 0x6E, 255],
  BOOTS:    [0x3D, 0x2B, 0x1A, 255],
  BOOTS_S:  [0x2A, 0x1C, 0x0E, 255],
  // Books
  BOOK_R:   [0xC0, 0x39, 0x2E, 255],
  BOOK_B:   [0x2E, 0x5C, 0xC0, 255],
  BOOK_G:   [0x2E, 0xA0, 0x5C, 255],
  BOOK_Y:   [0xD4, 0xA8, 0x2E, 255],
  BOOK_P:   [0x7A, 0x2E, 0xC0, 255],
  BOOK_SPINE:[0x1A, 0x1A, 0x1A, 255],
  BOOK_PAGE:[0xF0, 0xEB, 0xD6, 255],
  // Shelf
  SHELF_W:  [0xC4, 0x8E, 0x5A, 255],
  SHELF_D:  [0x8B, 0x5E, 0x3A, 255],
  SHELF_DS: [0x6B, 0x44, 0x2A, 255],
  // Floor / environment
  FLOOR_L:  [0xE8, 0xDF, 0xCF, 255],
  FLOOR_D:  [0xD4, 0xC8, 0xB0, 255],
  FLOOR_T:  [0xC8, 0xB8, 0x98, 255],
  // UI
  UI_BG:    [0x1A, 0x1A, 0x2E, 255],
  UI_GOLD:  [0xF0, 0xC8, 0x40, 255],
  // Shadow
  SHADOW:   [0x00, 0x00, 0x00, 80],
  // Enemy (misfiled ghost)
  GHOST_W:  [0xE8, 0xE8, 0xF0, 220],
  GHOST_S:  [0xC0, 0xC0, 0xD0, 200],
  GHOST_EYE:[0x3A, 0x1A, 0x6E, 255],
  // Particles
  SPARK_Y:  [0xFF, 0xE8, 0x40, 255],
  SPARK_W:  [0xFF, 0xFF, 0xFF, 200],
  // Cart
  CART_M:   [0x7A, 0x7A, 0x8A, 255],
  CART_D:   [0x5A, 0x5A, 0x6A, 255],
  CART_W:   [0xD0, 0xD0, 0xD8, 255],
  BLACK:    [0x00, 0x00, 0x00, 255],
  WHITE:    [0xFF, 0xFF, 0xFF, 255],
};

function setPixel(pixels, w, x, y, color) {
  if (x < 0 || x >= w || y < 0) return;
  const idx = (y * w + x) * 4;
  pixels[idx]     = color[0];
  pixels[idx + 1] = color[1];
  pixels[idx + 2] = color[2];
  pixels[idx + 3] = color[3];
}

function fillRect(pixels, w, x, y, rw, rh, color) {
  for (let ry = y; ry < y + rh; ry++)
    for (let rx = x; rx < x + rw; rx++)
      setPixel(pixels, w, rx, ry, color);
}

function outline(pixels, w, h, color) {
  // Draw 1px outline around non-transparent pixels
  const temp = new Uint8Array(pixels);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (temp[idx + 3] > 0) {
        // Check 4 neighbors
        const neighbors = [[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dx, dy] of neighbors) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nIdx = (ny * w + nx) * 4;
            if (temp[nIdx + 3] === 0) {
              setPixel(pixels, w, nx, ny, color);
            }
          }
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPRITE: Luchador Librarian — 32x32 per frame, 4 frames (idle anim), 4 dirs
// Sheet: 128w x 128h (4 frames across, 4 directions down)
// ═══════════════════════════════════════════════════════════════════════════
function drawLuchadorFrame(pixels, sheetW, ox, oy, frame, dir) {
  // dir: 0=down, 1=right, 2=up, 3=left
  const F = frame % 2; // 0 or 1 for idle bob

  // Shadow
  fillRect(pixels, sheetW, ox+8, oy+28, 16, 3, C.SHADOW);

  // Legs
  const legOff = F === 0 ? 0 : 1;
  if (dir === 0 || dir === 2) {
    // Left leg
    fillRect(pixels, sheetW, ox+10, oy+20, 4, 6+legOff, C.PANTS);
    fillRect(pixels, sheetW, ox+10, oy+26+legOff, 4, 2, C.BOOTS);
    // Right leg
    fillRect(pixels, sheetW, ox+18, oy+20, 4, 6+legOff, C.PANTS);
    fillRect(pixels, sheetW, ox+18, oy+26+legOff, 4, 2, C.BOOTS);
  } else {
    // Side view — stacked legs
    fillRect(pixels, sheetW, ox+12, oy+20, 5, 7, C.PANTS);
    fillRect(pixels, sheetW, ox+12, oy+27, 5, 2, C.BOOTS);
    fillRect(pixels, sheetW, ox+13, oy+21, 5, 7, C.PANTS);
    fillRect(pixels, sheetW, ox+13, oy+28, 5, 1, C.BOOTS_S);
  }

  // Body / Vest
  const bodyY = oy + 12 - F;
  fillRect(pixels, sheetW, ox+9, bodyY, 14, 9, C.VEST_R);
  fillRect(pixels, sheetW, ox+11, bodyY+2, 10, 5, C.VEST_G); // chest stripe
  // Torso sides
  fillRect(pixels, sheetW, ox+9, bodyY, 2, 9, C.VEST_R);
  fillRect(pixels, sheetW, ox+21, bodyY, 2, 9, C.VEST_R);

  // Arms
  if (dir === 0 || dir === 2) {
    // Left arm
    fillRect(pixels, sheetW, ox+6, bodyY+1, 3, 7, C.SKIN);
    fillRect(pixels, sheetW, ox+6, bodyY+1, 3, 3, C.VEST_R);
    // Right arm
    fillRect(pixels, sheetW, ox+23, bodyY+1, 3, 7, C.SKIN);
    fillRect(pixels, sheetW, ox+23, bodyY+1, 3, 3, C.VEST_R);
  } else {
    // Side — one visible arm
    const ax = dir === 1 ? ox+22 : ox+7;
    fillRect(pixels, sheetW, ax, bodyY+1, 3, 7, C.SKIN);
    fillRect(pixels, sheetW, ax, bodyY+1, 3, 3, C.VEST_R);
  }

  // Head
  const headY = bodyY - 8;
  fillRect(pixels, sheetW, ox+10, headY, 12, 8, C.SKIN);

  // Mask (the iconic luchador mask!)
  // Base mask shape
  fillRect(pixels, sheetW, ox+10, headY, 12, 6, C.MASK_R);
  // Forehead stripe
  fillRect(pixels, sheetW, ox+10, headY, 12, 2, C.MASK_W);
  // Green accent stripe
  fillRect(pixels, sheetW, ox+10, headY+2, 12, 1, C.MASK_G);
  // Eye holes
  if (dir !== 2) { // visible from front, left, right
    if (dir === 0 || dir === 3) {
      fillRect(pixels, sheetW, ox+12, headY+3, 3, 2, C.MASK_EYE);
    }
    if (dir === 0 || dir === 1) {
      fillRect(pixels, sheetW, ox+17, headY+3, 3, 2, C.MASK_EYE);
    }
  } else {
    // Back of head — no eyes, show mask back
    fillRect(pixels, sheetW, ox+10, headY, 12, 6, C.MASK_R);
    fillRect(pixels, sheetW, ox+12, headY+1, 8, 1, C.MASK_W);
  }

  // Outline the whole character
  // (simplified: outline head and body blocks)
  const BLK = C.BLACK;
  // Head outline
  for (let x = 10; x < 22; x++) {
    setPixel(pixels, sheetW, ox+x, headY-1, BLK);       // top
    setPixel(pixels, sheetW, ox+x, headY+8, BLK);       // bottom (only if no body)
  }
  setPixel(pixels, sheetW, ox+9, headY, BLK);
  setPixel(pixels, sheetW, ox+22, headY, BLK);
  for (let y = headY; y < headY+8; y++) {
    setPixel(pixels, sheetW, ox+9, y, BLK);
    setPixel(pixels, sheetW, ox+22, y, BLK);
  }
  // Body outline
  for (let x = 9; x < 23; x++) {
    setPixel(pixels, sheetW, ox+x, bodyY+9, BLK);
  }
  for (let y = bodyY; y < bodyY+9; y++) {
    setPixel(pixels, sheetW, ox+8, y, BLK);
    setPixel(pixels, sheetW, ox+23, y, BLK);
  }
}

function generateLuchadorSheet() {
  const frameW = 32, frameH = 32;
  const cols = 4, rows = 4; // 4 frames x 4 directions
  const w = frameW * cols, h = frameH * rows;
  const pixels = new Uint8Array(w * h * 4); // transparent

  for (let dir = 0; dir < 4; dir++) {
    for (let frame = 0; frame < 4; frame++) {
      drawLuchadorFrame(pixels, w, frame * frameW + 2, dir * frameH + 2, frame, dir);
    }
  }
  return createPNG(w, h, pixels);
}

// ═══════════════════════════════════════════════════════════════════════════
// SPRITE: Books — 5 book types, each 16x20, in a row
// Sheet: 80w x 24h
// ═══════════════════════════════════════════════════════════════════════════
function generateBooksSheet() {
  const bw = 16, bh = 24;
  const bookColors = [C.BOOK_R, C.BOOK_B, C.BOOK_G, C.BOOK_Y, C.BOOK_P];
  const w = bw * 5, h = bh;
  const pixels = new Uint8Array(w * h * 4);

  bookColors.forEach((color, i) => {
    const ox = i * bw;
    const oy = 2;
    // Main cover
    fillRect(pixels, w, ox+2, oy, 12, 18, color);
    // Spine (left edge)
    fillRect(pixels, w, ox+1, oy, 1, 18, C.BOOK_SPINE);
    // Pages (right edge)
    fillRect(pixels, w, ox+14, oy, 1, 18, C.BOOK_PAGE);
    // Top pages
    fillRect(pixels, w, ox+2, oy-1, 12, 1, C.BOOK_PAGE);
    // Title bar on cover (darker stripe)
    fillRect(pixels, w, ox+4, oy+5, 8, 1, C.BOOK_SPINE);
    fillRect(pixels, w, ox+4, oy+8, 8, 1, C.BOOK_SPINE);
    // Category letter (bright center dot)
    fillRect(pixels, w, ox+8, oy+6, 2, 2, C.WHITE);
    // Black outline
    const BLK = C.BLACK;
    for (let x = 1; x < 15; x++) {
      setPixel(pixels, w, ox+x, oy-1, BLK);
      setPixel(pixels, w, ox+x, oy+18, BLK);
    }
    for (let y = oy-1; y <= oy+18; y++) {
      setPixel(pixels, w, ox, y, BLK);
      setPixel(pixels, w, ox+15, y, BLK);
    }
  });

  return createPNG(w, h, pixels);
}

// ═══════════════════════════════════════════════════════════════════════════
// SPRITE: Shelf — 64x48 (a tall bookshelf unit, top-down face)
// ═══════════════════════════════════════════════════════════════════════════
function generateShelfSheet() {
  const w = 80, h = 56;
  const pixels = new Uint8Array(w * h * 4);

  // Main shelf body
  fillRect(pixels, w, 2, 4, 76, 48, C.SHELF_W);
  // Dark inner area (where books sit)
  fillRect(pixels, w, 4, 6, 72, 44, C.SHELF_D);
  // Three shelf dividers (horizontal planks)
  fillRect(pixels, w, 4, 16, 72, 3, C.SHELF_W);
  fillRect(pixels, w, 4, 30, 72, 3, C.SHELF_W);
  fillRect(pixels, w, 4, 44, 72, 3, C.SHELF_W);
  // Shelf plank shadows
  fillRect(pixels, w, 4, 19, 72, 1, C.SHELF_DS);
  fillRect(pixels, w, 4, 33, 72, 1, C.SHELF_DS);
  // Top edge highlight
  fillRect(pixels, w, 2, 4, 76, 2, C.SHELF_W);
  // Frame outline
  const BLK = C.BLACK;
  for (let x = 2; x < 78; x++) {
    setPixel(pixels, w, x, 3, BLK);
    setPixel(pixels, w, x, 52, BLK);
  }
  for (let y = 3; y <= 52; y++) {
    setPixel(pixels, w, 1, y, BLK);
    setPixel(pixels, w, 78, y, BLK);
  }
  // Vertical dividers
  fillRect(pixels, w, 28, 6, 2, 44, C.SHELF_DS);
  fillRect(pixels, w, 50, 6, 2, 44, C.SHELF_DS);

  return createPNG(w, h, pixels);
}

// ═══════════════════════════════════════════════════════════════════════════
// SPRITE: Ghost Enemy — 24x28, 4 frames (float animation)
// Sheet: 96w x 28h
// ═══════════════════════════════════════════════════════════════════════════
function generateGhostSheet() {
  const fw = 24, fh = 28;
  const w = fw * 4, h = fh;
  const pixels = new Uint8Array(w * h * 4);

  for (let f = 0; f < 4; f++) {
    const ox = f * fw;
    const bob = f < 2 ? 0 : 1;
    // Wispy bottom (wavy tail)
    const tailY = 18 + bob;
    // Ghost body
    fillRect(pixels, w, ox+3, 4+bob, 18, 14, C.GHOST_W);
    // Rounded top
    fillRect(pixels, w, ox+5, 2+bob, 14, 3, C.GHOST_W);
    fillRect(pixels, w, ox+3, 5+bob, 18, 2, C.GHOST_W);
    // Eyes
    fillRect(pixels, w, ox+7, 9+bob, 3, 3, C.GHOST_EYE);
    fillRect(pixels, w, ox+14, 9+bob, 3, 3, C.GHOST_EYE);
    // Wispy tendrils at bottom
    fillRect(pixels, w, ox+3, tailY, 3, 4, C.GHOST_S);
    fillRect(pixels, w, ox+9, tailY+1, 3, 5, C.GHOST_S);
    fillRect(pixels, w, ox+15, tailY, 3, 4, C.GHOST_S);
    fillRect(pixels, w, ox+18, tailY+2, 3, 3, C.GHOST_S);
    // Glow effect (semi-transparent outer)
    fillRect(pixels, w, ox+2, 3+bob, 1, 15, [0xC0, 0xC0, 0xD8, 80]);
    fillRect(pixels, w, ox+21, 3+bob, 1, 15, [0xC0, 0xC0, 0xD8, 80]);
  }

  return createPNG(w, h, pixels);
}

// ═══════════════════════════════════════════════════════════════════════════
// SPRITE: Book Cart — 32x32, 1 frame
// ═══════════════════════════════════════════════════════════════════════════
function generateCartSheet() {
  const w = 32, h = 32;
  const pixels = new Uint8Array(w * h * 4);

  // Shadow
  fillRect(pixels, w, 6, 26, 20, 3, C.SHADOW);
  // Cart body (metal tray)
  fillRect(pixels, w, 4, 8, 24, 14, C.CART_M);
  fillRect(pixels, w, 5, 9, 22, 12, C.CART_D); // inner dark
  // Cart rim (lighter top edge)
  fillRect(pixels, w, 4, 8, 24, 2, C.CART_W);
  // Wheels
  fillRect(pixels, w, 6, 22, 4, 4, C.CART_D);
  fillRect(pixels, w, 7, 23, 2, 2, C.CART_W); // highlight
  fillRect(pixels, w, 22, 22, 4, 4, C.CART_D);
  fillRect(pixels, w, 23, 23, 2, 2, C.CART_W);
  // Handle (top)
  fillRect(pixels, w, 8, 5, 16, 3, C.CART_M);
  fillRect(pixels, w, 9, 6, 14, 1, C.CART_W); // handle highlight
  // Some books peeking out of the cart
  fillRect(pixels, w, 7, 10, 3, 8, C.BOOK_R);
  fillRect(pixels, w, 11, 10, 3, 8, C.BOOK_B);
  fillRect(pixels, w, 15, 10, 3, 8, C.BOOK_G);
  // Outline
  const BLK = C.BLACK;
  for (let x = 4; x < 28; x++) {
    setPixel(pixels, w, x, 7, BLK);
    setPixel(pixels, w, x, 22, BLK);
  }
  for (let y = 7; y <= 22; y++) {
    setPixel(pixels, w, 3, y, BLK);
    setPixel(pixels, w, 28, y, BLK);
  }

  return createPNG(w, h, pixels);
}

// ═══════════════════════════════════════════════════════════════════════════
// SPRITE: Particles / Effects — 8x8 frames in a 64x8 strip (8 frames)
// ═══════════════════════════════════════════════════════════════════════════
function generateParticlesSheet() {
  const fw = 8, fh = 8;
  const w = fw * 8, h = fh;
  const pixels = new Uint8Array(w * h * 4);

  for (let f = 0; f < 8; f++) {
    const ox = f * fw;
    const size = Math.max(1, 4 - Math.floor(f * 0.6));
    const alpha = Math.max(40, 255 - f * 30);
    const color = f < 4 ? [0xFF, 0xE8, 0x40, alpha] : [0xFF, 0xFF, 0xFF, alpha];
    fillRect(pixels, w, ox + 3, 3, size, size, color);
  }

  return createPNG(w, h, pixels);
}

// ═══════════════════════════════════════════════════════════════════════════
// TILEMAP: Floor tiles — 32x32 each, 4 variants in a 128x32 strip
// ═══════════════════════════════════════════════════════════════════════════
function generateFloorTiles() {
  const tw = 32, th = 32;
  const w = tw * 4, h = th;
  const pixels = new Uint8Array(w * h * 4);

  const tileColors = [C.FLOOR_L, C.FLOOR_D, C.FLOOR_T, C.FLOOR_L];
  tileColors.forEach((base, i) => {
    const ox = i * tw;
    fillRect(pixels, w, ox, 0, tw, th, base);
    // Subtle variation dots
    if (i === 0) {
      setPixel(pixels, w, ox+5, 7, C.FLOOR_D);
      setPixel(pixels, w, ox+21, 19, C.FLOOR_D);
    }
    if (i === 1) {
      fillRect(pixels, w, ox+10, 10, 12, 12, C.FLOOR_T);
    }
    if (i === 2) {
      // Subtle grain
      for (let y = 0; y < th; y += 4)
        for (let x = 0; x < tw; x += 6)
          setPixel(pixels, w, ox+x, y, C.FLOOR_L);
    }
    if (i === 3) {
      // Center tile with decorative border (lobby)
      fillRect(pixels, w, ox+2, 2, 28, 28, C.FLOOR_L);
      fillRect(pixels, w, ox+1, 1, 1, 30, C.FLOOR_D);
      fillRect(pixels, w, ox, 0, 1, 32, C.FLOOR_T);
      fillRect(pixels, w, ox+31, 1, 1, 30, C.FLOOR_D);
      fillRect(pixels, w, ox+1, 31, 30, 1, C.FLOOR_D);
    }
  });

  return createPNG(w, h, pixels);
}

// ═══════════════════════════════════════════════════════════════════════════
// WRITE ALL SPRITES
// ═══════════════════════════════════════════════════════════════════════════
const outDir = '/home/claude/luchador-lib/src/assets/sprites/';
const tileDir = '/home/claude/luchador-lib/src/assets/tilemaps/';

fs.writeFileSync(outDir + 'luchador.png', generateLuchadorSheet());
fs.writeFileSync(outDir + 'books.png', generateBooksSheet());
fs.writeFileSync(outDir + 'shelf.png', generateShelfSheet());
fs.writeFileSync(outDir + 'ghost.png', generateGhostSheet());
fs.writeFileSync(outDir + 'cart.png', generateCartSheet());
fs.writeFileSync(outDir + 'particles.png', generateParticlesSheet());
fs.writeFileSync(tileDir + 'floor.png', generateFloorTiles());

console.log('All sprites generated successfully.');
