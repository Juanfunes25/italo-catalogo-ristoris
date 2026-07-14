const fs = require('fs');
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');

const OUT = path.join(__dirname, '../icons');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function drawIcon(size, maskableSafe) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // background: dark matte metal -> terracotta gradient (industrial-italian)
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#3a3632');
  bg.addColorStop(1, '#211f1d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // warm halo light
  const halo = ctx.createRadialGradient(size*0.5, size*0.38, size*0.05, size*0.5, size*0.38, size*0.55);
  halo.addColorStop(0, 'rgba(244,199,130,0.45)');
  halo.addColorStop(1, 'rgba(244,199,130,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  const scale = maskableSafe ? 0.62 : 0.78;
  const cx = size / 2;
  const cy = size / 2;
  const s = size * scale / 100; // path authored in 100x100 space

  ctx.save();
  ctx.translate(cx - 50 * s, cy - 52 * s);
  ctx.scale(s, s);

  // classical roman profile silhouette (simplified bust), terracotta gold color
  ctx.fillStyle = '#d98a5f';
  ctx.beginPath();
  ctx.moveTo(38, 20);
  ctx.bezierCurveTo(33, 22, 30, 28, 31, 35);
  ctx.bezierCurveTo(28, 36, 26, 39, 27, 43);
  ctx.bezierCurveTo(24, 45, 23, 50, 26, 54);
  ctx.bezierCurveTo(24, 58, 25, 63, 29, 66);
  ctx.bezierCurveTo(29, 72, 33, 77, 39, 79);
  ctx.lineTo(39, 85);
  ctx.lineTo(61, 85);
  ctx.lineTo(61, 79);
  ctx.bezierCurveTo(58, 78, 56, 76, 55, 73);
  ctx.lineTo(52, 73);
  ctx.bezierCurveTo(48, 73, 45, 70, 45, 66);
  ctx.lineTo(45, 60);
  ctx.bezierCurveTo(49, 59, 52, 55, 52, 51);
  ctx.bezierCurveTo(55, 50, 57, 47, 57, 44);
  ctx.bezierCurveTo(60, 42, 61, 38, 59, 35);
  ctx.bezierCurveTo(61, 31, 60, 26, 56, 23);
  ctx.bezierCurveTo(54, 19, 49, 17, 44, 18);
  ctx.bezierCurveTo(42, 18, 40, 19, 38, 20);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // terracotta ring accent
  if (!maskableSafe) {
    ctx.strokeStyle = 'rgba(181,97,60,0.9)';
    ctx.lineWidth = size * 0.025;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size*0.46, 0, Math.PI * 2);
    ctx.stroke();
  }

  return canvas;
}

const sizes = [
  { size: 192, name: 'icon-192.png', maskable: false },
  { size: 512, name: 'icon-512.png', maskable: false },
  { size: 192, name: 'icon-maskable-192.png', maskable: true },
  { size: 512, name: 'icon-maskable-512.png', maskable: true },
  { size: 180, name: 'apple-touch-icon.png', maskable: false },
  { size: 32, name: 'favicon-32.png', maskable: false },
];

for (const s of sizes) {
  const canvas = drawIcon(s.size, s.maskable);
  fs.writeFileSync(path.join(OUT, s.name), canvas.toBuffer('image/png'));
  console.log('Wrote', s.name);
}
