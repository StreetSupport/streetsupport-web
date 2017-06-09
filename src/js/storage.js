/* global localStorage */

export const get = (key) => {
  return localStorage.getItem(key)
}

export const set = (key, obj) => {
  localStorage.setItem(key, obj)
}