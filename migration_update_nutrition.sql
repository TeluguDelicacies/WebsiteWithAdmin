-- Migration to update 'nutrition_info' for Ready to Eat products with detailed breakdown

-- Format: JSON with keys: serving_size, total_servings, calories, protein, total_fat, saturated_fat, carbs, fiber, sugars, sodium
-- Note: Values are stored as strings. We will aim to keep units in the string if provided in the source for clarity, 
-- or stripping 'g' if strictly adhering to previous number-only schema? 
-- The user provided "Protein 0.7g", so we will store "0.7g". 
-- (You may need to update sales.html to not double-append 'g' if it detects it).

UPDATE products SET nutrition_info = '{
    "serving_size": "5g",
    "total_servings": "20",
    "calories": "20.88kcal",
    "protein": "0.7g",
    "total_fat": "1.49g",
    "saturated_fat": "0.75g",
    "carbs": "1.51g",
    "fiber": "0.64g",
    "sugars": "0.31g",
    "sodium": "0.08g"
}' WHERE product_name = 'Kadapa Kaaram';

UPDATE products SET nutrition_info = '{
    "serving_size": "5g",
    "total_servings": "20",
    "calories": "14.95kcal",
    "protein": "0.63g",
    "total_fat": "0.4g",
    "saturated_fat": "0.15g",
    "carbs": "2.47g",
    "fiber": "0.91g",
    "sugars": "0.52g",
    "sodium": "0.11g"
}' WHERE product_name = 'Nalla Kaaram';

UPDATE products SET nutrition_info = '{
    "serving_size": "5g",
    "total_servings": "20",
    "calories": "16.96kcal",
    "protein": "0.58g",
    "total_fat": "0.3g",
    "saturated_fat": "0.2g",
    "carbs": "3.01g",
    "fiber": "0.83g",
    "sugars": "0.1g",
    "sodium": "0.07g"
}' WHERE product_name = 'Godhuma Kaaram';

UPDATE products SET nutrition_info = '{
    "serving_size": "5g",
    "total_servings": "20",
    "calories": "21.5kcal",
    "protein": "0.36g",
    "total_fat": "1.73g",
    "saturated_fat": "1.54g",
    "carbs": "1.41g",
    "fiber": "0.74g",
    "sugars": "0.23g",
    "sodium": "0.17g"
}' WHERE product_name = 'Velluli Kaaram';

UPDATE products SET nutrition_info = '{
    "serving_size": "5g",
    "total_servings": "20",
    "calories": "25.87kcal",
    "protein": "1.24g",
    "total_fat": "2.04g",
    "saturated_fat": "0.36g",
    "carbs": "1.02g",
    "fiber": "0.64g",
    "sugars": "0.2g",
    "sodium": "0.07g"
}' WHERE product_name = 'Palli Kaaram';

UPDATE products SET nutrition_info = '{
    "serving_size": "5g",
    "total_servings": "20",
    "calories": "20.56kcal",
    "protein": "0.84g",
    "total_fat": "0.5g",
    "saturated_fat": "0.13g",
    "carbs": "2.09g",
    "fiber": "1.06g",
    "sugars": "0.18g",
    "sodium": "0.1g"
}' WHERE product_name = 'Avisaginjala Kaaram';

UPDATE products SET nutrition_info = '{
    "serving_size": "5g",
    "total_servings": "20",
    "calories": "13.43kcal",
    "protein": "0.85g",
    "total_fat": "0.39g",
    "saturated_fat": "0.06g",
    "carbs": "1.85g",
    "fiber": "0.62g",
    "sugars": "0.09g",
    "sodium": "0.22g"
}' WHERE product_name = 'Moringa Kaaram';

UPDATE products SET nutrition_info = '{
    "serving_size": "5g",
    "total_servings": "20",
    "calories": "11.21kcal",
    "protein": "0.65g",
    "total_fat": "0.22g",
    "saturated_fat": "0.05g",
    "carbs": "2.07g",
    "fiber": "0.94g",
    "sugars": "0.08g",
    "sodium": "0.21g"
}' WHERE product_name = 'Pudina Kaaram';

UPDATE products SET nutrition_info = '{
    "serving_size": "5g",
    "total_servings": "20",
    "calories": "16.39kcal",
    "protein": "0.69g",
    "total_fat": "0.2g",
    "saturated_fat": "0.02g",
    "carbs": "3.21g",
    "fiber": "0.84g",
    "sugars": "0.17g",
    "sodium": "0.05g"
}' WHERE product_name = 'Dosa Kaaram';

UPDATE products SET nutrition_info = '{
    "serving_size": "5g",
    "total_servings": "20",
    "calories": "18kcal",
    "protein": "0.9g",
    "total_fat": "0.55g",
    "saturated_fat": "0.31g",
    "carbs": "2.53g",
    "fiber": "0.6g",
    "sugars": "0.45g",
    "sodium": "0.06g"
}' WHERE product_name = 'Kandi Podi';

UPDATE products SET nutrition_info = '{
    "serving_size": "5g",
    "total_servings": "20",
    "calories": "12.71kcal",
    "protein": "0.81g",
    "total_fat": "0.2g",
    "saturated_fat": "0.05g",
    "carbs": "2.39g",
    "fiber": "1.33g",
    "sugars": "0.23g",
    "sodium": "0.13g"
}' WHERE product_name = 'Karivepaku Podi';

UPDATE products SET nutrition_info = '{
    "serving_size": "5g",
    "total_servings": "20",
    "calories": "19.99kcal",
    "protein": "0.87g",
    "total_fat": "1.03g",
    "saturated_fat": "0.16g",
    "carbs": "2.23g",
    "fiber": "0.69g",
    "sugars": "0.85g",
    "sodium": "0.13g"
}' WHERE product_name = 'Palli Dhaniya Podi';

UPDATE products SET nutrition_info = '{
    "serving_size": "5g",
    "total_servings": "20",
    "calories": "17.73kcal",
    "protein": "1.06g",
    "total_fat": "0.16g",
    "saturated_fat": "0.02g",
    "carbs": "3g",
    "fiber": "1.05g",
    "sugars": "0.33g",
    "sodium": "0.03g"
}' WHERE product_name = 'Idli Podi';

UPDATE products SET nutrition_info = '{
    "serving_size": "40g",
    "total_servings": "20",
    "calories": "127.92kcal",
    "protein": "5.03g",
    "total_fat": "3.08g",
    "saturated_fat": "1.3g",
    "carbs": "22.92g",
    "fiber": "7.42g",
    "sugars": "2.16g",
    "sodium": "1.13g"
}' WHERE product_name = 'Sambar Premix';

UPDATE products SET nutrition_info = '{
    "serving_size": "40g",
    "total_servings": "2.5",
    "calories": "172.38kcal",
    "protein": "8.58g",
    "total_fat": "11.38g",
    "saturated_fat": "1.92g",
    "carbs": "10.68g",
    "fiber": "3.54g",
    "sugars": "2.49g",
    "sodium": "0.26g"
}' WHERE product_name = 'Chutney Premix';

UPDATE products SET nutrition_info = '{
    "serving_size": "40g",
    "total_servings": "20",
    "calories": "146.89kcal",
    "protein": "7.23g",
    "total_fat": "2.84g",
    "saturated_fat": "0.42g",
    "carbs": "23.55g",
    "fiber": "4.57g",
    "sugars": "0.89g",
    "sodium": "0.04g"
}' WHERE product_name = 'MultiGrain Mix';
