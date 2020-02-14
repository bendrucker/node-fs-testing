'use strict'

const test = require('tape')
const { Volume } = require('memfs')
const proxyquire = require('proxyquire').noCallThru()

test('replacing fs with proxyquire', async function (t) {
  const reverse = proxyquire('./', {
    fs: Volume.fromJSON({ './foo': 'bar' })
  })

  t.equal(await reverse('./foo'), 'rab')

  t.end()
})
