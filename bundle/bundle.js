(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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
  Schema(sql, database, function (error, schema) {
    if (error) { return k(error) }
    if (!viewers) { viewers = {} }
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

},{"./console.js":3,"./editor.js":4,"./field/identifier.js":10,"./login.js":13,"./schema.js":14,"./searcher.js":15,"./selector.js":16,"./setter.js":17}],2:[function(require,module,exports){
window.browsersql = require("../browsersql.js")
},{"../browsersql.js":1}],3:[function(require,module,exports){

var Feedback = require("./feedback.js")

module.exports = function (sql) {
  var textarea = document.createElement("textarea")
  var button = document.createElement("button")
  button.textContent = "Run"
  button.onclick = function () {
    textarea.disabled = true
    button.disabled = true
    feedback.$free()
    while(ol.firstChild) { ol.firstChild.remove() }
    sql(textarea.value, function (err, results) {
      textarea.disabled = false
      button.disabled = false
      err?feedback.$sqlf(err):feedback.$succ("Query successful")
      for (var i=0; i<results.length; i++) {
        var table = document.createElement("table")
        var li = document.createElement("li")
        li.appendChild(table)
        ol.appendChild(li)
        for (var j=0; j<results[i].length; j++) {
          var tr = document.createElement("tr")
          table.appendChild(tr)
          for (var k=0; k<results[i][j].length; k++) {
            var td = document.createElement("td")
            td.innerText = results[i][j][k]
            tr.appendChild(td)
          }
        }
      }
    })
  }
  var feedback = Feedback()
  var ol = document.createElement("ol")
  var top = document.createElement("div")
  top.class = "browsersql console"
  top.appendChild(textarea)
  top.appendChild(button)
  top.appendChild(feedback)
  top.appendChild(ol)
  return top
}


},{"./feedback.js":5}],4:[function(require,module,exports){

var Selector = require("./selector.js")
var Setter = require("./setter.js")

module.exports = function (global, table, oninsert) {

  function select (id) {
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
  div.class = "browsersql editor"  
  div.appendChild(setters)
  div.appendChild(Selector(global, table, select, oninsert))

  return div

}

},{"./selector.js":16,"./setter.js":17}],5:[function(require,module,exports){

module.exports = function () {
  var span = document.createElement("span")
  span.class = "browsersql feedback"
  span.$free = function () {
    span.class = "browsersql feedback"
    span.textContent = ""
  }
  span.$succ = function (msg) {
    span.class = "browsersql feedback success"
    span.textContent = msg
  }
  span.$fail = function (err) {
    span.class = "browsersql feedback failure"
    span.textContent = err
  }
  span.$sqlf = function (err) {
    span.class = "browsersql feedback failure"
    span.textContent = "SQL error: "+err
  }
  return span
}

},{}],6:[function(require,module,exports){

var Boolean = require("./field/boolean.js")
var Enumeration = require("./field/enumeration.js")
var Float = require("./field/float.js")
var Identifier = require("./field/identifier.js")
var Integer = require("./field/integer.js")
var Text = require("./field/text.js")

module.exports = function (global, descriptor) {
  var field
  if (descriptor.type === "identifier") { field = Identifier(global, descriptor.table) }
  else if (descriptor.type === "integer") { field = Integer(descriptor.min, descriptor.max) }
  else if (descriptor.type === "enumeration") { field = Enumeration(descriptor.options) }
  else if (descriptor.type === "boolean") { field = Boolean() }
  else if (descriptor.type === "float") { field = Float(descriptor.unsigned) }
  else if (descriptor.type === "text") { field = Text(descriptor.maxlength) }
  else { field = Text() }
  if (!descriptor.nullable) { return field }
  var checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  var span = document.createElement("span")
  Object.defineProperty(span, "$value", {
    get: function () { return checkbox.checked?null:field.$value },
    set: function (v) {
      checkbox.checked = v===null
      field.hidden = v===null
      if (v!==null) { field.$value=v }
      return v
    }
  })
  Object.defineProperty(span, "$disabled", {
    get: function () { return field.$disabled && checkbox.disabled },
    set: function (v) { return (field.$disabled=v, checkbox.disabled=v) }
  })
  field.$onchange = function () { checkbox.checked=false; if (span.$onchange) { span.$onchange() } }
  checkbox.onchange = function () {
    field.hidden = checkbox.checked
    if (span.$onchange) { span.$onchange() }
  }
  span.appendChild(checkbox)
  span.appendChild(document.createTextNode("(null)"))
  span.appendChild(field)
  return span
}

},{"./field/boolean.js":7,"./field/enumeration.js":8,"./field/float.js":9,"./field/identifier.js":10,"./field/integer.js":11,"./field/text.js":12}],7:[function(require,module,exports){

module.exports = function () {
  var input = document.createElement("input")
  input.type = "checkbox"
  Object.defineProperty(input, "$value", {
    get: function () { return input.checked?1:0 },
    set: function (val) { return input.checked = val===0?false:true }
  })
  Object.defineProperty(input, "$disabled", {
    get: function () { return input.disabled },
    set: function (v) { return input.disabled = v }
  })
  input.onchange = function () { if (input.$onchange) { input.$onchange() } }
  return input
}

},{}],8:[function(require,module,exports){

module.exports = function (values) {
  if (values.length===0) {
    var feedback = Feedback()
    feedback.$fail("No options given")
    return feedback
  }
  var input = document.createElement("select")
  for (var i=0; i<values.length; i++) {
    var option = document.createElement("option")
    option.textContent = values[i]
    option.selected = i===0
    option.value = values[i]
    input.appendChild(option)
  }
  Object.defineProperty(input, "$value", {
    get: function () { return input.value },
    set: function (v) { return input.value = v }
  })
  Object.defineProperty(input, "$disabled", {
    get: function () { return input.disabled },
    set: function (v) { return input.disabled = v }
  })
  input.onchange = function () { if (input.$onchange) { input.$onchange() } }
  return input
}

},{}],9:[function(require,module,exports){

module.exports = function (unsigned) {
  var input = document.createElement("input")
  input.type = "number"
  input.value = "0"
  Object.defineProperty(input, "$value", {
    get: function () { return Number(input.value) },
    set: function (v) { return input.value = String(v) }
  })
  Object.defineProperty(input, "$disabled", {
    get: function () { return input.disabled },
    set: function (v) { return input.disabled = v }
  })
  input.onchange = function () {
    var v = Number(input.value)
    if (isNaN(v)) { v=0 }
    if (unsigned && v<0) { v=0 }
    input.value = String(v)
    if (input.$onchange) { input.$onchange() }
  }
  return input
}


},{}],10:[function(require,module,exports){

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

},{}],11:[function(require,module,exports){
module.exports = function (min, max) {
  var input = document.createElement("input")
  input.type = "number"
  input.value = "0"
  Object.defineProperty(input, "$value", {
    get: function () { return Number(input.value) },
    set: function (v) { return input.value = String(v) }
  })
  Object.defineProperty(input, "$disabled", {
    get: function () { return input.disabled },
    set: function (v) { return input.disabled = v }
  })
  input.onchange = function () {
    var v = Math.round(Number(input.value))
    if (v===NaN) { v=0 }
    if (v<min) { v=min }
    if (v>max) { v=max }
    input.value = v
    if (input.$onchange) { input.$onchange() }
  }
  return input
}
},{}],12:[function(require,module,exports){

module.exports = function (maxlength) {
  var input = document.createElement("textarea")
  input.value = ""
  if (maxlength) { input.maxlength = maxlength }
  Object.defineProperty(input, "$value", {
    get: function () { return input.value },
    set: function (v) { return input.value = v }
  })
  Object.defineProperty(input, "$disabled", {
    get: function () { return input.disabled },
    set: function (v) { return input.disabled = v }
  })
  input.onchange = function () { if (input.$onchange) { input.$onchange() } }
  return input
}

},{}],13:[function(require,module,exports){

var Feedback = require("./feedback.js")

module.exports = function (onlogin) {
  var name = document.createElement("input")
  name.type = "text"
  name.placeholder = "Username"
  var password = document.createElement("input")
  password.type = "password"
  password.placeholder = "Password"
  var button = document.createElement("button")
  button.textContent = "Login"
  button.onclick = function () {
    feedback.$free()
    name.disabled = true
    password.disabled = true
    button.disabled = true
    onlogin(name.value, password.value, function (err) {
      password.value = ""
      name.disabled = false
      button.disabled = false
      err?feedback.$sqlf(err):feedback.$succ("Authentification successful")
    })
  }
  var feedback = Feedback()
  var div = document.createElement("div")
  div.class = "browsersql login"
  div.appendChild(name)
  div.appendChild(password)
  div.appendChild(button)
  div.appendChild(feedback)
  return div
}

},{"./feedback.js":5}],14:[function(require,module,exports){

var Util = require("./util.js")

// type :: integer || float || boolean || text || decimal || identifier || enum
// options :: [String]
// min :: Number
// max :: Number
// maxlength :: Natural
// precision :: Natural
// scale :: Natural
// nullable :: Boolean
// unsigned :: Boolean
// foreign  :: String

function parse (type) {
  // TODO warning when using too large number for JavaScript engine (e.g. bigint & longtext)
  var xs
  if (type === "tinyint(1)") { return {type:"boolean"} }
  // Signed integer
  if (/^tinyint(\([0-9]+\))$/.test(type)) { return {type:"integer", min:-128, max:127} }
  if (/^smallint(\([0-9]+\))$/.test(type)) { return {type:"integer", min:-32768, max:32767} }
  if (/^mediumint(\([0-9]+\))$/.test(type)) { return {type:"integer", min:-8388608, max:8388607} }
  if (/^int(\([0-9]+\))$/.test(type)) { return {type:"integer", min:-2147483648, max:2147483647} }
  if (/^bigint(\([0-9]+\))$/.test(type)) { return {type:"integer", min:-9223372036854775808, max:9223372036854775807} }   
  // Unsigned integer
  if (/^tinyint(\([0-9]+\)) unsigned$/.test(type)) { return {type:"integer", min:0, max:255} }
  if (/^smallint(\([0-9]+\)) unsigned$/.test(type)) { return {type:"integer", min:0, max:65535} }
  if (/^mediumint(\([0-9]+\)) unsigned$/.test(type)) { return {type:"integer", min:0, max:16777215} }
  if (/^int(\([0-9]+\)) unsigned$/.test(type)) { return {type:"integer", min:0, max:4294967295} }
  if (/^bigint(\([0-9]+\)) unsigned$/.test(type)) { return {type:"integer", min:0, max:18446744073709551615} }
  // Decimal
  if (xs=/^decimal\(([0-9]+),([0-9]+)\)$/.exec(type)) { return {type:"decimal", precision:Number(xs[1]), scale:Number(xs[2]), unsigned:false} }
  if (xs=/^decimal\(([0-9]+),([0-9]+)\) unsigned$/.exec(type)) { return {type:"decimal", precision:Number(xs[1]), scale:Number(xs[2]), unsigned:true} }
  // Float
  if (type === "float") { return {type:"float", unsigned:false} }
  if (type === "float unsigned") { return {type:"float", unsigned:true} }
  if (type === "double") { return {type:"float", unsigned:false} }
  if (type === "double unsigned") { return {type:"float", unsigned:true} }
  // Enum TODO: full string literal support (now cannot contain commas and escaped quotes)
  if (xs=/^enum\((\'[^\',]*\'(,\'[^\',]*\')*)\)$/.exec(type)) {
    return {
      type:"enumeration",
      options:xs[1].split(",").map(function (s) {
        return s.substring(1, s.length-1)
      })
    }
  }
  // Text
  if (xs=/^varchar\(([0-9]+)\)$/.exec(type)) { return {type:"text", maxlength:Number(xs[1])} }
  if (xs=/^char\([0-9]+\)$/.exec(type)) { return {type:"text", maxlength:Number(xs[1])} }
  if (type === "tinytext") { return {type:"text", maxlength:255} }
  if (type === "text") { return {type:"text", maxlength:65535} }
  if (type === "mediumtext") { return {type:"text", maxlength:16777215} }
  if (type === "longtext") { return {type:"text", maxlength:4294967295} }
  // Default TODO: date-based field
  return {type:"unknown"}
}

module.exports = function (sql, db, k) {
  sql("SHOW TABLES FROM "+Util.backquote(db), function (err, results) {
    if (err) { return k(err) }
    if (results[0].length === 0) { return k(null, {}) }
    var tables = results[0].map(function (row) { return row[0] })
    var query = tables.map(function (table) { return "SHOW COLUMNS FROM "+Util.backquote(db)+"."+Util.backquote(table)+";" }).join("\n")
    sql(query, function (err, results) {
      if (err) { return k(err) }
      var schema = {}
      for (var i=0; i<results.length; i++) {
        schema[tables[i]] = {}
        for (var j=0; j<results[i].length; j++) {
          var xs
          var column = results[i][j][0]
          var descr = {}
          schema[tables[i]][column] = descr
          if (column==="id") { schema[tables[i]][column] = {type:"identifier", table:tables[i]} }
          else if (xs = /^(.+)_id$/.exec(column)) { schema[tables[i]][column] = {type:"identifier", table:xs[1]} }
          else { schema[tables[i]][column] = parse(results[i][j][1]) }
          schema[tables[i]][column].nullable = results[i][j][2]==="YES"
        }
      }
      k(null, schema)
    })
  })
}

},{"./util.js":18}],15:[function(require,module,exports){

var Util = require("./util.js")
var Feedback = require("./feedback.js")
var Field = require("./field.js")

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
  searcher.class = "browsersql searcher"
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
      div.appendChild(document.createTextNode(column))
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
    div.appendChild(document.createTextNode("Page:"))
    div.appendChild(input)
    searcher.appendChild(div)
  } ());
  // list
  var ol = document.createElement("ol")
  searcher.appendChild(ol)
  return searcher
}

},{"./feedback.js":5,"./field.js":6,"./util.js":18}],16:[function(require,module,exports){

var Feedback = require("./feedback.js")
var Identifier = require("./field/identifier.js")
var Util = require("./util.js")

function insert_query (db, tb, vls) {
  var query = "INSERT INTO "+Util.backquote(db)+"."+Util.backquote(tb)+" "
  query = query+"("+Object.keys(vls).map(Util.backquote).join(",")+")"
  query = query+" VALUES ("+Object.keys(vls).map(function (c) { return Util.quote(vls[c]) })+");"
  query = query+"\nSELECT LAST_INSERT_ID();"
  return query
}

function delete_query (db, tb, id) {
  return "DELETE FROM "+Util.backquote(db)+"."+Util.backquote(tb)+" WHERE id="+Util.quote(id)
}

function empty () { return {} }

module.exports = function (global, table, onselect, oninsert) {

  oninsert = oninsert || empty

  /////////////////////
  // Private Methods //
  /////////////////////

  function disable () {
    delete_button.disabled = true
    insert_button.disabled = true
    field.$disabled = true
  }

  function enable () {
    delete_button.disabled = field.$value===0
    insert_button.disabled = false
    field.$disabled = false
  }

  ////////////////////
  // HTML attribute //
  ////////////////////

  var field = Identifier(global, table)
  field.$onchange = function () {
    delete_button.disabled = false
    onselect(field.$value)
  }

  var insert_button = document.createElement("button")
  insert_button.textContent = "Insert"
  insert_button.onclick = function () {
    disable()
    global.sql(insert_query(global.database, table, oninsert()), function (err, results) {
      err?feedback.$sqlf(err):(field.$value=results[1][0][0],onselect(field.$value))
      enable()
    })
  }

  var delete_button = document.createElement("button")
  delete_button.disabled = true
  delete_button.textContent = "Delete"
  delete_button.onclick = function () {
    if (confirm("Are you sure you want to delete this item and possibly its associated entries?")) {
      disable()
      global.sql(delete_query(global.database, table, field.$value), function (err) {
        err?feedback.$sqlf(err):(field.$value=0,onselect(0))
        enable()
      })
    }
  }

  var feedback = Feedback()

  //////////////
  // Top HTML //
  //////////////

  var selector = document.createElement("div")
  selector.class = "browsersql selector"
  selector.appendChild(document.createTextNode(table+":"))
  selector.appendChild(field)
  selector.appendChild(insert_button)
  selector.appendChild(delete_button)
  selector.appendChild(feedback)
  return selector

}

},{"./feedback.js":5,"./field/identifier.js":10,"./util.js":18}],17:[function(require,module,exports){

var Field = require("./field.js")
var Util = require("./util.js")
var Feedback = require("./feedback.js")

function set (db, tb, id, cl, vl) { return "UPDATE "+Util.backquote(db)+"."+Util.backquote(tb)+" SET "+Util.backquote(cl)+"="+Util.quote(vl)+" WHERE id="+Util.quote(id) }

function get (db, tb, id, cl) { return "SELECT "+Util.backquote(cl)+" FROM "+Util.backquote(db)+"."+Util.backquote(tb)+" WHERE id="+Util.quote(id) }

module.exports = function (gl, tb, id, cl) {
  var setter = document.createElement("div")
  setter.appendChild(document.createTextNode(cl+":"))
  setter.class = "browsersql setter"
  var feedback = Feedback()
  setter.appendChild(feedback)
  if (!gl.schema[tb][cl]) { return feedback.$fail("No such table: "+tb) }
  if (!gl.schema[tb][cl]) { return feedback.$fail("No such column: "+cl+" for table: "+tb) }
  gl.sql(get(gl.database, tb, id, cl), function (err, results) {
    if (err) { return feedback.$sqlf(err) }
    var field = Field(gl, gl.schema[tb][cl])
    setter.insertBefore(field, feedback)
    field.$value = results[0][0][0]
    field.$onchange = function () {
      field.$disabled = true
      gl.sql(set(gl.database,tb,id,cl,field.$value)+";\n"+get(gl.database,tb,id,cl)+";", function (err, results) {
        field.$disabled = false
        err?feedback.$sqlf(err):(field.$value=results[1][0][0])
      })
    }
  })
  return setter
}

},{"./feedback.js":5,"./field.js":6,"./util.js":18}],18:[function(require,module,exports){

exports.quote = function (x) {
  if (x === null) { return "NULL" }
  return "'" + String(x).replace(/'/g, "\\'") + "'"
}

exports.backquote = function (x) {
  return "`" + String(x).replace(/`/g, "\\`") + "`"
}

exports.repeat = function (str, num) {
  return (new Array(num+1)).join(str)
}

},{}]},{},[2]);
