(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var msg = params.get('msg');
  if (msg) {
    var toast = document.createElement('div');
    toast.className = 'toast' + (msg.toLowerCase().indexOf('fail') !== -1 || msg.toLowerCase().indexOf('expired') !== -1 ? ' is-error' : '');
    toast.setAttribute('role', 'status');
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(function () { toast.remove(); }, 300);
    }, 4500);
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
