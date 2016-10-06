let init = () => {
  window.addEventListener('scroll', (e) => {
    let doc = document.documentElement
    let top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
    let header = document.querySelector('.header')
    const smallStickyClass = 'header--small'
    if (top >= 200) {
      header.classList.add(smallStickyClass)
    } else {
      header.classList.remove(smallStickyClass)
    }
  })
}

module.exports = {
  init: init
}
