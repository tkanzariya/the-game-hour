-- Operations phase: users, team, games, event links
-- Safe to run repeatedly — uses IF NOT EXISTS
-- Extra events columns (instagram_handle, added_to_calendar) are added by
-- cms/includes/ops-migrate.php when missing (ALTER is not idempotent here).
-- Requires the events table (see migrate-events.sql).

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
