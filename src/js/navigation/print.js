const init = () => {
  const button = document.querySelector('.js-print-btn')

  if (button) {
    button.addEventListener('click', function (e) {
      e.preventDefault()
      window.print()
    })
  }
}

module.exports = {
  init: init
}
