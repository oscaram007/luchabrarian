// ─── TitleScene — Atmospheric Title Screen ─────────────────────────────────

class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Title' });
  }

  create() {
    const W = CONFIG.GAME_WIDTH;
    const H = CONFIG.GAME_HEIGHT;

    // ── Deep dark library background ──────────────────────────────────────
    this.cameras.main.setBackgroundColor('#0e0e1a');

    // Subtle gradient overlay
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0e0e1a, 0x0e0e1a, 0x1a1a2e, 0x1a1a2e, 1);
    bg.fillRect(0, 0, W, H);

    // Decorative shelf silhouettes along top and bottom
    bg.fillStyle(0x151525, 1);
    bg.fillRect(0, 0, W, 40);
    bg.fillRect(0, H - 30, W, 30);

    // Shelf plank lines
    bg.fillStyle(0x2a2a3e, 1);
    bg.fillRect(0, 38, W, 2);
    bg.fillRect(0, H - 31, W, 1);

    // Small book silhouettes on the top shelf
    const bookColors = [0x8b2020, 0x2050a0, 0x208050, 0xa08020, 0x6020a0];
    for (let i = 0; i < 14; i++) {
      const bx = 30 + i * 44 + (i % 3) * 4;
      const bw = 10 + (i % 3) * 4;
      const bh = 22 + (i % 4) * 3;
      bg.fillStyle(bookColors[i % bookColors.length], 1);
      bg.fillRect(bx, 40 - bh + 18, bw, bh);
    }

    // ── Title text ────────────────────────────────────────────────────────
    // Main title — chunky retro feel
    const titleText = this.add.text(W / 2, 130, 'EL BIBLIOTECA', {
      fontSize: '42px',
      fontFamily: '"Courier New", monospace',
      color: '#c8a84a',
      stroke: '#1a1a2e',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5, 0.5);

    // Subtitle
    this.add.text(W / 2, 175, 'The Luchador Librarian', {
      fontSize: '18px',
      fontFamily: '"Courier New", monospace',
      color: '#8a7a4a',
      align: 'center'
    }).setOrigin(0.5, 0.5);

    // Decorative line under title
    bg.fillStyle(0xc8a84a, 0.4);
    bg.fillRect(W/2 - 80, 195, 160, 2);

    // ── Luchador sprite (center stage) ────────────────────────────────────
    const player = this.add.image(W / 2, 290, 'player_d0_f0');
    player.setScale(3); // big and proud on the title screen
    player.setOrigin(0.5, 0.5);

    // Idle bob animation on title
    this.tweens.add({
      targets: player,
      y: 285,
      duration: 600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // ── Story blurb ───────────────────────────────────────────────────────
    const blurb = [
      'The books have been returned',
      'in the WRONG ORDER.',
      '',
      'Only one luchador librarian',
      'can restore the chaos.',
      '',
      'The library closes at midnight.'
    ].join('\n');

    this.add.text(W / 2, 400, blurb, {
      fontSize: '13px',
      fontFamily: '"Courier New", monospace',
      color: '#a0a0b8',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5, 0.5);

    // ── Press to start ────────────────────────────────────────────────────
    const startText = this.add.text(W / 2, H - 50, 'PRESS SPACE OR CLICK TO START', {
      fontSize: '14px',
      fontFamily: '"Courier New", monospace',
      color: '#c8a84a',
      align: 'center'
    }).setOrigin(0.5, 0.5);

    // Blink the prompt
    this.tweens.add({
      targets: startText,
      alpha: 0.2,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // ── Input: any key or click starts the game ───────────────────────────
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game'));
    this.input.once('pointerdown', () => this.scene.start('Game'));

    // Also accept any key
    this.input.keyboard.once('keydown', (event) => {
      if (event.code !== 'Space') this.scene.start('Game');
    });
  }
}
