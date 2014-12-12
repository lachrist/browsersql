
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
