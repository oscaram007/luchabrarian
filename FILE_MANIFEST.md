# The Luchabrarian — Complete File Manifest

## Project Overview
A playable luchador librarian game with two implementations:
1. **el_biblioteca_sim.html** — Single-file Canvas 2D simulation (UPDATED with all features)
2. **Original Phaser.js project** — Full modular game engine implementation

---

## 📁 File Directory Structure

```
/mnt/user-data/outputs/
├── el_biblioteca_sim.html          ← MAIN PLAYABLE FILE (single-file simulation)
├── index.html                       ← Phaser.js project entry point
├── README.md                        ← Project documentation
├── generate_sprites.js              ← Procedural sprite generator
├── FILE_MANIFEST.md                ← This file
├── docs/
│   └── design.md                   ← Design philosophy & system breakdowns
└── src/
    ├── config.js                   ← Game constants
    ├── main.js                     ← Phaser boot configuration
    ├── scenes/
    │   ├── BootScene.js           ← Asset loading
    │   ├── TitleScene.js          ← Title screen
    │   ├── GameScene.js           ← Main gameplay
    │   └── GameOverScene.js       ← Win/lose screen
    ├── entities/
    │   ├── Player.js              ← Luchador: movement, dash, carry
    │   ├── Book.js                ← Book: types, pickup, filing
    │   ├── Shelf.js               ← Shelf: accepts books, glows on match
    │   └── Ghost.js               ← Enemy: chase AI, drops books
    ├── systems/
    │   ├── BookSystem.js          ← Book lifecycle management
    │   ├── ComboSystem.js         ← Consecutive return tracking
    │   └── UISystem.js            ← HUD rendering
    └── assets/
        ├── sprites/               ← Generated PNG sprite sheets
        │   ├── luchador.png      (980 bytes, 128×128)
        │   ├── books.png         (220 bytes, 80×24)
        │   ├── shelf.png         (266 bytes, 80×56)
        │   ├── ghost.png         (267 bytes, 96×28)
        │   ├── cart.png          (187 bytes, 32×32)
        │   └── particles.png     (134 bytes, 64×8)
        └── tilemaps/
            └── floor.png         (253 bytes, 128×32)
```

**Total Files:** 26  
**Main Implementation:** `el_biblioteca_sim.html` (48 KB, 1400+ lines)

---

## 🎮 Main Playable File: el_biblioteca_sim.html

### Features Implemented
- **9 book categories**: Romance (pink), Science (green), Horror (purple), Sci-Fi (blue), Tablets (bright blue), Forbidden (black), Manga (gold), Mystery (gray), Trash (orange)
- **Trash can system**: Trash books go into a procedurally-drawn trash can, not a shelf
- **Health system**: 100% → 0%, ghosts deal 20% damage per hit, health depleted = game over
- **Health bar**: Heart icon + segmented fill bar + percentage display
- **Danger flash**: At ≤15% health, entire health section pulses (heart, bar, label, percentage)
- **Pause menu**: Press ESC to pause, shows overlay with score, Resume (ESC), Quit to Title (Enter)
- **Controls**: WASD/Arrows (move), Space (dash), walk over books (pickup), walk into shelf/trash (file), ESC (pause)
- **Game states**: Title → Play → Paused ↔ Play → GameOver → Title
- **Combo system**: 3.5s window, 1.5× multiplier per chain
- **Wave escalation**: Every 20s, +3 books spawn, ghost interval shrinks
- **Win/lose conditions**: All books filed = win, time runs out OR health depleted = lose
- **Distinct death messages**: "The ghosts defeated you" vs "N books left unfiled"

### Technical Details
- **Rendering**: Pure Canvas 2D API
- **Size**: 48 KB single-file HTML
- **Dependencies**: None (standalone HTML/CSS/JS)
- **Browser**: Works in any modern browser, no build step
- **Performance**: 60 FPS cap with delta time smoothing

---

## 📦 Phaser.js Project Files

### Core Files (5)
1. **index.html** — Phaser canvas host + script loader
2. **src/config.js** — All game constants (speeds, timers, scoring, dimensions)
3. **src/main.js** — Phaser.Game initialization
4. **README.md** — Setup instructions, controls, roadmap
5. **docs/design.md** — Core philosophy, loop breakdown, visual decisions

### Scenes (4)
1. **BootScene.js** — Loads sprites, slices into textures via canvas, creates animations
2. **TitleScene.js** — Atmospheric title with animated luchador, blinking start prompt
3. **GameScene.js** — Main game loop (floor, entities, collision, escalation, particles)
4. **GameOverScene.js** — Win/lose screen with animated score counter

### Entities (4)
1. **Player.js** — 4-directional movement, dash mechanic, carry state (max 3), direction animation
2. **Book.js** — 5 types with category labels, state machine (floor/carried/filed), bob animation
3. **Shelf.js** — Type matching, glow when player carries correct book, 3 visual slots
4. **Ghost.js** — Direct chase AI, float animation, contact drops all books + resets combo

### Systems (3)
1. **BookSystem.js** — Spawning, pickup collision, shelf filing, wave escalation, ghost-hit drop
2. **ComboSystem.js** — Consecutive return window (3.5s), score multiplier, visual counter
3. **UISystem.js** — HUD (score, timer, carry slots), wave announcements, feedback labels

### Assets (7 sprite sheets)
All generated by **generate_sprites.js** using raw PNG encoding (no external libs):
1. **luchador.png** — 128×128 (32×32 frames: 4 idle × 4 directions)
2. **books.png** — 80×24 (16×24 per book: 5 types)
3. **shelf.png** — 80×56 (single wood shelf)
4. **ghost.png** — 96×28 (24×28: 4 float frames)
5. **cart.png** — 32×32 (decorative cart)
6. **particles.png** — 64×8 (8×8: 8 decay stages)
7. **floor.png** — 128×32 (32×32: 4 tile variants)

---

## 🚀 How to Run

### Option 1: Single-File Simulation (Recommended)
```bash
# Just open in browser
open el_biblioteca_sim.html
```

### Option 2: Phaser.js Project (Full Implementation)
```bash
# Local play (no server needed)
open index.html

# Or serve via HTTP (for full CDN asset loading)
python3 -m http.server 8000
# Navigate to http://localhost:8000
```

### Option 3: GitHub Pages
```bash
# Push to GitHub repo
# Settings → Pages → source: main branch at /
# Live at: https://your-username.github.io/repo-name/
```

---

## 🎨 Procedural Sprite Generation

**generate_sprites.js** creates all pixel art programmatically:
- **Method**: Raw PNG encoding via Node.js Buffer + zlib
- **Dependencies**: None (pure Node.js built-ins)
- **Output**: 7 PNG files totaling 2.3 KB
- **Palette**: 30+ pre-defined colors (luchador mask, book types, shelf wood, ghost wisp)
- **Regeneration**: Edit generator → run `node generate_sprites.js` → sprites update

---

## 📊 Code Statistics

| File | Lines | Bytes | Purpose |
|---|---|---|---|
| el_biblioteca_sim.html | 1,400 | 48 KB | Complete playable simulation |
| GameScene.js | 280 | 10 KB | Phaser main game loop |
| Player.js | 180 | 7 KB | Luchador entity |
| BookSystem.js | 200 | 8 KB | Book lifecycle manager |
| UISystem.js | 240 | 10 KB | HUD & feedback system |
| generate_sprites.js | 496 | 20 KB | Procedural sprite generator |

**Total Project Size**: ~120 KB (including all assets)

---

## 🗺️ Game Systems Summary

### Core Loop
```
Books on floor → Scan category → Navigate/dodge ghosts → 
Pickup (max 3) → Route to shelf → File → Score + Combo → Repeat
```

### Escalation
- Wave every 20s: +3 books, ghost interval -2s
- Ghost spawn: First at 8s, then every 12s (shrinking)
- Time: 90s countdown, warning flash at 15s

### Scoring
- Base: 100 points per correct filing
- Combo: 3.5s window, 1.5× multiplier per chain
- Resets: Ghost hit or combo timeout

### Health System (Simulation Only)
- Start: 100%
- Damage: -20% per ghost hit
- Game Over: 0% health
- Visual: Heart icon + segmented bar + percentage + danger flash at ≤15%

---

## 🎯 Key Differences: Simulation vs Phaser

| Feature | el_biblioteca_sim.html | Phaser Project |
|---|---|---|
| **File Count** | 1 | 26 |
| **Size** | 48 KB | ~120 KB total |
| **Dependencies** | None | Phaser 3.60 CDN |
| **Engine** | Raw Canvas 2D | Phaser.js |
| **Physics** | Manual collision | Phaser Arcade |
| **Book Types** | 9 categories | 5 types |
| **Trash Can** | ✓ (procedural) | ✗ |
| **Health System** | ✓ (full HUD) | ✗ |
| **Pause Menu** | ✓ (ESC overlay) | ✗ |
| **Deployment** | Drop & play | Requires server |

---

## 🔧 Technology Stack

### Simulation
- **Rendering**: HTML5 Canvas 2D
- **Language**: Vanilla JavaScript (ES6)
- **Build**: None (single file)
- **Hosting**: Any static host

### Phaser Project
- **Engine**: Phaser.js 3.60 (CDN)
- **Language**: JavaScript (ES5-compatible)
- **Physics**: Phaser Arcade (no gravity)
- **Assets**: Procedural PNG generation
- **Hosting**: GitHub Pages (zero build)

---

## 📝 License & Credits

**Created by**: Claude (Anthropic)  
**License**: See project root  
**Assets**: Procedurally generated (no external resources)  
**Font**: "Press Start 2P" (Google Fonts)
