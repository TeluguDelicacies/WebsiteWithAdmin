-- Add Quick Commerce specific fields to site_settings
DO $$
BEGIN
    -- Quick Commerce Hero Title
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'quick_hero_title') THEN
        ALTER TABLE site_settings ADD COLUMN quick_hero_title TEXT DEFAULT 'Groceries in Minutes';
    END IF;

    -- Quick Commerce Hero Subtitle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'quick_hero_subtitle') THEN
        ALTER TABLE site_settings ADD COLUMN quick_hero_subtitle TEXT DEFAULT 'Freshness delivered at the speed of life.';
    END IF;

    -- Quick Commerce Hero Telugu Subtitle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'quick_hero_telugu_subtitle') THEN
        ALTER TABLE site_settings ADD COLUMN quick_hero_telugu_subtitle TEXT DEFAULT 'అవసరమైన సరుకులు, నిమిషాల్లో మీ ఇంటికి';
    END IF;

    -- Quick Commerce Hero Image URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'quick_hero_image_url') THEN
        ALTER TABLE site_settings ADD COLUMN quick_hero_image_url TEXT DEFAULT './images/quick_commerce_hero.png';
    END IF;
    
    -- Ensure show_mrp exists (fix for user error)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'show_mrp') THEN
        ALTER TABLE site_settings ADD COLUMN show_mrp BOOLEAN DEFAULT TRUE;
    END IF;

END $$;
