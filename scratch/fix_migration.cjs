const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'database', 'migration_new_products_and_discriptor.sql');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of "packaging": with "packaging_type":
content = content.replace(/"packaging":/g, '"packaging_type":');

fs.writeFileSync(filePath, content);
console.log('Fixed packaging_type keys in migration SQL.');
