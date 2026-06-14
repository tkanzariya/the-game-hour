<?php
declare(strict_types=1);

/**
 * Apply Phase 1 content tables on production MySQL when missing.
 * Safe to call repeatedly — SQL uses IF NOT EXISTS / idempotent inserts.
 */
function cms_content_migrate_if_needed(): void
{
    static $checked = false;
    if ($checked || cms_content_uses_json()) {
        return;
    }
    $checked = true;

    if (cms_content_tables_exist()) {
        return;
    }

    $path = __DIR__ . '/../sql/migrate-content-phase1.sql';
    if (!is_file($path)) {
        throw new RuntimeException('Missing migration file: migrate-content-phase1.sql');
    }

    $sql = (string) file_get_contents($path);
    $statements = cms_content_split_sql_statements($sql);
    $pdo = cms_db();
    foreach ($statements as $statement) {
        $pdo->exec($statement);
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
    } catch (Throwable) {
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
