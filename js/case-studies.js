/* =====================================================
   case-studies.js — switches between the three tabs
   (LoanMatcha, SEL, Santi). Each tab has its own link:
   case-studies.html#loanmatcha  /  #sel  /  #santi
   ===================================================== */
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.cs-tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.cs-panel'));
  var titles = { loanmatcha: 'LoanMatcha', sel: 'SEL', santi: 'Santi' };
  var current = null;

  function show(name) {
    if (!titles[name]) { name = 'loanmatcha'; }   // unknown or empty link → first tab

    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-tab') === name;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.setAttribute('tabindex', on ? '0' : '-1');
    });
    var switched = current !== null && current !== name;   // false on first load
    panels.forEach(function (panel) {
      var on = panel.id === 'panel-' + name;
      if (switched) { panel.classList.toggle('is-entering', on); }   // starts the soft fade
      panel.hidden = !on;
    });

    document.title = titles[name] + ' — Case studies — Markuss Javier';
    if (switched) { window.scrollTo(0, 0); }   // new tab starts at the top
    current = name;
  }

  function fromHash() { show(window.location.hash.replace('#', '')); }

  /* Keyboard: Left and Right arrows switch tabs, Home and End jump to the
     first or last one, and Space or Enter opens the selected one */
  tabs.forEach(function (tab, i) {
    tab.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) { return; }   // leave browser shortcuts alone
      var next = null;
      if (e.key === 'ArrowRight') { next = (i + 1) % tabs.length; }
      else if (e.key === 'ArrowLeft') { next = (i - 1 + tabs.length) % tabs.length; }
      else if (e.key === 'Home') { next = 0; }
      else if (e.key === 'End') { next = tabs.length - 1; }
      else if (e.key === ' ') { next = i; }
      if (next === null) { return; }
      e.preventDefault();                       // stops the page from scrolling
      tabs[next].focus();
      window.location.hash = tabs[next].getAttribute('data-tab');
    });
  });

  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
