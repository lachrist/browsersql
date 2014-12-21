
module.exports = function (content) {
  var span = document.createElement("span")
  span.className = "browsersql label"
  span.textContent = content
  return span
}
