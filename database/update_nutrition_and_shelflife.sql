-- Migration: Update nutrition_info and shelf_life for existing products

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shelf_life TEXT;

UPDATE public.products 
SET 
    shelf_life = '90', 
    nutrition_info = '{"calories":"20.84kcal","protein":"0.85g","total_fat":"1.13g","saturated_fat":"0.14g","carbs":"2.03g","fiber":"1.1g","sugars":"0.21g","sodium":"0.1g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Avisaginjala Kaaram';

UPDATE public.products 
SET 
    shelf_life = '60', 
    nutrition_info = '{"calories":"24.99kcal","protein":"0.96g","total_fat":"1.86g","saturated_fat":"0.3g","carbs":"1.46g","fiber":"0.61g","sugars":"0.13g","sodium":"0.06g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Chinthaku Podi';

UPDATE public.products 
SET 
    shelf_life = '90', 
    nutrition_info = '{"calories":"16.16kcal","protein":"0.67g","total_fat":"0.2g","saturated_fat":"0.02g","carbs":"3.13g","fiber":"0.83g","sugars":"0.17g","sodium":"0.09g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Dosa Kaaram';

UPDATE public.products 
SET 
    shelf_life = '60', 
    nutrition_info = '{"calories":"20.88kcal","protein":"0.7g","total_fat":"1.49g","saturated_fat":"0.75g","carbs":"1.51g","fiber":"0.64g","sugars":"0.31g","sodium":"0.08g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Kadapa Kaaram';

UPDATE public.products 
SET 
    shelf_life = '90', 
    nutrition_info = '{"calories":"16.02kcal","protein":"0.92g","total_fat":"0.29g","saturated_fat":"0.04g","carbs":"2.71g","fiber":"0.92g","sugars":"0.12g","sodium":"0.08g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Kandi Podi';

UPDATE public.products 
SET 
    shelf_life = '90', 
    nutrition_info = '{"calories":"12.71kcal","protein":"0.81g","total_fat":"0.2g","saturated_fat":"0.05g","carbs":"2.39g","fiber":"1.33g","sugars":"0.23g","sodium":"0.13g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Karivepaku Podi';

UPDATE public.products 
SET 
    shelf_life = '90', 
    nutrition_info = '{"calories":"17.22kcal","protein":"1.03g","total_fat":"0.16g","saturated_fat":"0.02g","carbs":"2.91g","fiber":"1.02g","sugars":"0.32g","sodium":"0.08g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Karnataka Idli Podi';

UPDATE public.products 
SET 
    shelf_life = '30', 
    nutrition_info = '{"calories":"15.47kcal","protein":"0.81g","total_fat":"0.71g","saturated_fat":"0.11g","carbs":"1.88g","fiber":"1.1g","sugars":"0.35g","sodium":"0.09g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Konaseema Kaaram';

UPDATE public.products 
SET 
    shelf_life = '45', 
    nutrition_info = '{"calories":"20.76kcal","protein":"0.39g","total_fat":"1.64g","saturated_fat":"1.37g","carbs":"1.55g","fiber":"0.95g","sugars":"0.23g","sodium":"0.2g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Koora Kaaram';

UPDATE public.products 
SET 
    shelf_life = '60', 
    nutrition_info = '{"calories":"12.34kcal","protein":"0.54g","total_fat":"0.23g","saturated_fat":"0.04g","carbs":"2.37g","fiber":"0.77g","sugars":"0.48g","sodium":"0.26g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Kothimera Kaaram';

UPDATE public.products 
SET 
    shelf_life = '90', 
    nutrition_info = '{"calories":"13.43kcal","protein":"0.85g","total_fat":"0.39g","saturated_fat":"0.06g","carbs":"1.85g","fiber":"0.62g","sugars":"0.09g","sodium":"0.22g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Moringa Kaaram';

UPDATE public.products 
SET 
    shelf_life = '90', 
    nutrition_info = '{"calories":"14.95kcal","protein":"0.63g","total_fat":"0.47g","saturated_fat":"0.15g","carbs":"2.47g","fiber":"0.91g","sugars":"0.52g","sodium":"0.11g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Nalla Kaaram';

UPDATE public.products 
SET 
    shelf_life = '90', 
    nutrition_info = '{"calories":"25.87kcal","protein":"1.24g","total_fat":"2.04g","saturated_fat":"0.36g","carbs":"1.02g","fiber":"0.64g","sugars":"0.2g","sodium":"0.07g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Palli Kaaram';

UPDATE public.products 
SET 
    shelf_life = '60', 
    nutrition_info = '{"calories":"13.89kcal","protein":"0.65g","total_fat":"0.26g","saturated_fat":"0.05g","carbs":"2.65g","fiber":"0.95g","sugars":"0.47g","sodium":"0.26g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Pudina Kaaram';

UPDATE public.products 
SET 
    shelf_life = '90', 
    nutrition_info = '{"calories":"18kcal","protein":"0.9g","total_fat":"0.55g","saturated_fat":"0.31g","carbs":"2.53g","fiber":"0.6g","sugars":"0.45g","sodium":"0.06g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Putnala Podi';

UPDATE public.products 
SET 
    shelf_life = '90', 
    nutrition_info = '{"calories":"17.24kcal","protein":"0.68g","total_fat":"0.41g","saturated_fat":"0.2g","carbs":"2.93g","fiber":"0.76g","sugars":"0.09g","sodium":"0.07g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Special Godhuma Kaaram';

UPDATE public.products 
SET 
    shelf_life = '60', 
    nutrition_info = '{"calories":"19.99kcal","protein":"0.87g","total_fat":"1.03g","saturated_fat":"0.16g","carbs":"2.23g","fiber":"0.69g","sugars":"0.85g","sodium":"0.13g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Special Palli Kaaram';

UPDATE public.products 
SET 
    shelf_life = '60', 
    nutrition_info = '{"calories":"13.23kcal","protein":"0.66g","total_fat":"0.57g","saturated_fat":"0.09g","carbs":"1.64g","fiber":"0.65g","sugars":"0.16g","sodium":"0.09g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Tamalapaaku Kaaram';

UPDATE public.products 
SET 
    shelf_life = '60', 
    nutrition_info = '{"calories":"10.59kcal","protein":"0.42g","total_fat":"0.45g","saturated_fat":"0.07g","carbs":"1.77g","fiber":"0.75g","sugars":"0.17g","sodium":"0.25g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Velluli Kaaram';

UPDATE public.products 
SET 
    shelf_life = '90', 
    nutrition_info = '{"calories":"178.61kcal","protein":"9.01g","total_fat":"10.89g","saturated_fat":"1.83g","carbs":"13.74g","fiber":"5.08g","sugars":"2.74g","sodium":"0.64g","serving_size":"Serving Size 40g, Total Servings 20"}'::jsonb
WHERE product_name = 'Chutney Premix';

UPDATE public.products 
SET 
    shelf_life = '90', 
    nutrition_info = '{"calories":"146.89kcal","protein":"7.23g","total_fat":"2.84g","saturated_fat":"0.42g","carbs":"23.55g","fiber":"4.57g","sugars":"0.89g","sodium":"0.04g","serving_size":"Serving Size 40g, Total Servings 20"}'::jsonb
WHERE product_name = 'MultiGrain Mix';

UPDATE public.products 
SET 
    shelf_life = '120', 
    nutrition_info = '{"calories":"127.92kcal","protein":"5.03g","total_fat":"3.08g","saturated_fat":"1.3g","carbs":"22.92g","fiber":"7.42g","sugars":"2.16g","sodium":"1.13g","serving_size":"Serving Size 40g, Total Servings 20"}'::jsonb
WHERE product_name = 'Sambar Premix';

UPDATE public.products 
SET 
    shelf_life = '120', 
    nutrition_info = '{"calories":"13.46kcal","protein":"0.32g","total_fat":"0.14g","saturated_fat":"0.04g","carbs":"3.08g","fiber":"0.6g","sugars":"0.92g","sodium":"0.3g","serving_size":"Serving Size 5g, Total Servings 20"}'::jsonb
WHERE product_name = 'Peri Peri Masala';

UPDATE public.products 
SET 
    shelf_life = NULL, 
    nutrition_info = '{"serving_size":"Total_servings 20"}'::jsonb
WHERE product_name = 'Ragi Chapati';

UPDATE public.products 
SET 
    shelf_life = NULL, 
    nutrition_info = '{"carbs":"37.25g","fiber":"1.32g","sodium":"0.19g","sugars":"0.13g","protein":"5.03g","calories":"211.73kcal","total_fat":"4.16g","saturated_fat":"0.89g","serving_size":"Total_servings 20"}'::jsonb
WHERE product_name = 'Malabar Parota (10pcs)';

UPDATE public.products 
SET 
    shelf_life = NULL, 
    nutrition_info = '{"carbs":"35.36g","fiber":"5.26g","sodium":"0.98g","sugars":"0.2g","protein":"6.48g","calories":"201.24kcal","total_fat":"4.79g","saturated_fat":"1.03g","serving_size":"Total_servings 20, Additional_info 0.25gms Trans Fat per serving."}'::jsonb
WHERE product_name = 'Whole Wheat Parota';

UPDATE public.products 
SET 
    shelf_life = NULL, 
    nutrition_info = '{"carbs":"21.72g","fiber":"3.46g","sodium":"0.11g","sugars":"0.12g","protein":"3.87g","calories":"108.33kcal","total_fat":"1.22g","saturated_fat":"0.18g","serving_size":"Total_servings 20"}'::jsonb
WHERE product_name = 'Poori';

UPDATE public.products 
SET 
    shelf_life = NULL, 
    nutrition_info = '{"carbs":"16.55g","fiber":"2.46g","sodium":"0.09g","sugars":"0.09g","protein":"3.03g","calories":"88.32kcal","total_fat":"1.58g","saturated_fat":"0.22g","serving_size":"Total_servings 20"}'::jsonb
WHERE product_name = 'Wheat Chapathi';

UPDATE public.products 
SET 
    shelf_life = NULL, 
    nutrition_info = '{"carbs":"35.36g","fiber":"5.26g","sodium":"0.98g","sugars":"0.2g","protein":"6.48g","calories":"201.24kcal","total_fat":"4.79g","saturated_fat":"1.03g","serving_size":"Total_servings 20"}'::jsonb
WHERE product_name = 'Malabar Parota (5pcs)';

