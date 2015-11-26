// .js-nav-push
// .js-nav-container
// .is-active

exports.open = function() {
  console.log('nav open');
  $('.js-nav-container').addClass('is-active');
  $('.js-nav-push').addClass('is-active');
};

exports.close = function() {
  console.log('nav close');
  $('.js-nav-container').removeClass('is-active');
  $('.js-nav-push').removeClass('is-active');
};
