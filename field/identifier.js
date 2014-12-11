
var Searcher = require("./searcher.js")

// viewer, search-button, searcher

module.exports = function (global, table) {
  var id = 0
  var viewer = global.viewers[table](0)
  var span = document.createElement("span")
  // button
  var button = document.createElement("button")
  function expand () {
    button.textContent="Hide"
    button.onclick=collapse
    searcher.hidden=false
    searcher.$refresh()
  }
  function collapse () {
    button.textContent="Search"
    button.onclick=expand
    searcher.hidden=true
  }
  // searcher
  var searcher = Searcher(global, table, function (id) {
    set(id)
    collapse()
    if (span.$onchange) { span.$onchange() }
  })
  // $value
  function set (v) {
    id = v
    span.removeChild(viewer)
    viewer = global.viewers[table](id)
    span.insertBefore(viewer, button)
    return id
  }
  Object.defineProperty(span, "$value", {get:function () { return id }, set:set_value})
  // $disabled
  Object.defineProperty(span, "$disabled", {
    get: function () { return button.disabled },
    set: function (v) {
      if (v&&!searcher.hidden) { collapse() }
      return button.disabled = v
    }
  })
  // initialize
  collapse()
  span.appendChild(viewer)
  span.appendChild(button)
  span.appendChild(searcher)
  return span
}
