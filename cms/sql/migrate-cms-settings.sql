-- Admin-editable settings (notify email). Safe to run repeatedly.

CREATE TABLE IF NOT EXISTS cms_settings (
  setting_key VARCHAR(80) NOT NULL PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO cms_settings (setting_key, setting_value, updated_at)
VALUES ('notify_email', 'thegamehourr@gmail.com', UTC_TIMESTAMP())
ON DUPLICATE KEY UPDATE setting_key = setting_key;
