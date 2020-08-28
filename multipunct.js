const core = require("./core.js")

// Load a text to test
const fs = require("fs")
const source = fs.readFileSync(process.argv[2], "utf8")   // requires a text file in the folder with the program
const language = process.argv[3].toUpperCase()

console.log(core.fixAll(source,language))

/* STILL TODO:

* Match all space characters in errors
* Match more forms of broken ellipsis (..)
* Match (…) ellipsis form and replace with […]
* Add space before German ellipsis
* Handle errors in command line input
* Find and correct date formats?

*/
