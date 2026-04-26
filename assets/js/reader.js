/*
 * GRACE M. STEELE - reader.js
 * TIMBUKTU LLC, 2026
 *
 * Handles all PDF reader functionality for fiction.html and nonfiction.html.
 *
 * HOW TO USE
 * ----------
 * This file is loaded by both reader pages. It reads data-pdf attributes
 * from .work-btn elements and uses PDF.js to render pages into #canvas-stack.
 *
 * To add a new work, add a .work-btn in the HTML with:
 *   data-pdf="path/to/file.pdf"
 * No changes to this JS file are needed.
 *
 * FEATURES
 * --------
 * - PDF rendering via PDF.js (canvas, no embed, no native controls)
 * - Page-by-page navigation (Prev / Next buttons + arrow keys)
 * - Zoom in / out (10% steps, 50%-200% range)
 * - Right-click blocked on the reader area
 * - Context menu blocked site-wide
 * - Tab visibility blur: content blurs when window loses focus
 * - Keyboard shortcut: ArrowLeft / ArrowRight for page turns
 * - Synced top and bottom controls
 */


(function () {
    'use strict';

    // ============================================================
    // PDF.js worker setup
    // Must match the CDN version loaded in the HTML file.
    // ============================================================
    if (typeof pdfjsLib === 'undefined') {
        console.error('reader.js: PDF.js not loaded. Check the CDN script tag in the HTML.');
        return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';


    // ============================================================
    // State
    // ============================================================

    var pdfDoc       = null;   // loaded PDF.js document
    var currentPage  = 1;      // 1-indexed
    var totalPages   = 0;
    var scale        = 1.0;    // render scale (1.0 = 100%)
    var minScale     = 0.5;
    var maxScale     = 2.0;
    var scaleStep    = 0.1;
    var isRendering  = false;  // guard to prevent concurrent renders


    // ============================================================
    // Element references
    // ============================================================

    var canvasStack    = document.getElementById('canvas-stack');
    var readerEmpty    = document.getElementById('reader-empty');
    var readerLoading  = document.getElementById('reader-loading');
    var readerShield   = document.getElementById('reader-shield');

    var prevTop    = document.getElementById('prev-btn-top');
    var nextTop    = document.getElementById('next-btn-top');
    var prevBottom = document.getElementById('prev-btn-bottom');
    var nextBottom = document.getElementById('next-btn-bottom');

    var pageInfoTop    = document.getElementById('page-info-top');
    var pageInfoBottom = document.getElementById('page-info-bottom');

    var zoomInTop     = document.getElementById('zoom-in-btn');
    var zoomOutTop    = document.getElementById('zoom-out-btn');
    var zoomLevelTop  = document.getElementById('zoom-level');
    var zoomInBottom  = document.getElementById('zoom-in-btn-b');
    var zoomOutBottom = document.getElementById('zoom-out-btn-b');
    var zoomLevelBottom = document.getElementById('zoom-level-b');

    var workBtns = document.querySelectorAll('.work-btn');


    // ============================================================
    // Load and render PDF
    // ============================================================

    function loadPdf(path) {
        // Reset state
        currentPage = 1;
        pdfDoc      = null;
        totalPages  = 0;

        showLoading(true);
        clearCanvases();
        setButtonsDisabled(true);

        pdfjsLib.getDocument(path).promise
            .then(function (doc) {
                pdfDoc     = doc;
                totalPages = doc.numPages;
                renderPage(currentPage);
            })
            .catch(function (err) {
                showLoading(false);
                console.error('reader.js: Failed to load PDF:', err);
                showError();
            });
    }

    function renderPage(pageNum) {
        if (!pdfDoc || isRendering) { return; }
        isRendering = true;

        pdfDoc.getPage(pageNum).then(function (page) {
            var viewport = page.getViewport({ scale: scale });

            // Remove any existing canvas for this slot, then create fresh
            clearCanvases();

            var canvas    = document.createElement('canvas');
            var ctx       = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width  = viewport.width;

            canvasStack.appendChild(canvas);

            var renderCtx = {
                canvasContext: ctx,
                viewport:      viewport
            };

            page.render(renderCtx).promise.then(function () {
                isRendering = false;
                showLoading(false);
                updateControls();
            }).catch(function (err) {
                isRendering = false;
                showLoading(false);
                console.error('reader.js: Render error on page', pageNum, err);
            });
        });
    }

    // Clear all canvas elements from the stack (not the empty/loading divs)
    function clearCanvases() {
        var canvases = canvasStack.querySelectorAll('canvas');
        canvases.forEach(function (c) { c.remove(); });
    }

    // Show or hide the loading spinner
    function showLoading(show) {
        if (!readerLoading) { return; }
        readerLoading.style.display = show ? 'flex' : 'none';
        if (readerEmpty) {
            readerEmpty.style.display = show ? 'none' : (pdfDoc ? 'none' : 'flex');
        }
    }

    // Show an inline error message
    function showError() {
        if (!readerEmpty) { return; }
        readerEmpty.style.display = 'flex';
        var mark = readerEmpty.querySelector('.reader-empty__mark');
        var text = readerEmpty.querySelector('.reader-empty__text');
        if (mark) { mark.textContent = '!'; }
        if (text) { text.textContent = 'This work could not be loaded. Please try again later.'; }
    }


    // ============================================================
    // Page navigation
    // ============================================================

    function goToPage(pageNum) {
        if (!pdfDoc || pageNum < 1 || pageNum > totalPages) { return; }
        currentPage = pageNum;
        showLoading(true);
        renderPage(currentPage);
        // Scroll the top of the reader into view
        var frame = document.getElementById('reader-frame');
        if (frame) { frame.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }

    function prevPage() { goToPage(currentPage - 1); }
    function nextPage() { goToPage(currentPage + 1); }

    // Update button disabled states and page counters
    function updateControls() {
        var atFirst = currentPage <= 1;
        var atLast  = currentPage >= totalPages;
        var text    = pdfDoc ? 'Page ' + currentPage + ' of ' + totalPages : '';

        setButtonsDisabled(false);

        if (prevTop)    { prevTop.disabled    = atFirst; }
        if (nextTop)    { nextTop.disabled    = atLast;  }
        if (prevBottom) { prevBottom.disabled = atFirst; }
        if (nextBottom) { nextBottom.disabled = atLast;  }

        if (pageInfoTop)    { pageInfoTop.textContent    = text; }
        if (pageInfoBottom) { pageInfoBottom.textContent = text; }

        updateZoomDisplay();
    }

    function setButtonsDisabled(disabled) {
        if (prevTop)    { prevTop.disabled    = disabled; }
        if (nextTop)    { nextTop.disabled    = disabled; }
        if (prevBottom) { prevBottom.disabled = disabled; }
        if (nextBottom) { nextBottom.disabled = disabled; }
    }


    // ============================================================
    // Zoom
    // ============================================================

    function zoomIn() {
        if (scale >= maxScale) { return; }
        scale = Math.min(maxScale, parseFloat((scale + scaleStep).toFixed(1)));
        rerenderCurrent();
    }

    function zoomOut() {
        if (scale <= minScale) { return; }
        scale = Math.max(minScale, parseFloat((scale - scaleStep).toFixed(1)));
        rerenderCurrent();
    }

    function rerenderCurrent() {
        if (!pdfDoc) { return; }
        showLoading(true);
        renderPage(currentPage);
    }

    function updateZoomDisplay() {
        var label = Math.round(scale * 100) + '%';
        if (zoomLevelTop)    { zoomLevelTop.textContent    = label; }
        if (zoomLevelBottom) { zoomLevelBottom.textContent = label; }
    }


    // ============================================================
    // Work selector buttons
    // ============================================================

    workBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var pdfPath = btn.getAttribute('data-pdf');
            if (!pdfPath) { return; }

            // Update active state
            workBtns.forEach(function (b) { b.classList.remove('is-active'); });
            btn.classList.add('is-active');

            // Hide empty state
            if (readerEmpty) { readerEmpty.style.display = 'none'; }

            loadPdf(pdfPath);
        });
    });


    // ============================================================
    // Nav button events
    // ============================================================

    if (prevTop)    { prevTop.addEventListener('click',    prevPage); }
    if (nextTop)    { nextTop.addEventListener('click',    nextPage); }
    if (prevBottom) { prevBottom.addEventListener('click', prevPage); }
    if (nextBottom) { nextBottom.addEventListener('click', nextPage); }

    if (zoomInTop)     { zoomInTop.addEventListener('click',     zoomIn);  }
    if (zoomOutTop)    { zoomOutTop.addEventListener('click',    zoomOut); }
    if (zoomInBottom)  { zoomInBottom.addEventListener('click',  zoomIn);  }
    if (zoomOutBottom) { zoomOutBottom.addEventListener('click', zoomOut); }


    // ============================================================
    // Keyboard navigation
    // ============================================================

    document.addEventListener('keydown', function (e) {
        if (!pdfDoc) { return; }
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { prevPage(); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  { nextPage(); }
        if (e.key === '+' || e.key === '=') { zoomIn();  }
        if (e.key === '-')                  { zoomOut(); }
    });


    // ============================================================
    // Content protection
    // ============================================================

    // Block right-click everywhere on the page
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });

    // Block right-click specifically on the reader shield overlay
    if (readerShield) {
        readerShield.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            return false;
        });
    }

    // Block common keyboard copy / select-all shortcuts
    document.addEventListener('keydown', function (e) {
        // Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P, Ctrl+U, F12
        var blocked = (
            (e.ctrlKey && (e.key === 'c' || e.key === 'C')) ||
            (e.ctrlKey && (e.key === 'a' || e.key === 'A')) ||
            (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
            (e.ctrlKey && (e.key === 'p' || e.key === 'P')) ||
            (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
            e.key === 'F12' ||
            // Mac equivalents
            (e.metaKey && (e.key === 'c' || e.key === 'C')) ||
            (e.metaKey && (e.key === 'a' || e.key === 'A')) ||
            (e.metaKey && (e.key === 's' || e.key === 'S')) ||
            (e.metaKey && (e.key === 'p' || e.key === 'P'))
        );

        // Allow arrow keys and zoom keys (checked above) but block the rest
        // Only block when a PDF is loaded and we are in the reader area
        if (blocked && pdfDoc) {
            e.preventDefault();
            return false;
        }
    });

    // Tab visibility: blur reader content when window loses focus
    // This discourages screen capture via switch-and-screenshot
    var readerFrame = document.getElementById('reader-frame');

    document.addEventListener('visibilitychange', function () {
        if (!readerFrame) { return; }
        if (document.hidden) {
            readerFrame.style.filter = 'blur(22px)';
        } else {
            readerFrame.style.filter = '';
        }
    });

    window.addEventListener('blur', function () {
        if (readerFrame) { readerFrame.style.filter = 'blur(22px)'; }
    });

    window.addEventListener('focus', function () {
        if (readerFrame) { readerFrame.style.filter = ''; }
    });

    // Block drag-and-drop of canvas elements
    document.addEventListener('dragstart', function (e) {
        if (e.target && e.target.tagName === 'CANVAS') {
            e.preventDefault();
        }
    });


    // ============================================================
    // Print protection (CSS handles display:none but JS adds a
    // belt-and-suspenders blank page replacement)
    // ============================================================

    window.addEventListener('beforeprint', function () {
        if (readerFrame) { readerFrame.style.visibility = 'hidden'; }
    });

    window.addEventListener('afterprint', function () {
        if (readerFrame) { readerFrame.style.visibility = ''; }
    });

}());