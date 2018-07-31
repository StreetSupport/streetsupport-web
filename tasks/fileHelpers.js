import util from 'gulp-util'

export function newFile (name, contents) {
  var readableStream = require('stream').Readable({ objectMode: true })
  readableStream._read = function () {
    this.push(new util.File({ cwd: '', base: '', path: name, contents: new Buffer(contents) }))
    this.push(null)
  }
  return readableStream
}