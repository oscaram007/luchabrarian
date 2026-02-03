// ─── Player — The Luchador Librarian ────────────────────────────────────────
// Handles movement, direction facing, book carry state, dash mechanic,
// and sprite animation switching.

class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    // ── Sprite ──────────────────────────────────────────────────────────
    this.sprite = scene.physics.add.sprite(x, y, 'player_d0_f0');
    this.sprite.setScale(1);
    this.sprite.setDepth(50);
    // Hitbox — smaller than sprite for tighter feel
    this.sprite.body.setSize(20, 24);
    this.sprite.body.setOffset(6, 6);
    this.sprite.body.setImmovable(false);
    this.sprite.body.setCollideWorldBounds(true);

    // ── State ───────────────────────────────────────────────────────────
    this.direction = 0;          // 0=down 1=right 2=up 3=left
    this.carrying = [];          // array of Book references currently held
    this.isDashing = false;
    this.dashCooldownLeft = 0;
    this.currentAnim = null;

    // ── Input ───────────────────────────────────────────────────────────
    this.keys = scene.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w:     Phaser.Input.Keyboard.KeyCodes.W,
      a:     Phaser.Input.Keyboard.KeyCodes.A,
      s:     Phaser.Input.Keyboard.KeyCodes.S,
      d:     Phaser.Input.Keyboard.KeyCodes.D,
      dash:  Phaser.Input.Keyboard.KeyCodes.SHIFT,
      pick:  Phaser.Input.Keyboard.KeyCodes.E,
    });

    // Dash key just-pressed tracker
    this.dashPressed = false;

    // ── Shadow ──────────────────────────────────────────────────────────
    this.shadow = scene.add.graphics();
    this.shadow.setDepth(1);
    this.shadow.fillStyle(0x000000, 0.25);
    this.shadow.fillEllipse(0, 0, 28, 8);
  }

  // ── Public API ──────────────────────────────────────────────────────────
  getSpeed() {
    if (this.isDashing) return CONFIG.PLAYER_DASH_SPEED;
    const atLimit = this.carrying.length >= CONFIG.CARRY_LIMIT;
    return CONFIG.PLAYER_SPEED * (atLimit ? CONFIG.SLOW_FACTOR : 1);
  }

  pickUpBook(book) {
    if (this.carrying.length >= CONFIG.CARRY_LIMIT) return false;
    this.carrying.push(book);
    return true;
  }

  dropAllBooks() {
    const dropped = [...this.carrying];
    this.carrying = [];
    return dropped;
  }

  isFull() {
    return this.carrying.length >= CONFIG.CARRY_LIMIT;
  }

  // ── Update Loop ─────────────────────────────────────────────────────────
  update(delta) {
    this._handleDash(delta);
    this._handleMovement();
    this._updateAnimation();
    this._updateCarriedBooks();
    this._updateShadow();
  }

  // ── Dash ────────────────────────────────────────────────────────────────
  _handleDash(delta) {
    // Cooldown timer
    if (this.dashCooldownLeft > 0) {
      this.dashCooldownLeft -= delta;
    }

    // Detect dash key press (rising edge)
    const dashDown = Phaser.Input.Keyboard.JustDown(this.keys.dash);
    if (dashDown && this.dashCooldownLeft <= 0 && !this.isDashing) {
      this.isDashing = true;
      this.dashCooldownLeft = CONFIG.PLAYER_DASH_COOLDOWN;

      // Dash in current movement direction (or facing direction)
      const speed = CONFIG.PLAYER_DASH_SPEED;
      let vx = 0, vy = 0;
      if (this.keys.left.isDown || this.keys.a.isDown)  vx = -1;
      if (this.keys.right.isDown || this.keys.d.isDown) vx = 1;
      if (this.keys.up.isDown || this.keys.w.isDown)    vy = -1;
      if (this.keys.down.isDown || this.keys.s.isDown)  vy = 1;

      // If no movement key, dash in facing direction
      if (vx === 0 && vy === 0) {
        if (this.direction === 1) vx = 1;
        else if (this.direction === 3) vx = -1;
        else if (this.direction === 2) vy = -1;
        else vy = 1;
      }

      // Normalize diagonal
      const len = Math.sqrt(vx * vx + vy * vy);
      if (len > 0) { vx /= len; vy /= len; }

      this.sprite.body.setVelocity(vx * speed, vy * speed);

      // Spawn dash particles
      this.scene.events.emit('dash_particles', this.sprite.x, this.sprite.y);

      // End dash after duration
      this.scene.time.delayedCall(CONFIG.PLAYER_DASH_DURATION, () => {
        this.isDashing = false;
        // Velocity reset handled in movement
      });
    }
  }

  // ── Movement ────────────────────────────────────────────────────────────
  _handleMovement() {
    if (this.isDashing) return; // dash overrides normal movement

    let vx = 0, vy = 0;

    if (this.keys.left.isDown || this.keys.a.isDown)  vx -= 1;
    if (this.keys.right.isDown || this.keys.d.isDown) vx += 1;
    if (this.keys.up.isDown || this.keys.w.isDown)    vy -= 1;
    if (this.keys.down.isDown || this.keys.s.isDown)  vy += 1;

    // Update facing direction (priority: last axis moved)
    if (vx !== 0 || vy !== 0) {
      if (Math.abs(vx) >= Math.abs(vy)) {
        this.direction = vx > 0 ? 1 : 3;
      } else {
        this.direction = vy > 0 ? 0 : 2;
      }
    }

    // Normalize diagonal movement
    const len = Math.sqrt(vx * vx + vy * vy);
    if (len > 0) { vx /= len; vy /= len; }

    const speed = this.getSpeed();
    this.sprite.body.setVelocity(vx * speed, vy * speed);
  }

  // ── Animation ───────────────────────────────────────────────────────────
  _updateAnimation() {
    const animKey = `player_idle_${this.direction}`;
    if (this.currentAnim !== animKey) {
      this.sprite.anims.play(animKey);
      this.currentAnim = animKey;
    }
  }

  // ── Carried Books — stack visually on the player ──────────────────────
  _updateCarriedBooks() {
    const px = this.sprite.x;
    const py = this.sprite.y - 10; // above head

    this.carrying.forEach((book, i) => {
      if (book.sprite) {
        book.sprite.setPosition(px + (i - 1) * 10, py - i * 6);
        book.sprite.setDepth(60 + i);
        book.sprite.setScale(0.6);
      }
    });
  }

  // ── Shadow ──────────────────────────────────────────────────────────────
  _updateShadow() {
    this.shadow.setPosition(this.sprite.x, this.sprite.y + 16);
  }

  // ── Cleanup ─────────────────────────────────────────────────────────────
  destroy() {
    this.sprite.destroy();
    this.shadow.destroy();
  }
}
