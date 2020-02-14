'use strict'

const fs = require('fs')

module.exports = readAndReverseFile

// returns the contents of the file at path, reversed
async function readAndReverseFile(path) {
  return fs.readFileSync(path, 'utf8').split('').reverse().join('')
}