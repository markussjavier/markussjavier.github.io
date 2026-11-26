/* =====================================================
   enlarge.js — tap or click a small picture to see it bigger
   (case-studies.html and about.html)

   Three kinds of markup turn it on:
   1) <figure data-screens="name|name|name">  one picture holding three
      phone screens side by side, shown one at a time (Santi and
      LoanMatcha "...Almost"). No new image files are needed.
      Santi's positions are the default. For other pictures add
      data-screens-size="width x height" and
      data-screens-slices="left,width|left,width|left,width".
      Add data-zoom-in to also offer "Zoom in".
   2) data-zoom-group="..." on the box around a case-study picture, with
      "Zoom in". Pictures with the same value share one Previous / Next
      loop. If the box has a caption next to it (<figcaption>, as in
      SEL "The changes"), the caption also shows in the large view.
   3) <img data-enlarge="...">  Tattoo flashes and Prints (about.html).
      Prints also have data-zoom="..." : the artwork file to show when
      enlarged, with data-zoom-size="width x height".

   "Zoom in" shows the picture at the file's own width (never stretched
   past it, so it stays sharp). Drag, swipe or use the arrow keys to
   move around. It only appears when it makes the picture at least
   10% bigger. A button with only one picture hides Previous / Next.
   ===================================================== */
(function () {
  "use strict";
  if (!window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) { return; }  // very old browser: leave pictures as they are

  // Santi: where each screen sits inside the 1972 x 1198 picture: [left edge, width], in image pixels
  var SANTI_SIZE = "1972x1198";
  var SANTI_SLICES = "0,605|683,606|1367,605";

  var figures = Array.prototype.slice.call(document.querySelectorAll("figure[data-screens]"));
  var studies = Array.prototype.slice.call(document.querySelectorAll("[data-zoom-group]"));
  var singles = Array.prototype.slice.call(document.querySelectorAll("img[data-enlarge]"));
  if (!figures.length && !studies.length && !singles.length) { return; }
  var MAX_W = 605;       // widest the Santi, tattoo and print pictures open, in screen pixels
  var ZOOM_MIN = 1.1;    // offer "Zoom in" only if it makes the picture at least this much bigger
  var PAN_STEP = 80;     // how far one arrow-key press moves a zoomed picture

  /* ---------- Build the dark overlay (once) ---------- */
  var view = document.createElement("dialog");
  view.className = "zoom";
  view.setAttribute("aria-label", "Enlarged picture");
  view.innerHTML =
    '<div class="zoom__layout">' +
      '<div class="zoom__top">' +
        '<button type="button" class="zoom__btn zoom__zoom" hidden>Zoom in</button>' +
        '<button type="button" class="zoom__btn zoom__close">Close</button>' +
      '</div>' +
      '<div class="zoom__stage"><div class="zoom__frame"><img class="zoom__img" alt=""></div></div>' +
      '<p class="zoom__label" aria-live="polite" hidden></p>' +
      '<div class="zoom__bottom">' +
        '<button type="button" class="zoom__btn zoom__prev">Previous</button>' +
        '<p class="zoom__count" aria-live="polite"></p>' +
        '<button type="button" class="zoom__btn zoom__next">Next</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(view);

  var stage = view.querySelector(".zoom__stage");
  var frame = view.querySelector(".zoom__frame");
  var picture = view.querySelector(".zoom__img");
  var count = view.querySelector(".zoom__count");
  var bottomBar = view.querySelector(".zoom__bottom");
  var label = view.querySelector(".zoom__label");
  var zoomButton = view.querySelector(".zoom__zoom");
  var fullW = 0;         // zoomed width of the picture showing now (0 = no zoom for this one)
  var zoomed = false;
  var drag = null;       // mouse drag in progress
  var lastWidth = 0;     // window width, to notice a phone being turned
  var group = null;      // what we opened: { items, buttons }
  var index = 0;         // which picture in that group is showing
  var returnY = 0;       // page position to go back to

  function render() {
    var item = group.items[index];
    var size = item.size();        // { ratio, maxW, sliceWidth, sliceLeft, fullW }
    setZoom(false);                // every picture starts fitted to the window
    fullW = size.fullW || 0;
    view.classList.toggle("zoom--wide", !!fullW && size.ratio > .75);
    frame.style.setProperty("--screen-ratio", size.ratio);
    frame.style.setProperty("--max-w", size.maxW + "px");
    picture.src = item.src;
    picture.alt = item.name;
    picture.style.width = size.sliceWidth + "%";            // 100% = the whole picture
    picture.style.left = size.sliceLeft + "%";
    count.textContent = (index + 1) + " of " + group.items.length;
    bottomBar.hidden = group.items.length < 2;
    label.textContent = item.label || "";
    label.hidden = !item.label;
    if (view.open) { offerZoom(); }
  }

  function offerZoom() {                                     // call only while the picture is fitted
    zoomButton.hidden = !(fullW && fullW > frame.getBoundingClientRect().width * ZOOM_MIN);
  }

  function setZoom(on) {
    zoomed = on;
    drag = null;
    view.classList.toggle("zoom--in", on);
    view.classList.remove("zoom--dragging");
    zoomButton.textContent = on ? "Fit" : "Zoom in";
    if (on) { frame.style.setProperty("--zoom-w", fullW + "px"); }
    stage.scrollTop = 0;
    stage.scrollLeft = on ? (stage.scrollWidth - stage.clientWidth) / 2 : 0;   // start in the middle, at the top
  }

  function step(by) {                                        // wraps around: last → first and first → last
    if (group.items.length < 2) { return; }
    index = (index + by + group.items.length) % group.items.length;
    render();
  }

  function open(g, i) {
    group = g; index = i; returnY = window.scrollY;
    render();
    document.documentElement.classList.add("zoom-open");     // stops the page behind from scrolling
    view.showModal();
    lastWidth = window.innerWidth;
    offerZoom();
    view.querySelector(".zoom__close").focus();
  }

  view.addEventListener("close", function () {               // runs for Close, Esc and the dark background
    setZoom(false);
    document.documentElement.classList.remove("zoom-open");
    if (!group) { return; }
    var opener = group.buttons[index];                        // return to the screen you were last looking at
    if (opener.offsetParent !== null) {
      window.scrollTo({ top: returnY, behavior: "instant" });
      opener.focus({ preventScroll: true });
    }
    group = null;
  });

  view.querySelector(".zoom__close").addEventListener("click", function () { view.close(); });
  view.querySelector(".zoom__prev").addEventListener("click", function () { step(-1); });
  view.querySelector(".zoom__next").addEventListener("click", function () { step(1); });

  // a click on the dark area around the screen also closes it
  view.addEventListener("click", function (e) {
    if (zoomed) { return; }                                  // while zoomed, a click or drag never closes
    if (e.target === view || /zoom__(layout|top|stage|bottom)\b/.test(e.target.className)) { view.close(); }
  });

  view.addEventListener("keydown", function (e) {            // Esc is handled by the browser
    if (e.altKey || e.ctrlKey || e.metaKey) { return; }
    if (zoomed) {                                            // arrow keys move around the zoomed picture
      var moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (moves.hasOwnProperty(e.key)) {
        e.preventDefault();
        stage.scrollLeft += moves[e.key][0] * PAN_STEP;
        stage.scrollTop += moves[e.key][1] * PAN_STEP;
      }
      return;
    }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  });

  zoomButton.addEventListener("click", function () {
    setZoom(!zoomed);
  });

  // mouse: drag to move a zoomed picture (fingers and trackpads scroll it the usual way)
  picture.draggable = false;
  stage.addEventListener("pointerdown", function (e) {
    if (!zoomed || e.pointerType !== "mouse" || e.button !== 0) { return; }
    e.preventDefault();
    drag = { x: e.clientX, y: e.clientY, left: stage.scrollLeft, top: stage.scrollTop };
    stage.setPointerCapture(e.pointerId);
    view.classList.add("zoom--dragging");
  });
  stage.addEventListener("pointermove", function (e) {
    if (!drag) { return; }
    stage.scrollLeft = drag.left - (e.clientX - drag.x);
    stage.scrollTop = drag.top - (e.clientY - drag.y);
  });
  function endDrag() { drag = null; view.classList.remove("zoom--dragging"); }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  window.addEventListener("resize", function () {            // window resized or phone turned: fit again
    if (!view.open || window.innerWidth === lastWidth) { return; }
    lastWidth = window.innerWidth;
    setZoom(false);
    offerZoom();
  });

  window.addEventListener("hashchange", function () { if (view.open) { view.close(); } });  // e.g. the browser's Back button changes tabs

  /* ---------- Figures: put an invisible button over the picture (or over each screen in it) ---------- */
  function makeButton(button, g, i, name) {
    button.type = "button";
    button.setAttribute("aria-label", "Enlarge: " + name);
    button.setAttribute("aria-haspopup", "dialog");
    button.addEventListener("click", function () { open(g, i); });
    g.buttons.push(button);
  }

  function overlay(figure, left, width) {                    // left and width are percentages of the figure
    var button = document.createElement("button");
    button.className = "zoom-hit";
    button.style.left = left + "%";
    button.style.width = width + "%";
    figure.appendChild(button);
    return button;
  }

  // 1) one picture holding several screens
  figures.forEach(function (figure) {
    var img = figure.querySelector("img");
    if (!img) { return; }                                     // picture is missing
    var names = figure.getAttribute("data-screens").split("|");
    var full = (figure.getAttribute("data-screens-size") || SANTI_SIZE).split("x");
    var fileW = +full[0], fileH = +full[1];
    var canZoom = figure.hasAttribute("data-zoom-in");
    var g = { items: [], buttons: [] };
    (figure.getAttribute("data-screens-slices") || SANTI_SLICES).split("|").forEach(function (text, i) {
      var left = +text.split(",")[0], width = +text.split(",")[1];
      g.items.push({
        src: img.getAttribute("src"), name: names[i],
        size: function () {
          return { ratio: width / fileH, maxW: canZoom ? width : MAX_W,
                   sliceWidth: fileW / width * 100, sliceLeft: -left / width * 100,
                   fullW: canZoom ? width : 0 };
        }
      });
      makeButton(overlay(figure, left / fileW * 100, width / fileW * 100), g, i, names[i]);
    });
  });

  // 2) case-study pictures: they open as large as the window allows, up to the file's own width
  var studySets = {};
  studies.forEach(function (figure) {
    if (!figure.querySelector("img")) { return; }             // picture is missing
    var key = figure.getAttribute("data-zoom-group");
    if (!studySets[key]) { studySets[key] = []; }
    studySets[key].push(figure);
  });
  Object.keys(studySets).forEach(function (key) {
    var list = studySets[key];
    var g = { items: [], buttons: [] };
    list.forEach(function (figure, i) {
      var img = figure.querySelector("img");
      var name = img.alt;
      var caption = figure.parentNode.tagName === "FIGURE" && figure.parentNode.querySelector("figcaption");
      var text = caption ? caption.textContent.trim() : "";
      g.items.push({
        src: img.getAttribute("src"), name: name, label: text,
        size: function () {
          var w = img.naturalWidth || +img.getAttribute("width") || MAX_W;   // not loaded yet: use the HTML size
          var h = img.naturalHeight || +img.getAttribute("height") || MAX_W;
          return { ratio: w / h, maxW: w, sliceWidth: 100, sliceLeft: 0, fullW: w };
        }
      });
      var spoken = (text ? text + ": " : "") + name + (list.length > 1 ? ", " + (i + 1) + " of " + list.length : "");
      makeButton(overlay(figure, 0, 100), g, i, spoken);
    });
  });

  /* ---------- Whole pictures: wrap each one in a button ---------- */
  var sets = {};
  singles.forEach(function (img) {
    var key = img.getAttribute("data-enlarge");
    if (!sets[key]) { sets[key] = []; }
    sets[key].push(img);
  });
  Object.keys(sets).forEach(function (key) {
    var g = { items: [], buttons: [] };
    sets[key].forEach(function (img, i) {
      var name = (img.getAttribute("data-zoom-name") || img.alt) + " " + (i + 1) + " of " + sets[key].length;
      var own = (img.getAttribute("data-zoom-size") || "").split("x");   // size of the data-zoom file
      g.items.push({
        src: img.getAttribute("data-zoom") || img.getAttribute("src"), name: name,
        size: function () {
          var w = +own[0] || img.naturalWidth || +img.getAttribute("width");
          var h = +own[1] || img.naturalHeight || +img.getAttribute("height");
          // never wider than the file itself, so it stays sharp; bigger files grow automatically
          return { ratio: w / h, maxW: Math.min(w, MAX_W), sliceWidth: 100, sliceLeft: 0 };
        }
      });
      var button = document.createElement("button");
      button.className = "zoom-thumb";
      makeButton(button, g, i, name);
      img.parentNode.insertBefore(button, img);
      button.appendChild(img);
    });
  });
})();
