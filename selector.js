
var Feedback = require("./feedback.js")

return function (sql, table, onselect, insert) {

  ///////////
  // State //
  ///////////

  var id

  /////////////////////
  // Private Methods //
  /////////////////////

  // GUI-only update
  function patient () {
    delete_button.disabled = true
    insert_button.disabled = true
    id_input.prop.disabled = true
  }

  // GUI-only update
  function update () {
    delete_button.disabled = id === ""
    insert_button.disabled = false
    id_input.prop.disabled = false
    id_input.val(id)
  }

  function change (new_id) {
    id = new_id
    update()
    onselect(id===""?null:id)
  }

  ////////////////////
  // HTML attribute //
  ////////////////////

  var id_input = document.createElement("input")
  id_input.type = "text"
  id_input.placeholder = "Enter an ID..."
  id_input.onchange = function () {
    if (id_input.value === "") { return change(null) }
    patient()
    var new_id = id_input.value
    if (new_id === "") { return onselect(null) }
    sql("SELECT id FROM table "+Util.backquote(table)+" WHERE id="+Util.quote(new_id), function (err, tables) {
      if (err) { return (update(), feedback.$fail("SQL error: "+err)) }
      if (tables[0].length === 0) { return (update(), feedback.$fail("No such ID")) }
      change(new_id)
    })
  }

  var insert_button = document.createElement("button")
  insert_button.textContent = "Insert"
  insert_button.onclick = function () {
    patient()
    var o = insert()
    var query = "INSERT INTO "+Util.backquote(table)+"("
    query = query+"("+Object.keys(o).map(Util.backquote).join(",")+")"
    query = query+" VALUES ("+Object.keys(o).map(function (k) { return Util.quote(o[k]) })+");"
    query = query+"\nSELECT LAST_INSERT_ID();"
    sql(query, function (err, tables) {
      if (err) { (update(), feedback.$fail("SQL error: "+err)) }
      change(tables[0][0][0])
    })
  }

  var delete_button = document.createElement("button")
  delete_button.textContent = "Delete"
  delete_button.onclick = function () {
    if (confirm("Are you sure you want to delete this item and its associated entries?")) {
      patient()
      sql("DELETE FROM "+Util.backquote(table)+" WHERE id="+Util.quote(id), function (err) {
        if (err) { (update(), feedback.$fail("SQL error: "+err))  }
        change("")
      })
    }
  }

  var feedback = Feedback()

  //////////
  // Init //
  //////////

  change("")

  ///////////////
  // Interface //
  ///////////////

  var selector = document.createElement("div")
  selector.class = "browsersql selector"
  selector.appendChild(id_input)
  selector.appendChild(create_button)
  selector.appendChild(delete_button)
  selector.appendChild(feedback)
  return selector

}
