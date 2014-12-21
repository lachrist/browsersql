
module.exports = function () {
  var span = document.createElement("span")
  span.className = "browsersql feedback"
  span.$free = function () {
    span.class = "browsersql feedback"
    span.textContent = ""
  }
  span.$succ = function (msg) {
    span.class = "browsersql feedback success"
    span.textContent = msg
  }
  span.$fail = function (err) {
    span.class = "browsersql feedback failure"
    span.textContent = err
  }
  span.$sqlf = function (err) {
    span.class = "browsersql feedback failure"
    span.textContent = "SQL error: "+err
  }
  return span
}
