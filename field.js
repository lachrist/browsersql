
var Boolean = require("./field/boolean.js")
var Enum = require("./field/enum.js")
var Float = require("./field/flaot.js")
var Identifier = require("./field/identifier.js")
var integer = require("./field/integer.js")
var text = require("./field/text.js")

module.exports = function (sql, schema, viewers, descriptor) {
  var field
  if (descriptor.type === "identifier") { field = identifier(sql, schema, viewers, descriptor.foreign) }
  else if (descriptor.type === "integer") { field = integer(descriptor.min, descriptor.max) }
  else if (descriptor.type === "enum") { field = enum(descriptor.options) }
  else if (descriptor.type === "boolean") { field = boolean() }
  else if (descriptor.type === "float") { field = float(descriptor.unsigned) }
  else if (descriptor.type === "text") { field = text(descriptor.maxlength) }
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
  checkbox.onchange = function () { if (span.$onchange) { span.$onchange() } }
  span.appendChild(field)
  span.appendChild(document.createTextNode("null:"))
  span.appendChild(checkbox)
  return span
}
