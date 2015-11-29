// .js-nav-push
// .js-nav-container
// .js-nav-overlay
// .is-active

exports.open = function() {
  console.log('nav open');
  $('.js-nav-container').addClass('is-active');
  $('.js-nav-push').addClass('is-active');
  $('.js-nav-overlay').addClass('is-active');
};

exports.close = function() {
  console.log('nav close');
  $('.js-nav-container').removeClass('is-active');
  $('.js-nav-push').removeClass('is-active');
  $('.js-nav-overlay').removeClass('is-active');    
};
