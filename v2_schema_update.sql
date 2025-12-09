-- 1. Safely add new columns (Postgres supported syntax)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ingredients TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS nutrition_info JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS serving_suggestion TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_name_telugu TEXT;

-- 2. Update Data (Seed)
-- Kadapa Kaaram
UPDATE public.products 
SET 
    product_name_telugu = 'కడప కారం',
    product_tagline = 'Bold flavor, rich and hearty!',
    product_description = 'A signature Andhra blend that balances peanuts, garlic, and dry coconut with a fiery kick of red chili. Rich, hearty, and versatile — a true taste of Kadapa tradition.',
    ingredients = 'Peanuts, Garlic, Dry Coconut, Cumin, Dry Red Chili, Coriander, Jaggery, Salt, Chili Powder, Curry Leaf, Lemon Salt',
    nutrition_info = '{"calories": "20.88 kcal", "protein": "0.7 g", "fat": "1.49 g", "carbs": "1.51 g", "details": "Per 5g serving"}',
    serving_suggestion = 'Steaming hot rice and ghee, or sprinkled over dosa with ghee for an irresistible twist.'
WHERE product_name ILIKE '%Kadapa Kaaram%';

-- Nalla Kaaram
UPDATE public.products 
SET 
    product_name_telugu = 'నల్ల కారం',
    product_tagline = 'High fiber, gut-friendly spice!',
    product_description = 'A wholesome Andhra classic made with tamarind, dals, and garlic. High in fiber and flavor, this podi adds a tangy, spicy twist to everyday favorites.',
    ingredients = 'Dry Red Chili, Chickpea, Urad Dal, Tamarind, Garlic, Coriander, Cumin, Salt, Ghee, Ginger, Jaggery, Curry Leaf',
    nutrition_info = '{"calories": "14.95 kcal", "protein": "0.63 g", "fat": "0.4 g", "carbs": "2.47 g", "details": "Per 5g serving"}',
    serving_suggestion = 'Sprinkled over hot idlis with ghee or paired with crispy dosas for a flavorful kick.'
WHERE product_name ILIKE '%Nalla Kaaram%';

-- Kandi Podi
UPDATE public.products 
SET 
    product_name_telugu = 'కంది పొడి',
    product_tagline = 'Flavor-packed, protein-rich!',
    product_description = 'A protein-rich lentil blend from Kadapa, combining fried gram, coconut, and garlic for a nutty, savory taste. Traditionally enjoyed with pickle rice and ghee for an extra flavor boost.',
    ingredients = 'Fried Half Gram, Dry Coconut, Garlic, Red Chili Powder, Salt',
    nutrition_info = '{"calories": "17.72 kcal", "protein": "0.89 g", "fat": "0.54 g", "carbs": "2.49 g", "details": "Per 5g serving"}',
    serving_suggestion = 'Traditional Kadapa-style pickle rice and ghee, where it amplifies the complex flavors of pickles.'
WHERE product_name ILIKE '%Kandi Podi%';

-- Palli Kaaram
UPDATE public.products 
SET 
    product_name_telugu = 'పల్లి కారం',
    product_tagline = 'Palli Kaaram. Boldly Telugu!',
    product_description = 'A nutty and spicy Kadapa classic made with peanuts, chili, and curry leaves. A true part of local culture — delicious with rice and ghee. ',
    ingredients = 'Peanuts, Red Chili Powder, Curry Leaf, Dry Red Chili, Garlic, Salt, Cumin',
    nutrition_info = '{"calories": "25.87 kcal", "protein": "1.24 g", "fat": "2.04 g", "carbs": "1.02 g", "details": "Per 5g serving"}',
    serving_suggestion = 'A spoonful with steaming hot rice — adds bold, nutty, and spicy flavor to each mouthful.'
WHERE product_name ILIKE '%Palli Kaaram%';

-- Karivepaku Podi
UPDATE public.products 
SET 
    product_name_telugu = 'కరివేపాకు పొడి',
    product_tagline = 'Earthy. Spicy. Naturally Good!',
    product_description = 'A must-try Andhra specialty made with fragrant curry leaves, dals, and spices. Earthy and wholesome, this podi pairs beautifully with hot rice and ghee for a nourishing meal.',
    ingredients = 'Curry Leaf, Garlic, Urad Dal, Dry Red Chili, Chickpea, Coriander, Tamarind, Salt, Cumin, Fenugreek',
    nutrition_info = '{"calories": "12.71 kcal", "protein": "0.81 g", "fat": "0.2 g", "carbs": "2.39 g", "details": "Per 5g serving"}',
    serving_suggestion = 'Hot steamed rice drizzled with ghee — the classic way to enjoy this podi.'
WHERE product_name ILIKE '%Karivepaku Podi%';

-- Palli Dhaniya Podi
UPDATE public.products 
SET 
    product_name_telugu = 'పల్లి ధనియాల పొడి',
    product_tagline = 'Rustic. Rich. Ridiculously Good.',
    product_description = 'Our best-reviewed podi! A rustic blend of peanuts, coriander, and jaggery that delivers mellow, nutty flavors. Smooth and balanced, it’s even loved by kids when mixed with hot rice and ghee.',
    ingredients = 'Peanuts, Fried Half Gram, Coriander, Jaggery, Dry Red Chili, Salt, Tamarind',
    nutrition_info = '{"calories": "19.99 kcal", "protein": "0.87 g", "fat": "1.03 g", "carbs": "2.23 g", "details": "Per 5g serving"}',
    serving_suggestion = 'Hot rice and ghee — a mellow, comforting combination that appeals to all ages.'
WHERE product_name ILIKE '%Palli Dhaniya Podi%';

-- Idli Podi
UPDATE public.products 
SET 
    product_name_telugu = 'ఇడ్లీ పొడి',
    product_tagline = 'Idli’s Best Friends: Ghee & Podi!',
    product_description = 'A classic South Indian podi made with chickpeas, urad dal, and spices. Perfectly balanced for hot idlis with ghee, adding a nutty, mildly spicy flavor every time.',
    ingredients = 'Chickpea, Urad Dal, Dry Red Chili, Cumin, Black Pepper, Salt, Curry Leaf',
    nutrition_info = '{"calories": "17.73 kcal", "protein": "1.06 g", "fat": "0.16 g", "carbs": "3 g", "details": "Per 5g serving"}',
    serving_suggestion = 'Sprinkle over hot idlis with ghee for a classic, flavorful experience.'
WHERE product_name ILIKE '%Idli Podi%';

-- Dosa Kaaram
UPDATE public.products 
SET 
    product_name_telugu = 'దోసె కారం',
    product_tagline = 'Perfect Spice for Crispy Dosas!',
    product_description = 'A flavorful podi crafted for crispy dosas. Made with poha, lentils, and aromatic spices, it adds a nutty, spicy kick that enhances every bite with ghee.',
    ingredients = 'Poha, Chickpea, Urad Dal, Coriander, Dry Red Chili, Cumin, Curry Leaf, Salt, Garlic, Marathi Moggu, Cinnamon',
    nutrition_info = '{"calories": "16.39 kcal", "protein": "0.69 g", "fat": "0.2 g", "carbs": "3.21 g", "details": "Per 5g serving"}',
    serving_suggestion = 'Sprinkle over hot dosas with ghee for a perfectly spiced, flavorful experience.'
WHERE product_name ILIKE '%Dosa Kaaram%';

-- Velluli Kaaram
UPDATE public.products 
SET 
    product_name_telugu = 'వెల్లుల్లి కారం',
    product_tagline = 'Sauté. Sprinkle. Savor Garlic.',
    product_description = 'A garlicky podi with dry coconut and spices, a staple in every Kadapa household. Adds delicious flavor to sautéed vegetables or can be used as a base for curries.',
    ingredients = 'Dry Coconut, Garlic, Salt, Red Chili Powder, Coriander',
    nutrition_info = '{"calories": "21.5 kcal", "protein": "0.36 g", "fat": "1.73 g", "carbs": "1.41 g", "details": "Per 5g serving"}',
    serving_suggestion = 'Sprinkle on sautéed vegetables or use as a base to make curries tastier.'
WHERE product_name ILIKE '%Velluli Kaaram%';

-- Avisaginjala Kaaram
UPDATE public.products 
SET 
    product_name_telugu = 'అవిసెగింజల కారం',
    product_tagline = 'Healthy Bite, Enriched with Ragi',
    product_description = 'A wholesome podi enriched with flax seeds and finger millet (ragi). Nutty, spicy, and lightly sweet, it delivers nutrition and taste in every bite.',
    ingredients = 'Flax Seed, Urad Dal, Peanuts, Finger Millet, Dry Red Chili, Salt, Garlic, Tamarind, Jaggery, Cardamom, Cinnamon, Cloves, Curry Leaf',
    nutrition_info = '{"calories": "20.56 kcal", "protein": "0.84 g", "fat": "0.5 g", "carbs": "2.09 g", "details": "Per 5g serving"}',
    serving_suggestion = 'A healthy addition to hot rice or meals — enjoy the nutritional benefits of flax seeds and ragi in a tasty podi.'
WHERE product_name ILIKE '%Avisaginjala Kaaram%';

-- Godhuma Kaaram
UPDATE public.products 
SET 
    product_name_telugu = 'గోధుమ కారం',
    product_tagline = 'Bold Flavor, Rich and Hearty',
    product_description = 'A wholesome, nutty podi made with chakki atta, dals, coconut, and garlic. Perfectly balanced, it brings a bold, hearty flavor to your meals.',
    ingredients = 'Chakki Atta, Urad Dal, Red Chilly Powder, Dry Coconut, Flax Seed, Garlic, Salt',
    nutrition_info = '{"calories": "16.96 kcal", "protein": "0.58 g", "fat": "0.3 g", "carbs": "3.01 g", "details": "Per 5g serving"}',
    serving_suggestion = 'Sprinkle over hot idlis or dosas with ghee for a flavorful experience.'
WHERE product_name ILIKE '%Godhuma Kaaram%';
