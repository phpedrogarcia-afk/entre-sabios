// Compartilhamento e geração de imagem.
// Extraído de script.js na Fase 4 da refatoração segura.

function getShareSourceLabel(source) {
  if (typeof source === 'string') return source.trim();
  return String(source?.title || '').trim();
}

function formatShareAttribution(attribution, source) {
  const cleanAttribution = String(attribution || '').trim() || 'Entre Sábios';
  const cleanSource = getShareSourceLabel(source);
  if (!cleanSource || cleanSource.localeCompare(cleanAttribution, 'pt-BR', { sensitivity: 'base' }) === 0) {
    return cleanAttribution;
  }
  return `${cleanAttribution} · ${cleanSource}`;
}

function getSharePayload() {
  if (currentStory) {
    return {
      quote: currentStory.quote,
      attribution: currentStory.attribution || currentStory.displayAuthor || currentStory.author,
      source: getShareSourceLabel(currentStory.source),
    };
  }

  return {
    quote: quoteTextEl.textContent.replace(/[“”]/g, '').trim() || 'A sabedoria começa quando prestamos atenção ao momento presente.',
    attribution: quoteAuthorEl.textContent.replace(/^—\s*/, '').trim() || 'Entre Sábios',
    source: '',
  };
}

function getShareMessage() {
  const payload = getSharePayload();
  const attribution = formatShareAttribution(payload.attribution, payload.source);
  return `“${payload.quote.replace(/[“”]/g, '').trim()}”\n— ${attribution}\n\nentresabios.com`;
}

function getRandomShareStyle() {
  const availableStyles = Object.keys(shareCardThemes);
  return availableStyles[Math.floor(Math.random() * availableStyles.length)] || 'sage';
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function wrapCanvasText(ctx, text, maxWidth) {
  const lines = [];
  const paragraphs = String(text).split(/\r?\n/);

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const words = paragraph.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
    let currentLine = '';

    words.forEach((word) => {
      const parts = [];
      let remainingWord = word;
      while (remainingWord && ctx.measureText(remainingWord).width > maxWidth) {
        let end = remainingWord.length - 1;
        while (end > 1 && ctx.measureText(remainingWord.slice(0, end)).width > maxWidth) end -= 1;
        parts.push(remainingWord.slice(0, end));
        remainingWord = remainingWord.slice(end);
      }
      if (remainingWord) parts.push(remainingWord);

      parts.forEach((part) => {
        const testLine = currentLine ? `${currentLine} ${part}` : part;
        if (ctx.measureText(testLine).width <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = part;
        }
      });
    });

    if (currentLine) lines.push(currentLine);
    if (paragraphIndex < paragraphs.length - 1 && lines.at(-1) !== '') lines.push('');
  });
  return lines;
}

function drawLeaf(ctx, x, y, size, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.55, -size * 0.5, size * 1.15, -size * 0.2, size * 1.45, 0);
  ctx.bezierCurveTo(size * 1.08, size * 0.28, size * 0.5, size * 0.48, 0, 0);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.035);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 1.25, 0);
  ctx.stroke();
  ctx.restore();
}

function drawBranch(ctx, x, y, scale, angle, theme, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(flip ? -scale : scale, scale);
  ctx.strokeStyle = theme.leafDark;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(24, -70, 56, -132, 98, -198);
  ctx.stroke();

  [
    [24, -46, 42, -0.95],
    [42, -88, 50, 0.28],
    [66, -128, 48, -0.84],
    [84, -170, 42, 0.18],
  ].forEach(([lx, ly, size, leafAngle]) => {
    drawLeaf(ctx, lx, ly, size, leafAngle, theme.leaf);
  });
  ctx.restore();
}

function drawShareIcon(ctx, x, y, size, theme) {
  ctx.save();
  ctx.strokeStyle = theme.muted;
  ctx.lineWidth = Math.max(2, size * 0.08);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.68;

  ctx.beginPath();
  ctx.rect(x, y + size * 0.34, size * 0.7, size * 0.58);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y + size * 0.58);
  ctx.lineTo(x + size * 0.35, y);
  ctx.moveTo(x + size * 0.14, y + size * 0.22);
  ctx.lineTo(x + size * 0.35, y);
  ctx.lineTo(x + size * 0.56, y + size * 0.22);
  ctx.stroke();

  ctx.restore();
}

function drawPaperNoise(ctx, width, height, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < 900; i++) {
    const shade = 210 + Math.floor(Math.random() * 40);
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade - 8})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 1.2, 1.2);
  }
  ctx.restore();
}

function fitShareQuote(ctx, text, maxWidth, maxHeight, scale) {
  const characterCount = String(text).trim().length;
  let fontSize = (characterCount <= 80 ? 82 : characterCount <= 180 ? 72 : 68) * scale;
  const minimumFontSize = 28 * scale;
  let lines = [];
  let lineHeight = 0;

  do {
    ctx.font = `500 ${fontSize}px Georgia, "Times New Roman", serif`;
    lines = wrapCanvasText(ctx, text, maxWidth);
    lineHeight = fontSize * 1.33;
    if (lines.length * lineHeight <= maxHeight || fontSize <= minimumFontSize) break;
    fontSize -= 2 * scale;
  } while (fontSize >= minimumFontSize);

  return { fontSize, lines, lineHeight, blockHeight: lines.length * lineHeight };
}

function fitShareCredit(ctx, text, maxWidth, maxHeight, scale, quoteFont) {
  let fontSize = Math.min(32 * scale, Math.max(25 * scale, quoteFont * 0.38));
  const minimumFontSize = 22 * scale;
  let lines = [];
  let lineHeight = 0;

  do {
    ctx.font = `400 ${fontSize}px Georgia, "Times New Roman", serif`;
    lines = wrapCanvasText(ctx, text, maxWidth);
    lineHeight = fontSize * 1.35;
    if (lines.length * lineHeight <= maxHeight || fontSize <= minimumFontSize) break;
    fontSize -= 1 * scale;
  } while (fontSize >= minimumFontSize);

  return { fontSize, lines, lineHeight, blockHeight: lines.length * lineHeight };
}

function drawShareCard({ width = 1080, height = 1920, styleKey = currentShareStyle } = {}) {
  const payload = getSharePayload();
  const theme = shareCardThemes[styleKey] || shareCardThemes.sage;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('O navegador não oferece suporte à geração da imagem.');
  const scale = width / 1080;

  ctx.fillStyle = theme.page;
  ctx.fillRect(0, 0, width, height);

  const margin = 0;
  const cardX = margin;
  const cardY = margin;
  const cardW = width - margin * 2;
  const cardH = height - margin * 2;
  const radius = 0;

  ctx.save();
  ctx.shadowColor = 'rgba(42, 35, 26, 0.18)';
  ctx.shadowBlur = 34 * scale;
  ctx.shadowOffsetY = 18 * scale;
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = theme.bottom;
  ctx.fill();
  ctx.restore();

  roundedRectPath(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.clip();

  const bg = ctx.createLinearGradient(0, cardY, width, cardY + cardH);
  bg.addColorStop(0, theme.top);
  bg.addColorStop(0.55, theme.glow);
  bg.addColorStop(1, theme.bottom);
  ctx.fillStyle = bg;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  const glow = ctx.createRadialGradient(width * 0.58, height * 0.26, 20 * scale, width * 0.58, height * 0.26, 460 * scale);
  glow.addColorStop(0, 'rgba(255,255,240,0.58)');
  glow.addColorStop(1, 'rgba(255,255,240,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  drawPaperNoise(ctx, width, height, 0.055);
  drawBranch(ctx, cardX + 60 * scale, cardY + 305 * scale, 1.18 * scale, -0.08, theme, false);
  drawBranch(ctx, cardX + 80 * scale, cardY + cardH - 70 * scale, 1.08 * scale, Math.PI + 0.16, theme, true);

  ctx.strokeStyle = theme.stroke;
  ctx.lineWidth = 2 * scale;
  roundedRectPath(ctx, cardX + 1 * scale, cardY + 1 * scale, cardW - 2 * scale, cardH - 2 * scale, radius);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.ink;

  const quote = `“${payload.quote.replace(/[“”]/g, '').trim()}”`;
  const fittedQuote = fitShareQuote(ctx, quote, cardW * 0.74, cardH * 0.5, scale);
  const quoteFont = fittedQuote.fontSize;
  const quoteLines = fittedQuote.lines;
  const lineHeight = fittedQuote.lineHeight;
  const quoteBlockH = fittedQuote.blockHeight;
  const quoteStartY = height * 0.48 - quoteBlockH / 2 + lineHeight / 2;

  quoteLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, quoteStartY + index * lineHeight);
  });

  ctx.fillStyle = theme.muted;
  const author = `— ${formatShareAttribution(payload.attribution, payload.source)}`;
  const fittedCredit = fitShareCredit(ctx, author, cardW * 0.7, cardH * 0.12, scale, quoteFont);
  const quoteBottomY = quoteStartY + Math.max(0, quoteLines.length - 1) * lineHeight + lineHeight / 2;
  const creditStartY = quoteBottomY + 74 * scale + fittedCredit.lineHeight / 2;
  ctx.font = `400 ${fittedCredit.fontSize}px Georgia, "Times New Roman", serif`;
  fittedCredit.lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, creditStartY + index * fittedCredit.lineHeight);
  });

  ctx.font = `700 ${20 * scale}px Arial, sans-serif`;
  ctx.globalAlpha = 0.58;
  ctx.fillText('ENTRE SÁBIOS', width / 2, cardY + cardH - 108 * scale);
  ctx.font = `600 ${16 * scale}px Arial, sans-serif`;
  ctx.globalAlpha = 0.5;
  ctx.fillText('entresabios.com', width / 2, cardY + cardH - 78 * scale);
  ctx.globalAlpha = 1;

  drawShareIcon(ctx, cardX + cardW - 92 * scale, cardY + cardH - 110 * scale, 42 * scale, theme);

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.96);
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

async function createShareImage({ styleKey = currentShareStyle } = {}) {
  const resolvedStyleKey = shareCardThemes[styleKey] ? styleKey : 'sage';
  const imageCanvas = drawShareCard({ styleKey: resolvedStyleKey });
  const imageBlob = await canvasToBlob(imageCanvas);
  if (!imageBlob) throw new Error('Não foi possível gerar a imagem.');
  const filename = `entre-sabios-${resolvedStyleKey}-stories.png`;
  const imageFile = typeof File === 'function'
    ? new File([imageBlob], filename, { type: 'image/png' })
    : null;
  return {
    blob: imageBlob,
    file: imageFile,
    filename,
    styleKey: resolvedStyleKey,
  };
}

function canShareImageFile(file) {
  if (!file || typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return false;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function setShareStatus(message = '') {
  if (shareStatusEl) shareStatusEl.textContent = message;
}

function updateShareStyleButtons() {
  shareStyleButtons.forEach((button) => {
    const active = button.dataset.shareStyle === currentShareStyle;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function updateShareCardPreview() {
  // A prévia foi removida para manter o painel de compartilhamento mais limpo.
}
