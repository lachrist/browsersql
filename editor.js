
var Selector = require("./selector.js")
var Setter = require("./setter.js")

module.exports = function (global, table, oninsert) {

  function select (id) {
    div.$id = id
    while (setters.firstChild) { setters.removeChild(setters.firstChild) }
    if (id===0) { return }
    for (var column in global.schema[table]) {
      if (column !== "id") {
        setters.appendChild(Setter(global, table, id, column))
      }
    }
  }

  var setters = document.createElement("div")

  var div = document.createElement("div")
  div.$id = 0
  div.className = "browsersql editor"
  div.appendChild(setters)
  div.appendChild(Selector(global, table, select, oninsert))

  return div

}
