/* landing.js — small interactions for the landing page */
(function () {
  "use strict";

  /* 1) Logo row: copy the logos once so the loop never shows a gap */
  var logos = document.querySelector(".logos");
  if (logos) {
    var track = logos.querySelector(".logos__track");
    var set = track.querySelector(".logos__set");
    var copy = set.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.querySelectorAll("img").forEach(function (img) { img.alt = ""; });
    track.appendChild(copy);
    logos.classList.add("is-ready");
  }

  /* 2) Reduced motion: if the still logo row is cut off, let the keyboard select it
        (then the Left and Right arrow keys scroll it) */
  if (logos) {
    var stillRow = window.matchMedia("(prefers-reduced-motion: reduce)");
    var updateLogos = function () {
      if (stillRow.matches && logos.scrollWidth > logos.clientWidth + 1) {
        logos.setAttribute("tabindex", "0");
        logos.setAttribute("role", "group");
        logos.setAttribute("aria-label", "Company logos, scrolls sideways");
      } else {
        logos.removeAttribute("tabindex");
        logos.removeAttribute("role");
        logos.removeAttribute("aria-label");
        logos.scrollLeft = 0;
      }
    };
    window.addEventListener("resize", updateLogos);
    window.addEventListener("load", updateLogos);
    if (stillRow.addEventListener) { stillRow.addEventListener("change", updateLogos); }
    updateLogos();
  }

  /* 3) Hero magnifier: a round lens that follows the mouse */
  var wrap = document.querySelector(".hero-logo");
  var lens = wrap && wrap.querySelector(".lens");
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (wrap && lens && canHover) {
    var ZOOM = 1.6;         // how much the lens enlarges the drawing
    var SIZE = 160;         // lens diameter in pixels (also set in landing.css)
    wrap.addEventListener("pointermove", function (e) {
      var r = wrap.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      lens.style.transform = "translate(" + (x - SIZE / 2) + "px," + (y - SIZE / 2) + "px)";
      lens.style.backgroundSize = (r.width * ZOOM) + "px " + (r.height * ZOOM) + "px";
      lens.style.backgroundPosition = (SIZE / 2 - x * ZOOM) + "px " + (SIZE / 2 - y * ZOOM) + "px";
      wrap.classList.add("is-hovering");
    });
    wrap.addEventListener("pointerleave", function () { wrap.classList.remove("is-hovering"); });
  }
})();
