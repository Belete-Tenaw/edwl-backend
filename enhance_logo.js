const Jimp = require('jimp');
const path = require('path');

const srcLogo = path.join(__dirname, 'frontend/src/assets/logo_premium_v4.png');
const destLogo = path.join(__dirname, 'frontend/src/assets/logo_premium_v4.png');

Jimp.read(srcLogo)
  .then(image => {
    // Increase contrast by 20%
    image.contrast(0.2);
    // Increase color saturation by 20% (Jimp's color method)
    image.color([{ apply: 'saturate', params: [20] }]);
    
    return image.writeAsync(destLogo);
  })
  .then(() => {
    console.log('Logo enhanced successfully');
  })
  .catch(err => {
    console.error(err);
  });
