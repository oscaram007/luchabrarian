// ─── El Biblioteca — Game Boot ──────────────────────────────────────────────
// Configures and launches the Phaser game instance.

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: CONFIG.GAME_WIDTH,
  height: CONFIG.GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0e0e1a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },      // top-down — no gravity
      debug: false             // set true to see hitboxes
    }
  },
  scene: [
    BootScene,
    TitleScene,
    GameScene,
    GameOverScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
});
