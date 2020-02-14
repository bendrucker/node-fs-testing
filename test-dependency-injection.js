'use strict'

const test = require('tape')
const { Volume } = require('memfs')
const reverse = require('./injection')

test('dependency injection', async function (t) {
  const fs = Volume.fromJSON({ './foo': 'bar' })

  t.equal(await reverse(fs, './foo'), 'rab')

  t.end()
})
