-- Migration: Add discriptor and shelf_life columns, clear old products, insert new products

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discriptor TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shelf_life TEXT;

-- Delete all old products
DELETE FROM public.products;

-- Insert new products
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Avisaginjala Kaaram', 'అవిసగింజల కారం', 'avisaginjala-kaaram', 'ready-to-eat', 'Healthy Bite, Enriched with Ragi!',
        'A wholesome podi enriched with flax seeds and finger millet (ragi). Nutty, spicy, and lightly sweet, it delivers nutrition and taste in every bite.', 'Flax Seed, Urad Dal, Peanuts, Finger Millet, Dry Red Chilly, Salt, Garlic, Cloves, Tamarind, Jaggery, Cardamom, Curry Leaf, Cinnamon', 'Add the desired amount of podi to hot rice. Mix in a spoonful of ghee to enhance the flavor and aroma. Serve warm!',
        true, true, 'Flaxseed Kaaram Podi', '90',
        55, '100g', 500, '[{"quantity":"100g","mrp":55,"price":55,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":135,"price":135,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":255,"price":255,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":495,"price":495,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":105,"price":105,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"20.84kcal","Protein":"0.85g","Total Fat":"1.13g","Saturated Fat":"0.14g","Carbs":"2.03g","Fiber":"1.1g","Sugars":"0.21g","Sodium":"0.1g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Chinthaku Podi', 'చింతాకు పొడి', 'chinthaku-podi', 'ready-to-eat', 'Tangy. Nutty. Traditionally Bold!',
        'Traditional Andhra spice powder prepared from sun-dried tamarind leaves, roasted lentils, and dried chilies. Brings a rich, tangy punch to meals.', 'Peanuts, Black Sesame Seeds, Tamarind Leaves, Dry Red Chilly, Garlic, Coriander, Salt', 'Add this tangy blend of chinthaku, roasted peanuts, and black sesame to hot rice. Mix in a good serving of ghee and serve warm.',
        false, true, 'Tamarind Leaf Kaaram Podi', '60',
        70, '100g', 500, '[{"quantity":"100g","mrp":70,"price":70,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":170,"price":170,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":325,"price":325,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":630,"price":630,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":120,"price":120,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"24.99kcal","Protein":"0.96g","Total Fat":"1.86g","Saturated Fat":"0.3g","Carbs":"1.46g","Fiber":"0.61g","Sugars":"0.13g","Sodium":"0.06g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Dosa Kaaram', 'దోశ కారం', 'dosa-kaaram', 'ready-to-eat', 'Perfect Spice for Crispy Dosas!',
        'A flavorful podi crafted for crispy dosas. Made with poha, lentils, and aromatic spices, it adds a nutty, spicy kick that enhances every bite with ghee.', 'Poha, Chickpea, Urad Dal, Coriander, Red Chilly Powder, Dry Red Chilly, Salt, Cumin, Curry Leaf, Garlic, Marathi Moggu, Cinnamon', 'Evenly dust this vibrant mix of [Ingredient 1] and spices onto your roasting dosa. Finish with a touch of ghee for a spicy, flavorful bite.',
        false, true, NULL, '90',
        45, '100g', 500, '[{"quantity":"100g","mrp":45,"price":45,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":110,"price":110,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":210,"price":210,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":405,"price":405,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":95,"price":95,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"16.16kcal","Protein":"0.67g","Total Fat":"0.2g","Saturated Fat":"0.02g","Carbs":"3.13g","Fiber":"0.83g","Sugars":"0.17g","Sodium":"0.09g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Kadapa Kaaram', 'కడప కారం', 'kadapa-kaaram', 'ready-to-eat', 'Bold flavor, rich and hearty!',
        'A signature Andhra blend that balances peanuts, garlic, and dry coconut with a fiery kick of red chili. Rich, hearty, and versatile — a true taste of Kadapa tradition.', 'Peanuts, Garlic, Dry Coconut, Cumin, Dry Red Chilly, Coriander, Jaggery, Salt, Red Chilly Powder, Curry Leaf, Lemon Salt', 'Sprinkle this versatile, sweet-and-spicy blend of peanuts, garlic, and dry coconut over dosas, or mix it into hot rice with ghee. ',
        true, true, 'Rayalaseema Multipurpose Podi', '60',
        60, '100g', 500, '[{"quantity":"100g","mrp":60,"price":60,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":145,"price":145,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":280,"price":280,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":540,"price":540,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":110,"price":110,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"20.88kcal","Protein":"0.7g","Total Fat":"1.49g","Saturated Fat":"0.75g","Carbs":"1.51g","Fiber":"0.64g","Sugars":"0.31g","Sodium":"0.08g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Kandi Podi', 'కంది పొడి', 'kandi-podi', 'ready-to-eat', 'Roasted Lentils,.Pure Comfort!',
        'Traditional Andhra spice powder prepared from sun-dried tamarind leaves, roasted lentils, and dried chilies. Brings a rich, tangy punch to meals.', 'Red Gram, Chickpea, Dry Red Chilly, Coriander, Urad Dal, Garlic, Cumin, Curry Leaf, White Sesame Seeds, Salt, Mung Bean, Fresh Coriander, Red Chilly Powder, Asafoetida', 'Enjoy the traditional flavor of this multipurpose blend of roasted dals, garlic, and a hint of hing. Mix it into hot rice with a spoonful of ghee, or pair it with your daily tiffins!',
        true, true, 'Traditional Roasted Gram Powder', '90',
        55, '100g', 500, '[{"quantity":"100g","mrp":55,"price":55,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":135,"price":135,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":255,"price":255,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":495,"price":495,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":105,"price":105,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"16.02kcal","Protein":"0.92g","Total Fat":"0.29g","Saturated Fat":"0.04g","Carbs":"2.71g","Fiber":"0.92g","Sugars":"0.12g","Sodium":"0.08g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Karivepaku Podi', 'కరివేపాకు పొడి', 'karivepaku-podi', 'ready-to-eat', 'Earthy.Spicy. Naturally Good!',
        'A must-try Andhra specialty made with fragrant curry leaves, dals, and spices. Earthy and wholesome, this podi pairs beautifully with hot rice and ghee for a nourishing meal.', 'Curry Leaf, Garlic, Urad Dal, Dry Red Chilly, Chickpea, Coriander, Tamarind, Salt, Cumin, Fenugreek', 'Mix the desired amount of this earthy curry leaf, garlic, and tamarind blend into hot rice. Stir in a generous serving of ghee for a comforting, traditional meal.',
        true, true, 'Curryleaf Kaaram Podi', '90',
        60, '100g', 500, '[{"quantity":"100g","mrp":60,"price":60,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":145,"price":145,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":280,"price":280,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":540,"price":540,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":110,"price":110,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"12.71kcal","Protein":"0.81g","Total Fat":"0.2g","Saturated Fat":"0.05g","Carbs":"2.39g","Fiber":"1.33g","Sugars":"0.23g","Sodium":"0.13g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Karnataka Idli Podi', 'కర్ణాటక ఇడ్లీ పొడి', 'karnataka-idli-podi', 'ready-to-eat', 'Idli’s Best Friends: Ghee & Podi!',
        'A classic South Indian podi made with chickpeas, urad dal, and spices. Perfectly balanced for hot idlis with ghee, adding a nutty, mildly spicy flavor every time.', 'Chickpea, Urad Dal, Dry Red Chilly, Salt, Cumin, Black Pepper, Red Chilly Powder, Curry Leaf', 'Mix this classic blend of roasted dals and black pepper with a generous spoonful of ghee. Spread it right on top for a perfect bite!',
        false, true, NULL, '90',
        50, '100g', 500, '[{"quantity":"100g","mrp":50,"price":50,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":120,"price":120,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":230,"price":230,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":450,"price":450,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":100,"price":100,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"17.22kcal","Protein":"1.03g","Total Fat":"0.16g","Saturated Fat":"0.02g","Carbs":"2.91g","Fiber":"1.02g","Sugars":"0.32g","Sodium":"0.08g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Konaseema Kaaram', 'కోనసీమ కారం', 'konaseema-kaaram', 'ready-to-eat', 'Superfoods Meet Fiery Tradition!',
        'A signature spice blend inspired by the coastal Konaseema region. Blends dry coconut, garlic, and red chilies for a rich, aromatic flavor.', 'Curry Leaf, Flax Seed, Peanuts, Moringa, Dry Red Chilly, Chickpea, Coriander, Raisin, Fresh Mint, Tamarind, Urad Dal, White Sesame Seeds, Salt, Ginger, Asafoetida', 'Place Holder',
        false, true, NULL, '30',
        75, '100g', 500, '[{"quantity":"100g","mrp":75,"price":75,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":180,"price":180,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":350,"price":350,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":675,"price":675,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":125,"price":125,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"15.47kcal","Protein":"0.81g","Total Fat":"0.71g","Saturated Fat":"0.11g","Carbs":"1.88g","Fiber":"1.1g","Sugars":"0.35g","Sodium":"0.09g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Koora Kaaram', 'కూర కారం', 'koora-kaaram', 'ready-to-eat', 'Sauté. Sprinkle. Savor Garlic!',
        'The essential Telugu multi-purpose spice mix used for seasoning daily curries, fries, and gravies. Perfect balance of spices.', 'Dry Coconut, Garlic, Red Chilly Powder, Coriander, Salt', 'Sauté your everyday vegetables, sprinkle this rich blend of garlic and dry coconut over the top, and savor the bold flavor!',
        false, false, 'Rayalaseema Fry Podi', '45',
        60, '100g', 500, '[{"quantity":"100g","mrp":60,"price":60,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":145,"price":145,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":280,"price":280,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":540,"price":540,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":110,"price":110,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"20.76kcal","Protein":"0.39g","Total Fat":"1.64g","Saturated Fat":"1.37g","Carbs":"1.55g","Fiber":"0.95g","Sugars":"0.23g","Sodium":"0.2g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Kothimera Kaaram', 'కొత్తిమీర కారం', 'kothimera-kaaram', 'ready-to-eat', 'Zesty coriander Spark – Freshness in Every Spoon!',
        'A vibrant, aromatic spice powder made with fresh sun-dried coriander leaves, roasted dals, and garlic. Earthy and fresh.', 'Red Chilly Powder, Fresh Coriander, Red Gram, Urad Dal, Salt, Poha, Dry Red Chilly, Cumin, Jaggery, Tamarind', 'Toss this flavorful mix of coriander and roasted dals with hot rice and ghee to bring out the rich, herby aroma.',
        false, true, 'Coriander Leaves Kaaram Podi', '60',
        60, '100g', 500, '[{"quantity":"100g","mrp":60,"price":60,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":145,"price":145,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":280,"price":280,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":540,"price":540,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":110,"price":110,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"12.34kcal","Protein":"0.54g","Total Fat":"0.23g","Saturated Fat":"0.04g","Carbs":"2.37g","Fiber":"0.77g","Sugars":"0.48g","Sodium":"0.26g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Moringa Kaaram', 'మునగాకు కారం', 'moringa-kaaram', 'ready-to-eat', 'Moringa Magic: Nutritious. Natural. Delicious!',
        'A nutrient-dense South Indian spice blend combining superfood Moringa leaves with roasted lentils and seeds for a savory, earthy flavor. This all-natural "miracle podi" delivers a potent boost of vitamins and antioxidants in every spoonful.', 'Red Gram, Moringa, Chickpea, Pumpkin Seeds, Salt, Dry Red Chilly, Cumin, Black Pepper, Curry Leaf, Mint Leaves, Lemon Salt', 'Mix the desired amount of this moringa, pumpkin seed blend into hot rice. Stir in a generous serving of ghee for a nutritious meal.',
        false, true, 'Drumstick Leaf Kaaram Podi', '90',
        65, '100g', 500, '[{"quantity":"100g","mrp":65,"price":65,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":160,"price":160,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":300,"price":300,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":585,"price":585,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":115,"price":115,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"13.43kcal","Protein":"0.85g","Total Fat":"0.39g","Saturated Fat":"0.06g","Carbs":"1.85g","Fiber":"0.62g","Sugars":"0.09g","Sodium":"0.22g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Nalla Kaaram', 'నల్ల కారం', 'nalla-kaaram', 'ready-to-eat', 'High fiber, gut-friendly spice!',
        'A wholesome Andhra classic made with tamarind, dals, and garlic. High in fiber and flavor, this podi adds a tangy, spicy twist to everyday favorites.', 'Dry Red Chilly, Chickpea, Urad Dal, Tamarind, Garlic, Coriander, Cumin, Salt, Ghee, Ginger, Jaggery, Curry Leaf', 'Enjoy this hotel-style blend of roasted dals, fiery chilies, and garlic. Mix it with ghee to dip soft idlis, or sprinkle it over a roasting dosa!',
        false, true, 'Hotel Style Idli & Dosa Kaaram', '90',
        55, '100g', 500, '[{"quantity":"100g","mrp":55,"price":55,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":135,"price":135,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":255,"price":255,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":495,"price":495,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":105,"price":105,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"14.95kcal","Protein":"0.63g","Total Fat":"0.47g","Saturated Fat":"0.15g","Carbs":"2.47g","Fiber":"0.91g","Sugars":"0.52g","Sodium":"0.11g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Palli Kaaram', 'పల్లి కారం', 'palli-kaaram', 'ready-to-eat', 'Palli Kaaram. Boldly Telugu!',
        'A nutty and spicy Kadapa classic made with peanuts, chili, and curry leaves. A true part of local culture — delicious with rice or even as a snack on its own.', 'Peanuts, Curry Leaf, Dry Red Chilly, Garlic, Red Chilly Powder, Salt, Cumin', 'Add this unique Rayalaseema blend of roasted peanuts, garlic, and curry leaves to hot rice. Mix in a spoonful of ghee and serve warm!',
        false, true, 'Peanut Kaaram Podi', '90',
        55, '100g', 500, '[{"quantity":"100g","mrp":55,"price":55,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":135,"price":135,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":255,"price":255,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":495,"price":495,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":105,"price":105,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"25.87kcal","Protein":"1.24g","Total Fat":"2.04g","Saturated Fat":"0.36g","Carbs":"1.02g","Fiber":"0.64g","Sugars":"0.2g","Sodium":"0.07g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Pudina Kaaram', 'పుదిన కారం', 'pudina-kaaram', 'ready-to-eat', 'Light, Lively & Minty-Perfect!',
        'A refreshing and aromatic South Indian spice blend featuring sun-dried mint, garlic, and roasted lentils for a zesty, herbaceous kick. This flavorful podi acts as a natural palate cleanser while providing a cooling, gut-friendly boost to your daily meals.', 'Red Chilly Powder, Mint Leaves, Urad Dal, Red Gram, Poha, Salt, Dry Red Chilly, Cumin, Tamarind, Jaggery', 'Add this refreshing blend of mint leaves, roasted dals, and a hint of tamarind to hot rice. Mix in a spoonful of ghee and serve warm!',
        false, true, 'Mint Leaf Kaaram Podi', '60',
        60, '100g', 500, '[{"quantity":"100g","mrp":60,"price":60,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":145,"price":145,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":280,"price":280,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":540,"price":540,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":110,"price":110,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"13.89kcal","Protein":"0.65g","Total Fat":"0.26g","Saturated Fat":"0.05g","Carbs":"2.65g","Fiber":"0.95g","Sugars":"0.47g","Sodium":"0.26g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Putnala Podi', 'పుట్నాల పొడి', 'putnala-podi', 'ready-to-eat', 'Flavor-packed, protein-rich!',
        'A protein-rich lentil blend from Kadapa, this podi combines fried gram, coconut, and garlic for a nutty, savory taste. Traditionally enjoyed with pickle rice and ghee for an extra flavor boost.', 'Fried Gram, Dry Coconut, Garlic, Red Chilly Powder, Salt', 'Add this classic blend of fried gram, dry coconut, and garlic to hot rice. Mix in a spoonful of ghee and pair with your favorite pickle for a perfect meal!',
        false, true, 'Gunpowder', '90',
        50, '100g', 500, '[{"quantity":"100g","mrp":50,"price":50,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":120,"price":120,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":230,"price":230,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":450,"price":450,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":100,"price":100,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"18kcal","Protein":"0.9g","Total Fat":"0.55g","Saturated Fat":"0.31g","Carbs":"2.53g","Fiber":"0.6g","Sugars":"0.45g","Sodium":"0.06g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Special Godhuma Kaaram', 'స్పెషల్ గోధుమ కారం', 'special-godhuma-kaaram', 'ready-to-eat', 'Tasty, Light & Fresh!',
        'A wholesome, nutty podi made with chakki atta, dals, coconut, and garlic. Perfectly balanced, it brings a bold, hearty flavor to your meals.', 'Chakki Atta, Urad Dal, Red Chilly Powder, Dry Coconut, Flax Seed, Garlic, Salt', 'Smear this unique, nutty mix of whole wheat, urad dal, and garlic onto dosas, or pair it with melted ghee for the perfect savory idli dip.',
        false, true, 'Special Nutty Kaaram Podi', '90',
        45, '100g', 500, '[{"quantity":"100g","mrp":45,"price":45,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":110,"price":110,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":210,"price":210,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":405,"price":405,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":95,"price":95,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"17.24kcal","Protein":"0.68g","Total Fat":"0.41g","Saturated Fat":"0.2g","Carbs":"2.93g","Fiber":"0.76g","Sugars":"0.09g","Sodium":"0.07g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Special Palli Kaaram', 'స్పెషల్ పల్లి కారం', 'special-palli-kaaram', 'ready-to-eat', 'Rustic. Rich. Ridiculously Good!',
        'Our best-reviewed podi! A rustic blend of peanuts, coriander, and jaggery that delivers mellow, nutty flavors. Smooth and balanced, it’s even loved by kids when mixed with hot rice and ghee.', 'Peanuts, Fried Gram, Coriander, Jaggery, Dry Red Chilly, Salt, Tamarind', 'Toss this flavorful mix of peanuts, fried gram, and coriander with hot rice and a good serving of ghee to beautifully bring out the sweet and tangy notes.',
        true, true, 'Special Peanut Kaaram Podi', '60',
        60, '100g', 500, '[{"quantity":"100g","mrp":60,"price":60,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":145,"price":145,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":280,"price":280,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":540,"price":540,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":110,"price":110,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"19.99kcal","Protein":"0.87g","Total Fat":"1.03g","Saturated Fat":"0.16g","Carbs":"2.23g","Fiber":"0.69g","Sugars":"0.85g","Sodium":"0.13g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Tamalapaaku Kaaram', 'తమలపాకు కారం', 'tamalapaaku-kaaram', 'ready-to-eat', 'Wellness in Every Bite – Betel Leaf at the Heart!',
        'A unique, health-focused herbal spice powder combining fresh betel leaves (Tamalapaaku) with traditional roasted spices and lentils.', 'Betel Leaf, Garlic, Urad Dal, Chickpea, Peanuts, Red Chilly Powder, Cumin, White Sesame Seeds, Coriander, Salt, Curry Leaf', 'Stir this vibrantly fresh betel leaf and sesame mix into hot rice with a spoonful of ghee for an uplifting flavor.',
        false, true, 'Betel Leaf Kaaram Podi', '60',
        90, '100g', 500, '[{"quantity":"100g","mrp":90,"price":90,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":220,"price":220,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":420,"price":420,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":810,"price":810,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":140,"price":140,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"13.23kcal","Protein":"0.66g","Total Fat":"0.57g","Saturated Fat":"0.09g","Carbs":"1.64g","Fiber":"0.65g","Sugars":"0.16g","Sodium":"0.09g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Velluli Kaaram', 'వెల్లుల్లి కారం', 'velluli-kaaram', 'ready-to-eat', 'Three Ingredients. Infinite Flavor!',
        'A garlicky podi with dry coconut and spices, a staple in every Kadapa household. Adds delicious flavor to sautéed vegetables or can be used as a base for curries.', 'Garlic, Red Chilly Powder, Salt, Sunflower Oil', 'Smear this savory garlic blend onto hot dosas, or toss it with hot rice and ghee to bring out the roasted aroma.',
        true, true, 'Garlic Kaaram Podi', '60',
        60, '100g', 500, '[{"quantity":"100g","mrp":60,"price":60,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":145,"price":145,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":280,"price":280,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":540,"price":540,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":110,"price":110,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"10.59kcal","Protein":"0.42g","Total Fat":"0.45g","Saturated Fat":"0.07g","Carbs":"1.77g","Fiber":"0.75g","Sugars":"0.17g","Sodium":"0.25g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Chutney Premix', 'చట్నీ ప్రీమిక్స్', 'chutney-premix', 'ready-to-eat', 'Fresh Chutney in a Snap!',
        'A quick and easy blend of peanuts, gram, and spices. Just add water and grind to make a smooth, flavorful Palli (groundnut) chutney in minutes.', 'Peanuts, Fried Gram, Dry Red Chilly, Salt, Ginger, Tamarind, Coriander Powder', 'Simply add water gradually to this flavorful blend until you reach your desired consistency.Ready in seconds to pair with hot tiffin.',
        false, true, 'Ready to Use Peanut Chutney', '90',
        45, '100g', 500, '[{"quantity":"100g","mrp":45,"price":45,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":110,"price":110,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":210,"price":210,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":405,"price":405,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":95,"price":95,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"40g","Total Servings":"20","Calories":"178.61kcal","Protein":"9.01g","Total Fat":"10.89g","Saturated Fat":"1.83g","Carbs":"13.74g","Fiber":"5.08g","Sugars":"2.74g","Sodium":"0.64g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'MultiGrain Mix', 'మల్టీ గ్రెయిన్ మిక్స్', 'multigrain-mix', 'ready-to-eat', 'Power of 13 Grains, Strength in Every Bite!',
        'A wholesome blend of 13 grains and legumes, designed to make multigrain chapatis at home. Nutritious and flavorful, it turns every bite into a healthy delight.', 'Horse Gram, Red Gram, Cornflour, Oats, Finger Millet, Soybean, Pearl Millet, Chickpea, Mung Bean, White Sesame Seeds, Urad Dal, Red Chilly Powder, Garlic, Coriander', 'Add this mix to chakki atta in 1:5 ratio before making the dough, to get the health benefits of 13 grains in every bite.',
        false, true, 'Nutritious Multigrain Flour Additive Enhanced with Ashwagandha', '90',
        40, '100g', 500, '[{"quantity":"100g","mrp":40,"price":40,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":95,"price":95,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":185,"price":185,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":360,"price":360,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":90,"price":90,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"40g","Total Servings":"20","Calories":"146.89kcal","Protein":"7.23g","Total Fat":"2.84g","Saturated Fat":"0.42g","Carbs":"23.55g","Fiber":"4.57g","Sugars":"0.89g","Sodium":"0.04g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Sambar Premix', 'సాంబార్ ప్రీమిక్స్', 'sambar-premix', 'ready-to-eat', 'Authentic Sambar in a Snap!',
        'A convenient, ready-to-use blend of rice, lentils, spices, and tamarind. Just add vegetables and boil to enjoy a flavorful, authentic South Indian sambar in minutes.', 'Rice, Dry Red Chilly, Coriander, Red Gram, Urad Dal, Chickpea, Tamarind, Salt, Dry Coconut, Cumin, Fenugreek, Cinnamon, Curry Leaf', 'Add 40g of this authentic blend to 1 liter of water along with your favorite fresh vegetables. Boil until tender for fresh sambar.',
        false, true, 'Ready to Use Tiffin Sambar', '120',
        50, '100g', 500, '[{"quantity":"100g","mrp":50,"price":50,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":120,"price":120,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":230,"price":230,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":450,"price":450,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":100,"price":100,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"40g","Total Servings":"20","Calories":"127.92kcal","Protein":"5.03g","Total Fat":"3.08g","Saturated Fat":"1.3g","Carbs":"22.92g","Fiber":"7.42g","Sugars":"2.16g","Sodium":"1.13g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Peri Peri Masala', 'పెరి పెరి మసాలా', 'peri-peri-masala', 'ready-to-eat', 'Fiery, Tangy, Totally Irresistible!',
        'A fiery, zesty fusion blend of African bird''s eye chilies, garlic, herbs, and spices. Perfect for fries, chips, and snacks.', 'Sugar, Salt, Red Chilly Powder, Onion Powder, Kashmiri Red Chilly Powder, Garlic Powder, Amchur Powder, Black Pepper, Oregano', 'Dust this zesty chili and herb mix generously over popcorn, makhana, or roasted nuts for a perfectly spicy snack.',
        false, true, NULL, '120',
        80, '100g', 500, '[{"quantity":"100g","mrp":80,"price":80,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"250g","mrp":195,"price":195,"stock":100,"packaging_type":"Standup Pouch"},{"quantity":"500g","mrp":370,"price":370,"stock":100,"packaging_type":"Pouch"},{"quantity":"1000g","mrp":720,"price":720,"stock":100,"packaging_type":"Pouch"},{"quantity":"100g","mrp":130,"price":130,"stock":100,"packaging_type":"Glass Jar"}]'::jsonb, '{"Serving Size":"5g","Total Servings":"20","Calories":"13.46kcal","Protein":"0.32g","Total Fat":"0.14g","Saturated Fat":"0.04g","Carbs":"3.08g","Fiber":"0.6g","Sugars":"0.92g","Sodium":"0.3g"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Ragi Chapati', 'రాగి చపాతీ', 'ragi-chapati', 'ready-to-cook', 'Wholesome Ragi. Fresh Chakki Goodness!',
        'Healthy, soft chapatis prepared from a nutritious blend of finger millet (Ragi) flour and whole wheat. Ready to cook on the tawa.', NULL, NULL,
        false, false, NULL, NULL,
        70, '5 pcs', 100, '[{"quantity":"5 pcs","mrp":70,"price":70,"stock":100,"packaging_type":"Pouch"}]'::jsonb, '{"Carbs:":true,"Fiber:":true,"Sodium:":true,"Sugars:":true,"Protein:":true,"Calories:":true,"Total_fat:":true,"Saturated_fat:":true,"Total_servings:":"20"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Malabar Parota (10pcs)', 'మలబార్ పరోటా', 'malabar-parota-10pcs', 'ready-to-cook', 'Flaky. Buttery. Irresistibly South Indian!',
        'Traditional flaky layered Malabar parottas made with premium ingredients, delivering authentic Kerala street-food taste at home.', 'All-Purpose Flour, Sunflower Oil, Vanaspati, Water, Salt', 'Remove the parotta from the pack and heat on a preheated tawa for 30–40 seconds on each side. Store in the refrigerator.',
        false, true, NULL, NULL,
        155, '10pcs', 994, '[{"quantity":"10pcs","mrp":155,"price":155,"stock":994,"packaging_type":"Pouch"}]'::jsonb, '{"Carbs:":"37.25g","Fiber:":"1.32g","Sodium:":"0.19g","Sugars:":"0.13g","Protein:":"5.03g","Calories:":"211.73kcal","Total_fat:":"4.16g","Saturated_fat:":"0.89g","Total_servings:":"20"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Whole Wheat Parota', 'వీట్ పరోటా', 'whole-wheat-parota', 'ready-to-cook', 'Whole Grain Power. Guilt-Free Indulgence!',
        'Healthy whole wheat parottas with rich layers and hearty flavour, combining nutrition and indulgent South Indian taste.', 'Whole Wheat Atta, Sunflower Oil, Vanaspati, Water, Salt', 'Remove the parotta from the pack and heat on a preheated tawa for 30–40 seconds on each side. Store in the refrigerator.',
        true, true, NULL, NULL,
        165, '10pcs', 96, '[{"quantity":"10pcs","mrp":165,"price":165,"stock":96,"packaging_type":"Pouch"}]'::jsonb, '{"Carbs:":"35.36g","Fiber:":"5.26g","Sodium:":"0.98g","Sugars:":"0.2g","Protein:":"6.48g","Calories:":"201.24kcal","Total_fat:":"4.79g","Saturated_fat:":"1.03g","Total_servings:":"20","Additional_info: 0.25gms Trans Fat per serving.":true}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Poori', 'పూరి', 'poori', 'ready-to-cook', 'Wholesome Puri! Full Chakki Atta  freshness!',
        'Golden, fluffy puris made from 100% whole wheat chakki atta. These ready-to-fry delights offer a light, airy texture and authentic home-style taste, perfect for festive meals or weekend breakfasts.', 'Poori Atta, Chakki Atta, Samolina, Water, Salt, Sunflower Oil', NULL,
        false, true, NULL, NULL,
        65, '10pcs', 99, '[{"quantity":"10pcs","mrp":65,"price":65,"stock":99,"packaging_type":"Pouch"}]'::jsonb, '{"Carbs:":"21.72g","Fiber:":"3.46g","Sodium:":"0.11g","Sugars:":"0.12g","Protein:":"3.87g","Calories:":"108.33kcal","Total_fat:":"1.22g","Saturated_fat:":"0.18g","Total_servings:":"20"}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Wheat Chapathi', 'గోధుమ చపాతీ', 'wheat-chapathi', 'ready-to-cook', 'Soft Rotis. Pure Home Taste!',
        'Soft, wholesome wheat chapathi made from carefully selected wheat flour. Perfect balance of nutrition and taste, ideal for wrapping curries or enjoying with dal and vegetables.', 'Chakki Atta, Water, Salt, Sunflower Oil', 'Remove the chapathi from the pack and heat on a preheated tawa for 20–30 seconds on each side. Store in the refrigerator.',
        false, true, NULL, NULL,
        85, '10pcs', 996, '[{"quantity":"10pcs","mrp":85,"price":85,"stock":996,"packaging_type":"Pouch"}]'::jsonb, '{"Carbs:":"16.55g","Fiber:":"2.46g","Sodium:":"0.09g","Sugars:":"0.09g","Protein:":"3.03g","Calories:":"88.32kcal","Total_fat:":"1.58g","Saturated_fat:":"0.22g","Total_servings:":"20","Additional_info:":true}'::jsonb
    );
INSERT INTO public.products (
        product_name, product_name_telugu, slug, product_category, product_tagline, 
        product_description, ingredients, serving_suggestion, 
        is_trending, is_visible, discriptor, shelf_life,
        mrp, net_weight, total_stock, quantity_variants, nutrition_info
    ) VALUES (
        'Malabar Parota (5pcs)', 'మలబార్ పరోటా', 'malabar-parota-5pcs', 'ready-to-cook', 'Flaky. Buttery. Irresistibly South Indian!',
        'Traditional flaky layered Malabar parottas made with premium ingredients, delivering authentic Kerala street-food taste at home.', 'All-Purpose Flour, Sunflower Oil, Vanaspati, Water, Salt', 'Remove the parotta from the pack and heat on a preheated tawa for 30–40 seconds on each side. Store in the refrigerator.',
        false, true, NULL, NULL,
        85, '5pcs', 800, '[{"quantity":"5pcs","mrp":85,"price":85,"stock":800,"packaging_type":"Pouch"}]'::jsonb, '{"Carbs:":"35.36g","Fiber:":"5.26g","Sodium:":"0.98g","Sugars:":"0.2g","Protein:":"6.48g","Calories:":"201.24kcal","Total_fat:":"4.79g","Saturated_fat:":"1.03g","Total_servings:":"20"}'::jsonb
    );
