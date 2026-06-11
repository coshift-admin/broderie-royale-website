/* ============================================================
   file-picker.js — reusable file-attachment UI for the storefront.
   Used on /commande (order attachments), /contact (contact + devis).

   Usage:
     const picker = BR_FilePicker.attach({
       root: document.querySelector('#myPicker'),
       maxFiles: 10,
       maxBytesPerFile: 10 * 1024 * 1024,
       maxBytesTotal: 50 * 1024 * 1024,
       promptHtml: '...',  // optional, defaults to FR copy
     });
     // ...later, on submit:
     const files = picker.files();  // Array<File>

   The picker writes its own validation errors inline and keeps the
   selection state. It does NOT submit anything itself.
   ============================================================ */
(function () {
  "use strict";

  var DEFAULT_ALLOWED_EXTS = [
    "png","jpg","jpeg","gif","webp","bmp","tiff","tif",
    "pdf","ai","eps","psd","svg",
  ];

  function esc(s) {
    if (s == null) return "";
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatBytes(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(0) + " KB";
    return (n / 1024 / 1024).toFixed(1) + " MB";
  }

  function fileExt(name) {
    if (!name || name.indexOf(".") < 0) return "";
    return name.split(".").pop().toLowerCase();
  }

  function defaultPromptHtml(allowedHuman, maxFiles, maxMb) {
    // Compact prompt — keeps the picker visually light. The full list of
    // accepted formats is hidden inside the hint chip on the right; users
    // who care can hover/focus it, and anyone who tries to upload a wrong
    // file gets a clear inline error pointing to the same list.
    var hintText = "Formats acceptés : " + esc(allowedHuman)
      + ". Jusqu’à " + maxFiles + " fichiers, " + maxMb + " MB par fichier.";
    return (
      '<span class="fp-ico" aria-hidden="true">'
      +  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 4v12M6 10l6-6 6 6M5 19h14"/></svg>'
      + '</span>'
      + '<span class="fp-text">'
      +   '<b>Ajouter des fichiers</b>'
      +   '<small>Glissez-déposez ou cliquez pour parcourir</small>'
      + '</span>'
      + '<span class="fp-hint" role="button" tabindex="0"'
      +     ' aria-label="' + esc(hintText) + '"'
      +     ' data-tip="' + esc(hintText) + '">'
      +   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4M12 17h.01"/></svg>'
      + '</span>'
    );
  }

  function attach(opts) {
    opts = opts || {};
    var root = opts.root;
    if (!root) throw new Error("BR_FilePicker.attach: opts.root is required");

    var allowedExts = opts.allowedExts || DEFAULT_ALLOWED_EXTS;
    var maxFiles = opts.maxFiles || 10;
    var maxBytesPerFile = opts.maxBytesPerFile || 10 * 1024 * 1024;
    var maxBytesTotal = opts.maxBytesTotal || 50 * 1024 * 1024;

    var allowedAccept = allowedExts.map(function (e) { return "." + e; }).join(",");
    var allowedHuman = allowedExts.map(function (e) { return e.toUpperCase(); }).join(", ");
    var maxMb = Math.floor(maxBytesPerFile / 1024 / 1024);

    // Render shell. We accept root as either an empty container or one
    // that already has the markup — but the simplest contract is "empty
    // div, we build everything inside it."
    root.classList.add("file-picker");
    root.innerHTML =
      '<label class="file-picker-prompt">'
      +  (opts.promptHtml || defaultPromptHtml(allowedHuman, maxFiles, maxMb))
      +  '<input type="file" multiple accept="' + esc(allowedAccept) + '" />'
      + '</label>'
      + '<div class="file-picker-list" role="list"></div>'
      + '<div class="file-picker-error" hidden></div>';

    var input = root.querySelector("input[type=file]");
    var list = root.querySelector(".file-picker-list");
    var errEl = root.querySelector(".file-picker-error");

    // In-memory selection. We don't write back to the <input>'s FileList
    // because that's immutable in most browsers; instead the picker is
    // the source of truth and we hand `files()` back to the caller.
    var state = [];

    function setError(msg) {
      if (!msg) { errEl.hidden = true; errEl.textContent = ""; return; }
      errEl.hidden = false;
      errEl.textContent = msg;
    }

    function renderList() {
      list.innerHTML = state.map(function (f, i) {
        return (
          '<div class="file-picker-item" role="listitem">'
          +  '<span class="fp-name" title="' + esc(f.name) + '">' + esc(f.name) + '</span>'
          +  '<span class="fp-size">' + esc(formatBytes(f.size)) + '</span>'
          +  '<button type="button" class="fp-remove" data-idx="' + i + '" aria-label="Retirer ' + esc(f.name) + '">×</button>'
          + '</div>'
        );
      }).join("");
      list.querySelectorAll(".fp-remove").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var idx = parseInt(btn.dataset.idx, 10);
          state.splice(idx, 1);
          renderList();
          setError("");
        });
      });
    }

    function addFiles(incoming) {
      setError("");
      var rejected = [];
      var total = state.reduce(function (s, f) { return s + f.size; }, 0);
      for (var i = 0; i < incoming.length; i++) {
        var f = incoming[i];
        var ext = fileExt(f.name);
        if (allowedExts.indexOf(ext) < 0) {
          rejected.push(f.name + " (type non autorisé)");
          continue;
        }
        if (f.size > maxBytesPerFile) {
          rejected.push(f.name + " (trop volumineux)");
          continue;
        }
        if (state.length >= maxFiles) {
          rejected.push(f.name + " (limite de " + maxFiles + " fichiers atteinte)");
          continue;
        }
        if (total + f.size > maxBytesTotal) {
          rejected.push(f.name + " (total > " + Math.floor(maxBytesTotal / 1024 / 1024) + " MB)");
          continue;
        }
        // Skip exact duplicates (same name + size).
        var dup = state.some(function (g) { return g.name === f.name && g.size === f.size; });
        if (dup) continue;
        state.push(f);
        total += f.size;
      }
      renderList();
      if (rejected.length) {
        setError("Fichiers refusés : " + rejected.join(" ; "));
      }
    }

    input.addEventListener("change", function () {
      addFiles(input.files || []);
      // Reset the native input so re-picking the same file works.
      try { input.value = ""; } catch (e) {}
    });

    // Drag-and-drop. The whole picker is the drop zone.
    ["dragenter", "dragover"].forEach(function (ev) {
      root.addEventListener(ev, function (e) {
        e.preventDefault(); e.stopPropagation();
        root.classList.add("is-drag");
      });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      root.addEventListener(ev, function (e) {
        e.preventDefault(); e.stopPropagation();
        root.classList.remove("is-drag");
      });
    });
    root.addEventListener("drop", function (e) {
      var files = (e.dataTransfer && e.dataTransfer.files) || [];
      if (files.length) addFiles(files);
    });

    return {
      files: function () { return state.slice(); },
      clear: function () { state = []; renderList(); setError(""); },
      count: function () { return state.length; },
    };
  }

  window.BR_FilePicker = { attach: attach };
})();
