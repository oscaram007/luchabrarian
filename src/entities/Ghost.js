// ─── Ghost ───────────────────────────────────────────────────────────────────
// A misfiled curse. Spawns when books sit on the wrong shelf too long,
// or periodically as chaos escalates. Floats toward the player.
// Contact with a ghost causes the player to drop all carried books.

class Ghost {
  constructor(scene, x, y) {
    this.scene = scene;

    // ── Sprite ──────────────────────────────────────────────────────────
    this.sprite = scene.physics.add.sprite(x, y, 'ghost_f0');
    this.sprite.setDepth(40);
    this.sprite.body.setSize(18, 22);
    this.sprite.body.setOffset(3, 3);
    this.sprite.body.setImmovable(false);
    this.sprite.body.setAllowGravity(false);
    this.sprite.anims.play('ghost_float');

    // Float offset for vertical bobbing
    this.baseY = y;
    this.floatPhase = Math.random() * Math.PI * 2;
    this.floatTime = 0;

    // Trail particles
    this.trailTimer = 0;

    this.alive = true;
  }

  // ── Update ──────────────────────────────────────────────────────────────
  update(delta, player) {
    if (!this.alive) return;

    // ── Chase player ──────────────────────────────────────────────────
    const px = player.sprite.x;
    const py = player.sprite.y;
    const gx = this.sprite.x;
    const gy = this.sprite.y;

    const dx = px - gx;
    const dy = py - gy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 2) {
      const speed = CONFIG.GHOST_SPEED;
      this.sprite.body.setVelocity(
        (dx / dist) * speed,
        (dy / dist) * speed
      );
    } else {
      this.sprite.body.setVelocity(0, 0);
    }

    // ── Float bob ─────────────────────────────────────────────────────
    this.floatTime += delta * 0.003;
    const bob = Math.sin(this.floatTime + this.floatPhase) * 4;
    // Apply bob as a Y offset (on top of physics position)
    this.sprite.setPosition(this.sprite.body.x + this.sprite.body.width / 2,
                            this.sprite.body.y + this.sprite.body.height / 2 + bob);

    // ── Trail particles ───────────────────────────────────────────────
    this.trailTimer += delta;
    if (this.trailTimer > 200) {
      this.trailTimer = 0;
      this.scene.events.emit('ghost_trail', this.sprite.x, this.sprite.y);
    }
  }

  // ── Destroy (when banished by correct book placement nearby) ──────────
  destroy() {
    this.alive = false;
    // Death burst effect
    this.scene.events.emit('ghost_burst', this.sprite.x, this.sprite.y);
    this.sprite.destroy();
  }
}
