// ─── El Biblioteca — Game Configuration ────────────────────────────────────

const CONFIG = {
  // ── Display ───────────────────────────────────────────────────────────
  GAME_WIDTH: 640,
  GAME_HEIGHT: 480,
  SCALE: 2,            // pixel-art upscale factor

  // ── Tile Grid ─────────────────────────────────────────────────────────
  TILE_SIZE: 32,
  MAP_COLS: 20,        // 20 tiles wide  = 640px
  MAP_ROWS: 15,        // 15 tiles tall  = 480px

  // ── Player ────────────────────────────────────────────────────────────
  PLAYER_SPEED: 160,
  PLAYER_DASH_SPEED: 340,
  PLAYER_DASH_DURATION: 220,
  PLAYER_DASH_COOLDOWN: 600,
  CARRY_LIMIT: 3,
  SLOW_FACTOR: 0.6,    // speed multiplier when carrying max books

  // ── Books ─────────────────────────────────────────────────────────────
  BOOK_TYPES: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
  BOOK_CATEGORIES: {   // each type maps to a category label
    RED:    'Fiction',
    BLUE:   'Science',
    GREEN:  'History',
    YELLOW: 'Poetry',
    PURPLE: 'Mystery'
  },
  INITIAL_BOOKS: 5,    // books on floor at game start
  BOOKS_PER_WAVE: 3,   // additional books spawned each escalation

  // ── Shelves ───────────────────────────────────────────────────────────
  SHELF_POSITIONS: [
    // [col, row] in tile coordinates — placed around the map edges
    { x: 2,  y: 2,  type: 'RED',    label: 'Fiction' },
    { x: 14, y: 2,  type: 'BLUE',   label: 'Science' },
    { x: 2,  y: 11, type: 'GREEN',  label: 'History' },
    { x: 14, y: 11, type: 'YELLOW', label: 'Poetry' },
    { x: 8,  y: 6,  type: 'PURPLE', label: 'Mystery' },
  ],

  // ── Ghosts (Misfiled Curse enemies) ───────────────────────────────────
  GHOST_SPEED: 55,
  GHOST_SPAWN_DELAY: 8000,   // ms before first ghost
  GHOST_SPAWN_INTERVAL: 12000,

  // ── Scoring ───────────────────────────────────────────────────────────
  SCORE_BASE: 100,
  SCORE_COMBO_MULTIPLIER: 1.5,  // per consecutive correct return
  COMBO_TIMEOUT: 3500,          // ms — window for next return to chain

  // ── Time ──────────────────────────────────────────────────────────────
  GAME_TIME: 90,       // seconds — the library is closing

  // ── Escalation ────────────────────────────────────────────────────────
  ESCALATION_INTERVAL: 20000,  // every 20s, chaos increases

  // ── Sprite Dimensions (source pixels) ─────────────────────────────────
  SPRITES: {
    PLAYER:    { w: 32, h: 32, frames: 4, directions: 4 },
    BOOK:      { w: 16, h: 24 },
    SHELF:     { w: 80, h: 56 },
    GHOST:     { w: 24, h: 28, frames: 4 },
    CART:      { w: 32, h: 32 },
    PARTICLE:  { w: 8,  h: 8,  frames: 8 },
    FLOOR:     { w: 32, h: 32, variants: 4 },
  }
};
