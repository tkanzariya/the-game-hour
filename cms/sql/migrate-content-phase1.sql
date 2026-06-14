-- Phase 1: Website Manager content (testimonials + statistics)
-- Run in phpMyAdmin AFTER existing images table is in place.
-- Safe to re-run: uses IF NOT EXISTS and idempotent metric seeds.

CREATE TABLE IF NOT EXISTS testimonials (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT '',
  role VARCHAR(255) NOT NULL DEFAULT '',
  review TEXT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  placement ENUM('home', 'service') NOT NULL DEFAULT 'home',
  service_slug VARCHAR(120) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_testimonial_slug (slug),
  KEY idx_visible_sort (visible, sort_order),
  KEY idx_placement (placement),
  KEY idx_service_slug (service_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_metrics (
  metric_key VARCHAR(60) NOT NULL PRIMARY KEY,
  value VARCHAR(60) NOT NULL DEFAULT '',
  updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO site_metrics (metric_key, value) VALUES
('events-hosted', '50+'),
('participants', '3,000+'),
('games-conducted', '100+'),
('cities-served', '6')
ON DUPLICATE KEY UPDATE metric_key = metric_key;

-- Testimonials are seeded on first admin login via cms_content_seed_if_empty()
-- (imports from bundled JSON when the table is empty).
