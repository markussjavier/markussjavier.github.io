/* contact.js — makes the "Back" link return to the right place.
   Normally Back goes to the landing page. When you arrive from a case study
   (the link ends in ?from=loanmatcha, ?from=sel or ?from=santi) it goes back to that tab. */
(function () {
  "use strict";
  var back = document.getElementById("backLink");
  if (!back) return;
  var from = new URLSearchParams(window.location.search).get("from");
  var tabs = { loanmatcha: "case-studies.html#loanmatcha", sel: "case-studies.html#sel", santi: "case-studies.html#santi" };
  if (from && Object.prototype.hasOwnProperty.call(tabs, from)) back.setAttribute("href", tabs[from]);
})();
