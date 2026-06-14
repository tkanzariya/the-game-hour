<?php
declare(strict_types=1);

require_once __DIR__ . '/dev-content-store.php';
require_once __DIR__ . '/content-migrate.php';
require_once __DIR__ . '/../data/content-seed.php';

function cms_content_uses_json(): bool
{
    return cms_dev_json_enabled() && cms_dev_content_enabled();
}

function cms_content_testimonial_count(): int
{
    if (cms_content_uses_json()) {
        return cms_dev_content_count_testimonials();
    }
    cms_content_migrate_if_needed();
    $stmt = cms_db()->query('SELECT COUNT(*) FROM testimonials');
    return (int) $stmt->fetchColumn();
}

function cms_content_seed_if_empty(): void
{
    cms_content_migrate_if_needed();
    if (cms_content_testimonial_count() === 0) {
        $rows = cms_content_seed_testimonials_from_json();
        if ($rows !== []) {
            cms_content_insert_seed_testimonials($rows);
        }
    }

    $metrics = cms_content_get_metric_values();
    $needsMetrics = false;
    foreach (cms_content_metric_keys() as $key) {
        if (!isset($metrics[$key]) || $metrics[$key] === '') {
            $needsMetrics = true;
            break;
        }
    }
    if ($needsMetrics) {
        cms_content_save_metric_values(cms_content_default_metrics());
    }
}

/** @param list<array<string, mixed>> $rows */
function cms_content_insert_seed_testimonials(array $rows): void
{
    if (cms_content_uses_json()) {
        $now = gmdate('Y-m-d H:i:s');
        $id = 0;
        $out = [];
        foreach ($rows as $row) {
            $id++;
            $out[] = [
                'id' => $id,
                'slug' => (string) $row['slug'],
                'name' => (string) $row['name'],
                'role' => (string) $row['role'],
                'review' => (string) $row['review'],
                'rating' => (int) ($row['rating'] ?? 5),
                'visible' => (int) ($row['visible'] ?? 1),
                'sort_order' => (int) ($row['sort_order'] ?? 0),
                'placement' => (string) ($row['placement'] ?? 'home'),
                'service_slug' => $row['service_slug'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        cms_dev_content_seed_testimonials($out);
        return;
    }

    $stmt = cms_db()->prepare(
        'INSERT INTO testimonials (slug, name, role, review, rating, visible, sort_order, placement, service_slug, updated_at)
         VALUES (:slug, :name, :role, :review, :rating, :visible, :sort_order, :placement, :service_slug, UTC_TIMESTAMP())',
    );
    foreach ($rows as $row) {
        $stmt->execute([
            'slug' => (string) $row['slug'],
            'name' => (string) $row['name'],
            'role' => (string) $row['role'],
            'review' => (string) $row['review'],
            'rating' => max(1, min(5, (int) ($row['rating'] ?? 5))),
            'visible' => (int) ($row['visible'] ?? 1),
            'sort_order' => (int) ($row['sort_order'] ?? 0),
            'placement' => (string) ($row['placement'] ?? 'home'),
            'service_slug' => $row['service_slug'] ?? null,
        ]);
    }
}

/** @return list<array<string, mixed>> */
function cms_content_get_all_testimonials(bool $includeHidden = false): array
{
    if (cms_content_uses_json()) {
        return cms_dev_content_get_all_testimonials($includeHidden);
    }
    $sql = 'SELECT id, slug, name, role, review, rating, visible, sort_order, placement, service_slug, created_at, updated_at
            FROM testimonials';
    if (!$includeHidden) {
        $sql .= ' WHERE visible = 1';
    }
    $sql .= ' ORDER BY sort_order ASC, id DESC';
    return cms_db()->query($sql)->fetchAll();
}

function cms_content_get_testimonial(int $id): ?array
{
    if (cms_content_uses_json()) {
        return cms_dev_content_get_testimonial($id);
    }
    $stmt = cms_db()->prepare(
        'SELECT id, slug, name, role, review, rating, visible, sort_order, placement, service_slug, created_at, updated_at
         FROM testimonials WHERE id = :id LIMIT 1',
    );
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

/** @param array<string, mixed> $input */
function cms_content_validate_testimonial_input(array $input, bool $isUpdate): array
{
    $name = trim((string) ($input['name'] ?? ''));
    $role = trim((string) ($input['role'] ?? ''));
    $review = trim((string) ($input['review'] ?? ''));
    $rating = (int) ($input['rating'] ?? 5);
    $visible = !empty($input['visible']) ? 1 : 0;
    $sortOrder = (int) ($input['sort_order'] ?? 0);
    $placement = (string) ($input['placement'] ?? 'home');
    $serviceSlug = trim((string) ($input['service_slug'] ?? ''));

    if ($name === '') {
        return ['ok' => false, 'error' => 'Name is required.', 'code' => 'validation'];
    }
    if ($review === '') {
        return ['ok' => false, 'error' => 'Review is required.', 'code' => 'validation'];
    }
    if (strlen($review) > 2000) {
        return ['ok' => false, 'error' => 'Review is too long (max 2000 characters).', 'code' => 'validation'];
    }
    if ($rating < 1 || $rating > 5) {
        return ['ok' => false, 'error' => 'Rating must be between 1 and 5.', 'code' => 'validation'];
    }
    if (!in_array($placement, ['home', 'service'], true)) {
        $placement = 'home';
    }
    if ($placement === 'service' && $serviceSlug === '') {
        return ['ok' => false, 'error' => 'Choose a service page for service testimonials.', 'code' => 'validation'];
    }
    if ($placement === 'home') {
        $serviceSlug = null;
    }

    $slug = cms_sanitize_key((string) ($input['slug'] ?? ''));
    if (!$isUpdate || $slug === '') {
        $slug = cms_sanitize_key($name . '-' . ($input['id'] ?? bin2hex(random_bytes(4))));
    }
    if ($slug === '') {
        $slug = 'testimonial-' . time();
    }

    return [
        'ok' => true,
        'data' => [
            'slug' => $slug,
            'name' => $name,
            'role' => $role,
            'review' => $review,
            'rating' => $rating,
            'visible' => $visible,
            'sort_order' => $sortOrder,
            'placement' => $placement,
            'service_slug' => $serviceSlug !== '' ? $serviceSlug : null,
        ],
    ];
}

/** @param array<string, mixed> $input */
function cms_content_save_testimonial(array $input): array
{
    $id = (int) ($input['id'] ?? 0);
    $validated = cms_content_validate_testimonial_input($input, $id > 0);
    if (!$validated['ok']) {
        return $validated;
    }
    $data = $validated['data'];

    if (cms_content_uses_json()) {
        $payload = array_merge($data, ['id' => $id > 0 ? $id : null]);
        return cms_dev_content_save_testimonial($payload);
    }

    if ($id > 0) {
        $stmt = cms_db()->prepare(
            'UPDATE testimonials SET slug = :slug, name = :name, role = :role, review = :review, rating = :rating,
             visible = :visible, sort_order = :sort_order, placement = :placement, service_slug = :service_slug,
             updated_at = UTC_TIMESTAMP() WHERE id = :id',
        );
        $stmt->execute([
            'id' => $id,
            'slug' => $data['slug'],
            'name' => $data['name'],
            'role' => $data['role'],
            'review' => $data['review'],
            'rating' => $data['rating'],
            'visible' => $data['visible'],
            'sort_order' => $data['sort_order'],
            'placement' => $data['placement'],
            'service_slug' => $data['service_slug'],
        ]);
        if ($stmt->rowCount() === 0 && cms_content_get_testimonial($id) === null) {
            return ['ok' => false, 'error' => 'Testimonial not found.', 'code' => 'not_found'];
        }
        return ['ok' => true, 'id' => $id];
    }

    $stmt = cms_db()->prepare(
        'INSERT INTO testimonials (slug, name, role, review, rating, visible, sort_order, placement, service_slug, updated_at)
         VALUES (:slug, :name, :role, :review, :rating, :visible, :sort_order, :placement, :service_slug, UTC_TIMESTAMP())',
    );
    try {
        $stmt->execute([
            'slug' => $data['slug'],
            'name' => $data['name'],
            'role' => $data['role'],
            'review' => $data['review'],
            'rating' => $data['rating'],
            'visible' => $data['visible'],
            'sort_order' => $data['sort_order'],
            'placement' => $data['placement'],
            'service_slug' => $data['service_slug'],
        ]);
    } catch (PDOException $e) {
        if (str_contains($e->getMessage(), 'Duplicate')) {
            return ['ok' => false, 'error' => 'A testimonial with that ID already exists. Try a different name.', 'code' => 'validation'];
        }
        throw $e;
    }
    return ['ok' => true, 'id' => (int) cms_db()->lastInsertId()];
}

function cms_content_delete_testimonial(int $id): bool
{
    if (cms_content_uses_json()) {
        return cms_dev_content_delete_testimonial($id);
    }
    $stmt = cms_db()->prepare('DELETE FROM testimonials WHERE id = :id');
    $stmt->execute(['id' => $id]);
    return $stmt->rowCount() > 0;
}

/** @return array<string, string> */
function cms_content_get_metric_values(): array
{
    if (cms_content_uses_json()) {
        return cms_dev_content_get_metrics();
    }
    $stmt = cms_db()->query('SELECT metric_key, value FROM site_metrics');
    $values = cms_content_default_metrics();
    foreach ($stmt->fetchAll() as $row) {
        $values[(string) $row['metric_key']] = (string) $row['value'];
    }
    return $values;
}

/** @param array<string, string> $values */
function cms_content_save_metric_values(array $values): void
{
    $clean = [];
    foreach (cms_content_metric_keys() as $key) {
        $clean[$key] = trim((string) ($values[$key] ?? ''));
    }

    if (cms_content_uses_json()) {
        cms_dev_content_save_metrics($clean);
        return;
    }

    $stmt = cms_db()->prepare(
        'INSERT INTO site_metrics (metric_key, value, updated_at) VALUES (:key, :value, UTC_TIMESTAMP())
         ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = UTC_TIMESTAMP()',
    );
    foreach ($clean as $key => $value) {
        $stmt->execute(['key' => $key, 'value' => $value]);
    }
}

function cms_content_testimonial_public_payload(array $row): array
{
    return [
        'id' => (string) ($row['slug'] ?? $row['id']),
        'name' => (string) ($row['name'] ?? ''),
        'role' => (string) ($row['role'] ?? ''),
        'review' => (string) ($row['review'] ?? ''),
        'rating' => (int) ($row['rating'] ?? 5),
        'placement' => (string) ($row['placement'] ?? 'home'),
        'serviceSlug' => $row['service_slug'] ?? null,
        'sortOrder' => (int) ($row['sort_order'] ?? 0),
        'updatedAt' => $row['updated_at'] ?? null,
    ];
}

/** @return array<string, mixed> */
function cms_content_public_payload(): array
{
    $testimonials = array_map(
        'cms_content_testimonial_public_payload',
        cms_content_get_all_testimonials(false),
    );
    $metrics = [];
    foreach (cms_content_get_metric_values() as $key => $value) {
        $metrics[$key] = ['value' => $value, 'label' => cms_content_metric_labels()[$key] ?? $key];
    }
    return [
        'generated_at' => gmdate('c'),
        'version' => 1,
        'testimonials' => $testimonials,
        'metrics' => $metrics,
    ];
}

/** @return list<array{id: string, label: string}> */
function cms_content_service_options(): array
{
    return [
        ['id' => 'birthday-games', 'label' => 'Birthday Games'],
        ['id' => 'corporate-games', 'label' => 'Corporate Games'],
        ['id' => 'social-gathering-games', 'label' => 'Social Gatherings'],
        ['id' => 'game-festival', 'label' => 'Game Festival'],
        ['id' => 'school-and-collage-event', 'label' => 'School & College'],
        ['id' => 'wedding-or-haldi-games', 'label' => 'Wedding / Haldi'],
        ['id' => 'traditional-games', 'label' => 'Traditional Games'],
        ['id' => 'bollywood-games', 'label' => 'Bollywood Games'],
    ];
}

function cms_content_stars(int $rating): string
{
    $rating = max(1, min(5, $rating));
    return str_repeat('★', $rating) . str_repeat('☆', 5 - $rating);
}
