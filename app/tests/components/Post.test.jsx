let React = require('react')
let ReactDOM = require('react-dom')
let TestUtils = require('react-dom/test-utils')
let expect = require('expect')
let $ = require('jquery')

let {Post} = require('Post')

describe('Post', () => {
  it('should exist', () => {
    expect(Post).toExist()
  })

})