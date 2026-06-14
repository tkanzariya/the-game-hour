<?php
declare(strict_types=1);

/** Legacy DB keys → canonical frontend keys (mirrors src/data/image-keys.ts CMS_KEY_ALIASES). */
function cms_key_aliases(): array
{
    return [
        'birthday-hero' => 'birthday-games-slider-1',
    ];
}

/** Expand manifest so legacy alias uploads resolve on the frontend. */
function cms_expand_manifest_aliases(array $manifest): array
{
    $aliases = cms_key_aliases();
    foreach ($aliases as $legacy => $canonical) {
        if (isset($manifest[$canonical]) || !isset($manifest[$legacy])) {
            continue;
        }
        $manifest[$canonical] = $manifest[$legacy];
        $manifest[$canonical]['key'] = $canonical;
    }
    foreach ($aliases as $legacy => $canonical) {
        if (isset($manifest[$canonical]) && !isset($manifest[$legacy])) {
            $manifest[$legacy] = $manifest[$canonical];
            $manifest[$legacy]['key'] = $legacy;
        }
    }
    return $manifest;
}

/** User-facing flash messages keyed by code (used in ?msg=). */
function cms_flash_messages(): array
{
    return [
        'upload_success' => 'Image uploaded successfully. It is now live on your website.',
        'replace_success' => 'Image replaced successfully. The new photo is live on your website.',
        'remove_success' => 'Image removed. The website default is showing again.',
        'upload_failed' => 'Upload failed. Please try again.',
        'file_too_large' => 'File too large. Maximum size is 5 MB.',
        'invalid_type' => 'Invalid file type. Allowed: JPG, PNG, WEBP.',
        'invalid_image' => 'That file is not a valid image. Please choose a photo.',
        'no_file' => 'Please choose a photo to upload.',
        'session_expired' => 'Your session expired. Please sign in and try again.',
        'csrf_failed' => 'Your session expired. Please go back and try again.',
        'delete_failed' => 'Could not remove the image. Please try again.',
        'not_found' => 'Image slot not found.',
    ];
}

function cms_flash_message(string $code): string
{
    $messages = cms_flash_messages();
    return $messages[$code] ?? $code;
}

function cms_redirect_with_msg(string $url, string $code): void
{
    $sep = str_contains($url, '?') ? '&' : '?';
    header('Location: ' . $url . $sep . 'msg=' . urlencode($code));
    exit;
}
