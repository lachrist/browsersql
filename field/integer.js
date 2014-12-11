module.exports = function (min, max) {
  var input = document.createElement("input")
  input.type = "number"
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