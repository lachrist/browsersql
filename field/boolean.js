
function boolean () {
  var input = document.createElement("input")
  input.type = "checkbox"
  Object.defineProperty(input, "$value", {
    get: function () { return input.checked?1:0 },
    set: function (val) { return input.checked = val===0?false:true }
  })
  Object.defineProperty(input, "$disabled", {
    get: function () { return input.disabled },
    set: function (v) { return input.disabled = v }
  })
  input.onchange = function () { if (input.$onchange) { input.$onchange() } }
  return input
}
