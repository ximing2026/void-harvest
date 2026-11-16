// Keyboard and mouse state for VOID HARVEST. The game polls this object once a frame;
// nothing here knows about the game itself, only about what the player is holding,
// pressing and pointing at.

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = { x: 0, y: 0, down: false, clicked: false };
    this.canvas = canvas;

    addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.key.toLowerCase());
      this.keys.add(e.key.toLowerCase());
    });
    addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => this.keys.clear());

    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - r.left) / r.width) * canvas.width;
      this.mouse.y = ((e.clientY - r.top) / r.height) * canvas.height;
    });
    canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.mouse.down = true;
      this.mouse.clicked = true;
      const r = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - r.left) / r.width) * canvas.width;
      this.mouse.y = ((e.clientY - r.top) / r.height) * canvas.height;
    });
    addEventListener('mouseup', () => { this.mouse.down = false; });
  }

  /** Whether a movement direction is held: WASD and the arrow keys both steer. */
  axis() {
    const k = this.keys;
    return {
      x: (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0),
      y: (k.has('s') || k.has('arrowdown') ? 1 : 0) - (k.has('w') || k.has('arrowup') ? 1 : 0),
    };
  }

  dashHeld() {
    return this.keys.has('shift') || this.keys.has(' ') || this.mouse.down;
  }

  /** Whether a key went down this frame (not merely held). Clears at end of frame. */
  tapped(key) {
    return this.pressed.has(key);
  }

  /** The mouse was clicked this frame. Clears at end of frame. */
  clicked() {
    return this.mouse.clicked;
  }

  endFrame() {
    this.pressed.clear();
    this.mouse.clicked = false;
  }
}
