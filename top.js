
var Console = require("./console.js")
var Login = require("./login.js")
var Searcher = require("./searcher.js")
var Selector = require("./selector.js")
var Setter = require("./setter.js")

module.exports = function (sql, viewers) {
  var schema = {}
  viewers = viewers || {}
  return {
    console: function () { return Console(sql) },
    login: login,
    searcher: function (table, onclick) { return Searcher(sql, schema, viewers, table) },
    selector:
    setter: function (table, column) { return Setter(sql, schema, viewers, table, column) } 
  }
}
