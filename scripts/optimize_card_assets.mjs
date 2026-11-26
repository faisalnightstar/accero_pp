import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const filesToOptimize = [
  'public/assets/pan/nsdl-front.jpg',
  'public/assets/pan/nsdl-back.jpg',
  'public/assets/pan/uti-front.jpg',
  'public/assets/pan/uti-back.jpg',
  'public/assets/aadhar/cards/hi_front.jpg',
  'public/assets/aadhar/cards/hi_back.jpg',
  'public/assets/dl/dl-front.png',
  'public/assets/dl/dl-back.png',
  'public/assets/farmer/farmer-card-front.png',
  'public/assets/farmer/farmer-card-back.png',
  'public/assets/farmer/farmer-card.png',
  'public/assets/rc/rc-back.png'
];

async function optimizeAssets() {
  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const relPath of filesToOptimize) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) {
      console.log(`Skipping missing: ${relPath}`);
      continue;
    }

    const stat = fs.statSync(fullPath);
    const origSize = stat.size;
    totalOriginal += origSize;

    const isPng = relPath.endsWith('.png');
    let pipeline = sharp(fullPath);

    let buffer;
    if (isPng) {
      buffer = await pipeline
        .png({ quality: 85, compressionLevel: 9, palette: true })
        .toBuffer();
    } else {
      buffer = await pipeline
        .resize(1011, 638, { fit: 'fill' })
        .jpeg({ quality: 85, mozjpeg: true, progressive: true })
        .toBuffer();
    }

    const newSize = buffer.length;
    totalOptimized += newSize;

    fs.writeFileSync(fullPath, buffer);

    console.log(
      `${relPath}: ${Math.round(origSize / 1024)} KiB -> ${Math.round(newSize / 1024)} KiB (-${Math.round(
        ((origSize - newSize) / origSize) * 100
      )}%)`
    );
  }

  console.log('----------------------------------------------------');
  console.log(`Total Original: ${Math.round(totalOriginal / 1024)} KiB (${(totalOriginal / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`Total Optimized: ${Math.round(totalOptimized / 1024)} KiB (${(totalOptimized / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`Total Savings: ${Math.round((totalOriginal - totalOptimized) / 1024)} KiB (${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(1)} MB saved, -${Math.round(((totalOriginal - totalOptimized) / totalOriginal) * 100)}%)`);
}

optimizeAssets().catch(console.error);
