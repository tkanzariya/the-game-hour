# Upload Error Handling Report

Generated during CMS stabilization phase.

## Problem

Upload failures often surfaced as generic **“Your session expired”** messages because CSRF validation ran before file validation, and PHP upload errors (`UPLOAD_ERR_*`) were collapsed into a single generic failure string.

## Solution

### Server-side (`cms/includes/bootstrap.php`)

`cms_validate_image_upload()` now maps PHP upload errors to specific codes and messages:

| Code | User message | Trigger |
|------|--------------|---------|
| `file_too_large` | File too large. Maximum size is 5 MB. | `UPLOAD_ERR_INI_SIZE`, `UPLOAD_ERR_FORM_SIZE`, or size > config max |
| `no_file` | Please choose a photo to upload. | `UPLOAD_ERR_NO_FILE` |
| `invalid_type` | Invalid file type. Allowed: JPG, PNG, WEBP. | Bad extension or MIME |
| `invalid_image` | That file is not a valid image. Please choose a photo. | `getimagesize()` failure |
| `upload_failed` | Upload failed. Please try again. | Other `UPLOAD_ERR_*`, move failure |

Each failure returns `{ ok: false, error: string, code: string }`.

### Flash message codes (`cms/data/flash-messages.php`)

Standardized redirect codes via `?msg=`:

| Code | Message |
|------|---------|
| `upload_success` | Image uploaded successfully. It is now live on your website. |
| `replace_success` | Image replaced successfully. The new photo is live on your website. |
| `remove_success` | Image removed. The website default is showing again. |
| `upload_failed` | Upload failed. Please try again. |
| `file_too_large` | File too large. Maximum size is 5 MB. |
| `invalid_type` | Invalid file type. Allowed: JPG, PNG, WEBP. |
| `invalid_image` | That file is not a valid image. Please choose a photo. |
| `no_file` | Please choose a photo to upload. |
| `session_expired` | Your session expired. Please sign in and try again. |
| `csrf_failed` | Your session expired. Please go back and try again. |
| `delete_failed` | Could not remove the image. Please try again. |

### Upload page (`cms/admin/upload.php`)

- CSRF failure → `csrf_failed` (only when token invalid)
- Missing file → `no_file`
- Validation/save errors → specific code from `cms_validate_image_upload()` / `cms_save_upload()`
- Success → `upload_success` or `replace_success` based on prior upload state
- Inline `<div class="notice notice-error">` on the upload form for immediate errors (no redirect)

### Delete flow (`cms/admin/delete.php`)

- Success → `remove_success`
- CSRF failure → `session_expired`
- Failure → `delete_failed`

### Client-side (`cms/admin/assets/admin.js`)

- Toast notifications resolve `?msg=` codes to human-readable text
- Success toasts: green (`is-success`)
- Error toasts: red (`is-error`)
- URL cleaned with `history.replaceState` after showing toast
- **Pre-submit validation** on file picker: size > 5 MB and invalid MIME show inline notice before form submit

### Styles (`cms/admin/assets/admin.css`)

- `.notice`, `.notice-error`, `.notice-success` for inline alerts
- `.toast.is-success` / `.toast.is-error` for flash toasts

## Verification checklist

- [ ] Upload valid JPG → green toast `upload_success` or `replace_success`
- [ ] Upload 6 MB file → inline/client notice `file_too_large` (before submit) or server `file_too_large`
- [ ] Upload `.pdf` → `invalid_type`
- [ ] Submit form with expired session → `csrf_failed` toast (not conflated with file errors)
- [ ] Remove uploaded image → `remove_success` toast

## Files changed

- `cms/includes/bootstrap.php`
- `cms/data/flash-messages.php` (new)
- `cms/admin/upload.php`
- `cms/admin/delete.php`
- `cms/admin/assets/admin.js`
- `cms/admin/assets/admin.css`
