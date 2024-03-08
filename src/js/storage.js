/* global localStorage */

export const get = (key) => {
  const item = localStorage.getItem(key)
  return (item && item.includes('{'))
    ? JSON.parse(item)
    : item
}

const cleanForSave = (obj) => {
  return (typeof obj === 'string' || obj instanceof String)
    ? obj
    : JSON.stringify(obj)
}

export const set = (key, obj) => {
  localStorage.setItem(key, cleanForSave(obj))
}

export const keys = {
  userLocationState: 'userLocationState',
  postcode: 'postcode'
}
