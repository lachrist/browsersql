
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
      err?feedback.$fail("SQL error: "+err):feedback.$succ("Query successful")
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

