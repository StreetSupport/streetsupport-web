export const newElement = (tagName, innerHTML, attrs) => {
  const elem = document.createElement(tagName)
  Object.keys(attrs)
    .forEach((k) => {
      elem.setAttribute(k, attrs[k])
    })
  elem.innerHTML = innerHTML
  return elem
}
