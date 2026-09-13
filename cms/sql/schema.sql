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

-- Phase 1: testimonials + statistics (see migrate-content-phase1.sql for full migration)
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

-- Bookings (also in migrate-events.sql for existing installs)
CREATE TABLE IF NOT EXISTS events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_category ENUM('social', 'corporate') NOT NULL,
  event_status ENUM('pending', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
  email VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL DEFAULT '',
  phone VARCHAR(20) NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  birthday_person_name VARCHAR(255) DEFAULT NULL,
  company_name VARCHAR(255) DEFAULT NULL,
  event_type VARCHAR(80) DEFAULT NULL,
  participant_count INT UNSIGNED NOT NULL DEFAULT 1,
  age_group VARCHAR(40) DEFAULT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  venue_name VARCHAR(255) DEFAULT NULL,
  venue_type ENUM('indoor', 'outdoor') NOT NULL,
  payment_mode ENUM('online', 'online_cash') NOT NULL,
  referral_source VARCHAR(255) DEFAULT NULL,
  special_requirements TEXT DEFAULT NULL,
  terms_accepted_at DATETIME NOT NULL,
  price DECIMAL(12, 2) DEFAULT NULL,
  advance_amount DECIMAL(12, 2) DEFAULT NULL,
  full_payment_amount DECIMAL(12, 2) DEFAULT NULL,
  event_expenses DECIMAL(12, 2) DEFAULT NULL,
  advance_payment_date DATE DEFAULT NULL,
  full_payment_date DATE DEFAULT NULL,
  advance_payment_completed TINYINT(1) NOT NULL DEFAULT 0,
  full_payment_completed TINYINT(1) NOT NULL DEFAULT 0,
  payment_screenshot_path VARCHAR(512) DEFAULT NULL,
  instagram_handle VARCHAR(80) DEFAULT NULL,
  added_to_calendar TINYINT(1) NOT NULL DEFAULT 0,
  bubble_id VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_events_bubble_id (bubble_id),
  KEY idx_event_category (event_category),
  KEY idx_event_status (event_status),
  KEY idx_event_date (event_date),
  KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Operations: team, games, users (also in migrate-ops.sql)
CREATE TABLE IF NOT EXISTS team_members (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  date_of_birth DATE DEFAULT NULL,
  position ENUM('Coach', 'IT', 'Trainer', 'Sales', 'Marketing', 'BDE') NOT NULL DEFAULT 'Coach',
  employment_status VARCHAR(80) DEFAULT NULL,
  previous_company VARCHAR(255) DEFAULT NULL,
  previous_post VARCHAR(255) DEFAULT NULL,
  qualification VARCHAR(255) DEFAULT NULL,
  referral VARCHAR(255) DEFAULT NULL,
  resume_path VARCHAR(512) DEFAULT NULL,
  has_vehicle TINYINT(1) NOT NULL DEFAULT 0,
  willing_to_travel TINYINT(1) NOT NULL DEFAULT 0,
  bubble_id VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_team_members_bubble_id (bubble_id),
  KEY idx_team_name (name),
  KEY idx_team_position (position),
  KEY idx_team_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS games (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  category VARCHAR(120) DEFAULT NULL,
  formation VARCHAR(80) DEFAULT NULL,
  avg_duration_minutes INT UNSIGNED DEFAULT NULL,
  group_size VARCHAR(80) DEFAULT NULL,
  traits TEXT DEFAULT NULL,
  video_url VARCHAR(512) DEFAULT NULL,
  venue_indoor TINYINT(1) NOT NULL DEFAULT 0,
  venue_outdoor TINYINT(1) NOT NULL DEFAULT 0,
  bubble_id VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_games_bubble_id (bubble_id),
  KEY idx_games_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'coach') NOT NULL DEFAULT 'coach',
  team_member_id INT UNSIGNED DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  CONSTRAINT fk_users_team FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS game_age_groups (
  game_id INT UNSIGNED NOT NULL,
  age_group VARCHAR(40) NOT NULL,
  PRIMARY KEY (game_id, age_group),
  CONSTRAINT fk_game_age_groups_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS game_event_types (
  game_id INT UNSIGNED NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  PRIMARY KEY (game_id, event_type),
  CONSTRAINT fk_game_event_types_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_games (
  event_id INT UNSIGNED NOT NULL,
  game_id INT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (event_id, game_id),
  KEY idx_event_games_game (game_id),
  CONSTRAINT fk_event_games_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_games_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_team (
  event_id INT UNSIGNED NOT NULL,
  team_member_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (event_id, team_member_id),
  KEY idx_event_team_member (team_member_id),
  CONSTRAINT fk_event_team_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_team_member FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
