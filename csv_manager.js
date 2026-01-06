// ========================================
// GENERIC CSV IMPORT / EXPORT MANAGER
// ========================================
console.log('CSV Manager Module Loading...');

let csvParsedData = []; // Store parsed data for Preview -> Apply workflow

const CsvManager = {
    /**
     * Open Modal - Adjust UI based on View
     */
    openCsvModal: () => {
        document.getElementById('csvModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Toggle Field Selection visibility
        const state = window.getAppState();
        const fieldSel = document.querySelector('#csvExportSection > div:nth-child(2)');
        if (fieldSel) {
            fieldSel.style.display = (state.currentView === 'products') ? 'block' : 'none';
        }

        CsvManager.clearCsvUpload();
    },

    closeCsvModal: () => {
        document.getElementById('csvModal').style.display = 'none';
        document.body.style.overflow = '';
    },

    // Tab Switching
    switchCsvTab: (tab) => {
        const exportTab = document.getElementById('csvExportTab');
        const importTab = document.getElementById('csvImportTab');
        const exportSection = document.getElementById('csvExportSection');
        const importSection = document.getElementById('csvImportSection');

        if (tab === 'export') {
            exportTab.classList.add('active');
            importTab.classList.remove('active');
            exportSection.style.display = 'block';
            importSection.style.display = 'none';
        } else {
            exportTab.classList.remove('active');
            importTab.classList.add('active');
            exportSection.style.display = 'none';
            importSection.style.display = 'block';
        }
    },

    clearCsvUpload: () => {
        csvParsedData = [];
        const fileInput = document.getElementById('csvFileInput');
        if (fileInput) fileInput.value = '';
        document.getElementById('csvPreviewArea').style.display = 'none';
        document.getElementById('csvPreviewTable').innerHTML = '';
    },

    /**
     * Select/Deselect All Checkboxes
     */
    selectAllCsvFields: (check) => {
        const inputs = document.querySelectorAll('#csvExportSection input[type="checkbox"]:not(:disabled)');
        inputs.forEach(input => input.checked = check);
    },


    /**
     * Main Export Handler (Shim for UI button)
     */
    exportProductsCsv: async () => {
        const state = window.getAppState();
        await CsvManager.handleGenericExport(state.currentView);
    },

    /**
     * Generic Export Logic
     */
    handleGenericExport: async (type) => {
        if (!type) { showToast('Unknown export type', 'error'); return; }

        showToast(`Preparing ${type} export...`, 'info');
        let data = [];
        let filename = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;

        try {
            if (type === 'products') {
                await window.fetchProducts();
                const state = window.getAppState(); // Fresh State

                const isChecked = (id) => document.getElementById(id)?.checked;

                data = (state.allProducts || []).map(p => {
                    const row = { id: p.id };
                    row.command = '';

                    // Standard Fields
                    if (isChecked('csvFieldName')) row.product_name = p.product_name;
                    if (isChecked('csvFieldNameTelugu')) row.product_name_telugu = p.product_name_telugu || '';
                    if (isChecked('csvFieldCategory')) row.product_category = p.product_category;
                    if (isChecked('csvFieldTagline')) row.product_tagline = p.product_tagline || '';
                    if (isChecked('csvFieldDescription')) row.product_description = p.product_description || '';
                    if (isChecked('csvFieldIngredients')) row.ingredients = p.ingredients || '';
                    if (isChecked('csvFieldServing')) row.serving_suggestion = p.serving_suggestion || '';

                    // Nutrition Fields
                    const nutri = p.nutrition_info || {};
                    if (isChecked('csvFieldServingSize')) row.serving_size = nutri.serving_size || nutri.details || '';

                    if (isChecked('csvFieldNutrition')) {
                        // Format: "Calories: 20kcal, Protein: 1g"
                        const parts = [];
                        for (const [key, val] of Object.entries(nutri)) {
                            if (key === 'serving_size' || key === 'details') continue; // Skip serving size
                            const cleanKey = key.charAt(0).toUpperCase() + key.slice(1);
                            parts.push(`${cleanKey}: ${val}`);
                        }
                        row.nutrition = parts.join(', ');
                    }

                    if (isChecked('csvFieldTrending')) row.is_trending = p.is_trending;
                    if (isChecked('csvFieldVisible')) row.is_visible = p.is_visible;

                    const wantVariants = isChecked('csvFieldVariantQty') || isChecked('csvFieldVariantMrp') ||
                        isChecked('csvFieldVariantPrice') || isChecked('csvFieldVariantStock');

                    if (wantVariants) {
                        row.quantity_variants = JSON.stringify(p.quantity_variants || []);
                        row.base_price = p.mrp;     // Backup
                        row.total_stock = p.total_stock; // Backup
                    }

                    return row;
                });

            } else if (type === 'categories') {
                const { data: catData, error } = await supabase.from('categories').select('*').order('display_order');
                if (error) throw error;
                data = catData.map(c => ({
                    id: c.id,
                    command: '',
                    title: c.title,
                    slug: c.slug,
                    display_order: c.display_order,
                    is_visible: c.is_visible
                }));
            } else if (type === 'testimonials') {
                const { data: testData, error } = await supabase.from('testimonials').select('*').order('created_at');
                if (error) throw error;
                data = testData.map(t => ({
                    id: t.id,
                    command: '',
                    name: t.name,
                    message: t.message,
                    rating: t.rating,
                    location: t.location,
                    product_name: t.product_name,
                    is_visible: t.is_visible,
                    display_order: t.display_order
                }));
            }

            CsvManager.exportToCSV(data, filename);

        } catch (error) {
            console.error('Export Error:', error);
            showToast('Failed to export: ' + error.message, 'error');
        }
    },

    exportToCSV: (data, filename) => {
        if (!data || data.length === 0) {
            showToast('No data to export', 'error');
            return;
        }
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Export");
        XLSX.writeFile(wb, filename);
        showToast('Export successful!', 'success');
    },


    /**
     * Handle CSV Upload (Parse & Preview)
     */
    handleCsvUpload: (event) => {
        const file = event.target.files[0];
        if (!file) return;

        console.log('Parsing file:', file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const firstSheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet); // Auto-headers

                console.log('Check parsed rows:', jsonData.length);

                if (jsonData.length === 0) {
                    showToast('File is empty', 'error');
                    return;
                }

                csvParsedData = jsonData;
                CsvManager.renderCsvPreview(jsonData);

                document.getElementById('csvPreviewArea').style.display = 'block';
                document.getElementById('csvPreviewCount').textContent = `(${jsonData.length} rows)`;
                showToast(`Loaded ${jsonData.length} rows`, 'success');

            } catch (error) {
                console.error('Parse Error:', error);
                showToast('Parse failed: ' + error.message, 'error');
            }
        };
        reader.onerror = (err) => {
            console.error('FileReader Error:', err);
            showToast('FileReader failed', 'error');
        };
        reader.readAsArrayBuffer(file);
    },

    renderCsvPreview: (data) => {
        const container = document.getElementById('csvPreviewTable');
        const previewData = data.slice(0, 10);
        if (previewData.length === 0) return;

        const headers = Object.keys(previewData[0]);
        let html = '<table><thead><tr>';
        headers.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';

        previewData.forEach(row => {
            html += '<tr>';
            headers.forEach(h => html += `<td>${row[h] || ''}</td>`);
            html += '</tr>';
        });
        html += '</tbody></table>';

        if (data.length > 10) {
            html += `<p style="text-align: center; color: #666;">...and ${data.length - 10} more</p>`;
        }
        container.innerHTML = html;
    },

    /**
     * Process Import (Apply Changes)
     */
    processCsvImport: async () => {
        if (csvParsedData.length === 0) {
            showToast('No data to interpret', 'error');
            return;
        }
        const state = window.getAppState();
        await CsvManager.processGenericImport(csvParsedData, state.currentView);
        CsvManager.clearCsvUpload();
    },


    /**
     * Core Import Logic (Add/Update/Delete)
     */
    processGenericImport: async (rows, type) => {
        console.log(`Starting Import for ${type} with ${rows.length} rows`);
        showToast(`Processing ${rows.length} rows for ${type}...`, 'info');

        let tableName = '';
        if (type === 'products') tableName = 'products';
        else if (type === 'categories') tableName = 'categories';
        else if (type === 'testimonials') tableName = 'testimonials';
        else {
            showToast('Unknown table for import', 'error');
            return;
        }

        let stats = { added: 0, updated: 0, deleted: 0, errors: 0 };

        for (const row of rows) {
            try {
                // Skip truly empty rows
                if (!row || Object.keys(row).length < 2) continue;

                // 1. Normalize Command
                const command = (row.command || row.COMMAND || '').toString().toUpperCase().trim();

                // 2. Normalize ID (Handle product_id, category_id, etc.)
                let id = row.id || row.ID || row.product_id || row.category_id || row.testimonial_id || row.ID_COLUMN;

                // 3. Prepare Payload (Clean of non-existent DB columns)
                const payload = { ...row };

                // Remove all possible ID column variations and command from payload
                const keysToRemove = [
                    'id', 'ID', 'product_id', 'category_id', 'testimonial_id',
                    'command', 'COMMAND', 'ID_COLUMN'
                ];
                keysToRemove.forEach(key => delete payload[key]);

                if (type === 'products') {
                    // Handle quantity_variants serialization
                    if (typeof payload.quantity_variants === 'string') {
                        try {
                            payload.quantity_variants = JSON.parse(payload.quantity_variants);
                        } catch (e) {
                            // Keep as is
                        }
                    }

                    // 4. Handle Nutrition Logic (Robust merge)
                    const newNutri = {};

                    // Case A: Serving Size
                    if (row.serving_size !== undefined && row.serving_size !== '') {
                        newNutri.serving_size = row.serving_size;
                    }

                    // Case B: Nutrition Info as a single string
                    if (row.nutrition) {
                        const parts = row.nutrition.split(',');
                        parts.forEach(p => {
                            p = p.trim();
                            if (!p) return;
                            let k, v;
                            if (p.includes(':')) {
                                [k, v] = p.split(':').map(s => s.trim());
                            } else {
                                const match = p.match(/^(.+?)\s+(\d[\d\.]*[a-zA-Z%]*)$/);
                                if (match) {
                                    k = match[1].trim();
                                    v = match[2].trim();
                                }
                            }
                            if (k && v) {
                                const finalKey = k.toLowerCase().replace(/\s+/g, '_');
                                newNutri[finalKey] = v;
                                console.log(`Parsed Nutrition: [${k}] -> [${finalKey}]: ${v}`);
                            }
                        });
                    }

                    // Case C: Individual columns
                    const nutritionColumns = ['calories', 'protein', 'total_fat', 'saturated_fat', 'carbs', 'fiber', 'sugars', 'sodium'];
                    nutritionColumns.forEach(col => {
                        if (row[col] !== undefined && row[col] !== '') {
                            newNutri[col] = row[col];
                            delete payload[col]; // Remove from flat payload
                        }
                    });

                    if (Object.keys(newNutri).length > 0) {
                        payload.nutrition_info = newNutri;
                        console.log('Constructed nutrition_info:', payload.nutrition_info);
                    }

                    delete payload.nutrition;
                    delete payload.serving_size;

                    // Remove any other common columns that might be in CSV but NOT in DB root
                    // (Like variant columns if expanded)
                    const extraKeys = ['variant_index', 'variant_quantity', 'variant_mrp', 'variant_price', 'variant_stock'];
                    extraKeys.forEach(k => delete payload[k]);
                }

                // 5. Execute Supabase Query
                if (command === 'DELETE') {
                    if (id) {
                        const { error } = await supabase.from(tableName).delete().eq('id', id);
                        if (error) throw error;
                        stats.deleted++;
                    }
                }
                else if (id) {
                    console.log(`Updating ${tableName} ID: ${id}`, payload);
                    const { error } = await supabase.from(tableName).update(payload).eq('id', id);
                    if (error) throw error;
                    stats.updated++;
                }
                else {
                    console.log(`Inserting into ${tableName}`, payload);
                    const { error } = await supabase.from(tableName).insert([payload]);
                    if (error) throw error;
                    stats.added++;
                }

            } catch (err) {
                console.error('Row Import Error:', err, row);
                stats.errors++;
            }
        }

        // Refresh UI
        if (type === 'products' && window.fetchProducts) window.fetchProducts();
        if (type === 'categories' && window.fetchCategories) window.fetchCategories();
        if (type === 'testimonials' && window.fetchTestimonials) window.fetchTestimonials();

        let msg = `Done! +${stats.added}, ~${stats.updated}, -${stats.deleted}`;
        if (stats.errors > 0) msg += `, ${stats.errors} Failed`;
        showToast(msg, stats.errors > 0 ? 'warning' : 'success');
    }
};

// Expose to window
window.CsvManager = CsvManager;
console.log('CSV Manager Loaded and Attached to window.CsvManager');
