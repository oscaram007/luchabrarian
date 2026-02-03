// ─── BootScene — Asset Loading ──────────────────────────────────────────────
// Loads all sprites, slices them into individual textures,
// and sets up animation configs before the title screen.

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload() {
    // Show a minimal loading bar
    const graphics = this.add.graphics();
    const onFileComplete = () => {
      graphics.clear();
      const progress = this.load.progress;
      // Background
      graphics.fillStyle(0x1a1a2e, 1);
      graphics.fillRect(220, 230, 200, 20);
      // Fill
      graphics.fillStyle(0xc8a84a, 1);
      graphics.fillRect(222, 232, 196 * progress, 16);
      // Border
      graphics.lineStyle(2, 0xc8a84a, 0.6);
      graphics.strokeRect(220, 230, 200, 20);
    };
    this.load.on('progress', onFileComplete);

    // Load raw sprite sheets
    this.load.image('sheet_luchador',  'src/assets/sprites/luchador.png');
    this.load.image('sheet_books',     'src/assets/sprites/books.png');
    this.load.image('sheet_shelf',     'src/assets/sprites/shelf.png');
    this.load.image('sheet_ghost',     'src/assets/sprites/ghost.png');
    this.load.image('sheet_cart',      'src/assets/sprites/cart.png');
    this.load.image('sheet_particles','src/assets/sprites/particles.png');
    this.load.image('sheet_floor',     'src/assets/tilemaps/floor.png');
  }

  create() {
    // ── Slice sprite sheets into individual textures using canvas ─────────
    const S = CONFIG.SPRITES;

    // Helper: extract a sub-image from a loaded texture into a new named texture
    const slice = (sourceName, key, sx, sy, sw, sh) => {
      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      const img = this.textures.get(sourceName).source[0].image;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      this.textures.addCanvas(key, canvas);
    };

    // Luchador: 4 frames across, 4 directions down (each 32x32)
    for (let dir = 0; dir < S.PLAYER.directions; dir++) {
      for (let frame = 0; frame < S.PLAYER.frames; frame++) {
        slice('sheet_luchador', `player_d${dir}_f${frame}`,
          frame * S.PLAYER.w, dir * S.PLAYER.h, S.PLAYER.w, S.PLAYER.h);
      }
    }

    // Books: 5 types side by side (each 16x24)
    CONFIG.BOOK_TYPES.forEach((type, i) => {
      slice('sheet_books', `book_${type}`,
        i * S.BOOK.w, 0, S.BOOK.w, S.BOOK.h);
    });

    // Ghost: 4 frames across (each 24x28)
    for (let f = 0; f < S.GHOST.frames; f++) {
      slice('sheet_ghost', `ghost_f${f}`,
        f * S.GHOST.w, 0, S.GHOST.w, S.GHOST.h);
    }

    // Floor tile variants (each 32x32)
    for (let v = 0; v < S.FLOOR.variants; v++) {
      slice('sheet_floor', `floor_${v}`,
        v * S.FLOOR.w, 0, S.FLOOR.w, S.FLOOR.h);
    }

    // Particle frames (each 8x8)
    for (let f = 0; f < S.PARTICLE.frames; f++) {
      slice('sheet_particles', `particle_${f}`,
        f * S.PARTICLE.w, 0, S.PARTICLE.w, S.PARTICLE.h);
    }

    // ── Register Phaser Animations ────────────────────────────────────────
    // Player idle (direction 0 = down, frames 0-3)
    for (let dir = 0; dir < 4; dir++) {
      const frames = [];
      for (let f = 0; f < 4; f++) {
        frames.push({ key: `player_d${dir}_f${f}` });
      }
      this.anims.create({
        key: `player_idle_${dir}`,
        frames: frames,
        frameRate: 6,
        repeat: -1
      });
    }

    // Ghost float animation
    const ghostFrames = [];
    for (let f = 0; f < 4; f++) {
      ghostFrames.push({ key: `ghost_f${f}` });
    }
    this.anims.create({
      key: 'ghost_float',
      frames: ghostFrames,
      frameRate: 8,
      repeat: -1
    });

    // ── Done — move to title ──────────────────────────────────────────────
    this.scene.start('Title');
  }
}
