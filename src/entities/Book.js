// ─── Book ────────────────────────────────────────────────────────────────────
// A single book. Has a type (RED/BLUE/GREEN/YELLOW/PURPLE), knows its
// correct shelf, and tracks whether it's on the floor, being carried, or filed.

class Book {
  constructor(scene, x, y, type) {
    this.scene = scene;
    this.type = type;
    this.category = CONFIG.BOOK_CATEGORIES[type];

    // State machine: 'floor' | 'carried' | 'filed'
    this.state = 'floor';

    // ── Sprite ──────────────────────────────────────────────────────────
    this.sprite = scene.physics.add.sprite(x, y, `book_${type}`);
    this.sprite.setDepth(10);
    this.sprite.body.setSize(14, 20);
    this.sprite.body.setImmovable(true);  // doesn't get pushed around
    this.sprite.body.setAllowGravity(false);

    // Slight random rotation for "tossed on floor" feel
    this.sprite.setRotation((Math.random() - 0.5) * 0.6);

    // ── Label (category text floating above) ─────────────────────────────
    this.label = scene.add.text(x, y - 16, this.category, {
      fontSize: '9px',
      fontFamily: '"Courier New", monospace',
      color: '#e0e0e0',
      backgroundColor: '#00000088',
      padding: { left: 3, right: 3, top: 1, bottom: 1 }
    }).setOrigin(0.5, 1).setDepth(11);

    // Label bob
    this.labelBobPhase = Math.random() * Math.PI * 2;
    this.labelBobTime = 0;
  }

  // ── Pickup ──────────────────────────────────────────────────────────────
  pickup() {
    this.state = 'carried';
    // Disable physics body while carried
    this.sprite.body.setEnable(false);
    this.sprite.setRotation(0);
    // Label hides while carried
    this.label.setVisible(false);
  }

  // ── File (place on shelf) ───────────────────────────────────────────────
  file(shelf) {
    this.state = 'filed';
    // Place sprite on the shelf visually
    this.sprite.body.setEnable(false);
    this.sprite.setDepth(5);
    this.sprite.setScale(0.8);
    this.label.setVisible(false);

    // Snap to a slot on the shelf
    const slot = shelf.getNextSlot();
    if (slot) {
      this.sprite.setPosition(slot.x, slot.y);
      this.sprite.setRotation(0);
    } else {
      // Shelf full — place on top
      this.sprite.setPosition(shelf.sprite.x, shelf.sprite.y - 30);
    }
  }

  // ── Update (while on floor) ─────────────────────────────────────────────
  update(delta) {
    if (this.state !== 'floor') return;

    // Gentle bob on the label
    this.labelBobTime += delta * 0.002;
    const bob = Math.sin(this.labelBobTime + this.labelBobPhase) * 2;
    this.label.setPosition(this.sprite.x, this.sprite.y - 16 + bob);

    // Gentle glow pulse on the book itself (scale)
    const pulse = 1 + Math.sin(this.labelBobTime * 2 + this.labelBobPhase) * 0.02;
    this.sprite.setScale(pulse);
  }

  // ── Destroy ─────────────────────────────────────────────────────────────
  destroy() {
    this.sprite.destroy();
    this.label.destroy();
  }
}
