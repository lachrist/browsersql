
var Console = require("./console.js")
var Login = require("./login.js")
var Searcher = require("./searcher.js")
var Selector = require("./selector.js")
var Setter = require("./setter.js")
var Schema = require("./schema.js")
var Editor = require("./editor.js")

// Manual cyclic resolution: searcher <-> field.identifier
require("./field/identifier.js")(Searcher)

exports.login = Login
exports.console = Console
exports.kit = function (sql, database, viewers, k) {
  if (!k) { (k=viewers,viewers={}) }
  Schema(sql, database, function (error, schema) {
    if (error) { return k(error) }
    var default_viewer = function (id) { var span = document.createElement("span"); span.textContent=id; return span; }
    for (var table in schema) { if (!viewers[table]) { viewers[table]=default_viewer } }
    var global = { sql:sql, database:database, schema:schema, viewers:viewers }
    k(null, {
      searcher: function (table, onclick) { return Searcher(global, table, onclick) },
      selector: function (table, onselect, oninsert) { return Selector(global, table, onselect, oninsert) },
      setter: function (table, identifier, column) { return Setter(global, table, identifier, column) },
      editor: function (table, oninsert) { return Editor(global, table, oninsert) }
    })
  })
}
