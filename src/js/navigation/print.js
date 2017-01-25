const init = () => {
  const button = document.querySelector('.js-print-btn')

  if (button) {
    button.addEventListener('click', function () {
      console.log('print')
      window.print()
    })
  }
}

module.exports = {
  init: init
}
