const { keys, values } = require("core-js/fn/array")

// Set correct replacement symbols for each language, including both primary and secondary marks
const languages = {
  "EN": {
    "correct_open": "“",
    "correct_close": "”",
    "secondary_open": "‘",
    "secondary_close": "’"
  },
  "FR": {
    "correct_open": "«\xa0",    // include no-break spaces
    "correct_close": "\xa0»",
    "secondary_open": "“",
    "secondary_close": "”"
  },
  "IT": {
    "correct_open": "«",
    "correct_close": "»",
    "secondary_open": "“",
    "secondary_close": "”"
  },
  "ES": {
    "correct_open": "«",
    "correct_close": "»",
    "secondary_open": "“",
    "secondary_close": "”"
  },
  "DE": {
    "correct_open": "„",
    "correct_close": "“",
    "secondary_open": ",",
    "secondary_close": "‘"
  },
  "LT": {
    "correct_open": "„",
    "correct_close": "“",
    "secondary_open": ",",
    "secondary_close": "‘"
  },
  "PL": {
    "correct_open": "„",
    "correct_close": "”",
    "secondary_open": "«",
    "secondary_close": "»"
  }
}

// All possible quotation mark signs. We will use these to generate the relevant regex to find errors.
const all_marks = [
  "\"",                 // straight double
  "\'",                 // straight single
  "“",                  // smart open double
  "”",                  // smart close double
  "‘",                  // smart open single
  "’",                  // smart close single
  "«",                  // guillemets open no space
  "»",                  // guillemets close no space
  "« ",                 // guillemets open space        // TODO: make this work for any space char
  " »",                 // guillemets close space
  //",",                // German open single           // Remove this, otherwise it matches commas
  "„"                   // German open double
]

// Define the possible opening and closing positions for each quotation mark sign. Used to generate the regex.
const opening_error_positions = [
  "[^a-z]{sign}[a-z]",    // Mark before a word begins; avoid apostrophes
  "{sign}[¡¿][a-z]"       // Spanish cases
]

const closing_error_positions = [
  "[a-z]{sign}[^a-z]",    // Mark after a word ends; avoid apostrophes
  "[a-z][,.?!]{sign}"     // Mark where quote ends with punctuation
]

// Remove a specific element from an array easily
const remove = (array,element) => {
  let index = array.indexOf(element)
  array.splice(index,1)
}

// We will populate an object with all required regex: each false sign in each possible position.
// The object's keys are the regex. Each key value is the specific sign that needs to be replaced.
// Depending on the language selected, the "correct" mark is removed from the set before generating.
const generateRegex = (position_set,correct_char) => {

  let errors = {}
  let marks = Array.from(all_marks)
  remove(marks,correct_char)

  marks.forEach(mark => {
    position_set.forEach(position => {
      let regex = position.replace("{sign}",mark)
      errors[regex] = mark
    })
  })

  return errors

}

// Find sections in text matching the regex stored in the object, then replace only the required sign
const findReplace = (text,regex_obj,correct_char) => {

  for (const [regex,mark] of Object.entries(regex_obj)) {

    let re = new RegExp(regex,"gim")

    while ((match = re.exec(text)) != null){

      let substring1 = text.substring(match.index,match.index+match[0].length+1)
      let substring2 = substring1.replace(mark,correct_char)
      text = text.replace(substring1,substring2)

    }
  }

  return text

}

// Primary + secondary quotes: first we replace *all* quotes with the correct open/close symbols
// Then we search for dual occurences of an open/close without the appropriate closing symbol between

const generateSecondaryRegex = (repeated_char,break_char) => {

  let regex_obj = {} 
  
  // find two repeated characters separated by any number of characters that aren't the break character
  const match_expression = repeated_char + "[^" + break_char + "]+" + repeated_char

  regex_obj[match_expression] = repeated_char
  return regex_obj

}

const replaceSecondaryQuotes = (text,regex_obj,correct_char,open_close) => {

  let re = new RegExp(Object.keys(regex_obj)[0],"gim")

  while ((match = re.exec(text)) != null){

    let substring1
    let substring2

    if (open_close == "open") {
      substring1 = text.substring(match.index+1,match.index+match[0].length) // don't edit the first one
      substring2 = substring1.replace(Object.values(regex_obj)[0],correct_char)
    }
    else if (open_close == "close") {
      substring1 = text.substring(match.index,match.index+match[0].length-1) // don't edit the last one
      substring2 = substring1.replace(Object.values(regex_obj)[0],correct_char)
    }

    text = text.replace(substring1,substring2)

  }
  
  return text

} 


// Define regex and replacements for various punctuation characters + use our function to fix them
const fixPunctuation = (text) => {

  const regex_obj_apostrophe = {"[a-z]\'[a-z]": "\'"}   // define regex to catch then desired replacement char
  const regex_obj_dash = {" - ": "-"}                   // TODO: fix for any space char
  const regex_obj_emdash = {"—": "—"}   
  const regex_obj_ellipsis = {"\.\.\.": "\.\.\."}

  text = findReplace(text,regex_obj_apostrophe,"’")
  text = findReplace(text,regex_obj_dash,"–")
  text = findReplace(text,regex_obj_emdash," – ")     // replace em-dash with spaced en-dash
  text = findReplace(text,regex_obj_ellipsis,"…")

  return text

}

// Master function to apply everything to a source + language
const fixAll = (source,language) => {

  const correct_open = languages[language].correct_open
  const correct_close = languages[language].correct_close
  const secondary_open = languages[language].secondary_open
  const secondary_close = languages[language].secondary_close

  const open_quote_errors = generateRegex(opening_error_positions,correct_open)
  const close_quote_errors = generateRegex(closing_error_positions,correct_close)
  const secondary_open_regex = generateSecondaryRegex(correct_open,correct_close)
  const secondary_close_regex = generateSecondaryRegex(correct_close,correct_open)

  fixed_text = findReplace(source,open_quote_errors,correct_open)
  fixed_text = findReplace(fixed_text,close_quote_errors,correct_close)
  fixed_text = replaceSecondaryQuotes(fixed_text,secondary_open_regex,secondary_open,"open")
  fixed_text = replaceSecondaryQuotes(fixed_text,secondary_close_regex,secondary_close,"close")
  fixed_text = fixPunctuation(fixed_text)

  return fixed_text

}

module.exports.fixAll = fixAll