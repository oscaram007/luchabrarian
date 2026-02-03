// ─── BookSystem ──────────────────────────────────────────────────────────────
// Manages the lifecycle of all books in the game:
//   - Spawning books on the floor (initial + wave escalation)
//   - Pickup collision detection (player walks over a book)
//   - Drop logic (ghost contact drops all carried books)
//   - Shelf interaction (E key to file when near correct shelf)

class BookSystem {
  constructor(scene, player, shelves) {
    this.scene = scene;
    this.player = player;
    this.shelves = shelves;
    this.books = [];         // all active Book instances
    this.wave = 0;

    // Pickup cooldown per book (prevents instant re-pickup after drop)
    this.pickupCooldowns = new Map();

    // E key for manual filing (registered once)
    this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  // ── Spawn initial books ────────────────────────────────────────────────
  spawnInitialBooks() {
    for (let i = 0; i < CONFIG.INITIAL_BOOKS; i++) {
      this._spawnRandomBook();
    }
  }

  // ── Spawn a wave of additional books (escalation) ─────────────────────
  spawnWave() {
    this.wave++;
    const count = CONFIG.BOOKS_PER_WAVE;
    for (let i = 0; i < count; i++) {
      this._spawnRandomBook();
    }
  }

  // ── Spawn a single random book at a safe floor position ──────────────
  _spawnRandomBook() {
    const type = CONFIG.BOOK_TYPES[Math.floor(Math.random() * CONFIG.BOOK_TYPES.length)];
    const pos = this._getRandomFloorPosition();
    const book = new Book(this.scene, pos.x, pos.y, type);
    this.books.push(book);
    return book;
  }

  // ── Get a random position on the open floor (avoiding shelves) ────────
  _getRandomFloorPosition() {
    const margin = 48;
    const W = CONFIG.GAME_WIDTH;
    const H = CONFIG.GAME_HEIGHT;

    for (let attempt = 0; attempt < 50; attempt++) {
      const x = margin + Math.random() * (W - margin * 2);
      const y = margin + Math.random() * (H - margin * 2);

      // Check distance from all shelves
      let tooClose = false;
      for (const shelf of this.shelves) {
        const dist = Phaser.Math.Distance.Between(x, y, shelf.wx, shelf.wy);
        if (dist < 70) { tooClose = true; break; }
      }
      // Check distance from player
      const playerDist = Phaser.Math.Distance.Between(
        x, y, this.player.sprite.x, this.player.sprite.y
      );
      if (playerDist < 50) tooClose = true;

      if (!tooClose) return { x, y };
    }
    // Fallback: center of map
    return { x: CONFIG.GAME_WIDTH / 2, y: CONFIG.GAME_HEIGHT / 2 };
  }

  // ── Handle ghost contact — drop all carried books ─────────────────────
  onPlayerHitByGhost() {
    if (this.player.carrying.length === 0) return;

    const dropped = this.player.dropAllBooks();
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;

    // Scatter dropped books around the player
    dropped.forEach((book, i) => {
      const angle = (i / dropped.length) * Math.PI * 2;
      const dist = 30 + Math.random() * 20;
      const nx = px + Math.cos(angle) * dist;
      const ny = py + Math.sin(angle) * dist;

      // Reset book to floor state
      book.state = 'floor';
      book.sprite.body.setEnable(true);
      book.sprite.setPosition(nx, ny);
      book.sprite.setScale(1);
      book.sprite.setRotation((Math.random() - 0.5) * 0.6);
      book.label.setVisible(true);
      book.label.setPosition(nx, ny - 16);

      // Brief cooldown so it can't be instantly re-picked up
      this.pickupCooldowns.set(book, 1500);
    });

    // Screen shake for impact
    this.scene.cameras.main.shake(150, 0.01);
  }

  // ── Update ──────────────────────────────────────────────────────────────
  update(delta) {
    const player = this.player;

    // Update all books
    for (const book of this.books) {
      book.update(delta);
    }

    // Decrement pickup cooldowns
    for (const [book, remaining] of this.pickupCooldowns) {
      const newRemaining = remaining - delta;
      if (newRemaining <= 0) {
        this.pickupCooldowns.delete(book);
      } else {
        this.pickupCooldowns.set(book, newRemaining);
      }
    }

    // ── Pickup: walk over a floor book ──────────────────────────────────
    if (!player.isFull()) {
      for (const book of this.books) {
        if (book.state !== 'floor') continue;
        if (this.pickupCooldowns.has(book)) continue;

        const dist = Phaser.Math.Distance.Between(
          player.sprite.x, player.sprite.y,
          book.sprite.x, book.sprite.y
        );

        if (dist < 36) {
          if (player.pickUpBook(book)) {
            book.pickup();
            // Small pickup effect
            this.scene.events.emit('pickup_effect', book.sprite.x, book.sprite.y);
            break; // pick up one at a time
          }
        }
      }
    }

    // ── Shelf filing: E key when near a shelf with correct book ─────────
    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      this._tryFileBook();
    }

    // Also auto-file on overlap (walk into shelf with matching book)
    this._tryAutoFile();
  }

  // ── Try to file a carried book into a nearby shelf ────────────────────
  _tryFileBook() {
    for (const shelf of this.shelves) {
      if (!shelf.isPlayerNearWithBook(this.player)) continue;

      // Find the matching carried book
      const bookIdx = this.player.carrying.findIndex(b => b.type === shelf.type);
      if (bookIdx === -1) continue;

      const book = this.player.carrying[bookIdx];
      this.player.carrying.splice(bookIdx, 1);

      if (shelf.acceptBook(book)) {
        // Correct filing! Score event
        this.scene.events.emit('book_filed', book, shelf);
        return; // one file per press
      }
    }
  }

  // ── Auto-file when player walks into shelf with correct book ──────────
  _tryAutoFile() {
    for (const shelf of this.shelves) {
      if (!shelf.isPlayerNearWithBook(this.player)) continue;

      const bookIdx = this.player.carrying.findIndex(b => b.type === shelf.type);
      if (bookIdx === -1) continue;

      const book = this.player.carrying[bookIdx];
      this.player.carrying.splice(bookIdx, 1);

      if (shelf.acceptBook(book)) {
        this.scene.events.emit('book_filed', book, shelf);
        return;
      }
    }
  }

  // ── Get count of books still on the floor ─────────────────────────────
  getBooksOnFloor() {
    return this.books.filter(b => b.state === 'floor').length;
  }

  // ── Get total unfiled books (floor + carried) ─────────────────────────
  getUnfiledCount() {
    return this.books.filter(b => b.state !== 'filed').length;
  }
}
