// Efeitos discretos de interface.
// Extraído de script.js na Fase 5 da refatoração segura.
// Não alterar comportamento nem aparência nesta fase.

function playSoftBell() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const audioCtx = new AudioContext();
  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.18, now + 0.018);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);
  master.connect(audioCtx.destination);

  [
    { freq: 660, gain: 0.55, decay: 1.2 },
    { freq: 990, gain: 0.28, decay: 0.9 },
    { freq: 1320, gain: 0.12, decay: 0.6 },
  ].forEach(({ freq, gain, decay }) => {
    const osc = audioCtx.createOscillator();
    const toneGain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    toneGain.gain.setValueAtTime(gain, now);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(toneGain);
    toneGain.connect(master);
    osc.start(now);
    osc.stop(now + decay + 0.04);
  });

  window.setTimeout(() => audioCtx.close(), 1500);
}

function drawDecor() {
  const c = decorCanvas;
  const ctx = c.getContext('2d');
  const w = c.width;
  const h = c.height;

  ctx.clearRect(0, 0, w, h);

  // Fundo super sutil
  ctx.globalAlpha = 1;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(42,35,26,0.12)');
  grad.addColorStop(1, 'rgba(42,35,26,0.00)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // linhas orgânicas
  ctx.strokeStyle = 'rgba(42,35,26,0.18)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    const y = h * (0.35 + i * 0.08);
    ctx.moveTo(-30, y);
    for (let x = -10; x <= w + 20; x += 20) {
      const yy = y + Math.sin((x + i * 10) / 60) * (8 + i);
      ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
}
