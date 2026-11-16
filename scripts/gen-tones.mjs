// Generates the game's sound effects as small 16-bit mono WAV files.
// Run with: node scripts/gen-tones.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SAMPLE_RATE = 44100;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

/**
 * A note: frequency (Hz, optionally sliding to `to`), duration, start offset,
 * waveform and volume. Each note gets a short attack and exponential decay.
 */
function render(notes, totalMs) {
  const length = Math.round((SAMPLE_RATE * totalMs) / 1000);
  const samples = new Float32Array(length);
  for (const note of notes) {
    const start = Math.round((SAMPLE_RATE * (note.at ?? 0)) / 1000);
    const count = Math.round((SAMPLE_RATE * note.ms) / 1000);
    const attack = Math.round(SAMPLE_RATE * 0.004);
    let phase = 0;
    for (let i = 0; i < count && start + i < length; i++) {
      const t = i / count;
      const freq = note.to ? note.freq + (note.to - note.freq) * t : note.freq;
      phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      const wave = note.wave === 'square' ? Math.sign(Math.sin(phase)) * 0.5 : Math.sin(phase);
      const envelope = Math.min(1, i / attack) * Math.exp(-t * (note.decay ?? 5));
      samples[start + i] += wave * envelope * (note.gain ?? 0.6);
    }
  }
  return samples;
}

function toWav(samples) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((value, i) => {
    buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, value)) * 32767), 44 + i * 2);
  });
  return buffer;
}

const SOUNDS = {
  // Soft high blip for the final seconds of the study countdown.
  tick: render([{ freq: 1320, ms: 45, decay: 8, gain: 0.35 }], 50),
  // Short pop when a tile is chosen.
  select: render([{ freq: 660, to: 880, ms: 70, decay: 6, gain: 0.45 }], 75),
  // Rising two-note chime for a perfect round.
  success: render(
    [
      { freq: 784, ms: 140, decay: 4 },
      { freq: 1175, ms: 220, at: 110, decay: 4 },
    ],
    340,
  ),
  // Low falling buzz for a missed round.
  error: render([{ freq: 220, to: 150, ms: 260, decay: 3, wave: 'square', gain: 0.35 }], 270),
};

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, samples] of Object.entries(SOUNDS)) {
  writeFileSync(join(OUT_DIR, `${name}.wav`), toWav(samples));
  console.log(`wrote assets/sounds/${name}.wav`);
}
