const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function compilePDF() {
    const outputDir = path.join(__dirname, '../output_catalogues');
    const pdfPath = path.join(outputDir, 'TeluguDelicacies_Full_Catalogue.pdf');
    
    // 1. Get all PNGs
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
    if (files.length === 0) {
        console.log("No PNG catalogues found to compile.");
        return;
    }
    
    console.log(`Found ${files.length} catalogue images. Building PDF...`);
    
    // 2. Build temporary HTML
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @page { margin: 0; size: A4; }
            body { margin: 0; padding: 0; background: #fff; }
            img { 
                width: 100%; 
                height: 100vh; /* A4 aspect ratio mapped to viewport */
                object-fit: cover; 
                display: block; 
                page-break-after: always;
                break-after: page;
            }
        </style>
    </head>
    <body>
    `;
    
    for (const file of files) {
        const imgPath = path.join(outputDir, file).replace(/\\/g, '/');
        htmlContent += `<img src="file:///${imgPath}" />\n`;
    }
    
    htmlContent += `</body></html>`;
    
    const tempHtmlPath = path.join(__dirname, 'temp_pdf_builder.html');
    fs.writeFileSync(tempHtmlPath, htmlContent);
    
    // 3. Launch Puppeteer to render the PDF
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.goto(`file:///${tempHtmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });
    
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    await browser.close();
    
    // Clean up temp file
    if (fs.existsSync(tempHtmlPath)) {
        fs.unlinkSync(tempHtmlPath);
    }
    
    console.log(`\nSuccessfully compiled all images into:`);
    console.log(pdfPath);
}

compilePDF().catch(console.error);
