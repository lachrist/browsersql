
var Boolean = require("./field/boolean.js")
var Enum = require("./field/enum.js")
var Float = require("./field/flaot.js")
var Identifier = require("./field/identifier.js")
var integer = require("./field/integer.js")
var text = require("./field/text.js")

module.exports = function (global, descriptor) {
  var field
  if (descriptor.type === "identifier") { field = Identifier(global, descriptor.table) }
  else if (descriptor.type === "integer") { field = Integer(descriptor.min, descriptor.max) }
  else if (descriptor.type === "enum") { field = Enum(descriptor.options) }
  else if (descriptor.type === "boolean") { field = Boolean() }
  else if (descriptor.type === "float") { field = Float(descriptor.unsigned) }
  else if (descriptor.type === "text") { field = Text(descriptor.maxlength) }
  else { field = text() }
  if (!descriptor.nullable) { return field }
  var checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  var span = document.createElement("span")
  Object.defineProperty(span, "$value", {
    get: function () { return checkbox.checked?null:input.$value },
    set: function (v) { return v===null?checkbox.checked=true:(checkbox.checked=false,input.$value=v) }
  })
  Object.defineProperty(span, "$disabled", {
    get: function () { return input.$disabled && checkbox.disabled },
    set: function (v) { return (input.$disabled=v, checkbox.disabled=v) }
  })
  input.$onchange = function () { checkbox.checked=false; if (span.$onchange) { span.$onchange() } }
  checkbox.onchange = function () {
    field.hidden = checkbox.checked
    if (span.$onchange) { span.$onchange() }
  }
  span.appendChild(checkbox)
  span.appendChild(document.createTextNode("(null)"))
  span.appendChild(field)
  return span
}
