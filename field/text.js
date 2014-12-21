
module.exports = function (maxlength) {
  var input = document.createElement("textarea")
  input.value = ""
  input.rows = 1
  if (maxlength) { input.maxlength = maxlength }
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
