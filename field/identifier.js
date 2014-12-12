
var Searcher

// viewer, search-button, searcher
module.exports = function (global, table) {
  if (!Searcher) { return Searcher = global } // manual resolution cyclic dependency: searcher - field.identifier
  var id = 0
  var viewer = global.viewers[table](0)
  var span = document.createElement("span")
  // button
  var button = document.createElement("button")
  button.textContent="Search"
  button.onclick=expand
  function expand () {
    // cannot prebuild searcher (needs to be created onclick)
    // otherwise cyclic foreign keys will cause the program to cycle as well 
    searcher = Searcher(global, table, function (id) {
      set(id)
      collapse()
      if (span.$onchange) { span.$onchange() }
    })
    span.appendChild(searcher)
    button.textContent="Hide"
    button.onclick=collapse
  }
  function collapse () {
    button.textContent="Search"
    button.onclick=expand
    span.removeChild(searcher)
    searcher = null
  }
  // searcher
  var searcher = null
  // $value
  function set (v) {
    id = v
    span.removeChild(viewer)
    viewer = global.viewers[table](id)
    span.insertBefore(viewer, button)
    return id
  }
  Object.defineProperty(span, "$value", {get:function () { return id }, set:set})
  // $disabled
  Object.defineProperty(span, "$disabled", {
    get: function () { return button.disabled },
    set: function (v) {
      if (v&&searcher) { collapse() }
      return button.disabled = v
    }
  })
  // initialize
  span.appendChild(viewer)
  span.appendChild(button)
  return span
}
