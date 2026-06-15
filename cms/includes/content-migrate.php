<?php
declare(strict_types=1);

/**
 * Apply Phase 1 content tables on production MySQL when missing.
 * Safe to call repeatedly — SQL uses IF NOT EXISTS / idempotent inserts.
 * Never throws — callers use cms_content_db_ready() before querying.
 */

/** @var string|null */
$GLOBALS['cms_content_migration_error'] = null;

function cms_content_migration_error(): ?string
{
    return $GLOBALS['cms_content_migration_error'] ?? null;
}

function cms_content_db_ready(): bool
{
    if (cms_content_uses_json()) {
        return true;
    }
    cms_content_migrate_if_needed();
    return cms_content_tables_exist();
}

function cms_content_migrate_if_needed(): void
{
    static $attempted = false;
    if ($attempted || cms_content_uses_json()) {
        return;
    }
    $attempted = true;

    if (cms_content_tables_exist()) {
        return;
    }

    $path = __DIR__ . '/../sql/migrate-content-phase1.sql';
    if (!is_file($path)) {
        $GLOBALS['cms_content_migration_error'] = 'Missing migration file: migrate-content-phase1.sql';
        return;
    }

    try {
        $sql = (string) file_get_contents($path);
        $statements = cms_content_split_sql_statements($sql);
        $pdo = cms_db();
        foreach ($statements as $statement) {
            $pdo->exec($statement);
        }
        if (!cms_content_tables_exist()) {
            $GLOBALS['cms_content_migration_error'] =
                'Database tables were not created. Run cms/sql/migrate-content-phase1.sql in phpMyAdmin.';
        }
    } catch (Throwable $e) {
        $GLOBALS['cms_content_migration_error'] =
            'Could not create content tables automatically. Run cms/sql/migrate-content-phase1.sql in phpMyAdmin.';
    }
}

function cms_content_tables_exist(): bool
{
    try {
        $pdo = cms_db();
        $stmt = $pdo->query("SHOW TABLES LIKE 'testimonials'");
        if ($stmt === false || $stmt->fetchColumn() === false) {
            return false;
        }
        $stmt = $pdo->query("SHOW TABLES LIKE 'site_metrics'");
        return $stmt !== false && $stmt->fetchColumn() !== false;
    } catch (Throwable $e) {
        return false;
    }
}

/** @return list<string> */
function cms_content_split_sql_statements(string $sql): array
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

function cms_content_setup_notice_html(): string
{
    if (cms_content_db_ready()) {
        return '';
    }
    $msg = cms_content_migration_error()
        ?? 'Testimonials and statistics need a one-time database setup.';
    return '<div class="notice notice-error" role="alert">'
        . '<strong>Content database setup required.</strong> '
        . htmlspecialchars($msg)
        . ' Import <code>public_html/cms/sql/migrate-content-phase1.sql</code> in phpMyAdmin, then reload this page.</div>';
}
