
var Feedback = require("./feedback.js")

module.exports = function (onlogin) {
  var name = document.createElement("input")
  name.type = "text"
  name.placeholder = "Username"
  var pass = document.createElement("input")
  pass.type = "text"
  pass.placeholder = "Password"
  var butt = document.createElement("button")
  butt.textContent = "Login"
  butt.onclick = function () {
    feedback.$free()
    name.disabled = true
    pass.disabled = true
    butt.disabled = true
    onlogin(name.value, pass.value, function (err) {
      pass.value = ""
      name.disabled = false
      pass.disabled = false
      butt.disabled = false
      if (err) { feedback.$fail(err===1045?"Incorrect username - password combination":("SQL error: "+err)) }
      else { feedback.$succ("Authentification successful") }
    })
  }
  var feedback = Feedback()
  var div = document.createElement("div")
  div.class = "browsersql login"
  div.appendChild(name)
  div.appendChild(pass)
  div.appendChild(butt)
  div.appendChild(feedback)
  return div
}
