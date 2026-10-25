-- Game inquiries (customer game selection links)

CREATE TABLE IF NOT EXISTS inquiries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  token CHAR(32) NOT NULL,
  customer_name VARCHAR(160) NOT NULL,
  customer_phone VARCHAR(20) DEFAULT NULL,
  event_type VARCHAR(80) NOT NULL,
  age_groups TEXT DEFAULT NULL,
  participants INT UNSIGNED DEFAULT NULL,
  max_games INT UNSIGNED DEFAULT NULL,
  expires_at DATETIME NOT NULL,
  opened_at DATETIME DEFAULT NULL,
  submitted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_inquiries_token (token),
  KEY idx_inquiries_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inquiry_games (
  inquiry_id INT UNSIGNED NOT NULL,
  game_id INT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  selected TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (inquiry_id, game_id),
  KEY idx_inquiry_games_game (game_id),
  CONSTRAINT fk_inquiry_games_inquiry FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
  CONSTRAINT fk_inquiry_games_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
