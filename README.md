# BrowserSQL

This toolkit assumes that a SQL database is accessible through the browser.
One way to achieve such access is to use Ajax or better WebSocket and having a HTTP server forwarding requests to a local database (see https://github.com/lachrist/mariaws for a concreate example).



There is two ways you can include BrowserSQL within your web page:
  1. Simply include the file `browsersql.js` (https://github.com/lachrist/browsersql/blob/master/browsersql.js) within your web page.
     The global object will then contain the browsersql object.
  2. Use `browserify` (http://browserify.org/): install the module with `npm install browsersql` and get the 
The recommanded way to use it is to install it with `npm install browsersql` and then 


In this readme the function that materializes such access is called `onsql` ; its takes two arguments:
  1. A string that should be a SQL query (e.g. "SELECT * FROM CAR;")
  2. A callback that will receive two arguments:
    1. A potential SQL error code (`null` if the query was successfull)
    2. An array of tables that are the result of the query (a three-dimensional matrix that is)


Moreover this toolkit perform two 


Lets assume that the below database is accessible through the browser (e.g. https://github.com/lachrist/mariaws)

## Demonstration

```sql
CREATE DATABASE db;

CREATE TABLE db.course (
  id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(30)  NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE db.student (
  id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(30)  NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE db.mark (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id INT UNSIGNED NOT NULL,
  course_id  INT UNSIGNED NOT NULL,
  score      INT UNSIGNED NOT NULL,
  FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES course(id)  ON DELETE CASCADE,
  PRIMARY KEY (id)
);
```

```javascript
var Browsersql = require("browsersql")

function authentification (name, password, k) { /* Connection to database */ }
function sql (query, k) { /* Query to database */ }

var login = Browsersql.login(function (name, password, k) {
  login(name, password, function (err) {
    if (err) { return k(err) }
    document.body.removeChild(login)
    document.append(Browsersql.console(sql))
    Browsersql.kit(sql, "db", viewers, function (err, kit) {

    })
  })
})
document.body.appendChild(login)

var viewers = {
  "student": function (id) {
    var div = document.createElement("div")
    sql("SELECT name FROM db.student WHERE id="+id, function (err, results) {
      if (err) { return div.textContent = "SQL error: "+err }
      div.textContent = results[0][0][0]
    })
    return div
  }
}
```

## API

  * `browsersql.login(onlogin)`: a container 
  * `browsersql.console(onsql)`: 
  * `browsersql.kit(onsql, database, viewers, callback)`:
    * `searcher(table, onsearch)`: 
    * `selector(table, onselect, oninsert)`: 
    * `setter(table, identifier, column)`:
    * `editor(table, identifier)`:
 
