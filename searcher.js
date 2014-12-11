
var Schema = require("./schema.js")
var Feedback = require("./feedback.js")

module.exports = function (sql, schema, viewers, table, onsearch) {
  var top = document.createElement("div")
  top.class = "browsersql searcher"
  Schema(sql, schema, table, function (err) {
    var feedback = Feedback()
    if (err) {
      feedback.$fail("SQL error: "+err)
      return top.appendChild(feedback)
    }
    var ids = []
    var fields = {}
    var selects = {}
    var ol = document.createElement("ol")
    var page = page_input(ids, ol, viewers[table] || default_viewer, onsearch)
    search_fields(schema[table], fields, selects).forEach(function (label) { top.appendChild(label) })
    top.appendChild(search_button(ids, fields, selects, feedback, page.$navigate))
    top.appendChild(feedback)
    top.appendChild(page_input)
    top.appendChild(ol)
  })
  return top
}

function default_viewer (id) {
  var span = document.createElement("span")
  span.textContent = id
  return span
}

function search_fields (sql, schema, viewers, table_schema, fields, selects) {
  var labels = []
  for (var column in table_schema) { 
    fields[column] = Field(sql, schema, viewers, table_schema[column])
    selects[column] = document.createElement("select")
    var opts
    if (["integer", "float", "decimal"].indexOf(table_schema[column].type) !== -1) { opts = ["=", "!=", "<", "<=", ">", ">="] }
    else if (table_schema[column].type === "text") { opts = ["=", "!=", "LIKE", "NOT LIKE", "REGEXP", "NOT REGEXP", "<", "<=", ">", ">="] }
    else { opts = ["=", "!="] } // boolean & enum & identifier
    var option = document.createElement("option")
    option.value = null
    option.selected = true
    selects[column].appendChild(option)
    opts.forEach(function (opt) {
      var option = document.createElement("option")
      option.textContent = opt
      option.value = opt
      selects[column].appendChild(option)
    })
    var label = document.createElement("label")
    label.appendChild(document.createTextNode(column))
    label.appendChild(selects[column])
    label.appendChild(fields[column])
    labels.push(label)
  }
  return labels
}

function search_button (ids, fields, selects, feedback, navigate) {
  var button = document.createElement("button")
  button.textContent = "Search"
  function cont (err, tables) {
    button.disabled = false
    page_input.disabled = false
    for (var col in fields) {
      fields[col].$disabled = true
      selects[col].disabled = true
    }
    if (err) { return feedback.$fail("SQL error: "+err) }
    feedback.$succ("Hits: "+tables[0].length)
    while (ids.length>0) { ids.pop() }
    tables[0].forEach(function (row) { ids.push(row[0]) })
    navigate(1)
  }
  button.onclick = function () {
    button.disabled = true
    page_input.disabled = true
    while (ol.firstChild) { ol.firstChild.remove() }
    feedback.$free()
    var query = "SELECT id FROM " + Util.backquote(table) + " WHERE TRUE"
    for (var col in fields) {
      fields[col].$disabled = true
      selects[col].disabled = true
      if (selects[col].value !== "") {
        query = query +" && "+ Util.backquote(col)+selects[col].value+Util.quote(fields[col].$value)
      }
    }
    sql(query, cont)
  }
  return button
}

function page_input (ids, ol, viewer, onsearch) {
  var input = document.createElement("input")
  input.type = "number"
  input.disabled = true
  input.min = 1
  input.onchange = function () {
    var x = Number(page_input.value)
    if (isNaN(x)) { x=1 }
    navigate(x)
  }
  function navigate (page) {
    input.value = page
    while (ol.firstChild) { ol.firstChild.remove() }
    ids.slice((page-1)*10, (page-1)*10+10).forEach(function (id) {
      var li = document.createElement("li")
      li.appendChild(viewer(id))
      if (onsearch) { li.onclick = function () { onsearch(id) } }
      ol.appendChild(li)
    })
  }
  var label = document.createElement("label")
  label.textContent = "Page:"
  label.append(input)
  label.$navigate = navigate
  return label
}
