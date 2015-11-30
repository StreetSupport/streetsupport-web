var openElement = '.js-nav-open';
var closeElement = '.js-nav-close';
var overlayElement = '.js-nav-overlay';
var activeClass = 'is-active';
var el = document.querySelectorAll('.js-nav-container, .js-nav-push, .js-nav-overlay, html, body');

var open = function () {
  document.querySelector(openElement).addEventListener('click', function(e) {
    for (i = 0; i < el.length; ++i) {
      el[i].classList.add(activeClass);
    }
  });
};

var close = function () {
  document.querySelector(closeElement).addEventListener('click', function(e) {
    for (i = 0; i < el.length; ++i) {
      el[i].classList.remove(activeClass);
    }
  });

  document.querySelector(overlayElement).addEventListener('click', function(e) {
    for (i = 0; i < el.length; ++i) {
      el[i].classList.remove(activeClass);
    }
  });
};

module.exports = {
  open: open,
  close: close
};
