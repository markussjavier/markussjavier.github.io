/* =====================================================
   print-zoom.js — Prints (about.html), mouse only
   Point at a framed print and the artwork fills the picture box,
   zoomed in, and follows the mouse. Moving away brings the frame back.
   On phones, tapping opens the full artwork instead (js/enlarge.js).
   Needs js/enlarge.js to run first.
   ===================================================== */
(function () {
  "use strict";

  var ZOOM = 2;       // artwork width compared with the picture box (2 = twice as wide). Also set in about.css
  var EDGE = 0.1;     // you reach the artwork's edge slightly before the mouse reaches the box's edge

  function along(position, length) {             // mouse position → 0 (start) to 1 (end)
    return Math.min(1, Math.max(0, (position / length - EDGE) / (1 - 2 * EDGE)));
  }

  Array.prototype.forEach.call(document.querySelectorAll(".zoom-thumb img[data-zoom]"), function (thumb) {
    var box = thumb.parentNode;                  // the button around the framed photo
    var size = thumb.getAttribute("data-zoom-size").split("x");
    var art = null;                              // the big artwork: only downloaded when first needed
    var hovering = false;
    box.classList.add("zoom-thumb--pan");

    function show() {
      if (art && hovering && art.complete && art.naturalWidth) { box.classList.add("is-panning"); }
    }
    function hide() {
      hovering = false;
      box.classList.remove("is-panning");
    }
    function move(e) {
      if (e.pointerType !== "mouse") { return; }  // fingers scroll and tap as usual
      hovering = true;
      if (!art) {
        art = document.createElement("img");
        art.className = "pan";
        art.alt = "";
        art.setAttribute("aria-hidden", "true");
        art.width = +size[0];
        art.height = +size[1];
        art.addEventListener("load", show);
        art.addEventListener("error", function () { art.remove(); art = null; });  // keep the framed photo; try again next time
        art.src = thumb.getAttribute("data-zoom");
        box.appendChild(art);
      }
      var r = box.getBoundingClientRect();
      var w = r.width * ZOOM, h = w * size[1] / size[0];
      var x = -(w - r.width) * along(e.clientX - r.left, r.width);
      var y = -(h - r.height) * along(e.clientY - r.top, r.height);
      art.style.transform = "translate(" + x + "px," + y + "px)";
      show();
    }

    box.addEventListener("pointerenter", move);
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerleave", hide);
    box.addEventListener("pointercancel", hide);
    box.addEventListener("click", hide);          // the full-screen view is opening
  });
})();
