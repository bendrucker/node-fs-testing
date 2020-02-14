'use strict'

module.exports = readAndReverseFile

// returns the contents of the file at path, reversed
async function readAndReverseFile(fs, path) {
  return fs.readFileSync(path, 'utf8').split('').reverse().join('')
}