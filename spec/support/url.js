export const parseQuery = (url) => {
  return url.split('?')[1].split('&')
    .reduce((acc, next) => {
      const [k, v] = next.split('=')
      acc[k] = v
      return acc
    }, {})
}
