-- Bubble unique IDs + event extras for CSV import
-- Safe to run after migrate-events.sql and migrate-ops.sql.
-- PHP also adds these via cms_ops_add_event_columns() / cms_ops_add_bubble_id_columns().

SET @db := DATABASE();

SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'events' AND COLUMN_NAME = 'instagram_handle'
);
SET @sql := IF(@exists = 0, 'ALTER TABLE events ADD COLUMN instagram_handle VARCHAR(80) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'events' AND COLUMN_NAME = 'added_to_calendar'
);
SET @sql := IF(@exists = 0, 'ALTER TABLE events ADD COLUMN added_to_calendar TINYINT(1) NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'events' AND COLUMN_NAME = 'bubble_id'
);
SET @sql := IF(@exists = 0, 'ALTER TABLE events ADD COLUMN bubble_id VARCHAR(64) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'events' AND INDEX_NAME = 'uq_events_bubble_id'
);
SET @sql := IF(@exists = 0, 'ALTER TABLE events ADD UNIQUE KEY uq_events_bubble_id (bubble_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'games' AND COLUMN_NAME = 'bubble_id'
);
SET @sql := IF(@exists = 0, 'ALTER TABLE games ADD COLUMN bubble_id VARCHAR(64) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'games' AND INDEX_NAME = 'uq_games_bubble_id'
);
SET @sql := IF(@exists = 0, 'ALTER TABLE games ADD UNIQUE KEY uq_games_bubble_id (bubble_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'team_members' AND COLUMN_NAME = 'bubble_id'
);
SET @sql := IF(@exists = 0, 'ALTER TABLE team_members ADD COLUMN bubble_id VARCHAR(64) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'team_members' AND INDEX_NAME = 'uq_team_members_bubble_id'
);
SET @sql := IF(@exists = 0, 'ALTER TABLE team_members ADD UNIQUE KEY uq_team_members_bubble_id (bubble_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
