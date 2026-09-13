<?php
/**
 * Import Bubble CSVs into games, team_members, and events.
 *
 * Usage:
 *   php cms/tools/import-bubble.php
 *   php cms/tools/import-bubble.php --games="D:\Other\All Games Data.csv" --team="D:\Other\Coaches-Team list.csv" --events="D:\Other\All Events Data.csv"
 *
 * Flags:
 *   --sql-out=path   Write phpMyAdmin SQL (default: cms/dev-data/import-bubble-data.sql)
 *   --json           Upsert into local JSON bookings store (dev mode)
 *   --apply          Apply to MySQL (fails in JSON dev mode)
 *   --dry-run        Parse and report only
 */
declare(strict_types=1);

$root = dirname(__DIR__);
require_once $root . '/includes/bootstrap.php';
require_once $root . '/includes/bubble-import.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run this importer from the command line.\n");
    exit(1);
}

$args = [];
foreach (array_slice($argv, 1) as $arg) {
    if ($arg === '--json' || $arg === '--apply' || $arg === '--dry-run') {
        $args[substr($arg, 2)] = true;
        continue;
    }
    if (str_starts_with($arg, '--') && str_contains($arg, '=')) {
        [$key, $value] = explode('=', substr($arg, 2), 2);
        $args[$key] = $value;
    }
}

$gamesPath = $args['games'] ?? 'D:\\Other\\All Games Data.csv';
$teamPath = $args['team'] ?? 'D:\\Other\\Coaches-Team list.csv';
$eventsPath = $args['events'] ?? 'D:\\Other\\All Events Data.csv';
$sqlOut = $args['sql-out'] ?? ($root . '/dev-data/import-bubble-data.sql');

try {
    $data = cms_bubble_load_from_paths($gamesPath, $teamPath, $eventsPath);
} catch (Throwable $e) {
    fwrite(STDERR, $e->getMessage() . "\n");
    exit(1);
}

fwrite(STDOUT, sprintf(
    "Parsed games=%d team=%d events=%d warnings=%d\n",
    count($data['games']),
    count($data['team']),
    count($data['events']),
    count($data['warnings']),
));
foreach ($data['warnings'] as $warning) {
    fwrite(STDOUT, '  warn: ' . $warning . "\n");
}

if (!empty($args['dry-run'])) {
    exit(0);
}

$dir = dirname($sqlOut);
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}
file_put_contents($sqlOut, cms_bubble_build_sql($data));
fwrite(STDOUT, 'Wrote SQL: ' . $sqlOut . "\n");

$didApply = false;
if (!empty($args['json']) || (cms_dev_json_enabled() && empty($args['apply']))) {
    $stats = cms_bubble_apply_json($data);
    fwrite(STDOUT, sprintf("JSON upsert games=%d team=%d events=%d\n", $stats['games'], $stats['team'], $stats['events']));
    $didApply = true;
}

if (!empty($args['apply'])) {
    if (cms_dev_json_enabled()) {
        fwrite(STDERR, "JSON dev mode is on. Refusing MySQL --apply. Use --json or disable the dev.json_store block.\n");
        exit(1);
    }
    $stats = cms_bubble_apply_pdo(cms_db(), $data);
    fwrite(STDOUT, sprintf("MySQL upsert games=%d team=%d events=%d\n", $stats['games'], $stats['team'], $stats['events']));
    $didApply = true;
}

if (!$didApply) {
    fwrite(STDOUT, "SQL written only. Import that file in phpMyAdmin on the live database, or re-run with --apply / --json.\n");
}

exit(0);
