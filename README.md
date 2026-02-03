# El Biblioteca — The Luchador Librarian

A 32-bit style top-down platform game built with **Phaser.js**.

You are **El Biblioteca** — a masked luchador librarian defending order against the chaos of misfiled books. Pick up books, identify the correct shelf by category, dodge ghostly curses, and return everything before the library closes at midnight.

---

## Playing the Game

The game is designed to be hosted via **GitHub Pages** with zero build step.

1. Clone or fork the repo
2. Enable GitHub Pages (Settings → Pages → branch: `main`, folder: `/`)
3. Your game is live at `https://your-username.github.io/el-biblioteca/`

Or just open `index.html` locally — no server required for local play.

---

## Controls

| Key | Action |
|---|---|
| **Arrow Keys** or **WASD** | Move |
| **Shift** | Dash (luchador sprint) |
| **E** | File a book (when near correct shelf) |
| Walk over a book | Auto-pickup |
| Walk into a shelf with the right book | Auto-file |

---

## How It Works

### Core Loop
1. Books are scattered on the library floor
2. Walk over books to pick them up (max 3 at a time)
3. Each book has a **category** label — match it to the correct shelf
4. Shelves **glow** when you're near with the right book
5. File books to score points and build combos
6. New waves of books spawn as chaos escalates
7. Ghosts appear — touching one drops all your books
8. The clock counts down. File everything before time runs out.

### Scoring
- **100 points** per correct filing
- **Combo system**: consecutive correct returns within 3.5 seconds multiply your score
- Combos reset if you get hit by a ghost or let the window expire

### Escalation
Every 20 seconds, a new wave of books spawns and ghosts become more frequent. Ghost spawn intervals shrink as the game progresses.

---

## Project Structure

```
el-biblioteca/
├── index.html                  ← Game entry point (canvas host)
├── src/
│   ├── config.js               ← All game constants in one place
│   ├── main.js                 ← Phaser boot configuration
│   ├── scenes/
│   │   ├── BootScene.js        ← Asset loading + texture slicing
│   │   ├── TitleScene.js       ← Title screen
│   │   ├── GameScene.js        ← Main game loop
│   │   └── GameOverScene.js    ← Win/lose screen
│   ├── entities/
│   │   ├── Player.js           ← Luchador: movement, dash, carry
│   │   ├── Book.js             ← Book: types, pickup, filing
│   │   ├── Shelf.js            ← Shelf: accepts books, glows on match
│   │   └── Ghost.js            ← Enemy: chases player, drops books on contact
│   ├── systems/
│   │   ├── BookSystem.js       ← Book lifecycle, pickup, filing, waves
│   │   ├── ComboSystem.js      ← Consecutive return tracking + multiplier
│   │   └── UISystem.js         ← HUD: score, timer, carry slots, feedback
│   └── assets/
│       ├── sprites/            ← Generated pixel-art sprite sheets (PNG)
│       └── tilemaps/           ← Floor tile sheet
├── generate_sprites.js         ← Sprite generation script (run once)
├── docs/                       ← Design notes and roadmap
└── README.md
```

## Tech Stack

| Layer | Tool |
|---|---|
| Game Engine | Phaser.js 3.60 (CDN) |
| Language | JavaScript (ES5 compatible) |
| Rendering | HTML5 Canvas via Phaser |
| Physics | Phaser Arcade (lightweight, no gravity) |
| Assets | Procedurally generated pixel-art PNGs |
| Hosting | GitHub Pages (zero build) |

---

## Roadmap

### Milestone 1 — Playable Core ✓ *(current)*
- [x] Luchador sprite with directional animation
- [x] Top-down movement with dash mechanic
- [x] 5 book types with category labels
- [x] 5 shelves that accept correct book types
- [x] Pickup, carry (limit 3), and file loop
- [x] Ghost enemies that chase and drop books
- [x] Combo system with score multiplier
- [x] 90-second countdown timer
- [x] Wave escalation every 20 seconds
- [x] Win (all filed) and lose (time expired) states
- [x] Particle effects (pickup, dash, ghost trail/burst)
- [x] HUD with score, timer, carry slots, combo display

### Milestone 2 — Polish & Depth *(next)*
- [ ] Suplex animation (throw carts at ghosts)
- [ ] Sound effects (pickup, file, ghost hit, combo)
- [ ] More shelf layouts and map variety
- [ ] High score persistence (localStorage)
- [ ] Difficulty settings
- [ ] More enemy types (misfiled pixies, etc.)

### Milestone 3 — Expansion
- [ ] Story campaign with multiple levels
- [ ] Boss encounters
- [ ] Unlockable masks / outfits
- [ ] Co-op support (2 players, split keyboard)
