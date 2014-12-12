
var Util = require("./util.js")

// type :: integer || float || boolean || text || decimal || identifier || enum
// options :: [String]
// min :: Number
// max :: Number
// maxlength :: Natural
// precision :: Natural
// scale :: Natural
// nullable :: Boolean
// unsigned :: Boolean
// foreign  :: String

function parse (type) {
  // TODO warning when using too large number for JavaScript engine (e.g. bigint & longtext)
  var xs
  if (type === "tinyint(1)") { return {type:"boolean"} }
  // Signed integer
  if (/^tinyint(\([0-9]+\))$/.test(type)) { return {type:"integer", min:-128, max:127} }
  if (/^smallint(\([0-9]+\))$/.test(type)) { return {type:"integer", min:-32768, max:32767} }
  if (/^mediumint(\([0-9]+\))$/.test(type)) { return {type:"integer", min:-8388608, max:8388607} }
  if (/^int(\([0-9]+\))$/.test(type)) { return {type:"integer", min:-2147483648, max:2147483647} }
  if (/^bigint(\([0-9]+\))$/.test(type)) { return {type:"integer", min:-9223372036854775808, max:9223372036854775807} }   
  // Unsigned integer
  if (/^tinyint(\([0-9]+\)) unsigned$/.test(type)) { return {type:"integer", min:0, max:255} }
  if (/^smallint(\([0-9]+\)) unsigned$/.test(type)) { return {type:"integer", min:0, max:65535} }
  if (/^mediumint(\([0-9]+\)) unsigned$/.test(type)) { return {type:"integer", min:0, max:16777215} }
  if (/^int(\([0-9]+\)) unsigned$/.test(type)) { return {type:"integer", min:0, max:4294967295} }
  if (/^bigint(\([0-9]+\)) unsigned$/.test(type)) { return {type:"integer", min:0, max:18446744073709551615} }
  // Decimal
  if (xs=/^decimal\(([0-9]+),([0-9]+)\)$/.exec(type)) { return {type:"decimal", precision:Number(xs[1]), scale:Number(xs[2]), unsigned:false} }
  if (xs=/^decimal\(([0-9]+),([0-9]+)\) unsigned$/.exec(type)) { return {type:"decimal", precision:Number(xs[1]), scale:Number(xs[2]), unsigned:true} }
  // Float
  if (type === "float") { return {type:"float", unsigned:false} }
  if (type === "float unsigned") { return {type:"float", unsigned:true} }
  if (type === "double") { return {type:"float", unsigned:false} }
  if (type === "double unsigned") { return {type:"float", unsigned:true} }
  // Enum TODO: full string literal support (now cannot contain commas and escaped quotes)
  if (xs=/^enum\((\'[^\',]*\'(,\'[^\',]*\')*)\)$/.exec(type)) {
    return {
      type:"enumeration",
      options:xs[1].split(",").map(function (s) {
        return s.substring(1, s.length-1)
      })
    }
  }
  // Text
  if (xs=/^varchar\(([0-9]+)\)$/.exec(type)) { return {type:"text", maxlength:Number(xs[1])} }
  if (xs=/^char\([0-9]+\)$/.exec(type)) { return {type:"text", maxlength:Number(xs[1])} }
  if (type === "tinytext") { return {type:"text", maxlength:255} }
  if (type === "text") { return {type:"text", maxlength:65535} }
  if (type === "mediumtext") { return {type:"text", maxlength:16777215} }
  if (type === "longtext") { return {type:"text", maxlength:4294967295} }
  // Default TODO: date-based field
  return {type:"unknown"}
}

module.exports = function (sql, db, k) {
  sql("SHOW TABLES FROM "+Util.backquote(db), function (err, results) {
    if (err) { return k(err) }
    if (results[0].length === 0) { return k(null, {}) }
    var tables = results[0].map(function (row) { return row[0] })
    var query = tables.map(function (table) { return "SHOW COLUMNS FROM "+Util.backquote(db)+"."+Util.backquote(table)+";" }).join("\n")
    sql(query, function (err, results) {
      if (err) { return k(err) }
      var schema = {}
      for (var i=0; i<results.length; i++) {
        schema[tables[i]] = {}
        for (var j=0; j<results[i].length; j++) {
          var xs
          var column = results[i][j][0]
          var descr = {}
          schema[tables[i]][column] = descr
          if (column==="id") { schema[tables[i]][column] = {type:"identifier", table:tables[i]} }
          else if (xs = /^(.+)_id$/.exec(column)) { schema[tables[i]][column] = {type:"identifier", table:xs[1]} }
          else { schema[tables[i]][column] = parse(results[i][j][1]) }
          schema[tables[i]][column].nullable = results[i][j][2]==="YES"
        }
      }
      k(null, schema)
    })
  })
}
