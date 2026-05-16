const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        const logoPath = 'file:///' + __dirname.replace(/\\/g, '/') + '/frontend/src/assets/logo_premium_v4.png';
        const html = \
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@700&display=swap');
                body { margin: 0; padding: 0; background: transparent; }
                .container { width: 500px; height: 500px; position: relative; }
                svg { width: 100%; height: 100%; }
            </style>
        </head>
        <body>
            <div class="container" id="logo-container">
                <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                    <image href="\" x="0" y="0" width="500" height="500" />
                    <!-- Cover the existing outer text with a matching color ring. Let's guess the color is dark navy. -->
                    <circle cx="250" cy="250" r="215" fill="none" stroke="#0e1726" stroke-width="65" />
                    <circle cx="250" cy="250" r="215" fill="none" stroke="#121e33" stroke-width="65" opacity="0.8" />
                    
                    <!-- We can create an exact circular path for the text -->
                    <path id="topArc" d="M 60,250 A 190,190 0 0,1 440,250" fill="none" />
                    <path id="bottomArc" d="M 60,250 A 190,190 0 0,0 440,250" fill="none" />

                    <text fill="#ffffff" font-family="'Noto Sans Ethiopic', sans-serif" font-size="28" font-weight="700" letter-spacing="1.5">
                        <textPath href="#topArc" startOffset="50%" text-anchor="middle">
                            ??? ???? ??? ????? ????
                        </textPath>
                    </text>
                    <text fill="#ffffff" font-family="'Inter', sans-serif" font-size="22" font-weight="700" letter-spacing="4">
                        <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">
                            ETHIO DOMESTIC WORKERS LINK
                        </textPath>
                    </text>
                </svg>
            </div>
        </body>
        </html>
        \;

        fs.writeFileSync('temp_logo.html', html);
        
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setViewport({ width: 500, height: 500, deviceScaleFactor: 2 }); // Scale 2 for high res (1000x1000)
        
        await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/temp_logo.html', { waitUntil: 'networkidle0' });
        
        const element = await page.#logo-container;
        await element.screenshot({ path: 'frontend/src/assets/logo_fixed.png', omitBackground: true });
        
        await browser.close();
        console.log('Logo generated successfully!');
    } catch (e) {
        console.error(e);
    }
})();
