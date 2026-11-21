<?php
declare(strict_types=1);

/**
 * Web-sized WebP copies of CMS photos.
 *
 * Admins upload photos up to 20 MB. Visitors get a resized WebP instead, made the first time
 * it is asked for and kept in uploads/_web/. The original upload is never touched.
 * Public URL: /media/{image-key}-{width}.webp  (routed to cms/api/img.php by .htaccess)
 */

/** Widths the public site may ask for. Anything else is refused, so the cache cannot be filled at will. */
function cms_web_image_widths(): array
{
    return [480, 800, 1200, 1600];
}

/** True when this server can read JPG/PNG/WEBP and write WebP. */
function cms_web_image_supported(): bool
{
    return function_exists('imagewebp')
        && function_exists('imagecreatetruecolor')
        && function_exists('imagecopyresampled')
        && function_exists('imagecreatefromjpeg')
        && function_exists('imagecreatefrompng')
        && function_exists('imagecreatefromwebp');
}

/** Heroes are shown full width; everything else in cards and grids. */
function cms_web_image_width_for_key(string $key): int
{
    return strpos($key, 'hero') !== false ? 1600 : 1200;
}

/** Whether the stored file is a kind of photo we can resize. */
function cms_web_image_eligible(?string $filePath): bool
{
    if ($filePath === null || $filePath === '') {
        return false;
    }
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    return in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true);
}

function cms_web_image_cache_dir(): string
{
    return cms_uploads_dir() . DIRECTORY_SEPARATOR . '_web';
}

function cms_web_image_cache_path(string $key, int $width): string
{
    return cms_web_image_cache_dir() . DIRECTORY_SEPARATOR . $key . '-' . $width . '.webp';
}

/** Public URL of the web copy; null when this server cannot make one. */
function cms_web_image_url(string $key, ?string $filePath, ?string $updatedAt): ?string
{
    if (!cms_web_image_supported() || !cms_web_image_eligible($filePath)) {
        return null;
    }
    $url = '/media/' . $key . '-' . cms_web_image_width_for_key($key) . '.webp';
    if ($updatedAt) {
        $v = strtotime($updatedAt);
        if ($v !== false) {
            $url .= '?v=' . $v;
        }
    }
    return $url;
}

/** EXIF orientation (1-8) of a JPEG, read without the exif extension. 1 when absent. */
function cms_jpeg_orientation(string $file): int
{
    $fh = @fopen($file, 'rb');
    if (!$fh) {
        return 1;
    }
    $orientation = 1;
    if (fread($fh, 2) === "\xFF\xD8") {
        while (!feof($fh)) {
            $marker = fread($fh, 4);
            if (strlen($marker) < 4 || $marker[0] !== "\xFF") {
                break;
            }
            $type = ord($marker[1]);
            $len = (ord($marker[2]) << 8) + ord($marker[3]);
            if ($type === 0xDA || $len < 2) {
                break;
            }
            $segment = $len > 2 ? fread($fh, $len - 2) : '';
            if ($type === 0xE1 && substr($segment, 0, 6) === "Exif\0\0" && strlen($segment) > 20) {
                $tiff = substr($segment, 6);
                $little = substr($tiff, 0, 2) === 'II';
                $u16 = static function (string $s, int $o) use ($little): int {
                    $b = substr($s, $o, 2);
                    return strlen($b) < 2 ? 0 : (int) ($little ? (ord($b[1]) << 8) + ord($b[0]) : (ord($b[0]) << 8) + ord($b[1]));
                };
                $u32 = static function (string $s, int $o) use ($little): int {
                    $b = substr($s, $o, 4);
                    if (strlen($b) < 4) {
                        return 0;
                    }
                    return (int) ($little
                        ? (ord($b[3]) << 24) + (ord($b[2]) << 16) + (ord($b[1]) << 8) + ord($b[0])
                        : (ord($b[0]) << 24) + (ord($b[1]) << 16) + (ord($b[2]) << 8) + ord($b[3]));
                };
                $ifd = $u32($tiff, 4);
                $count = $u16($tiff, $ifd);
                for ($i = 0; $i < $count && $i < 64; $i++) {
                    $entry = $ifd + 2 + $i * 12;
                    if ($u16($tiff, $entry) === 0x0112) {
                        $value = $u16($tiff, $entry + 8);
                        $orientation = $value >= 1 && $value <= 8 ? $value : 1;
                        break;
                    }
                }
                break;
            }
        }
    }
    fclose($fh);
    return $orientation;
}

/**
 * Resize $source to at most $width px wide and save it as WebP at $dest.
 * Never makes an image larger. Returns false when it cannot (unsupported, too big for memory, bad file).
 */
function cms_web_image_build(string $source, string $dest, int $width): bool
{
    if (!cms_web_image_supported()) {
        return false;
    }
    $info = @getimagesize($source);
    if ($info === false || $info[0] < 1 || $info[1] < 1) {
        return false;
    }
    [$srcW, $srcH] = $info;
    $type = $info[2];

    // GD holds about 5 bytes per pixel while decoding and resizing; skip what will not fit.
    $limit = (int) ini_get('memory_limit');
    $unit = strtolower(substr(trim((string) ini_get('memory_limit')), -1));
    if ($limit > 0) {
        $limit *= $unit === 'g' ? 1073741824 : ($unit === 'm' ? 1048576 : ($unit === 'k' ? 1024 : 1));
        if ($srcW * $srcH * 5 + memory_get_usage() > $limit) {
            return false;
        }
    }

    if ($type === IMAGETYPE_JPEG) {
        $img = @imagecreatefromjpeg($source);
    } elseif ($type === IMAGETYPE_PNG) {
        $img = @imagecreatefrompng($source);
    } elseif ($type === IMAGETYPE_WEBP) {
        $img = @imagecreatefromwebp($source);
    } else {
        return false;
    }
    if (!$img) {
        return false;
    }

    // Phone photos are often stored sideways with an orientation tag; browsers honour it, so we must too.
    if ($type === IMAGETYPE_JPEG && function_exists('imagerotate')) {
        $angles = [3 => 180, 6 => -90, 8 => 90];
        $o = cms_jpeg_orientation($source);
        if (isset($angles[$o])) {
            $rotated = imagerotate($img, $angles[$o], 0);
            if ($rotated) {
                imagedestroy($img);
                $img = $rotated;
                $srcW = imagesx($img);
                $srcH = imagesy($img);
            }
        }
    }

    $outW = min($width, $srcW);
    $outH = max(1, (int) round($srcH * $outW / $srcW));
    $out = imagecreatetruecolor($outW, $outH);
    if (!$out) {
        imagedestroy($img);
        return false;
    }
    imagealphablending($out, false);
    imagesavealpha($out, true);
    imagefill($out, 0, 0, imagecolorallocatealpha($out, 0, 0, 0, 127));
    imagecopyresampled($out, $img, 0, 0, 0, 0, $outW, $outH, $srcW, $srcH);
    imagedestroy($img);

    $dir = dirname($dest);
    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
        imagedestroy($out);
        return false;
    }
    $tmp = $dest . '.' . getmypid() . '.tmp';
    $ok = @imagewebp($out, $tmp, 82);
    imagedestroy($out);
    if (!$ok || !is_file($tmp) || filesize($tmp) === 0) {
        @unlink($tmp);
        return false;
    }
    if (!@rename($tmp, $dest)) {
        // Windows will not rename over an existing file
        @unlink($dest);
        if (!@rename($tmp, $dest)) {
            @unlink($tmp);
            return false;
        }
    }
    return true;
}

/** Absolute path of the web copy, making or refreshing it when needed. null when it cannot be made. */
function cms_web_image_ensure(string $key, string $filePath, int $width): ?string
{
    $source = cms_uploads_dir() . DIRECTORY_SEPARATOR . $filePath;
    if (!is_file($source)) {
        return null;
    }
    $dest = cms_web_image_cache_path($key, $width);
    if (is_file($dest) && filemtime($dest) >= filemtime($source)) {
        return $dest;
    }
    return cms_web_image_build($source, $dest, $width) ? $dest : null;
}
