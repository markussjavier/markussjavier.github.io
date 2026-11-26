/* touch.js — used by every page.
   iPhones only show pressed styles (while a finger is down) if the page
   "listens" for touches. This empty listener switches that on. */
document.addEventListener("touchstart", function () {}, { passive: true });
