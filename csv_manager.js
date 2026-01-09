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
        CsvManager.switchCsvTab('export');
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
            document.getElementById('csvExportBtn').style.display = 'block';
            document.getElementById('csvApplyBtn').style.display = 'none';
        } else {
            exportTab.classList.remove('active');
            importTab.classList.add('active');
            exportSection.style.display = 'none';
            importSection.style.display = 'block';
            document.getElementById('csvExportBtn').style.display = 'none';
            // Show Apply button only if data exists
            const hasData = csvParsedData && csvParsedData.length > 0;
            document.getElementById('csvApplyBtn').style.display = hasData ? 'block' : 'none';
        }
    },

    clearCsvUpload: () => {
        csvParsedData = [];
        const fileInput = document.getElementById('csvFileInput');
        if (fileInput) fileInput.value = '';
        document.getElementById('csvPreviewArea').style.display = 'none';
        document.getElementById('csvPreviewTable').innerHTML = '';
        document.getElementById('csvApplyBtn').style.display = 'none';
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
                const expandVariants = isChecked('csvExpandVariants');

                const products = state.allProducts || [];
                const exportRows = [];

                products.forEach(p => {
                    const baseRow = { id: p.id };
                    baseRow.command = '';

                    // Standard Fields
                    if (isChecked('csvFieldName')) baseRow.product_name = p.product_name;
                    if (isChecked('csvFieldNameTelugu')) baseRow.product_name_telugu = p.product_name_telugu || '';
                    if (isChecked('csvFieldCategory')) baseRow.product_category = p.product_category;
                    if (isChecked('csvFieldTagline')) baseRow.product_tagline = p.product_tagline || '';
                    if (isChecked('csvFieldDescription')) baseRow.product_description = p.product_description || '';
                    if (isChecked('csvFieldIngredients')) baseRow.ingredients = p.ingredients || '';
                    if (isChecked('csvFieldServing')) baseRow.serving_suggestion = p.serving_suggestion || '';

                    // Nutrition Fields
                    const nutri = p.nutrition_info || {};
                    if (isChecked('csvFieldServingSize')) baseRow.serving_size = nutri.serving_size || nutri.details || '';

                    if (isChecked('csvFieldNutrition')) {
                        const parts = [];
                        for (const [key, val] of Object.entries(nutri)) {
                            if (key === 'serving_size' || key === 'details') continue;
                            const cleanKey = key.charAt(0).toUpperCase() + key.slice(1);
                            parts.push(`${cleanKey}: ${val}`);
                        }
                        baseRow.nutrition = parts.join(', ');
                    }

                    if (isChecked('csvFieldTrending')) baseRow.is_trending = p.is_trending;
                    if (isChecked('csvFieldVisible')) baseRow.is_visible = p.is_visible;
                    if (isChecked('csvFieldShelfLife')) baseRow.shelf_life = p.shelf_life || '';
                    if (isChecked('csvFieldRefrigeration')) baseRow.is_refrigerated = p.is_refrigerated || false;

                    const wantVariants = isChecked('csvFieldVariantQty') || isChecked('csvFieldVariantMrp') ||
                        isChecked('csvFieldVariantPrice') || isChecked('csvFieldVariantStock') || isChecked('csvFieldPackagingType');

                    if (expandVariants && wantVariants) {
                        const variants = p.quantity_variants || [];
                        if (variants.length === 0) {
                            // No variants but we want them? Add one empty variant row or just the base row
                            exportRows.push({ ...baseRow });
                        } else {
                            variants.forEach(v => {
                                const vRow = { ...baseRow };
                                if (isChecked('csvFieldVariantQty')) vRow.variant_qty = v.quantity || '';
                                if (isChecked('csvFieldVariantMrp')) vRow.variant_mrp = v.mrp || '';
                                if (isChecked('csvFieldVariantPrice')) vRow.variant_price = v.price || '';
                                if (isChecked('csvFieldVariantStock')) vRow.variant_stock = v.stock || 0;
                                if (isChecked('csvFieldPackagingType')) vRow.variant_packaging = v.packaging_type || '';
                                exportRows.push(vRow);
                            });
                        }
                    } else {
                        // Standard Single Row
                        const row = { ...baseRow };
                        if (isChecked('csvFieldPackagingType')) {
                            const firstVar = p.quantity_variants?.[0] || {};
                            row.packaging_type = firstVar.packaging_type || '';
                        }
                        if (wantVariants) {
                            row.quantity_variants = JSON.stringify(p.quantity_variants || []);
                        }
                        exportRows.push(row);
                    }
                });

                data = exportRows;

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
                document.getElementById('csvApplyBtn').style.display = 'block';
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
        const previewData = data.slice(0, 15); // Show up to 15 rows
        if (previewData.length === 0) return;

        const headers = Object.keys(previewData[0]);
        let html = `
            <div style="padding: 10px; background: #fff; border-bottom: 1px solid #eee; font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-info-circle"></i>
                Scroll horizontally to see all columns. Showing first ${previewData.length} rows.
            </div>
            <table>
                <thead>
                    <tr>`;

        headers.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';

        previewData.forEach(row => {
            html += '<tr>';
            headers.forEach(h => {
                let val = row[h];
                if (val === undefined || val === null || val === '') {
                    val = '<span style="color: #cbd5e1; font-style: italic;">-</span>';
                }
                html += `<td>${val}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        if (data.length > 15) {
            html += `<div style="text-align: center; padding: 15px; background: #f8fafc; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.85rem;">
                ... and ${data.length - 15} more rows
            </div>`;
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

        // Group rows to handle multi-row variants
        const productGroups = {};
        const others = [];

        rows.forEach(row => {
            if (!row || Object.keys(row).length < 2) return;
            const id = row.id || row.ID || row.product_id || row.category_id || row.testimonial_id || row.ID_COLUMN;

            if (type === 'products') {
                // Group products by ID (for updates/deletes) or by Name (for new products)
                // Use Name as key ONLY if ID is missing and it's a product
                const groupKey = id || (row.product_name ? `NEW_${row.product_name}` : null);
                if (groupKey) {
                    if (!productGroups[groupKey]) productGroups[groupKey] = [];
                    productGroups[groupKey].push(row);
                } else {
                    others.push(row);
                }
            } else {
                // Non-products: group by ID if available, else process individually
                if (id) {
                    if (!productGroups[id]) productGroups[id] = [];
                    productGroups[id].push(row);
                } else {
                    others.push(row);
                }
            }
        });

        // 1. Process Product Groups (Merged Rows)
        for (const [id, groupRows] of Object.entries(productGroups)) {
            try {
                const firstRow = groupRows[0];
                const command = (firstRow.command || firstRow.COMMAND || '').toString().toUpperCase().trim();

                const payload = {};
                const variants = [];

                // Standard product keywords to map from CSV to DB
                const productFields = [
                    'product_name', 'product_name_telugu', 'product_category',
                    'product_tagline', 'product_description', 'ingredients',
                    'serving_suggestion', 'is_trending', 'is_visible',
                    'shelf_life', 'is_refrigerated'
                ];

                // Merge base fields (take from first row or common values)
                productFields.forEach(field => {
                    const value = firstRow[field];
                    if (value !== undefined && value !== '') {
                        if (field === 'is_refrigerated' || field === 'is_visible' || field === 'is_trending') {
                            const valStr = value.toString().toLowerCase();
                            payload[field] = (valStr === 'true' || valStr === '1' || valStr === 'yes');
                        } else {
                            payload[field] = value;
                        }
                    }
                });

                // Handle Nutrition Logic (from first row)
                const nutri = {};
                if (firstRow.serving_size) nutri.serving_size = firstRow.serving_size;
                if (firstRow.nutrition) {
                    firstRow.nutrition.split(',').forEach(p => {
                        const [k, v] = p.split(':').map(s => s.trim());
                        if (k && v) nutri[k.toLowerCase().replace(/\s+/g, '_')] = v;
                    });
                }
                const nutritionCols = ['calories', 'protein', 'total_fat', 'saturated_fat', 'carbs', 'fiber', 'sugars', 'sodium'];
                nutritionCols.forEach(col => {
                    if (firstRow[col] !== undefined && firstRow[col] !== '') nutri[col] = firstRow[col];
                });
                if (Object.keys(nutri).length > 0) payload.nutrition_info = nutri;

                // Handle quantity_variants Recombination
                const isExpanded = groupRows.some(r => r.variant_qty || r.variant_price || r.variant_mrp || r.variant_packaging);

                if (isExpanded) {
                    groupRows.forEach(row => {
                        if (row.variant_qty || row.variant_price) {
                            variants.push({
                                quantity: row.variant_qty || '',
                                price: parseFloat(row.variant_price) || 0,
                                mrp: parseFloat(row.variant_mrp) || parseFloat(row.variant_price) || 0,
                                stock: parseInt(row.variant_stock) || 0,
                                packaging_type: row.variant_packaging || ''
                            });
                        }
                    });
                    if (variants.length > 0) payload.quantity_variants = variants;
                } else if (firstRow.quantity_variants) {
                    // Fallback to JSON format if expanded columns aren't used
                    try {
                        payload.quantity_variants = JSON.parse(firstRow.quantity_variants);
                    } catch (e) { }
                }

                // Execute Logic
                if (command === 'DELETE') {
                    if (!id || id.toString().startsWith('NEW_')) {
                        console.warn('Cannot delete an item without a valid ID');
                        return;
                    }
                    const { error } = await supabase.from(tableName).delete().eq('id', id);
                    if (error) throw error;
                    stats.deleted++;
                } else if (command === 'ADD' || id.toString().startsWith('NEW_')) {
                    // Insertion - Ensure slug for products
                    if (type === 'products') {
                        if (!payload.slug && payload.product_name) {
                            // Simple slug generation if missing
                            payload.slug = payload.product_name.toLowerCase().trim()
                                .replace(/[^a-z0-9\s-]/g, '')
                                .replace(/\s+/g, '-')
                                .replace(/-+/g, '-') + '-' + Math.random().toString(36).substring(7);
                        }
                    }

                    delete payload.id; // Ensure we don't try to insert 'NEW_...' as ID
                    console.log(`Inserting new ${type}:`, payload);
                    const { error } = await supabase.from(tableName).insert([payload]);
                    if (error) throw error;
                    stats.added++;
                } else {
                    // Update
                    if (!id || id.toString().startsWith('NEW_')) {
                        // This case should ideally be ADD if no ID, but just in case
                        console.warn('Attempted to update without ID, skipping or handling as error');
                        return;
                    }
                    console.log(`Updating ${type} ID: ${id}`, payload);
                    const { error } = await supabase.from(tableName).update(payload).eq('id', id);
                    if (error) throw error;
                    stats.updated++;
                }
            } catch (err) {
                console.error(`Group Import Error (${type}, ID/Key: ${id}):`, err);
                stats.errors++;
            }
        }

        // 2. Process Others (Insertions or non-product items)
        for (const row of others) {
            try {
                const command = (row.command || row.COMMAND || '').toString().toUpperCase().trim();
                let id = row.id || row.ID || row.product_id || row.category_id || row.testimonial_id || row.ID_COLUMN;

                const payload = { ...row };
                const keysToRemove = ['id', 'ID', 'product_id', 'category_id', 'testimonial_id', 'command', 'COMMAND', 'ID_COLUMN'];
                keysToRemove.forEach(key => delete payload[key]);

                if (id) {
                    if (command === 'DELETE') {
                        const { error } = await supabase.from(tableName).delete().eq('id', id);
                        if (error) throw error;
                        stats.deleted++;
                    } else {
                        // Updating non-product or item with ID not found in group logic
                        const { error } = await supabase.from(tableName).update(payload).eq('id', id);
                        if (error) throw error;
                        stats.updated++;
                    }
                } else {
                    // Insertion Logic
                    if (command === 'DELETE') {
                        console.warn('Ignoring DELETE command for row without ID');
                        return;
                    }
                    if (type === 'products' && (row.variant_qty || row.variant_price)) {
                        // Handle insertion with expanded variants (if any)
                        payload.quantity_variants = [{
                            quantity: row.variant_qty || '',
                            price: parseFloat(row.variant_price) || 0,
                            mrp: parseFloat(row.variant_mrp) || parseFloat(row.variant_price) || 0,
                            stock: parseInt(row.variant_stock) || 0,
                            packaging_type: row.variant_packaging || ''
                        }];
                        const variantKeys = ['variant_qty', 'variant_price', 'variant_mrp', 'variant_stock', 'variant_packaging'];
                        variantKeys.forEach(k => delete payload[k]);
                    }
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
