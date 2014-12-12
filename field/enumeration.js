
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
