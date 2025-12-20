-- Migration to update 'Ready to Eat' products
-- 1. DELETE existing 'Ready to Eat' products
DELETE FROM products WHERE product_category = 'Ready to Eat';

-- 2. INSERT new products
INSERT INTO products (
    product_name, 
    product_category, 
    product_tagline, 
    product_description, 
    ingredients, 
    nutrition_info, 
    serving_suggestion, 
    product_name_telugu, 
    display_order
) VALUES
-- 1. Kadapa Kaaram
(
    'Kadapa Kaaram',
    'Ready to Eat',
    'Bold flavor, rich and hearty!',
    'A signature Andhra blend that balances peanuts, garlic, and dry coconut with a fiery kick of red chili. Rich, hearty, and versatile — a true taste of Kadapa tradition.',
    'Peanuts, Garlic, Dry Coconut, Cumin, Dry Red Chilly, Coriander, Jaggery, Salt, Red Chilly Powder, Curry Leaf, Lemon Salt',
    '{"calories": "20.88kcal", "protein": "0.7", "fat": "1.49", "carbs": "1.51"}',
    'Steaming hot rice and ghee, or sprinkled over dosa with ghee for an irresistible twist.',
    'కడప కారం',
    1
),
-- 2. Nalla Kaaram
(
    'Nalla Kaaram',
    'Ready to Eat',
    'High fiber, gut-friendly spice!',
    'A wholesome Andhra classic made with tamarind, dals, and garlic. High in fiber and flavor, this podi adds a tangy, spicy twist to everyday favorites.',
    'Dry Red Chilly, Chickpea, Urad Dal, Tamarind, Garlic, Coriander, Cumin, Salt, Ghee, Ginger, Jaggery, Curry Leaf',
    '{"calories": "14.95kcal", "protein": "0.63", "fat": "0.4", "carbs": "2.47"}',
    'Sprinkled over hot idlis with ghee or paired with crispy dosas for a flavorful kick.',
    'నల్ల కారం',
    2
),
-- 3. Godhuma Kaaram
(
    'Godhuma Kaaram',
    'Ready to Eat',
    'Tasty, Light & Fresh!',
    'A wholesome, nutty podi made with chakki atta, dals, coconut, and garlic. Perfectly balanced, it brings a bold, hearty flavor to your meals.',
    'Chakki Atta, Urad Dal, Red Chilly Powder, Dry Coconut, Flax Seed, Garlic Cut, Garlic, Salt',
    '{"calories": "16.96kcal", "protein": "0.58", "fat": "0.3", "carbs": "3.01"}',
    'Steaming hot rice and ghee, or sprinkled over dosa with ghee for an irresistible twist.',
    'గోధుమ కారం',
    3
),
-- 4. Velluli Kaaram
(
    'Velluli Kaaram',
    'Ready to Eat',
    'Sauté. Sprinkle. Savor Garlic.',
    'A garlicky podi with dry coconut and spices, a staple in every Kadapa household. Adds delicious flavor to sautéed vegetables or can be used as a base for curries.',
    'Dry Coconut, Garlic, Salt, Red Chilly Powder, Coriander',
    '{"calories": "21.5kcal", "protein": "0.36", "fat": "1.73", "carbs": "1.41"}',
    'Sprinkle on sautéed vegetables or use as a base to make curries tastier.',
    'వెల్లూలి కారం',
    4
),
-- 5. Palli Kaaram
(
    'Palli Kaaram',
    'Ready to Eat',
    'Palli Kaaram. Boldly Telugu!',
    'A nutty and spicy Kadapa classic made with peanuts, chili, and curry leaves. A true part of local culture — delicious with rice or even as a snack on its own.',
    'Peanuts, Red Chilly Powder, Curry Leaf, Dry Red Chilly, Garlic, Salt, Cumin',
    '{"calories": "25.87kcal", "protein": "1.24", "fat": "2.04", "carbs": "1.02"}',
    'Steaming hot rice, or simply as a crunchy, flavorful snack.',
    'పల్లి కారం',
    5
),
-- 6. Avisaginjala Kaaram
(
    'Avisaginjala Kaaram',
    'Ready to Eat',
    'Healthy Bite, Enriched with Ragi',
    'A wholesome podi enriched with flax seeds and finger millet (ragi). Nutty, spicy, and lightly sweet, it delivers nutrition and taste in every bite.',
    'Flax Seed, Urad Dal, Peanuts, Finger Millet, Dry Red Chilly, Salt, Garlic, Tamarind, Jaggery, Cardamom, Cinnamon, Cinnamon, Cloves',
    '{"calories": "20.56kcal", "protein": "0.84", "fat": "0.5", "carbs": "2.09"}',
    'A healthy addition to hot rice or meals — enjoy the nutritional benefits of flax seeds and ragi in a tasty podi.',
    'అవిసాగింజల కారం',
    6
),
-- 7. Moringa Kaaram
(
    'Moringa Kaaram',
    'Ready to Eat',
    'Moringa Magic: Nutritious. Natural. Delicious!',
    'A nutrient-dense South Indian spice blend combining superfood Moringa leaves with roasted lentils and seeds for a savory, earthy flavor. This all-natural "miracle podi" delivers a potent boost of vitamins and antioxidants in every spoonful.',
    'Moringa, Red Gram, Chickpea, Pumpkin Seeds, Dry Red Chilly, Curry Leaf, Cumin, Black Pepper, Lemon Salt, Salt, Dried Pudina',
    '{"calories": "13.43kcal", "protein": "0.85", "fat": "0.39", "carbs": "1.85"}',
    'Best enjoyed mixed into steaming hot rice with a dollop of ghee, or served as a flavorful accompaniment to idlis and crispy dosas.',
    'మోరింగా కారం',
    7
),
-- 8. Pudina Kaaram
(
    'Pudina Kaaram',
    'Ready to Eat',
    'Light, Lively & Minty-Perfect!',
    'A refreshing and aromatic South Indian spice blend featuring sun-dried mint, garlic, and roasted lentils for a zesty, herbaceous kick. This flavorful podi acts as a natural palate cleanser while providing a cooling, gut-friendly boost to your daily meals.',
    'Dried Pudina, Garlic, Dry Red Chilly, Fresh Coriander, Urad Dal, Red Gram, Poha, Cumin, Salt, Dry Red Chilly',
    '{"calories": "11.21kcal", "protein": "0.65", "fat": "0.22", "carbs": "2.07"}',
    'Traditionally served mixed with hot rice and melted ghee, it also serves as a tangy, spiced dip for soft idlis, crispy vadas, or golden dosas.',
    'పుదీనా కారం',
    8
),
-- 9. Dosa Kaaram
(
    'Dosa Kaaram',
    'Ready to Eat',
    'Perfect Spice for Crispy Dosas!',
    'A flavorful podi crafted for crispy dosas. Made with poha, lentils, and aromatic spices, it adds a nutty, spicy kick that enhances every bite with ghee.',
    'Poha, Chickpea, Urad Dal, Coriander, Dry Red Chilly, Cumin, Curry Leaf, Salt, Garlic, Marathi Moggu, Cinnamon',
    '{"calories": "16.39kcal", "protein": "0.69", "fat": "0.2", "carbs": "3.21"}',
    'Sprinkle over hot dosas with ghee for a perfectly spiced, flavorful experience.',
    'దోశ కారం',
    9
),
-- 10. Kandi Podi
(
    'Kandi Podi',
    'Ready to Eat',
    'Flavor-packed, protein-rich!',
    'A protein-rich lentil blend from Kadapa, this podi combines fried gram, coconut, and garlic for a nutty, savory taste. Traditionally enjoyed with pickle rice and ghee for an extra flavor boost.',
    'Fried Half Gram, Dry Coconut, Garlic, Red Chilly Powder, Salt',
    '{"calories": "18kcal", "protein": "0.9", "fat": "0.55", "carbs": "2.53"}',
    'Traditional Kadapa-style pickle rice and ghee, where it amplifies the complex flavors of pickles.',
    'కంది పోడి',
    10
),
-- 11. Karivepaku Podi
(
    'Karivepaku Podi',
    'Ready to Eat',
    'Earthy.Spicy. Naturally Good!',
    'A must-try Andhra specialty made with fragrant curry leaves, dals, and spices. Earthy and wholesome, this podi pairs beautifully with hot rice and ghee for a nourishing meal.',
    'Curry Leaf, Garlic, Urad Dal, Dry Red Chilly, Chickpea, Coriander, Tamarind, Salt, Urad Dal Tempering, Cumin, Fenugreek',
    '{"calories": "12.71kcal", "protein": "0.81", "fat": "0.2", "carbs": "2.39"}',
    'Hot steamed rice drizzled with ghee — the classic way to enjoy this podi.',
    'కరివేపాకు పోడి',
    11
),
-- 12. Palli Dhaniya Podi
(
    'Palli Dhaniya Podi',
    'Ready to Eat',
    'Rustic. Rich. Ridiculously Good.',
    'Our best-reviewed podi! A rustic blend of peanuts, coriander, and jaggery that delivers mellow, nutty flavors. Smooth and balanced, it’s even loved by kids when mixed with hot rice and ghee.',
    'Peanuts, Fried Half Gram, Coriander, Jaggery, Dry Red Chilly, Salt, Tamarind',
    '{"calories": "19.99kcal", "protein": "0.87", "fat": "1.03", "carbs": "2.23"}',
    'Hot rice and ghee — a mellow, comforting combination that appeals to all ages.',
    'పల్లి ధనియా పోడి',
    12
),
-- 13. Idli Podi
(
    'Idli Podi',
    'Ready to Eat',
    'Idli’s Best Friends: Ghee & Podi!',
    'A classic South Indian podi made with chickpeas, urad dal, and spices. Perfectly balanced for hot idlis with ghee, adding a nutty, mildly spicy flavor every time.',
    'Chickpea, Urad Dal, Dry Red Chilly, Cumin, Black Pepper, Salt, Curry Leaf',
    '{"calories": "17.73kcal", "protein": "1.06", "fat": "0.16", "carbs": "3"}',
    'Sprinkle over hot idlis with ghee for a classic, flavorful experience.',
    'ఇడ్లీ పోడి',
    13
),
-- 14. Sambar Premix
(
    'Sambar Premix',
    'Ready to Eat',
    'Authentic Sambar in a Snap',
    'A convenient, ready-to-use blend of rice, lentils, spices, and tamarind. Just add vegetables and boil to enjoy a flavorful, authentic South Indian sambar in minutes.',
    'Rice, Dry Red Chilly, Coriander, Red Gram, Urad Dal, Chickpea, Tamarind, Salt, Dry Coconut, Cumin, Fenugreek, Cinnamon, Curry Leaf',
    '{"calories": "127.92kcal", "protein": "5.03", "fat": "3.08", "carbs": "22.92"}',
    'Just add vegetables and boil — a wholesome, flavorful South Indian sambar ready in minutes.',
    'సాంబార్ ప్రీమిక్స్',
    14
),
-- 15. Chutney Premix
(
    'Chutney Premix',
    'Ready to Eat',
    'Fresh Chutney in a Snap!',
    'A quick and easy blend of peanuts, gram, and spices. Just add water and grind to make a smooth, flavorful Palli (groundnut) chutney in minutes.',
    'Peanuts, Fried Half Gram, Green Chilli, Coriander, Salt, Tamarind',
    '{"calories": "172.38kcal", "protein": "8.58", "fat": "11.38", "carbs": "10.68"}',
    'Add water to the mix and grind to the desired consistency — fresh Palli chutney is ready to serve with idlis, dosas, or rice.',
    'చట్నీ ప్రీమిక్స్',
    15
),
-- 16. MultiGrain Mix
(
    'MultiGrain Mix',
    'Ready to Eat',
    'Power of 13 Grains, Strength in Every Bite!',
    'A wholesome blend of 13 grains and legumes, designed to make multigrain chapatis at home. Nutritious and flavorful, it turns every bite into a healthy delight.',
    'Horse Gram, Red Gram, Cornflour, Oats, Finger Millet, Soybean, Pearl Millet, Chickpea, Mung Bean, White Sesame Seeds, Urad Dal, Red Chilly Powder, Garlic, Coriander',
    '{"calories": "146.89kcal", "protein": "7.23", "fat": "2.84", "carbs": "23.55"}',
    'Mix 1 cup of this multigrain blend with 4 cups of whole wheat flour to make healthy, tasty chapatis at home.',
    'మల్టీ గ్రెయిన్ మిక్స్',
    16
);
