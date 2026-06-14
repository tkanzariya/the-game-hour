(function () {
  'use strict';

  var FLASH_MESSAGES = {
    upload_success: 'Image uploaded successfully. It is now live on your website.',
    replace_success: 'Image replaced successfully. The new photo is live on your website.',
    remove_success: 'Image removed. The website default is showing again.',
    upload_failed: 'Upload failed. Please try again.',
    file_too_large: 'File too large. Maximum size is 5 MB.',
    invalid_type: 'Invalid file type. Allowed: JPG, PNG, WEBP.',
    invalid_image: 'That file is not a valid image. Please choose a photo.',
    no_file: 'Please choose a photo to upload.',
    session_expired: 'Your session expired. Please sign in and try again.',
    csrf_failed: 'Your session expired. Please go back and try again.',
    delete_failed: 'Could not remove the image. Please try again.',
    not_found: 'Image slot not found.'
  };

  var ERROR_CODES = [
    'upload_failed', 'file_too_large', 'invalid_type', 'invalid_image',
    'no_file', 'session_expired', 'csrf_failed', 'delete_failed', 'not_found'
  ];

  var params = new URLSearchParams(window.location.search);
  var msgCode = params.get('msg');
  if (msgCode) {
    var text = FLASH_MESSAGES[msgCode] || msgCode;
    var isError = ERROR_CODES.indexOf(msgCode) !== -1;
    var toast = document.createElement('div');
    toast.className = 'toast' + (isError ? ' is-error' : ' is-success');
    toast.setAttribute('role', 'status');
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(function () { toast.remove(); }, 300);
    }, 5000);
    if (window.history.replaceState) {
      params.delete('msg');
      var qs = params.toString();
      var next = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
      window.history.replaceState({}, '', next);
    }
  }

  var sidebar = document.getElementById('sidebar');
  var toggle = document.getElementById('sidebar-toggle');
  var overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebar-overlay';
  if (sidebar) {
    document.body.appendChild(overlay);
    function closeSidebar() {
      sidebar.classList.remove('is-open');
      overlay.classList.remove('is-visible');
    }
    if (toggle) {
      toggle.addEventListener('click', function () {
        sidebar.classList.toggle('is-open');
        overlay.classList.toggle('is-visible');
      });
    }
    overlay.addEventListener('click', closeSidebar);
  }

  var dropzone = document.getElementById('upload-dropzone');
  var fileInput = document.getElementById('upload-file');
  var previewBox = document.getElementById('upload-preview');
  var previewImg = document.getElementById('upload-preview-img');
  var previewName = document.getElementById('upload-preview-name');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', function (e) {
      if (e.target.tagName !== 'INPUT') fileInput.click();
    });
    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });
    dropzone.addEventListener('dragleave', function () {
      dropzone.classList.remove('is-dragover');
    });
    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        showPreview(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) showPreview(fileInput.files[0]);
    });
  }

  function showPreview(file) {
    if (!previewBox || !previewImg || !file.type.match(/^image\//)) return;
    var maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      showInlineNotice('File too large. Maximum size is 5 MB.', true);
      fileInput.value = '';
      previewBox.classList.remove('is-visible');
      return;
    }
    var allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.indexOf(file.type) === -1) {
      showInlineNotice('Invalid file type. Allowed: JPG, PNG, WEBP.', true);
      fileInput.value = '';
      previewBox.classList.remove('is-visible');
      return;
    }
    clearInlineNotice();
    var reader = new FileReader();
    reader.onload = function (ev) {
      previewImg.src = ev.target.result;
      previewBox.classList.add('is-visible');
      if (previewName) {
        previewName.textContent = file.name + ' (' + formatSize(file.size) + ')';
      }
    };
    reader.readAsDataURL(file);
  }

  function showInlineNotice(message, isError) {
    var form = document.querySelector('.upload-form');
    if (!form) return;
    var existing = form.querySelector('.client-notice');
    if (existing) existing.remove();
    var notice = document.createElement('div');
    notice.className = 'notice client-notice' + (isError ? ' notice-error' : ' notice-success');
    notice.setAttribute('role', 'alert');
    notice.textContent = message;
    form.insertBefore(notice, form.firstChild);
  }

  function clearInlineNotice() {
    var existing = document.querySelector('.client-notice');
    if (existing) existing.remove();
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  document.querySelectorAll('[data-confirm-delete]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var label = form.getAttribute('data-photo-label') || 'this photo';
      if (!window.confirm('Remove "' + label + '"?\n\nThe website will show the default image until you upload a new one.')) {
        e.preventDefault();
      }
    });
  });
})();
