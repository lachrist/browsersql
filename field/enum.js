
function enum (options) {
  var input = document.createElement("select")
  options.forEach(function (str) {
    var option = document.createElement("option")
    option.textContent = str
    option.value = str
    input.appendChild(option)
  })
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
