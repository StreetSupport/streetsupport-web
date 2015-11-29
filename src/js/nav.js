// .js-nav-push
// .js-nav-container
// .js-nav-overlay
// .is-active

exports.open = function() {
  $('.js-nav-container, .js-nav-push, .js-nav-overlay, html, body').addClass('is-active');
};

exports.close = function() {
  $('.js-nav-container, .js-nav-push, .js-nav-overlay, html, body').removeClass('is-active');
};
