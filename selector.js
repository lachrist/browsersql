
var Feedback = require("./feedback.js")
var Identifier = require("./field/identifier.js")

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

return function (global, table, onselect, oninsert) {

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
      err?feedback.$sqlf(err):(field.$value=tables[1][0][0],onselect(field.$value))
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
  selector.appendChild(id_input)
  selector.appendChild(create_button)
  selector.appendChild(delete_button)
  selector.appendChild(feedback)
  return selector

}
