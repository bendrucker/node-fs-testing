'use strict'

const test = require('tape-promise/tape')
const fs = require('fs')
const reverse = require('./')

test('mutating fs', async function (t) {
  const readFileSync = fs.readFileSync
  fs.readFileSync = function mockReadFileSync (path, enc) {
    t.equal(path, './foo')
    t.equal(enc, 'utf8')
    return 'bar'
  }

  t.equal(await reverse('./foo'), 'rab')

  fs.readFileSync = readFileSync
  t.end()
})
