
function float (unsigned) {
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

