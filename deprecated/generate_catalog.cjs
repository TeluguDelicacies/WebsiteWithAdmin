const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

// ─── Font Registration ────────────────────────────────────────────────────────
try {
    const mod20Path = path.join(__dirname, 'assets', 'MOD20.TTF');
    if (fs.existsSync(mod20Path)) {
        registerFont(mod20Path, { family: 'Modern20' });
        console.log("Registered font Modern20 successfully.");
    }
    const chathuraPath = path.join(__dirname, 'assets', 'Chathura-Bold.ttf');
    if (fs.existsSync(chathuraPath)) {
        registerFont(chathuraPath, { family: 'Chathura' });
        console.log("Registered font Chathura successfully.");
    }
} catch (e) {
    console.warn("Could not register custom fonts. Fallbacks will be used.", e);
}

// ─── Configuration ──────────────────────────────────────────────────────────
const WIDTH = 1080;
const HEIGHT = 1920; // Exact 9:16 Aspect Ratio (1080 x 1920)

const COLORS = {
    bg:             '#FCF8F2',      // warm elegant cream background
    maroon:         '#6D0606',      // rich deep royal maroon
    maroonDark:     '#4D0202',      // darker shadow maroon
    gold:           '#B5883D',      // elegant warm gold accent
    goldLight:      '#EBD7B3',      // light gold row divider
    highlightBg:    '#FDF6EB',      // light orange-cream for highlight strips
    highlightBorder:'rgba(181, 136, 61, 0.25)',
    textDark:       '#2B1E0F',      // dark brown for titles
    textLight:      '#5C4533',      // medium brown for taglines
    white:          '#FFFFFF',
    greenLogo:      '#2C5E3B'       // green veg/whatsapp logo color
};

// ─── Text Wrapping Utility ──────────────────────────────────────────────────
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lines = [];
    
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line.trim());
    
    const totalHeight = lines.length * lineHeight;
    const startY = y - totalHeight / 2 + lineHeight / 2;
    
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, startY + i * lineHeight);
    }
}

// ─── Programmatic Vector Icon Drawings ──────────────────────────────────────

function drawChili(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 40, size / 40);
    
    ctx.beginPath();
    ctx.moveTo(15, 8);
    ctx.bezierCurveTo(28, 6, 35, 18, 30, 35);
    ctx.bezierCurveTo(28, 38, 25, 38, 25, 35);
    ctx.bezierCurveTo(22, 24, 18, 18, 12, 12);
    ctx.closePath();
    
    const grad = ctx.createLinearGradient(12, 8, 30, 35);
    grad.addColorStop(0, '#D21F3C');
    grad.addColorStop(1, '#8A0000');
    ctx.fillStyle = grad;
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(15, 8);
    ctx.quadraticCurveTo(14, 2, 8, 4);
    ctx.quadraticCurveTo(12, 6, 12, 9);
    ctx.fillStyle = '#3E8E41';
    ctx.fill();
    
    ctx.restore();
}

function drawGarlic(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 40, size / 40);
    
    ctx.beginPath();
    ctx.moveTo(20, 8);
    ctx.bezierCurveTo(28, 12, 34, 20, 30, 32);
    ctx.bezierCurveTo(28, 36, 12, 36, 10, 32);
    ctx.bezierCurveTo(6, 20, 12, 12, 20, 8);
    ctx.closePath();
    ctx.fillStyle = '#FAF8F0';
    ctx.fill();
    ctx.strokeStyle = '#D5CEB8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(20, 8);
    ctx.quadraticCurveTo(20, 22, 20, 34);
    ctx.moveTo(20, 8);
    ctx.quadraticCurveTo(25, 20, 25, 33);
    ctx.moveTo(20, 8);
    ctx.quadraticCurveTo(15, 20, 15, 33);
    ctx.stroke();
    
    ctx.strokeStyle = '#A49875';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(18, 34); ctx.lineTo(16, 38);
    ctx.moveTo(20, 34); ctx.lineTo(20, 39);
    ctx.moveTo(22, 34); ctx.lineTo(24, 38);
    ctx.stroke();
    
    ctx.restore();
}

function drawDosa(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 40, size / 40);
    
    ctx.save();
    ctx.rotate(-Math.PI / 6);
    
    ctx.beginPath();
    ctx.rect(5, 15, 30, 10);
    const grad = ctx.createLinearGradient(5, 15, 5, 25);
    grad.addColorStop(0, '#E5A93B');
    grad.addColorStop(0.5, '#B07A1C');
    grad.addColorStop(1, '#8B5E0C');
    ctx.fillStyle = grad;
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(5, 20, 3, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#D49B2C';
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(35, 20, 3, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#B07A1C';
    ctx.fill();
    
    ctx.restore();
    ctx.restore();
}

function drawBetelLeaf(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 40, size / 40);
    
    ctx.beginPath();
    ctx.moveTo(20, 35);
    ctx.bezierCurveTo(8, 26, 4, 14, 20, 4);
    ctx.bezierCurveTo(36, 14, 32, 26, 20, 35);
    ctx.closePath();
    
    const grad = ctx.createLinearGradient(20, 4, 20, 35);
    grad.addColorStop(0, '#73A942');
    grad.addColorStop(1, '#1A4301');
    ctx.fillStyle = grad;
    ctx.fill();
    
    ctx.strokeStyle = '#A3E25B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 4); ctx.lineTo(20, 33);
    ctx.moveTo(20, 12); ctx.quadraticCurveTo(12, 16, 10, 22);
    ctx.moveTo(20, 12); ctx.quadraticCurveTo(28, 16, 30, 22);
    ctx.moveTo(20, 20); ctx.quadraticCurveTo(14, 24, 12, 28);
    ctx.moveTo(20, 20); ctx.quadraticCurveTo(26, 24, 28, 28);
    ctx.stroke();
    
    ctx.restore();
}

function drawGenericLeaf(ctx, x, y, size, darkColor = '#1A4301', lightColor = '#73A942') {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 40, size / 40);
    
    ctx.beginPath();
    ctx.moveTo(8, 28);
    ctx.quadraticCurveTo(12, 10, 32, 8);
    ctx.quadraticCurveTo(28, 24, 8, 28);
    ctx.closePath();
    
    const grad = ctx.createLinearGradient(8, 28, 32, 8);
    grad.addColorStop(0, lightColor);
    grad.addColorStop(1, darkColor);
    ctx.fillStyle = grad;
    ctx.fill();
    
    ctx.strokeStyle = '#A3E25B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, 28);
    ctx.lineTo(30, 10);
    ctx.stroke();
    
    ctx.restore();
}

function drawCurryLeaf(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 40, size / 40);
    
    ctx.strokeStyle = '#5C4033';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 32);
    ctx.lineTo(30, 8);
    ctx.stroke();
    
    function drawLeaflet(lx, ly, angle, scale) {
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-3, -8, 0, -12);
        ctx.quadraticCurveTo(3, -8, 0, 0);
        ctx.fillStyle = '#2D6A4F';
        ctx.fill();
        ctx.restore();
    }
    
    drawLeaflet(14, 27, -Math.PI / 4, 0.85);
    drawLeaflet(16, 25, Math.PI / 4, 0.85);
    drawLeaflet(20, 20, -Math.PI / 4, 0.85);
    drawLeaflet(22, 18, Math.PI / 4, 0.85);
    drawLeaflet(27, 12, 0, 0.85);
    
    ctx.restore();
}

function drawMintLeaf(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 40, size / 40);
    
    function drawLeaf(mx, my, rot) {
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-8, -5, -10, -15, 0, -20);
        ctx.bezierCurveTo(10, -15, 8, -5, 0, 0);
        ctx.fillStyle = '#52B788';
        ctx.fill();
        ctx.strokeStyle = '#2D6A4F';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
    
    drawLeaf(17, 25, -Math.PI / 6);
    drawLeaf(23, 22, Math.PI / 4);
    
    ctx.restore();
}

function drawCorianderLeaf(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 40, size / 40);
    
    ctx.strokeStyle = '#1E4620';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, 35);
    ctx.bezierCurveTo(20, 25, 12, 20, 10, 15);
    ctx.moveTo(20, 30);
    ctx.bezierCurveTo(20, 22, 28, 20, 30, 15);
    ctx.moveTo(20, 35);
    ctx.lineTo(20, 10);
    ctx.stroke();
    
    function drawHead(hx, hy) {
        ctx.beginPath();
        ctx.arc(hx, hy, 4, 0, Math.PI*2);
        ctx.arc(hx-3, hy-2, 3, 0, Math.PI*2);
        ctx.arc(hx+3, hy-2, 3, 0, Math.PI*2);
        ctx.fillStyle = '#40916C';
        ctx.fill();
    }
    
    drawHead(10, 13);
    drawHead(30, 13);
    drawHead(20, 8);
    
    ctx.restore();
}

function drawBowl(ctx, x, y, size, fillType) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 40, size / 40);
    
    ctx.beginPath();
    ctx.ellipse(20, 20, 13, 10, 0, Math.PI, 0);
    ctx.closePath();
    
    let contentColor = '#D49B2C';
    let drawPattern = null;
    
    if (fillType === 'bowl-seeds') {
        contentColor = '#5C4033';
        drawPattern = (c) => {
            c.fillStyle = '#2C1E18';
            c.beginPath();
            c.arc(17, 16, 2, 0, Math.PI*2);
            c.arc(22, 14, 1.5, 0, Math.PI*2);
            c.arc(13, 18, 2, 0, Math.PI*2);
            c.arc(26, 17, 1.8, 0, Math.PI*2);
            c.fill();
        };
    } else if (fillType === 'bowl-peanuts' || fillType === 'coriander seeds') {
        contentColor = '#E5A93B';
        drawPattern = (c) => {
            c.fillStyle = '#9B5B00';
            c.beginPath();
            c.arc(18, 15, 3, 0, Math.PI*2);
            c.arc(23, 14, 2.5, 0, Math.PI*2);
            c.arc(13, 17, 3, 0, Math.PI*2);
            c.arc(27, 16, 2.5, 0, Math.PI*2);
            c.fill();
        };
    } else if (fillType === 'Rosted half gram') {
        contentColor = '#FFD000';
        drawPattern = (c) => {
            c.fillStyle = '#D49B00';
            c.beginPath();
            c.arc(16, 15, 2.5, 0, Math.PI*2);
            c.arc(22, 13, 2, 0, Math.PI*2);
            c.arc(25, 17, 2.5, 0, Math.PI*2);
            c.fill();
        };
    } else if (fillType === 'bowl-chutney') {
        contentColor = '#80B375';
    } else if (fillType === 'bowl-soup') {
        contentColor = '#D9531E';
        drawPattern = (c) => {
            c.fillStyle = '#2D6A4F';
            c.beginPath();
            c.arc(18, 16, 1.5, 0, Math.PI*2);
            c.arc(22, 15, 2, 0, Math.PI*2);
            c.fill();
        };
    } else {
        contentColor = '#D84B20';
    }
    
    ctx.fillStyle = contentColor;
    ctx.fill();
    if (drawPattern) drawPattern(ctx);
    
    ctx.beginPath();
    ctx.arc(20, 20, 14, 0, Math.PI);
    ctx.closePath();
    
    const bowlGrad = ctx.createLinearGradient(10, 20, 30, 30);
    bowlGrad.addColorStop(0, '#A67C52');
    bowlGrad.addColorStop(1, '#5C4021');
    ctx.fillStyle = bowlGrad;
    ctx.fill();
    
    ctx.strokeStyle = '#402A13';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.restore();
}

function drawPouchIcon(ctx, x, y, width, height) {
    ctx.save();
    ctx.translate(x - width/2, y - height/2);
    
    ctx.beginPath();
    ctx.moveTo(width * 0.2, 0);
    ctx.lineTo(width * 0.8, 0);
    ctx.lineTo(width * 0.88, height * 0.85);
    ctx.quadraticCurveTo(width * 0.88, height, width * 0.5, height);
    ctx.quadraticCurveTo(width * 0.12, height, width * 0.12, height * 0.85);
    ctx.lineTo(width * 0.2, 0);
    ctx.closePath();
    
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#DFC4A2');
    grad.addColorStop(1, '#B5926C');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#5E4125';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.15);
    ctx.lineTo(width * 0.8, height * 0.15);
    ctx.strokeStyle = '#5E4125';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.55, width * 0.18, 0, Math.PI*2);
    ctx.fillStyle = COLORS.maroon;
    ctx.fill();
    
    ctx.restore();
}

function drawJarIcon(ctx, x, y, width, height) {
    ctx.save();
    ctx.translate(x - width/2, y - height/2);
    
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.2);
    ctx.lineTo(width * 0.8, height * 0.2);
    ctx.lineTo(width * 0.85, height * 0.85);
    ctx.quadraticCurveTo(width * 0.85, height, width * 0.65, height);
    ctx.lineTo(width * 0.35, height);
    ctx.quadraticCurveTo(width * 0.15, height, width * 0.15, height * 0.85);
    ctx.closePath();
    
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, 'rgba(235, 248, 252, 0.9)');
    grad.addColorStop(1, 'rgba(200, 225, 235, 0.9)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#5A747F';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.rect(width * 0.22, 0, width * 0.56, height * 0.2);
    ctx.fillStyle = '#D4AF37';
    ctx.fill();
    ctx.strokeStyle = '#856404';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.rect(width * 0.22, height * 0.3, width * 0.56, height * 0.55);
    ctx.fillStyle = '#C84C1C';
    ctx.fill();
    
    ctx.restore();
}

function drawCornerMuggu(ctx, x, y, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2.2;
    
    ctx.beginPath();
    ctx.moveTo(-12, -12); ctx.lineTo(12, 12);
    ctx.moveTo(12, -12); ctx.lineTo(-12, 12);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(0, -8, 5, 0, Math.PI*2);
    ctx.arc(0, 8, 5, 0, Math.PI*2);
    ctx.arc(-8, 0, 5, 0, Math.PI*2);
    ctx.arc(8, 0, 5, 0, Math.PI*2);
    ctx.stroke();
    
    ctx.restore();
}

// ─── CSV Parsing ────────────────────────────────────────────────────────────
function parseCSV(filePath) {
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const lines = csvContent.split(/\r?\n/);
    const data = [];
    
    function parseCSVLine(text) {
        let ret = [], inQuote = false, val = '';
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (inQuote) {
                if (char === '"') {
                    if (i < text.length - 1 && text[i+1] === '"') {
                        val += '"';
                        i++;
                    } else {
                        inQuote = false;
                    }
                } else {
                    val += char;
                }
            } else {
                if (char === '"') {
                    inQuote = true;
                } else if (char === ',') {
                    ret.push(val);
                    val = '';
                } else {
                    val += char;
                }
            }
        }
        ret.push(val);
        return ret;
    }
    
    if (lines.length === 0) return data;
    const headers = parseCSVLine(lines[0]);
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const row = parseCSVLine(line);
        if (row.length >= headers.length) {
            const item = {};
            headers.forEach((h, idx) => {
                item[h] = row[idx];
            });
            data.push(item);
        }
    }
    return data;
}

// ─── Main Execution ─────────────────────────────────────────────────────────
async function run() {
    const csvPath = path.join(__dirname, 'catalog_products_processed.csv');
    if (!fs.existsSync(csvPath)) {
        console.error("Missing catalog_products_processed.csv. Make sure to generate it first.");
        return;
    }
    
    console.log("Parsing CSV data...");
    const products = parseCSV(csvPath);
    console.log(`Loaded ${products.length} products.`);
    
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    
    // 1. Warm cream background fill
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // 2. Premium Borders (adjusted for 1080px width)
    ctx.strokeStyle = COLORS.maroon;
    ctx.lineWidth = 6;
    ctx.strokeRect(25, 25, WIDTH - 50, HEIGHT - 50);
    
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(35, 35, WIDTH - 70, HEIGHT - 70);
    
    // 3. Corner Muggu decorations
    drawCornerMuggu(ctx, 50, 50, 0);
    drawCornerMuggu(ctx, WIDTH - 50, 50, Math.PI / 2);
    drawCornerMuggu(ctx, 50, HEIGHT - 50, -Math.PI / 2);
    drawCornerMuggu(ctx, WIDTH - 50, HEIGHT - 50, Math.PI);
    
    // 4. Header Branding Banner
    const bannerW = 680;
    const bannerH = 95;
    const bannerX = (WIDTH - bannerW) / 2;
    const bannerY = 55;
    
    ctx.fillStyle = COLORS.maroon;
    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 16);
    ctx.fill();
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(bannerX + 6, bannerY + 6, bannerW - 12, bannerH - 12);
    
    // Branding texts inside banner
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 31px "Modern20", "Georgia", serif';
    ctx.fillText("Telugu Delicacies", WIDTH / 2, bannerY + 38);
    
    ctx.fillStyle = COLORS.goldLight;
    ctx.font = 'italic 14px Arial, sans-serif';
    ctx.fillText("Modern Yet Traditional", WIDTH / 2, bannerY + 59);
    
    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText("Phone: 9618519191", WIDTH / 2, bannerY + 79);
    
    // 5. Cursive Elegant Subtitle
    ctx.fillStyle = COLORS.maroon;
    ctx.font = 'italic bold 48px "Georgia", serif';
    ctx.fillText("Podi & Kaaram", WIDTH / 2, 195);
    
    drawChili(ctx, WIDTH/2 - 210, 165, 30);
    drawChili(ctx, WIDTH/2 + 180, 165, 30);
    
    // 6. Pricing Columns Background Highlighting (adjusted X spacing for 1080px width)
    const colYStart = 250;
    const colYEnd = 1785;
    const colW = 95;
    const priceCols = [700, 805, 910]; // left coordinates of columns
    
    priceCols.forEach(x => {
        ctx.fillStyle = COLORS.highlightBg;
        ctx.beginPath();
        ctx.roundRect(x, colYStart, colW, colYEnd - colYStart, 10);
        ctx.fill();
        ctx.strokeStyle = COLORS.highlightBorder;
        ctx.lineWidth = 1;
        ctx.stroke();
    });
    
    // 7. Table Header Row & Packaging Icons
    const headerRowY = 310;
    const headerRowH = 45;
    
    drawPouchIcon(ctx, 747, 280, 36, 46); // Standup 100g
    drawPouchIcon(ctx, 852, 275, 42, 54); // Standup 250g
    drawJarIcon(ctx, 957, 278, 34, 48);   // Glass 100g
    
    ctx.fillStyle = COLORS.maroon;
    ctx.beginPath();
    ctx.roundRect(70, headerRowY, 620, headerRowH, [6, 0, 0, 6]);
    ctx.fill();
    
    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 19px "Georgia", serif';
    ctx.textAlign = 'left';
    ctx.fillText("Podi", 135, headerRowY + 28);
    ctx.fillText("Speciality", 375, headerRowY + 28);
    
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.maroon;
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText("Standup", 747, headerRowY + 16);
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText("100g", 747, headerRowY + 32);
    
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText("Standup", 852, headerRowY + 16);
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText("250g", 852, headerRowY + 32);
    
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText("Glass Jar", 957, headerRowY + 16);
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText("100g", 957, headerRowY + 32);
    
    // 8. Render Product Rows (adjusted for height 1920)
    const rowStartY = 365;
    const rowHeight = 64; // perfect fit for 22 rows within 1920px height
    
    products.forEach((prod, idx) => {
        const rowY = rowStartY + idx * rowHeight;
        
        if (idx % 2 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
        } else {
            ctx.fillStyle = 'rgba(247,237,222,0.3)';
        }
        ctx.fillRect(70, rowY, 620, rowHeight);
        
        ctx.strokeStyle = COLORS.goldLight;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(70, rowY + rowHeight);
        ctx.lineTo(WIDTH - 70, rowY + rowHeight);
        ctx.stroke();
        
        // Draw Icon
        const iconX = 100;
        const iconY = rowY + rowHeight / 2 - 17; 
        const iconType = prod['Icon'].trim();
        
        if (iconType === 'chili') {
            drawChili(ctx, iconX, iconY, 34);
        } else if (iconType === 'garlic') {
            drawGarlic(ctx, iconX, iconY, 32);
        } else if (iconType === 'dosa') {
            drawDosa(ctx, iconX, iconY, 32);
        } else if (iconType === 'betel-leaf') {
            drawBetelLeaf(ctx, iconX, iconY, 32);
        } else if (iconType === 'curry-leaf') {
            drawCurryLeaf(ctx, iconX, iconY, 32);
        } else if (iconType === 'mint-leaf') {
            drawMintLeaf(ctx, iconX, iconY, 32);
        } else if (iconType === 'coriander-leaf') {
            drawCorianderLeaf(ctx, iconX, iconY, 32);
        } else if (iconType === 'green-leaf' || iconType === 'tamarind-leaf') {
            drawGenericLeaf(ctx, iconX, iconY, 32);
        } else {
            drawBowl(ctx, iconX, iconY, 34, iconType);
        }
        
        // Draw Product Name
        ctx.textAlign = 'left';
        ctx.fillStyle = COLORS.maroon;
        ctx.font = 'bold 18px "Georgia", serif';
        ctx.fillText(prod['Display Name'], 140, rowY + rowHeight / 2 + 5);
        
        // Draw Speciality/Tagline with Text Wrapping
        ctx.fillStyle = COLORS.textLight;
        ctx.font = 'italic 14px "Trebuchet MS", "Arial", sans-serif';
        const tagline = prod['Speciality'];
        const maxTaglineWidth = 310; 
        const textLineHeight = 17;
        drawWrappedText(ctx, tagline, 375, rowY + rowHeight / 2, maxTaglineWidth, textLineHeight);
        
        // Draw Pricing Values
        ctx.textAlign = 'center';
        ctx.fillStyle = COLORS.textDark;
        ctx.font = 'bold 18px "Arial", sans-serif';
        
        ctx.fillText(prod['Standup 100g'], 747, rowY + rowHeight / 2 + 6);
        ctx.fillText(prod['Standup 250g'], 852, rowY + rowHeight / 2 + 6);
        ctx.fillText(prod['Glass Jar 100g'], 957, rowY + rowHeight / 2 + 6);
    });
    
    // 9. Footer Section
    const footerY = 1795;
    
    ctx.fillStyle = COLORS.maroon;
    ctx.beginPath();
    ctx.roundRect(70, footerY, WIDTH - 140, 36, 6);
    ctx.fill();
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    
    ctx.fillStyle = COLORS.white;
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText("Net Wt: 100GMs & 250GMs | Other Sizes & Bulk Quantities Available on Request", WIDTH / 2, footerY + 22);
    
    // Website QR Code rendering (exact 9:16 story corner placement)
    try {
        const qrBuffer = await QRCode.toBuffer('https://telugudelicacies.com', {
            margin: 1,
            width: 130,
            color: {
                dark: COLORS.maroon,
                light: COLORS.bg
            }
        });
        const qrImg = await loadImage(qrBuffer);
        
        const qrX = 930;
        const qrY = 1840;
        const qrSize = 64;
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2);
        
        ctx.textAlign = 'right';
        ctx.fillStyle = COLORS.textLight;
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText("Browse & Order online at:", qrX - 12, 1864);
        ctx.fillStyle = COLORS.maroon;
        ctx.font = 'bold 15px "Georgia", serif';
        ctx.fillText("telugudelicacies.com", qrX - 12, 1884);
    } catch (err) {
        console.error("Failed to render QR Code on canvas:", err);
    }
    
    // WhatsApp Order details
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.textDark;
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText("Order via WhatsApp: +91 96185 19191", 125, 1878);
    
    // WhatsApp green logo circle
    const waIconX = 90;
    const waIconY = 1871;
    ctx.beginPath();
    ctx.arc(waIconX, waIconY - 7, 11, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.greenLogo;
    ctx.fill();
    ctx.fillStyle = COLORS.white;
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("wa", waIconX, waIconY - 3);
    
    // 10. Write canvas to file
    const outputImagePath = path.join(__dirname, 'Telugu_Delicacies_Catalog.png');
    const out = fs.createWriteStream(outputImagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => {
        console.log(`Success! Catalog image generated successfully at ${outputImagePath}`);
    });
}

run().catch(err => {
    console.error("Execution error:", err);
});
