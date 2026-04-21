ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT '{}';
ALTER TABLE recipes ADD COLUMN images TEXT[] DEFAULT '{}';

-- Migrate existing image_url to the first element of the images array if images is empty
UPDATE products SET images = ARRAY[image_url] WHERE image_url IS NOT NULL AND (images IS NULL OR array_length(images, 1) IS NULL);
UPDATE recipes SET images = ARRAY[image_url] WHERE image_url IS NOT NULL AND (images IS NULL OR array_length(images, 1) IS NULL);
