
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

function parse_type (type) {
  var xs
  if (type === "tinyint(1)") { return {type:"boolean"} }
  // Signed integer
  if (/^tinyint(\([0-9]+\))$/.test(type)) { return {type:"integer", min:-128, max:127} }
  if (/^smallint(\([0-9]+\))$/.test(type)) { return {type:"integer", min:-32768, max:32767} }
  if (/^mediumint(\([0-9]+\))$/.test(type)) { return {type:"integer", min:-8388608, max:8388607} }
  if (/^int(\([0-9]+\))$/.test(type)) { return {type:"integer", -2147483648, max:2147483647} }
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
  // Enum TODO full string literal support (now cannot contain commas and escaped quotes)
  if (xs=/^enum\((\'[^\',]*\'(,\'[^\',]*\')*)\)$/.exec(type)) { return {type:"enum", options:xs[1].split(",").map(function (s) { return s.substring(1, s.length-1) }))} }
  // Text
  if (xs=/^varchar\(([0-9]+)\)$/.exec(type)) { return {type:"text", maxlength:Number(xs[1])} }
  if (xs=/^char\([0-9]+\)$/.exec(type)) { return {type:"text", maxlength:Number(xs[1])} }
  if (type === "tinytext") { return {type:"text", maxlength:255} }
  if (type === "text") { return {type:"text", maxlength:65535} }
  if (type === "mediumtext") { return {type:"text", maxlength:16777215} }
  if (type === "longtext") { return {type:"text", maxlength:4294967295} }
  // Default
  return {type:"text"}
}

module.exports = function (sql, schema, table, k) {
  if (!schema[table]) {
    schema[table] = [k]
    return sql("SHOW COLUMNS FROM " + Util.backquote(table), function (err, tables) {
      var ks = schema[table]
      if (err) {
        delete schema[table]
        k(err)
        return ks.forEach(function (k) { k(err) })
      }
      schema[table] = {}
      tables[0].forEach(function (col) {
        var o = {}
        schema[table][col[0]] = o
        if (col[0]==="id") { o = {type:"identifier"} }
        else if (var xs = /^(.+)_id$/.exec(col[0])) { o = {type:"identifier", foreign:xs[1]} }
        else { o = parse_type(col[1]) }
        o.nullable = col[2]==="YES"
      })
      ks.forEach(function (k) { k(null) })
    })
  }
  if (Array.isArray(schema[table])) { return schema[table].push(k) }
  k(null)
}
