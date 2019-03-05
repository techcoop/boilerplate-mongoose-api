'use strict'

const Lab = require('lab')
const lab = (exports.lab = Lab.script())
const expect = require('Code').expect
const { list } = require('./SchemaStatics')

lab.experiment('SchemaStatics', async () => {
  lab.test('list is a function', async () => {
    expect(typeof list).to.equal('function')
  })
})
