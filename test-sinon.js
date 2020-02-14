'use strict'

const test = require('tape')
const fs = require('fs')
const sinon = require('sinon')
const reverse = require('./')

test('stubbing fs with sinon', async function (t) {
  const stub = sinon.stub(fs, 'readFileSync')
  stub.withArgs('./foo', 'utf8').returns('bar')

  t.equal(await reverse('./foo'), 'rab')

  stub.restore()
  t.end()
})
