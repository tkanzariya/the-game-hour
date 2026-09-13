<?php
declare(strict_types=1);

/**
 * Ensure operations tables exist (users, team, games, event links).
 * Safe to call repeatedly.
 */

require_once __DIR__ . '/events-migrate.php';

/** @var string|null */
$GLOBALS['cms_ops_migration_error'] = null;

function cms_ops_migration_error(): ?string
{
    return $GLOBALS['cms_ops_migration_error'] ?? null;
}

function cms_ops_db_ready(): bool
{
    if (cms_dev_json_enabled()) {
        return true;
    }
    cms_ops_migrate_if_needed();
    return cms_ops_tables_exist();
}

function cms_ops_migrate_if_needed(): void
{
    static $attempted = false;
    if ($attempted || cms_dev_json_enabled()) {
        return;
    }
    $attempted = true;

    cms_events_migrate_if_needed();
    if (!cms_events_table_exists()) {
        $GLOBALS['cms_ops_migration_error'] =
            cms_events_migration_error() ?? 'Events table is missing. Run cms/sql/migrate-events.sql first.';
        return;
    }

    $path = __DIR__ . '/../sql/migrate-ops.sql';
    if (!is_file($path)) {
        $GLOBALS['cms_ops_migration_error'] = 'Missing migration file: migrate-ops.sql';
        return;
    }

    try {
        $pdo = cms_db();
        $sql = (string) file_get_contents($path);
        foreach (cms_events_split_sql_statements($sql) as $statement) {
            $pdo->exec($statement);
        }
        cms_ops_add_event_columns();
        cms_ops_add_bubble_id_columns();
        cms_ops_seed_admin_from_config();
        if (!cms_ops_tables_exist()) {
            $GLOBALS['cms_ops_migration_error'] =
                'Operations tables were not created. Run cms/sql/migrate-ops.sql in phpMyAdmin.';
        }
    } catch (Throwable $e) {
        $GLOBALS['cms_ops_migration_error'] =
            'Could not migrate operations tables. Run cms/sql/migrate-ops.sql in phpMyAdmin. '
            . $e->getMessage();
    }
}

function cms_ops_tables_exist(): bool
{
    try {
        $pdo = cms_db();
        foreach (['users', 'team_members', 'games'] as $table) {
            $stmt = $pdo->query('SHOW TABLES LIKE ' . $pdo->quote($table));
            if ($stmt === false || $stmt->fetchColumn() === false) {
                return false;
            }
        }
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

function cms_ops_column_exists(string $table, string $column): bool
{
    $stmt = cms_db()->prepare(
        'SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table_name AND COLUMN_NAME = :column_name',
    );
    $stmt->execute(['table_name' => $table, 'column_name' => $column]);
    return (int) $stmt->fetchColumn() > 0;
}

function cms_ops_add_event_columns(): void
{
    $pdo = cms_db();
    if (!cms_ops_column_exists('events', 'instagram_handle')) {
        $pdo->exec('ALTER TABLE events ADD COLUMN instagram_handle VARCHAR(80) DEFAULT NULL');
    }
    if (!cms_ops_column_exists('events', 'added_to_calendar')) {
        $pdo->exec('ALTER TABLE events ADD COLUMN added_to_calendar TINYINT(1) NOT NULL DEFAULT 0');
    }
}

function cms_ops_add_unique_if_missing(string $table, string $indexName, string $column): void
{
    $stmt = cms_db()->prepare(
        'SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table_name AND INDEX_NAME = :index_name',
    );
    $stmt->execute(['table_name' => $table, 'index_name' => $indexName]);
    if ((int) $stmt->fetchColumn() > 0) {
        return;
    }
    $quotedTable = '`' . str_replace('`', '``', $table) . '`';
    $quotedIndex = '`' . str_replace('`', '``', $indexName) . '`';
    $quotedColumn = '`' . str_replace('`', '``', $column) . '`';
    cms_db()->exec("ALTER TABLE {$quotedTable} ADD UNIQUE KEY {$quotedIndex} ({$quotedColumn})");
}

function cms_ops_add_bubble_id_columns(): void
{
    $pdo = cms_db();
    foreach (['events', 'games', 'team_members'] as $table) {
        if (!cms_ops_column_exists($table, 'bubble_id')) {
            $quoted = '`' . str_replace('`', '``', $table) . '`';
            $pdo->exec("ALTER TABLE {$quoted} ADD COLUMN bubble_id VARCHAR(64) DEFAULT NULL");
        }
        cms_ops_add_unique_if_missing($table, 'uq_' . $table . '_bubble_id', 'bubble_id');
    }
}

function cms_ops_seed_email_from_username(string $username): string
{
    $username = trim($username);
    if ($username !== '' && filter_var($username, FILTER_VALIDATE_EMAIL)) {
        return strtolower($username);
    }
    $safe = preg_replace('/[^a-z0-9._-]/i', '', $username) ?: 'admin';
    return strtolower($safe) . '@thegamehour.local';
}

function cms_ops_seed_admin_from_config(): void
{
    if (!cms_ops_tables_exist()) {
        return;
    }
    $info = cms_db()->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $info->execute(['email' => 'info@thegamehour.com']);
    if ($info->fetchColumn() !== false) {
        return;
    }
    $count = (int) cms_db()->query('SELECT COUNT(*) FROM users')->fetchColumn();
    if ($count > 0) {
        return;
    }
    $admin = cms_config()['admin'] ?? [];
    $username = trim((string) ($admin['username'] ?? ''));
    $hash = (string) ($admin['password_hash'] ?? '');
    if ($username === '' || $hash === '' || str_contains($hash, 'REPLACE_WITH')) {
        return;
    }
    $stmt = cms_db()->prepare(
        'INSERT INTO users (name, email, password_hash, role, is_active)
         VALUES (:name, :email, :password_hash, :role, 1)',
    );
    $stmt->execute([
        'name' => $username,
        'email' => cms_ops_seed_email_from_username($username),
        'password_hash' => $hash,
        'role' => 'admin',
    ]);
}
