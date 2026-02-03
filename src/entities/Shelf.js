// ─── Shelf ───────────────────────────────────────────────────────────────────
// A bookshelf. Each shelf has a type and only accepts books of that type.
// Glows when the player is near with the correct book.
// Tracks internal slots for visual book placement.

class Shelf {
  constructor(scene, x, y, type, label) {
    this.scene = scene;
    this.type = type;
    this.label = label;

    // Position in world pixels
    this.wx = x;
    this.wy = y;

    // ── Sprite ──────────────────────────────────────────────────────────
    this.sprite = scene.add.image(x, y, 'sheet_shelf');
    this.sprite.setScale(1);
    this.sprite.setDepth(20);
    this.sprite.setOrigin(0.5, 0.5);

    // ── Physics body (static, for collision) ─────────────────────────────
    this.body = scene.physics.add.staticImage(x, y, null);
    this.body.body.setSize(80, 56);
    this.body.body.refresh();
    this.body.setVisible(false);

    // ── Category Label ────────────────────────────────────────────────────
    const typeColors = {
      RED: '#d62a2a', BLUE: '#4a8cff', GREEN: '#2aaa5c',
      YELLOW: '#d4a82e', PURPLE: '#aa4aff'
    };

    // Label background
    this.labelBg = scene.add.graphics();
    this.labelBg.setDepth(25);
    this.labelBg.fillStyle(0x000000, 0.7);
    this.labelBg.fillRoundedRect(x - 32, y - 42, 64, 18, 4);
    // Label border (colored by type)
    const col = parseInt(typeColors[type].replace('#',''), 16);
    this.labelBg.lineStyle(2, col, 0.9);
    this.labelBg.strokeRoundedRect(x - 32, y - 42, 64, 18, 4);

    this.labelText = scene.add.text(x, y - 34, label.toUpperCase(), {
      fontSize: '10px',
      fontFamily: '"Courier New", monospace',
      color: typeColors[type],
      align: 'center'
    }).setOrigin(0.5, 0.5).setDepth(26);

    // ── Slot tracking (3 slots per shelf for visual book placement) ───────
    this.slots = [
      { x: x - 22, y: y + 5,  filled: false },
      { x: x,      y: y + 5,  filled: false },
      { x: x + 22, y: y + 5,  filled: false },
    ];

    // ── Glow effect (rendered via graphics, toggled by proximity) ─────────
    this.glowGraphics = scene.add.graphics();
    this.glowGraphics.setDepth(19);
    this.isGlowing = false;
  }

  // ── Get next empty slot ─────────────────────────────────────────────────
  getNextSlot() {
    for (const slot of this.slots) {
      if (!slot.filled) {
        slot.filled = true;
        return slot;
      }
    }
    return null; // shelf full
  }

  // ── Check if player is near with correct book type ────────────────────
  isPlayerNearWithBook(player) {
    const dist = Phaser.Math.Distance.Between(
      player.sprite.x, player.sprite.y, this.wx, this.wy
    );
    if (dist > 55) return false;

    // Check if player is carrying any book of this shelf's type
    return player.carrying.some(b => b.type === this.type);
  }

  // ── Accept a book — returns true if correct type ─────────────────────
  acceptBook(book) {
    if (book.type !== this.type) return false;
    book.file(this);
    return true;
  }

  // ── Update — manage glow state ────────────────────────────────────────
  update(player) {
    const shouldGlow = this.isPlayerNearWithBook(player);

    if (shouldGlow !== this.isGlowing) {
      this.isGlowing = shouldGlow;
      this._drawGlow(shouldGlow);
    }
  }

  _drawGlow(on) {
    this.glowGraphics.clear();
    if (!on) return;

    const typeGlows = {
      RED: 0xd62a2a, BLUE: 0x4a8cff, GREEN: 0x2aaa5c,
      YELLOW: 0xd4a82e, PURPLE: 0xaa4aff
    };
    const color = typeGlows[this.type] || 0xffffff;

    // Soft pulsing glow behind shelf
    this.glowGraphics.fillStyle(color, 0.12);
    this.glowGraphics.fillCircle(this.wx, this.wy, 48);
    this.glowGraphics.fillStyle(color, 0.08);
    this.glowGraphics.fillCircle(this.wx, this.wy, 60);
  }

  // ── Destroy ─────────────────────────────────────────────────────────────
  destroy() {
    this.sprite.destroy();
    this.body.destroy();
    this.labelBg.destroy();
    this.labelText.destroy();
    this.glowGraphics.destroy();
  }
}
