const ranges = [
  { name: '1k', key: 1000, zoom: 14 },
  { name: '2k', key: 2000, zoom: 14 },
  { name: '5k', key: 5000, zoom: 13 },
  { name: '10k', key: 10000, zoom: 11 },
  { name: '20k', key: 20000, zoom: 10 }
]

const defaultRange = 10000

const getByRange = function (range) {
  return ranges.find((pr) => pr.key === parseInt(range)).zoom || 10
}

module.exports = {
  ranges,
  getByRange,
  defaultRange
}
