# BrowserSQL

This toolkit aims at helping developing GUI elements for accessing a remote SQL database.
Using BrowserSQL require to pass around the raw access to the database.
One way to achieve such access is to use Ajax (or better, WebSocket) and having a HTTP server forwarding requests to a local database (see https://github.com/lachrist/mariaws for a concreate example).
In this readme the function that materializes such access is called `sql` ; its takes two arguments:
  1. A string that should be a SQL query (e.g. "SELECT * FROM CAR;")
  2. A callback that will receive two arguments:
    1. A potential SQL error code (`null` if the query was successfull)
    2. An array of tables that are the result of the query (a three-dimensional matrix that is)

There is two ways you can include BrowserSQL within your web page:
  1. Simply include the file `browsersql.js` (https://github.com/lachrist/browsersql/blob/master/browsersql.js) within your web page.
     The global object will then contain the `browsersql` object.
  2. Use `browserify` (http://browserify.org/): install this module with `npm install browsersql` and get the `browsersql` object with the JavaScript line: `var browsersql = require("browsersql")`.

## Demonstration

See: (https://github.com/lachrist/browsersql-demo).

## API

  * `browsersql.login(authentify)`: a container 
  * `browsersql.console(sql)`: 
  * `browsersql.kit(onsql, database, viewers, callback)`:
    * `searcher(table, onsearch)`: 
    * `selector(table, onselect, oninsert)`: 
    * `setter(table, identifier, column)`:
    * `editor(table, identifier)`:
