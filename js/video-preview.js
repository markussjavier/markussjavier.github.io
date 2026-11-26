/* =====================================================
   video-preview.js — Video Edits (about.html)
   Point at a thumbnail (or select it with the Tab key) and six
   frames from the video play in turn. Moving away brings the
   thumbnail back. Clicking still opens Instagram.

   Frames: the thumbnail's data-preview="folder/name" means
   folder/name-1.webp to folder/name-6.webp.

   No preview on touch screens (a tap opens the video), or when
   the "reduce motion" setting is on.
   ===================================================== */
(function () {
  "use strict";

  var FRAMES = 6;        // frames per video
  var INTERVAL = 750;    // time each frame stays up, in milliseconds (750 = three quarters of a second; bigger = slower)

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  Array.prototype.forEach.call(document.querySelectorAll(".video-tile img[data-preview]"), function (thumb) {
    var tile = thumb.parentNode;
    var base = thumb.getAttribute("data-preview");
    var frames = null;       // only downloaded the first time this tile is previewed
    var hovering = false;    // mouse is over the tile
    var selected = false;    // tile is selected with the keyboard
    var timer = null;
    var current = -1;        // frame showing now (-1 = just the thumbnail)

    function load() {
      frames = [];
      for (var i = 1; i <= FRAMES; i++) {
        var img = document.createElement("img");
        img.className = "video-tile__frame";
        img.alt = "";
        img.setAttribute("aria-hidden", "true");
        img.addEventListener("load", firstFrame);
        img.src = base + "-" + i + ".webp";
        tile.appendChild(img);
        frames.push(img);
      }
    }

    function ready(i) { return frames[i].complete && frames[i].naturalWidth > 0; }

    function show(i) {
      if (current > -1) { frames[current].classList.remove("is-showing"); }
      current = i;
      if (i > -1) { frames[i].classList.add("is-showing"); }
    }

    function firstFrame() {                      // show frame 1 as soon as it has arrived
      if (timer && current === -1 && ready(0)) {
        show(0);
        clearInterval(timer);                    // restart the clock so frame 1 gets its full half second
        timer = setInterval(next, INTERVAL);
      }
    }

    function next() {
      if (current === -1) { if (ready(0)) { show(0); } return; }
      var i = (current + 1) % FRAMES;
      if (ready(i)) { show(i); }                 // still downloading: keep the last frame up a little longer
    }

    function update() {                          // start or stop, depending on mouse, keyboard and settings
      var play = (hovering || selected) && !calm.matches && !document.hidden;
      if (play && !timer) {
        if (!frames) { load(); }
        timer = setInterval(next, INTERVAL);
        firstFrame();
      } else if (!play && timer) {
        clearInterval(timer);
        timer = null;
        show(-1);                                // back to the thumbnail; next time starts at frame 1
      }
    }

    function mouse(e) {
      if (e.pointerType !== "mouse") { return; }  // fingers scroll and tap as usual
      hovering = true;
      update();
    }
    tile.addEventListener("pointerenter", mouse);
    tile.addEventListener("pointermove", mouse);
    tile.addEventListener("pointerleave", function () { hovering = false; update(); });
    tile.addEventListener("focus", function () {
      var keyboard = true;
      try { keyboard = tile.matches(":focus-visible"); } catch (err) { /* older browser */ }
      selected = keyboard;
      update();
    });
    tile.addEventListener("blur", function () { selected = false; update(); });
    document.addEventListener("visibilitychange", function () {   // e.g. after the video opens in a new tab
      if (document.hidden) { hovering = false; }
      update();
    });
    if (calm.addEventListener) { calm.addEventListener("change", update); }
  });
})();
