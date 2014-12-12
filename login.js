
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
