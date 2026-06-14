-- The Game Hour Image CMS
-- Run in phpMyAdmin (cPanel → MySQL Databases → phpMyAdmin)

CREATE TABLE IF NOT EXISTS images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  image_key VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT '',
  category VARCHAR(120) NOT NULL DEFAULT 'General',
  file_path VARCHAR(512) DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_image_key (image_key),
  KEY idx_category (category),
  KEY idx_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed image slots (no files until uploaded via admin)
-- Full key list matches src/data/image-keys.ts

INSERT INTO images (image_key, title, category, file_path, updated_at) VALUES
('homepage-hero', 'Homepage hero', 'Homepage', NULL, NULL),
('homepage-about-teaser', 'Homepage about teaser', 'Homepage', NULL, NULL),
('homepage-team-building', 'Homepage team building', 'Homepage', NULL, NULL),
('homepage-strategy-games', 'Homepage strategy games', 'Homepage', NULL, NULL),
('gallery-hero', 'Gallery page hero', 'Gallery', NULL, NULL),
('gallery-1', 'Gallery event photo 1', 'Gallery', NULL, NULL),
('gallery-2', 'Gallery event photo 2', 'Gallery', NULL, NULL),
('gallery-3', 'Gallery event photo 3', 'Gallery', NULL, NULL),
('gallery-4', 'Gallery event photo 4', 'Gallery', NULL, NULL),
('gallery-5', 'Gallery event photo 5', 'Gallery', NULL, NULL),
('gallery-6', 'Gallery event photo 6', 'Gallery', NULL, NULL),
('gallery-7', 'Gallery event photo 7', 'Gallery', NULL, NULL),
('gallery-8', 'Gallery event photo 8', 'Gallery', NULL, NULL),
('gallery-9', 'Gallery event photo 9', 'Gallery', NULL, NULL),
('gallery-moment-1', 'Gallery moment 1', 'Gallery', NULL, NULL),
('gallery-moment-2', 'Gallery moment 2', 'Gallery', NULL, NULL),
('gallery-moment-3', 'Gallery moment 3', 'Gallery', NULL, NULL),
('gallery-moment-4', 'Gallery moment 4', 'Gallery', NULL, NULL),
('gallery-moment-5', 'Gallery moment 5', 'Gallery', NULL, NULL),
('gallery-moment-6', 'Gallery moment 6', 'Gallery', NULL, NULL)
ON DUPLICATE KEY UPDATE title = VALUES(title), category = VALUES(category);

-- Legacy key birthday-hero (if present) is aliased to birthday-games-slider-1 at runtime.
-- Service + branding + SEO keys: registered automatically on admin login via cms_register_missing_keys().
