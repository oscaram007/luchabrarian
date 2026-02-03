// ─── ComboSystem ─────────────────────────────────────────────────────────────
// Tracks consecutive correct book returns within the combo timeout window.
// Each successive return in the chain multiplies the score bonus.
// Displays a combo counter on screen that pulses on each hit.

class ComboSystem {
  constructor(scene) {
    this.scene = scene;
    this.combo = 0;
    this.comboTimer = 0;         // ms remaining on current combo window
    this.isActive = false;

    // ── Visual: combo text ──────────────────────────────────────────────
    this.comboText = scene.add.text(CONFIG.GAME_WIDTH / 2, 60, '', {
      fontSize: '28px',
      fontFamily: '"Courier New", monospace',
      color: '#f0c840',
      stroke: '#1a1a2e',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5, 0.5).setDepth(100).setVisible(false);

    // Listen for book filed events
    scene.events.on('book_filed', () => this.onBookFiled());
  }

  // ── Called each time a book is correctly filed ─────────────────────────
  onBookFiled() {
    this.combo++;
    this.comboTimer = CONFIG.COMBO_TIMEOUT;
    this.isActive = true;
    this._showCombo();
  }

  // ── Calculate current score multiplier ────────────────────────────────
  getMultiplier() {
    if (this.combo <= 1) return 1;
    return 1 + (this.combo - 1) * (CONFIG.SCORE_COMBO_MULTIPLIER - 1);
  }

  // ── Get current combo count ───────────────────────────────────────────
  getCombo() {
    return this.combo;
  }

  // ── Show/pulse the combo text ─────────────────────────────────────────
  _showCombo() {
    if (this.combo < 2) {
      this.comboText.setVisible(false);
      return;
    }

    this.comboText.setVisible(true);
    this.comboText.setText(`${this.combo}x COMBO!`);

    // Kill any running tweens on this text
    this.scene.tweens.killTweensOf(this.comboText);

    // Pulse scale effect
    this.comboText.setScale(1.4);
    this.scene.tweens.add({
      targets: this.comboText,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Power2'
    });

    // Color shift based on combo depth
    const colors = ['#f0c840', '#ff8840', '#ff4040', '#ff40ff', '#40ffff'];
    const colorIdx = Math.min(this.combo - 2, colors.length - 1);
    this.comboText.setColor(colors[colorIdx]);
  }

  // ── Update: countdown combo timer ─────────────────────────────────────
  update(delta) {
    if (!this.isActive) return;

    this.comboTimer -= delta;

    if (this.comboTimer <= 0) {
      // Combo expired
      this.combo = 0;
      this.isActive = false;
      this.comboText.setVisible(false);
    }
  }

  // ── Reset (e.g., on ghost hit) ────────────────────────────────────────
  reset() {
    this.combo = 0;
    this.isActive = false;
    this.comboTimer = 0;
    this.comboText.setVisible(false);
  }
}
```

That's the entire `ComboSystem.js` — **97 lines**!

**What it manages:**

1. **State Variables**:
   - `combo`: Current consecutive filing count (starts at 0)
   - `comboTimer`: Milliseconds remaining in the 3.5s window
   - `isActive`: Boolean flag (active when combo > 0)

2. **Visual Element**:
   - Large centered text at y=60, depth 100 (above everything)
   - 28px "Courier New" font
   - Dark stroke for readability
   - Hidden by default (only shows at 2+ combo)

3. **Combo Mechanics**:

   **When a book is filed**:
   - `combo++` (increments)
   - `comboTimer = 3500` (resets to 3.5 seconds)
   - `isActive = true` (starts countdown)
   - Display updates with pulse animation

   **Multiplier Formula**:
```
   combo = 1 → 1.0× (no bonus)
   combo = 2 → 1.5× (CONFIG.SCORE_COMBO_MULTIPLIER)
   combo = 3 → 2.0×
   combo = 4 → 2.5×
   combo = 5 → 3.0×
   etc.
```
   Formula: `1 + (combo - 1) × 0.5`

4. **Visual Feedback**:

   **Pulse Animation**:
   - Text scales to 1.4× instantly
   - Tweens back to 1.0× over 300ms
   - Power2 easing (smooth deceleration)
   - Kills previous tweens to prevent overlap

   **Color Progression** (based on combo depth):
```
   2x  → Gold    (#f0c840)
   3x  → Orange  (#ff8840)
   4x  → Red     (#ff4040)
   5x  → Magenta (#ff40ff)
   6x+ → Cyan    (#40ffff)
```

5. **Timer Countdown**:
   - Decrements every frame by delta
   - When timer reaches 0:
     - Combo resets to 0
     - Text hides
     - System becomes inactive

6. **Reset Conditions**:
   - Called by GameScene when ghost hits player
   - Immediately clears combo, timer, and hides text
   - No animation (instant reset for punishment feel)

7. **Event Integration**:
   - Listens to `'book_filed'` event from BookSystem
   - Automatically increments and refreshes timer
   - UISystem queries `getMultiplier()` and `getCombo()` for score calculation

**Design Philosophy**:

**Risk/Reward**:
- Combo window is generous (3.5s) but not trivial
- Encourages efficient routing (pickup → file → pickup → file)
- High combos feel rewarding (bright colors, large multipliers)

**Visual Communication**:
- Hidden until 2× (first file doesn't show anything)
- Pulse on each hit creates satisfying feedback
- Color shift shows progression visually
- Always visible during combo (constant reminder of timer)

**Punishment**:
- Ghost hit instantly resets (harsh but fair)
- Timeout is silent (no fanfare for failure)
- Forces risk assessment: "Do I have time for one more book?"

**Example Combo Chain**:
```
File 1: 100 pts  (no combo yet, text hidden)
File 2: 150 pts  (1.5× combo, text shows "2x COMBO!" in gold)
File 3: 200 pts  (2.0× combo, text shows "3x COMBO!" in orange)
File 4: 250 pts  (2.5× combo, text shows "4x COMBO!" in red)
[3.5 second pause]
Combo expires → resets to 0, text hides
