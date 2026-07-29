const fs = require('fs');
const { createPRNG } = require('./lib/pattern');

function parseArgs() {
  const args = process.argv.slice(2);
  let day = 1;
  let rows = 0;
  let countOnly = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--day') {
      day = parseInt(args[++i], 10);
    } else if (args[i] === '--rows') {
      rows = parseInt(args[++i], 10);
    } else if (args[i] === '--count-only') {
      countOnly = true;
    }
  }

  if (rows === 0 && !args.includes('--rows')) {
    // Auto calculate rows based on EDT hour (06:00 to 19:00)
    const edtHour = parseInt(new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour: 'numeric', hour12: false }), 10);
    let hoursPassed = edtHour - 6;
    if (hoursPassed < 0) hoursPassed = 0;
    if (hoursPassed > 13) hoursPassed = 13;
    const variance = (day * 17 % 5);
    rows = (hoursPassed + 1) * (20 + variance);
  }

  return { day, rows, countOnly };
}

function generateLoomSVG(day, rowsToWeave) {
  const prng = createPRNG(day);
  const WIDTH = 800;
  const HEIGHT = 1100;
  const BORDER = 40;

  const CLOTH_X = BORDER;
  const CLOTH_Y = BORDER;
  const CLOTH_W = WIDTH - BORDER * 2;
  const CLOTH_H = HEIGHT - BORDER * 2;

  const TOTAL_ROWS = 400;
  const WARP_THREADS = 240;

  const rowHeight = CLOTH_H / TOTAL_ROWS;
  const threadSpacing = CLOTH_W / WARP_THREADS;

  const COLORS = {
    linen: '#E5DCC8',
    black: '#1A1614',
    purple: '#5B2A54',
    warp: '#C9BFA8'
  };

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">\n`;
  svg += `<defs>\n`;
  svg += `<pattern id="meander" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">\n`;
  svg += `  <path d="M 0,10 h 20 v 20 h -10 v -10 h 20 v -10 h 10" fill="none" stroke="${COLORS.black}" stroke-width="4" stroke-linejoin="miter" stroke-linecap="square" />\n`;
  svg += `</pattern>\n`;
  svg += `</defs>\n`;

  // Ground
  svg += `<rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.linen}" />\n`;

  // Borders
  svg += `<rect x="0" y="0" width="${WIDTH}" height="${BORDER}" fill="url(#meander)" />\n`;
  svg += `<rect x="0" y="${HEIGHT - BORDER}" width="${WIDTH}" height="${BORDER}" fill="url(#meander)" />\n`;
  svg += `<rect x="0" y="0" width="${BORDER}" height="${HEIGHT}" fill="url(#meander)" />\n`;
  svg += `<rect x="${WIDTH - BORDER}" y="0" width="${BORDER}" height="${HEIGHT}" fill="url(#meander)" />\n`;

  // Inner border lines
  svg += `<rect x="${BORDER}" y="${BORDER}" width="${CLOTH_W}" height="${CLOTH_H}" fill="none" stroke="${COLORS.black}" stroke-width="2" />\n`;

  // Warp threads (vertical)
  for (let i = 0; i < WARP_THREADS; i++) {
    const x = CLOTH_X + i * threadSpacing + threadSpacing / 2;
    svg += `<line x1="${x}" y1="${CLOTH_Y}" x2="${x}" y2="${CLOTH_Y + CLOTH_H}" stroke="${COLORS.warp}" stroke-width="1.5" />\n`;
  }

  // Weft rows (start from the top, row 0 is top. The purple band is "a third of the way up", which means 2/3 of the way down from top. i.e. near row 266. Wait, if it's woven, typically you weave from bottom up. Let's make row 0 at the bottom!)
  for (let r = 0; r < rowsToWeave; r++) {
    if (r >= TOTAL_ROWS) break;
    
    // Twill shift
    const shift = r % 3;
    
    // Determine row color
    // A third of the way up = near row 133 (if 0 is bottom)
    const purpleStart = Math.floor(TOTAL_ROWS / 3) - 5 + Math.floor(prng() * 10 - 5);
    const purpleEnd = purpleStart + 15 + Math.floor(prng() * 10 - 5);
    
    const isPurple = r >= purpleStart && r <= purpleEnd;
    const strokeColor = isPurple ? COLORS.purple : COLORS.black;

    // Draw from bottom up
    const yBase = (CLOTH_Y + CLOTH_H) - (r * rowHeight + rowHeight / 2);

    for (let i = 0; i < WARP_THREADS; i++) {
      // Over 2, under 1
      const isOver = (i + shift) % 3 < 2;
      
      if (isOver) {
        // Irregularity
        const xOffsetStart = (prng() - 0.5) * 1.5;
        const xOffsetEnd = (prng() - 0.5) * 1.5;
        const yOffset = (prng() - 0.5) * 1.0;

        const x1 = CLOTH_X + i * threadSpacing + xOffsetStart;
        const x2 = CLOTH_X + (i + 1) * threadSpacing + xOffsetEnd;
        const y = yBase + yOffset;

        svg += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" />\n`;
      }
    }
  }

  svg += `</svg>\n`;
  return svg;
}

const { day, rows, countOnly } = parseArgs();

if (countOnly) {
  console.log(rows);
} else {
  const svg = generateLoomSVG(day, rows);
  process.stdout.write(svg);
}
