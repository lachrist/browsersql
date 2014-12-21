
var Util = require("./util.js")
var Feedback = require("./feedback.js")
var Field = require("./field.js")
var Label = require("./label.js")

function search_query (db, tb, fs, ss) {
  var query = "SELECT id FROM "+Util.backquote(db)+"."+Util.backquote(tb)+" WHERE TRUE"
  for (var column in fs) {
    if (ss[column].value !== "") {
      query = query +" && "+ Util.backquote(column)+ss[column].value+Util.quote(fs[column].$value)
    }
  }
  return query
}

module.exports = function (global, table, onsearch) {
  var ids = []
  // searcher
  var searcher = document.createElement("div")
  searcher.className = "browsersql searcher"
  if (!global.schema[table]) {
    var feedback = Feedback()
    feedback.$fail("No such table: "+table)
    searcher.appendChild(feedback)
    return searcher
  }
  // fields & selects
  var fields, selects
  (function () {
    fields = {}
    selects = {}
    for (var column in global.schema[table]) {
      var description = global.schema[table][column]
      if (column === "id") { description = {type:"integer", min:0, max:Number.MAX_VALUE} } // you dont want to search for an id within a searcher
      fields[column] = Field(global, description)
      selects[column] = document.createElement("select")
      var opts
      if (["integer", "float", "decimal"].indexOf(description.type) !== -1) { opts = ["=", "!=", "<", "<=", ">", ">="] }
      else if (description.type === "text") { opts = ["=", "!=", "LIKE", "NOT LIKE", "REGEXP", "NOT REGEXP", "<", "<=", ">", ">="] }
      else { opts = ["=", "!="] } // boolean & enum & identifier
      var option = document.createElement("option")
      option.value = ""
      option.textContent = ""
      option.selected = true
      selects[column].appendChild(option)
      opts.forEach(function (opt) {
        var option = document.createElement("option")
        option.textContent = opt
        option.value = opt
        selects[column].appendChild(option)
      })
      var div = document.createElement("div")
      div.appendChild(Label(column))
      div.appendChild(selects[column])
      div.appendChild(fields[column])
      searcher.appendChild(div)
    }
  } ());
  // search-button
  (function () {
    var button = document.createElement("button")
    button.textContent = "Search"
    button.onclick = function () {
      button.disabled = true
      for (var col in fields) { (fields[col].$disabled=true, selects[col].disabled=true) }
      feedback.$free()
      ids = []
      navigate(1)
      global.sql(search_query(global.database, table, fields, selects), cont)
    }
    function cont (err, results) {
      button.disabled = false
      for (var col in fields) { (fields[col].$disabled=false, selects[col].disabled=false) }
      if (err) { return feedback.$sqlf(err) }
      feedback.$succ("Hits: "+results[0].length)
      ids = results[0].map(function (row) { return row[0] })
      navigate(1)
    }
    searcher.appendChild(button)
  } ());
  // feedback
  var feedback = Feedback()
  searcher.appendChild(feedback)
  // page-input & navigate
  var navigate
  (function () {
    var input = document.createElement("input")
    input.type = "number"
    input.disabled = true
    input.min = 1
    input.value = 1
    input.onchange = function () {
      var x = Number(page_input.value)
      if (isNaN(x)) { x=1 }
      navigate(x)
    }
    navigate = function (page) {
      input.value = page
      while (ol.firstChild) { ol.removeChild(ol.firstChild) }
      ids.slice((page-1)*10, (page-1)*10+10).forEach(function (id) {
        var li = document.createElement("li")
        li.appendChild(global.viewers[table](id))
        if (onsearch) { li.onclick = function () { onsearch(id) } }
        ol.appendChild(li)
      })
    }
    var div = document.createElement("div")
    div.appendChild(Label("Page:"))
    div.appendChild(input)
    searcher.appendChild(div)
  } ());
  // list
  var ol = document.createElement("ol")
  searcher.appendChild(ol)
  return searcher
}
