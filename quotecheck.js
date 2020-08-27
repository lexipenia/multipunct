// Load the text to test
const fs = require("fs")
const source = fs.readFileSync("test_text.txt", "utf8")

// Set the language to use when interpreting/editing the text + initialize correct symbols/regex
const language = "EN"
let correct_open
let correct_open_regex
let correct_close
let correct_close_regex

// Lists of regex to match different cases for opening and closing quotation marks.
// NOTE: the lists also contains regex for the *correct* formats in different languages.
// Depending on the language selected, these correct formats are removed before the main check.
// This is because the correct format in some languages is an error in other languages.
const open_quote_errors = [
  "\"[a-z]",  // straight quotes at beginning
  "“[a-z]"    // EN correct
]

const close_quote_errors = [
  "[a-z]\"",  // straight quotes at end, no punctuation
  "[.,!?]\"",  // straight quotes at end, with punctuation
  "[a-z]”",   // EN correct
  "[.,!?]”"   // EN correct
]

const apostrophe_errors = [
  "\'"
]

// Set correct replacement symbols for each language + the correct regex possibilities
switch(language){
  case "EN": {
    correct_open = "“"
    correct_close = "”"
    correct_open_regex = [
      "“[a-z]"
    ]
    correct_close_regex = [
      "[a-z]”",
      "[.,!?]”"
    ]
    break;
  }
  case "FR": {
    correct_open = "«\xa0"    // include no-break spaces
    correct_close = "\xa0»"
    break;
  }
}

// Remove the language-specific correct expressions from the main error lists
const remove = (array,element) => {
  let index = array.indexOf(element)
  array.splice(index,1)
}

correct_open_regex.forEach(expression => {
  remove(open_quote_errors,expression)
})

correct_close_regex.forEach(expression => {
  remove(close_quote_errors,expression)
})

// carry out find/replace for any of the expression lists
const findReplace = (expression_list,replace_char) => {
  expression_list.forEach(expression => {
    let re = new RegExp(expression, "gim")
    let matches = source.match(re)
    console.log(matches)
    
  })
}

console.log("Searching for these opening expressions:")
console.log(open_quote_errors)
findReplace(open_quote_errors,correct_open)