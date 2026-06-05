import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.join(__dirname, '../public/assets/fonts');

const fonts = [
  // Montserrat (v31)
  {
    family: 'montserrat',
    name: 'Montserrat-500.woff2',
    url: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtZ6Hw5aXo.woff2'
  },
  {
    family: 'montserrat',
    name: 'Montserrat-700.woff2',
    url: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aXo.woff2'
  },
  // Alegreya (v39)
  {
    family: 'alegreya',
    name: 'Alegreya-400.woff2',
    url: 'https://fonts.gstatic.com/s/alegreya/v39/4UacrEBBsBhlBjvfkQjt71kZfyBzPgNG9hU4-6qj.woff2'
  },
  {
    family: 'alegreya',
    name: 'Alegreya-400i.woff2',
    url: 'https://fonts.gstatic.com/s/alegreya/v39/4UaSrEBBsBhlBjvfkSLk3abBFkvpkARTPlbgv5qhmSU.woff2'
  },
  {
    family: 'alegreya',
    name: 'Alegreya-700.woff2',
    url: 'https://fonts.gstatic.com/s/alegreya/v39/4UacrEBBsBhlBjvfkQjt71kZfyBzPgNGERI4-6qj.woff2'
  }
];

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download: ${url} (Status: ${res.status})`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
}

async function main() {
  console.log('Downloading optimized WOFF2 fonts...');
  for (const font of fonts) {
    const targetDir = path.join(FONTS_DIR, font.family);
    fs.mkdirSync(targetDir, { recursive: true });
    const dest = path.join(targetDir, font.name);
    console.log(`- Downloading ${font.family}/${font.name}...`);
    await downloadFile(font.url, dest);
  }
  console.log('All fonts downloaded successfully!');
}

main().catch(console.error);
