<?php
declare(strict_types=1);

/**
 * Ensure the events table exists on MySQL.
 * Safe to call repeatedly — SQL uses IF NOT EXISTS.
 */

/** @var string|null */
$GLOBALS['cms_events_migration_error'] = null;

function cms_events_migration_error(): ?string
{
    return $GLOBALS['cms_events_migration_error'] ?? null;
}

function cms_events_db_ready(): bool
{
    if (cms_dev_json_enabled()) {
        return true;
    }
    cms_events_migrate_if_needed();
    return cms_events_table_exists();
}

function cms_events_migrate_if_needed(): void
{
    static $attempted = false;
    if ($attempted || cms_dev_json_enabled()) {
        return;
    }
    $attempted = true;

    if (cms_events_table_exists()) {
        return;
    }

    $path = __DIR__ . '/../sql/migrate-events.sql';
    if (!is_file($path)) {
        $GLOBALS['cms_events_migration_error'] = 'Missing migration file: migrate-events.sql';
        return;
    }

    try {
        $sql = (string) file_get_contents($path);
        $statements = cms_events_split_sql_statements($sql);
        $pdo = cms_db();
        foreach ($statements as $statement) {
            $pdo->exec($statement);
        }
        if (!cms_events_table_exists()) {
            $GLOBALS['cms_events_migration_error'] =
                'Events table was not created. Run cms/sql/migrate-events.sql in phpMyAdmin.';
        }
    } catch (Throwable $e) {
        $GLOBALS['cms_events_migration_error'] =
            'Could not create events table automatically. Run cms/sql/migrate-events.sql in phpMyAdmin. '
            . $e->getMessage();
    }
}

function cms_events_table_exists(): bool
{
    try {
        $pdo = cms_db();
        $stmt = $pdo->query("SHOW TABLES LIKE 'events'");
        return $stmt !== false && $stmt->fetchColumn() !== false;
    } catch (Throwable $e) {
        return false;
    }
}

/** @return list<string> */
function cms_events_split_sql_statements(string $sql): array
{
    $lines = preg_split('/\R/', $sql) ?: [];
    $buffer = '';
    $statements = [];

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || strpos($trimmed, '--') === 0) {
            continue;
        }
        $buffer .= $line . "\n";
        if (substr(rtrim($line), -1) === ';') {
            $statement = trim($buffer);
            $buffer = '';
            if ($statement !== '') {
                $statements[] = $statement;
            }
        }
    }

    $tail = trim($buffer);
    if ($tail !== '') {
        $statements[] = $tail;
    }

    return $statements;
}
