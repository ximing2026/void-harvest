// Procedural sound for VOID HARVEST: every effect is synthesised with WebAudio, so the
// game ships no audio files and still answers every action with a sound. A tiny bass
// pulse loops under play. M mutes; the first user gesture unlocks the context.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.step = 0;
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopMusic();
    return this.muted;
  }

  tone(freq, freqEnd, ms, type, gain, when = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + ms / 1000);
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
    osc.connect(amp).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + ms / 1000 + 0.02);
  }

  noise(ms, gain, lowpass) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * (ms / 1000)));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const amp = this.ctx.createGain();
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
    src.connect(filter).connect(amp).connect(this.ctx.destination);
    src.start(t0);
  }

  collect(combo) {
    const base = 520 + Math.min(combo, 8) * 60;
    this.tone(base, base * 1.6, 110, 'sine', 0.16);
    this.tone(base * 2, base * 2.4, 70, 'triangle', 0.06, 0.02);
  }

  dash() {
    this.noise(180, 0.12, 2400);
    this.tone(220, 660, 160, 'sawtooth', 0.04);
  }

  explode() {
    this.noise(320, 0.3, 700);
    this.tone(120, 34, 340, 'sine', 0.32);
  }

  hurt() {
    this.tone(180, 60, 260, 'square', 0.18);
    this.noise(200, 0.18, 900);
  }

  upgrade() {
    [440, 554, 659, 880].forEach((f, i) => this.tone(f, f, 150, 'triangle', 0.12, i * 0.07));
  }

  launch() {
    [330, 415, 494, 659].forEach((f, i) => this.tone(f, f * 1.01, 130, 'triangle', 0.1, i * 0.06));
  }

  gameOver() {
    [392, 330, 262, 196].forEach((f, i) => this.tone(f, f * 0.94, 260, 'sawtooth', 0.1, i * 0.17));
  }

  startMusic() {
    if (this.musicTimer || !this.ctx) return;
    const bass = [55, 55, 82.4, 55, 65.4, 55, 98, 73.4];
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const f = bass[this.step % bass.length];
      this.tone(f, f, 210, 'triangle', 0.075);
      if (this.step % 2 === 0) this.tone(f * 4, f * 4, 90, 'sine', 0.02);
      this.step++;
    }, 224);
  }

  stopMusic() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
  }
}
