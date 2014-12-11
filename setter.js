
var Field = require("./field.js")
var Util = require("./util.js")
var Error = require("./warning.js")
var Schema = require("./schema.js")

function set (table, id, column, value) {
  return "UPDATE " + Util.backquote(table) + " SET " + Util.backquote(column) + "=" + Util.quote(value) + " WHERE id=" + Util.quote(id)
}

function get (table, id, column) {
  return "SELECT " + Util.backquote(column) + " FROM " + Util.backquote(table) + " WHERE id=" + Util.quote(id)
}

module.exports = function (schema, sql, table, id, column) {
  
  var setter = document.createElement("label")

  setter.appendChild(document.createTextNode(table+":"))
  
  setter.class = "browsersql setter"

  sql(get(table, id, column), function (err, tables) {
    if (err) { return setter.appendChild(Error(err)) }
    Schema(sql, schema, table, function (err, table_schema)) {
      if (err) { return setter.appendChild(Error(err)) }
      if (!table_schema[column]) { return setter.appendChild(Error("no-such-column")) }
      var field = Field(table_schema[column])
      field.$value = tables[0][0][0]
      setter.appendChild(field)
      field.$onchange = function () {
        field.$disabled = true
        sql(set(table, id, column, field.$value), function (err, tables) {
          if (err) {
            setter.removeChild(field)
            setter.appendChild(Warning(err))
          }
          field.$disabled = false
        })
      }
    })
  })

  return setter

}


//   Query.get(sql, table, id, column, function (err, value) {
//     if (err) { return label.appendChild(document.createTextNode("ERROR: "+err)) }
//     Schema(sql, schema, table, function (descriptions) {
//       var input, validate, feedback, nullbox, d=descriptions[column]
//       // Input
//       if (!d) {
//         input = document.createElement("input")
//       } else if (d.type === "boolean") {
//         input = document.createElement("input")
//         input.type = "checkbox"
//         Object.defineProperty(input, "value", {
//           get: function () { return checkbox.checked?1:0 },
//           set: function (val) { return checkbox.checked = val===0?false:true }
//         })
//       } else if (d.type === "text") {
//         input = document.createElement("textarea")
//         input.maxlength = d.maxlength
//       } else if (d.type === "decimal") {
//         input = document.createElement("input")
//         input.type = "number"
//         validate = function () { /* TODO */ }
//       } else if (d.type === "enum") {
//         input = document.createElement("select")
//         d.options.forEach(function (str) {
//           var opt = document.createElement("option")
//           opt.value = str
//           opt.appendChild(document.createTextNode(str))
//           input.appendChild(opt)
//         })
//       } else if (d.type === "integer") {
//         input = document.createElement("input")
//         input.type = "number"
//         input.min = d.min
//         input.max = d.max
//         validate = function () { input.value = Math.round(input.value) }
//       } else if (d.type === "float") {
//         input = document.createElement("input")
//         input.type = "number"
//         if (d.unsigned) { input.min = 0 }
//       } else {
//         input = document.createElement("input")
//         console.log("unexpected description: "+d)
//       }
//       label.appendChild(input)
//       // Nullbox && input.onchange
//       if (d.nullable) {
//         nullbox = document.createElement("input")
//         nullbox.type = "checkbox"
//         label.appendChild(document.createTextNode("null:"))
//         label.appendChild(nullbox)
//         function cont (err) {
//           input.disable = false
//           nullbox.disabled = false
//           feedback.$cont(err)
//         }
//         function change () {
//           feedback.$wait()
//           input.disabled = true
//           nullbox.disabled = true
//           sql(set(table, id, column, nullbox.checked?null:input.value), cont)
//         }
//         nullbox.onchange = change
//         input.onchange = function () {
//           feedback.$wait()
//           nullbox.checked = false
//           change()
//         }
//         (value===null)?(nullbox.checked=true):(input.value=value)
//       } else {
//         function cont (err) {
//           input.disable = false
//           feedback.$cont(err)
//         }
//         input.onchange = function () {
//           input.disabled = true 
//           Query.set(sql, table, id, column, input.value, cont)
//         }
//         input.value = value
//       }
//       // Feedback
//       feedback = Feedback()
//       label.appendChild(feedback)
//     })
//   })

//   return label

// }
