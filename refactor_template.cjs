const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'Data for Catalogue', 'premium_catalogue_template.html');
let content = fs.readFileSync(filePath, 'utf8');

// Remove controls
content = content.replace(/<div class="controls">[\s\S]*?<\/div>/, '');

// Replace script
const newScript = `    <script>
        window.injectProductData = function(p) {
            const cat = p.catalogue_category || 'General';
            const catBadge = document.getElementById('pCategory');
            if (catBadge) catBadge.innerText = cat.toUpperCase();
            
            let catColor = '#e6b201'; // General
            let darkColor = '#b88e00';
            if(cat.toLowerCase().includes('health')) { catColor = '#cc7722'; darkColor = '#9a5511'; }
            else if(cat.toLowerCase().includes('sprinkling')) { catColor = '#007c81'; darkColor = '#00595d'; }
            else if(cat.toLowerCase().includes('leafy')) { catColor = '#2d5a27'; darkColor = '#1a3b16'; }
            else if(cat.toLowerCase().includes('nutty')) { catColor = '#e64456'; darkColor = '#b83443'; }
            else if(cat.toLowerCase().includes('tasty')) { catColor = '#cc7722'; darkColor = '#9a5511'; }
            
            if (catBadge) catBadge.style.backgroundColor = catColor;
            document.documentElement.style.setProperty('--copper-primary', catColor);
            document.documentElement.style.setProperty('--copper-dark', darkColor);

            if (document.getElementById('pTitleEn')) document.getElementById('pTitleEn').innerText = p.product_name || '';
            if (document.getElementById('pTitleTe')) document.getElementById('pTitleTe').innerText = p.product_name_telugu || '';
            if (document.getElementById('pTagline')) document.getElementById('pTagline').innerText = p.product_tagline || '';
            if (document.getElementById('pDesc')) document.getElementById('pDesc').innerText = p.product_description || '';
            if (document.getElementById('pHero1Name')) document.getElementById('pHero1Name').innerText = p.hero_ingredient_1 || '';
            if (document.getElementById('pHero2Name')) document.getElementById('pHero2Name').innerText = p.hero_ingredient_2 || '';
            if (document.getElementById('pIngredients')) document.getElementById('pIngredients').innerText = p.ingredients || '';
            
            if (document.getElementById('pVeg')) document.getElementById('pVeg').innerText = p.is_veg === 'Yes' ? 'Veg' : 'Non-Veg';
            if (document.getElementById('pVegan')) document.getElementById('pVegan').innerText = p.is_vegan === 'Yes' ? 'Vegan' : 'Non-Vegan';
            if (document.getElementById('pNuts')) document.getElementById('pNuts').innerText = (p.contains_nuts && p.contains_nuts !== 'No') ? 'Contains Nuts' : 'Nut Free';
            if (document.getElementById('pJain')) document.getElementById('pJain').innerText = p.is_jain === 'Yes' ? 'Jain Friendly' : 'Not Jain';

            if (document.getElementById('pPriceJar')) document.getElementById('pPriceJar').innerHTML = \`100g Glass Jar <span>₹\${p.price_100g_glass_jar || '-'}</span>\`;
            if (document.getElementById('pPrice100')) document.getElementById('pPrice100').innerHTML = \`100g Standup <span>₹\${p.price_100g_standup || '-'}</span>\`;
            if (document.getElementById('pPrice250')) document.getElementById('pPrice250').innerHTML = \`250g Standup <span>₹\${p.price_250g_standup || '-'}</span>\`;
            if (document.getElementById('pPrice500')) document.getElementById('pPrice500').innerHTML = \`500g Pouch <span>₹\${p.price_500g_pouch || '-'}</span>\`;
            if (document.getElementById('pPrice1000')) document.getElementById('pPrice1000').innerHTML = \`1kg Pouch <span>₹\${p.price_1kg_pouch || '-'}</span>\`;

            if (document.getElementById('pHowToUse')) document.getElementById('pHowToUse').innerText = p.serving_suggestion || '';

            if (document.getElementById('pNutriServing')) document.getElementById('pNutriServing').innerText = \`(Per serving \${p.nutrition_serving_size || '5g'})\`;
            if (document.getElementById('pCal')) document.getElementById('pCal').innerText = p.nutrition_calories || '-';
            if (document.getElementById('pFat')) document.getElementById('pFat').innerText = p.nutrition_total_fat || '-';
            if (document.getElementById('pSatFat')) document.getElementById('pSatFat').innerText = p.nutrition_saturated_fat || '-';
            if (document.getElementById('pSugar')) document.getElementById('pSugar').innerText = p.nutrition_sugars || '-';
            if (document.getElementById('pPro')) document.getElementById('pPro').innerText = p.nutrition_protein || '-';
            if (document.getElementById('pCarb')) document.getElementById('pCarb').innerText = p.nutrition_carbs || '-';
            if (document.getElementById('pFiber')) document.getElementById('pFiber').innerText = p.nutrition_fiber || '-';
            if (document.getElementById('pSod')) document.getElementById('pSod').innerText = p.nutrition_sodium || '-';

            if (document.getElementById('pShelf')) document.getElementById('pShelf').innerText = (p.shelf_life_days || '-') + ' Days';
            const webUrl = p.webpage_url || 'https://telugudelicacies.com';
            if (document.getElementById('pWebQR')) document.getElementById('pWebQR').src = \`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=\${encodeURIComponent(webUrl)}\`;

            // Images
            if(p.jarImgUrl && document.getElementById('jarImg')) document.getElementById('jarImg').src = p.jarImgUrl;
            if(p.pouchImgUrl && document.getElementById('pouchImg')) document.getElementById('pouchImg').src = p.pouchImgUrl;
            if(p.hero1ImgUrl && document.getElementById('hero1Img')) document.getElementById('hero1Img').src = p.hero1ImgUrl;
            if(p.hero2ImgUrl && document.getElementById('hero2Img')) document.getElementById('hero2Img').src = p.hero2ImgUrl;
            
            if(p.hero_ingredient_3 && p.hero3ImgUrl) {
                if (document.getElementById('hero3Container')) document.getElementById('hero3Container').style.display = 'block';
                if (document.getElementById('pHero3Name')) document.getElementById('pHero3Name').innerText = p.hero_ingredient_3;
                if (document.getElementById('hero3Img')) document.getElementById('hero3Img').src = p.hero3ImgUrl;
            } else {
                if (document.getElementById('hero3Container')) document.getElementById('hero3Container').style.display = 'none';
            }
        };
    </script>`;

content = content.replace(/<script>[\s\S]*?<\/script>/, newScript);

// Remove image upload inputs just to be clean
content = content.replace(/<input type="file"[^>]*>/g, '');

// Save
fs.writeFileSync(filePath, content, 'utf8');
console.log('Template refactored successfully.');
