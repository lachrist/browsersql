
exports.quote = function (x) {
  if (x === null) { return "NULL" }
  return "'" + String(x).replace(/'/g, "\\'") + "'"
}

exports.backquote = function (x) {
  return "`" + String(x).replace(/`/g, "\\`") + "`"
}

exports.repeat = function (str, num) {
  return (new Array(num+1)).join(str)
}
