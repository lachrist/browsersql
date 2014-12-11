
var Searcher = require("./searcher.js")

module.exports = function (sql, schema, viewers, foreign) {
  if (!foreign) {
    var input = document.createElement("input")
    input.type = "number"
    input.min = 0
    return input
  }
  var viewer = viewers[foreign] || function (id) { var span = document.createElement("span"); span.textContent=id; return span; }
  var span = document.createElement("span")
  var button = document.createElement("button")
  button.onclick = expand
  button.textContent = "Search"
  // value
  var id
  function get_value () { return id }
  function set_value (v) {
    id = v
    while (span.firstChild) { span.firstChild.remove() }
    span.appendChild(viewer(id))
    span.appendChild(button)
    if (searcher) { span.appendChild(searcher) }
    return v
  }
  Object.defineProperty(span, "$value", {get:get_value,set:set_value})
  // disabled
  Object.defineProperty(span, "$disabled", {
    get: function () { return button.disabled },
    set: function (v) {
      if (v&&searcher) { collapse() }
      return button.disabled = v
    }
  })
  // searcher
  var searcher = null
  function expand () {
    searcher = Searcher(sql, schema, viewers, foreign, function (id) {
      set_value(id)
      collapse()
      if (span.$onchange) { span.$onchange() }
    })
    button.onclick = collapse
    span.appendChild(searcher)
  }
  function collapse () {
    searcher = null
    button.onclick = expand
    searcher.remove()
  }
  // return
  set_value(null)
  return span
}
