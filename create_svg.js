const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, 'frontend/src/assets/logo_circular.png');
const base64Data = fs.readFileSync(logoPath).toString('base64');
const dataUri = `data:image/png;base64,${base64Data}`;

const svg = `
<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
    <image href="${dataUri}" x="0" y="0" width="500" height="500" />
    
    <!-- Cover the existing outer text with a dark navy ring -->
    <!-- Assuming the ring is between radius 180 and 240, let's draw a stroke over it -->
    <!-- After testing, adjusting stroke-width to 80 to fully cover the text but leave the center and borders intact -->
    <circle cx="250" cy="250" r="210" fill="none" stroke="#101828" stroke-width="70" />
    <circle cx="250" cy="250" r="210" fill="none" stroke="#0f172a" stroke-width="70" opacity="0.5" />
    
    <!-- Circular paths for text -->
    <!-- Top Arc for Amharic text -->
    <path id="topArc" d="M 60,250 A 190,190 0 0,1 440,250" fill="none" />
    
    <!-- Bottom Arc for English text -->
    <path id="bottomArc" d="M 60,250 A 190,190 0 0,0 440,250" fill="none" />

    <!-- Amharic Text -->
    <text fill="#ffffff" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="24" font-weight="bold" letter-spacing="2">
        <textPath href="#topArc" startOffset="50%" text-anchor="middle">
            ኢትዮ የሃገር ውስጥ ሠራተኞች አገናኝ
        </textPath>
    </text>
    
    <!-- English Text -->
    <text fill="#ffffff" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="bold" letter-spacing="2">
        <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">
            ETHIO DOMESTIC WORKERS LINK-EDWL
        </textPath>
    </text>
</svg>
`;

fs.writeFileSync(path.join(__dirname, 'frontend/src/assets/logo_fixed.svg'), svg);
console.log('SVG logo generated at logo_fixed.svg.');
