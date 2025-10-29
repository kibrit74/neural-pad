import pngToIco from 'png-to-ico';
import fs from 'fs';

(async () => {
  try {
    const buf = await pngToIco('logo.png');
    fs.writeFileSync('icon.ico', buf);
    console.log('✓ Icon created: icon.ico');
  } catch (err) {
    console.error('Error:', err);
  }
})();
