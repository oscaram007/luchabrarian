// ─── GameOverScene — Win / Lose Screen ──────────────────────────────────────

class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOver' });
  }

  init(data) {
    this.won = data.won;
    this.finalScore = data.score || 0;
    this.booksLeft = data.booksLeft || 0;
  }

  create() {
    const W = CONFIG.GAME_WIDTH;
    const H = CONFIG.GAME_HEIGHT;

    // ── Background ────────────────────────────────────────────────────
    this.cameras.main.setBackgroundColor('#0a0a14');

    // Dark vignette
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a14, 0x0a0a14, 0x14142a, 0x14142a, 1);
    bg.fillRect(0, 0, W, H);

    // ── Header ────────────────────────────────────────────────────────
    if (this.won) {
      // Victory!
      this.add.text(W / 2, 90, '★ ORDER RESTORED ★', {
        fontSize: '34px',
        fontFamily: '"Courier New", monospace',
        color: '#f0c840',
        stroke: '#0a0a14',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5, 0.5);

      this.add.text(W / 2, 130, 'The library is saved.', {
        fontSize: '16px',
        fontFamily: '"Courier New", monospace',
        color: '#a0a0b8',
        align: 'center'
      }).setOrigin(0.5, 0.5);
    } else {
      // Defeat
      this.add.text(W / 2, 90, '★ LIBRARY CLOSED ★', {
        fontSize: '34px',
        fontFamily: '"Courier New", monospace',
        color: '#d62a2a',
        stroke: '#0a0a14',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5, 0.5);

      this.add.text(W / 2, 130, `${this.booksLeft} book${this.booksLeft !== 1 ? 's' : ''} left unfiled.`, {
        fontSize: '16px',
        fontFamily: '"Courier New", monospace',
        color: '#a0a0b8',
        align: 'center'
      }).setOrigin(0.5, 0.5);
    }

    // ── Luchador (smaller, at bottom) ─────────────────────────────────
    const player = this.add.image(W / 2, 220, 'player_d0_f0');
    player.setScale(2.5);
    player.setOrigin(0.5, 0.5);

    // Idle bob
    this.tweens.add({
      targets: player,
      y: 216,
      duration: 700,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // ── Score display ─────────────────────────────────────────────────
    this.add.text(W / 2, 310, 'FINAL SCORE', {
      fontSize: '12px',
      fontFamily: '"Courier New", monospace',
      color: '#6a6a8a',
      align: 'center'
    }).setOrigin(0.5, 0.5);

    const scoreText = this.add.text(W / 2, 345, '0', {
      fontSize: '48px',
      fontFamily: '"Courier New", monospace',
      color: '#f0c840',
      stroke: '#0a0a14',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5, 0.5);

    // Animate score counting up
    let displayed = 0;
    const target = this.finalScore;
    const duration = 1200;
    const startTime = this.time.now;

    this.time.addEvent({
      delay: 30,
      loop: true,
      callback: () => {
        const elapsed = this.time.now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        displayed = Math.round(target * progress);
        scoreText.setText(displayed.toString());
        if (progress >= 1) return;
      }
    });

    // ── Decorative line ───────────────────────────────────────────────
    const line = this.add.graphics();
    line.fillStyle(this.won ? 0xf0c840 : 0xd62a2a, 0.3);
    line.fillRect(W / 2 - 60, 380, 120, 2);

    // ── Play again button ─────────────────────────────────────────────
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x1a1a2e, 0.9);
    btnBg.fillRoundedRect(W / 2 - 80, 405, 160, 40, 6);
    btnBg.lineStyle(2, this.won ? 0xf0c840 : 0xd62a2a, 0.8);
    btnBg.strokeRoundedRect(W / 2 - 80, 405, 160, 40, 6);

    const btnText = this.add.text(W / 2, 425, 'PLAY AGAIN', {
      fontSize: '16px',
      fontFamily: '"Courier New", monospace',
      color: this.won ? '#f0c840' : '#d62a2a',
      align: 'center'
    }).setOrigin(0.5, 0.5);

    // Blink
    this.tweens.add({
      targets: btnText,
      alpha: 0.4,
      duration: 700,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // ── Input: restart ────────────────────────────────────────────────
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game'));
    this.input.once('pointerdown', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Game'));

    // ── Title link ────────────────────────────────────────────────────
    this.add.text(W / 2, H - 25, 'Press SPACE or click to play again  |  ESC for title', {
      fontSize: '10px',
      fontFamily: '"Courier New", monospace',
      color: '#4a4a6a',
      align: 'center'
    }).setOrigin(0.5, 0.5);

    this.input.keyboard.once('keydown-ESC', () => this.scene.start('Title'));
  }
}
