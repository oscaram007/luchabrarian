// ─── UISystem ────────────────────────────────────────────────────────────────
// Renders the HUD: score, countdown timer, carried books indicator,
// wave announcements, and the "library closing" warning.

class UISystem {
  constructor(scene, comboSystem) {
    this.scene = scene;
    this.comboSystem = comboSystem;
    this.score = 0;
    this.timeLeft = CONFIG.GAME_TIME;

    const W = CONFIG.GAME_WIDTH;

    // ── HUD Background bar ────────────────────────────────────────────
    this.hudBg = scene.add.graphics().setDepth(90);
    this.hudBg.fillStyle(0x0e0e1a, 0.85);
    this.hudBg.fillRect(0, 0, W, 36);
    this.hudBg.lineStyle(1, 0x2a2a4a, 1);
    this.hudBg.lineBetween(0, 36, W, 36);

    // ── Score ─────────────────────────────────────────────────────────
    this.scoreLabel = scene.add.text(16, 8, 'SCORE', {
      fontSize: '10px',
      fontFamily: '"Courier New", monospace',
      color: '#6a6a8a'
    }).setDepth(91);

    this.scoreText = scene.add.text(16, 20, '0', {
      fontSize: '16px',
      fontFamily: '"Courier New", monospace',
      color: '#f0c840'
    }).setDepth(91);

    // ── Timer ─────────────────────────────────────────────────────────
    this.timerLabel = scene.add.text(W - 100, 8, 'TIME', {
      fontSize: '10px',
      fontFamily: '"Courier New", monospace',
      color: '#6a6a8a'
    }).setDepth(91).setOrigin(0, 0);

    this.timerText = scene.add.text(W - 100, 20, '90', {
      fontSize: '16px',
      fontFamily: '"Courier New", monospace',
      color: '#e04040'
    }).setDepth(91).setOrigin(0, 0);

    // ── Carried books indicator (center) ──────────────────────────────
    this.carryLabel = scene.add.text(W / 2, 8, 'CARRYING', {
      fontSize: '10px',
      fontFamily: '"Courier New", monospace',
      color: '#6a6a8a'
    }).setDepth(91).setOrigin(0.5, 0);

    // Book slot indicators
    this.carrySlots = [];
    for (let i = 0; i < CONFIG.CARRY_LIMIT; i++) {
      const slot = scene.add.graphics().setDepth(91);
      this.carrySlots.push(slot);
    }

    // ── Wave announcement text (center screen) ───────────────────────
    this.waveText = scene.add.text(W / 2, H / 2, '', {
      fontSize: '32px',
      fontFamily: '"Courier New", monospace',
      color: '#d62a2a',
      stroke: '#0e0e1a',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5, 0.5).setDepth(100).setVisible(false);

    // ── Warning flash (when time is low) ──────────────────────────────
    this.warningFlash = scene.add.graphics().setDepth(95);
    this.warningFlashTimer = 0;
    this.warningFlashOn = false;

    // ── Pickup feedback text ──────────────────────────────────────────
    this.feedbackText = scene.add.text(W / 2, 80, '', {
      fontSize: '18px',
      fontFamily: '"Courier New", monospace',
      color: '#ffffff',
      stroke: '#1a1a2e',
      strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5, 0.5).setDepth(100).setVisible(false);

    this.feedbackTimer = 0;

    // Listen for events
    scene.events.on('book_filed', (book, shelf) => this._onBookFiled(book, shelf));
  }

  // ── Add score ─────────────────────────────────────────────────────────
  addScore(points) {
    this.score += points;
    this.scoreText.setText(this.score.toString());

    // Brief scale pulse on score
    this.scene.tweens.killTweensOf(this.scoreText);
    this.scoreText.setScale(1.3);
    this.scene.tweens.add({
      targets: this.scoreText,
      scaleX: 1, scaleY: 1,
      duration: 200,
      ease: 'Power2'
    });
  }

  // ── On correct book filed ─────────────────────────────────────────────
  _onBookFiled(book, shelf) {
    const combo = this.comboSystem.getCombo();
    const multiplier = this.comboSystem.getMultiplier();
    const points = Math.round(CONFIG.SCORE_BASE * multiplier);
    this.addScore(points);

    // Show feedback
    const feedbackColor = combo >= 3 ? '#ff4040' : combo >= 2 ? '#ff8840' : '#40ff80';
    this._showFeedback(
      combo >= 2 ? `+${points} (${combo}x)` : `+${points}`,
      feedbackColor
    );
  }

  // ── Show brief feedback text ──────────────────────────────────────────
  _showFeedback(msg, color) {
    this.feedbackText.setText(msg);
    this.feedbackText.setColor(color || '#ffffff');
    this.feedbackText.setVisible(true);
    this.feedbackText.setAlpha(1);
    this.feedbackText.setScale(1.2);
    this.feedbackTimer = 1200;

    this.scene.tweens.killTweensOf(this.feedbackText);
    this.scene.tweens.add({
      targets: this.feedbackText,
      scaleX: 1, scaleY: 1,
      duration: 300,
      ease: 'Power2'
    });
  }

  // ── Show wave announcement ────────────────────────────────────────────
  showWaveAnnouncement(wave) {
    this.waveText.setText(`WAVE ${wave}\nMore books!`);
    this.waveText.setVisible(true);
    this.waveText.setAlpha(1);
    this.waveText.setScale(1.3);

    this.scene.tweens.add({
      targets: this.waveText,
      scaleX: 1, scaleY: 1,
      duration: 400,
      ease: 'Power2'
    });

    this.scene.time.delayedCall(1800, () => {
      this.scene.tweens.add({
        targets: this.waveText,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => this.waveText.setVisible(false)
      });
    });
  }

  // ── Update ──────────────────────────────────────────────────────────────
  update(delta, player, bookSystem) {
    // ── Timer countdown ───────────────────────────────────────────────
    this.timeLeft -= delta / 1000;
    if (this.timeLeft < 0) this.timeLeft = 0;

    const secs = Math.ceil(this.timeLeft);
    this.timerText.setText(secs.toString());

    // Warning color when time is low
    if (secs <= 15) {
      this.timerText.setColor('#ff2020');
      // Flash warning
      this.warningFlashTimer += delta;
      if (this.warningFlashTimer > 400) {
        this.warningFlashTimer = 0;
        this.warningFlashOn = !this.warningFlashOn;
        this.warningFlash.clear();
        if (this.warningFlashOn) {
          this.warningFlash.fillStyle(0xff0000, 0.06);
          this.warningFlash.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        }
      }
    } else if (secs <= 30) {
      this.timerText.setColor('#ff8040');
    } else {
      this.timerText.setColor('#e04040');
    }

    // ── Carried books display ─────────────────────────────────────────
    const bookColors = {
      RED: 0xd62a2a, BLUE: 0x4a8cff, GREEN: 0x2aaa5c,
      YELLOW: 0xd4a82e, PURPLE: 0xaa4aff
    };
    const W = CONFIG.GAME_WIDTH;
    const slotStartX = W / 2 - (CONFIG.CARRY_LIMIT * 22) / 2;

    this.carrySlots.forEach((slot, i) => {
      slot.clear();
      const sx = slotStartX + i * 22;
      const sy = 18;

      if (i < player.carrying.length) {
        // Filled slot — draw book icon
        const book = player.carrying[i];
        slot.fillStyle(bookColors[book.type] || 0xffffff, 1);
        slot.fillRect(sx, sy, 14, 12);
        slot.lineStyle(1, 0x000000, 0.6);
        slot.strokeRect(sx, sy, 14, 12);
      } else {
        // Empty slot — dim outline
        slot.lineStyle(1, 0x3a3a5a, 0.5);
        slot.strokeRect(sx, sy, 14, 12);
      }
    });

    // ── Feedback text fade ────────────────────────────────────────────
    if (this.feedbackTimer > 0) {
      this.feedbackTimer -= delta;
      if (this.feedbackTimer <= 0) {
        this.feedbackText.setVisible(false);
      } else if (this.feedbackTimer < 400) {
        this.feedbackText.setAlpha(this.feedbackTimer / 400);
      }
    }

    return secs; // return for game-over check
  }

  // ── Destroy ─────────────────────────────────────────────────────────────
  destroy() {
    this.hudBg.destroy();
    this.scoreLabel.destroy();
    this.scoreText.destroy();
    this.timerLabel.destroy();
    this.timerText.destroy();
    this.carryLabel.destroy();
    this.carrySlots.forEach(s => s.destroy());
    this.waveText.destroy();
    this.warningFlash.destroy();
    this.feedbackText.destroy();
  }
}

const H = CONFIG.GAME_HEIGHT; // available for UISystem constructor
