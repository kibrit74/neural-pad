import iconGen from 'icon-gen';
import { mkdirSync, existsSync } from 'fs';

const input = 'public/Logo.png';
const outDir = 'build/icons';

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

(async () => {
  try {
    await iconGen(input, outDir, {
      report: true,
      modes: ['ico', 'icns'],
      names: { icns: 'icon', ico: 'icon' },
    });
    console.log('Icons generated in', outDir);
  } catch (e) {
    console.error('Icon generation failed:', e);
    process.exit(1);
  }
})();
