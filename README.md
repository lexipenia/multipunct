# multipunct

## Running from the command line

Place any `.txt` files to process in the same folder as the `multipunct.js` script. You can then run from the command line as follows:

`node multipunct.js <filename.txt> EN`

The final argument corresponds to the language ruleset to be applied.

For example, to run on the test text provided with French rules:

`node multipunct.js test_text.txt FR`

## The `fixAll` function

The main function `fixAll(source,language)`, which corrects a source text in a specific language, can be imported from the core module.

## Languages

| Code | Language |
|---|---|
| EN | English |
| FR | French |
| IT | Italian |
| ES | Spanish |
| DE | German |
| PL | Polish |
| LT | Lithuanian |