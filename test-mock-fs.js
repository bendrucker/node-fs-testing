'use strict'

const test = require('tape-promise/tape')

// has to load before module under test
const mockFs = require('mock-fs')
const reverse = require('./')

test('globally faking with mock-fs', async function (t) {
  mockFs({'./foo': 'bar'})

  t.equal(await reverse('./foo'), 'rab')

  mockFs.restore()
  t.end()
})
