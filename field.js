
var Boolean = require("./field/boolean.js")
var Enumeration = require("./field/enumeration.js")
var Float = require("./field/float.js")
var Identifier = require("./field/identifier.js")
var Integer = require("./field/integer.js")
var Text = require("./field/text.js")

module.exports = function (global, descriptor) {
  var field
  if (descriptor.type === "identifier") { field = Identifier(global, descriptor.table) }
  else if (descriptor.type === "integer") { field = Integer(descriptor.min, descriptor.max) }
  else if (descriptor.type === "enumeration") { field = Enumeration(descriptor.options) }
  else if (descriptor.type === "boolean") { field = Boolean() }
  else if (descriptor.type === "float") { field = Float(descriptor.unsigned) }
  else if (descriptor.type === "text") { field = Text(descriptor.maxlength) }
  else { field = Text() }
  if (!descriptor.nullable) { return field }
  var checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  var span = document.createElement("span")
  Object.defineProperty(span, "$value", {
    get: function () { return checkbox.checked?null:field.$value },
    set: function (v) {
      checkbox.checked = v===null
      field.hidden = v===null
      if (v!==null) { field.$value=v }
      return v
    }
  })
  Object.defineProperty(span, "$disabled", {
    get: function () { return field.$disabled && checkbox.disabled },
    set: function (v) { return (field.$disabled=v, checkbox.disabled=v) }
  })
  field.$onchange = function () { checkbox.checked=false; if (span.$onchange) { span.$onchange() } }
  checkbox.onchange = function () {
    field.hidden = checkbox.checked
    if (span.$onchange) { span.$onchange() }
  }
  span.appendChild(checkbox)
  span.appendChild(document.createTextNode("(null)"))
  span.appendChild(field)
  return span
}
