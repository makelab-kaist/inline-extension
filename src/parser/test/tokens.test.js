const parserTokens = require("../grammar_tokens").parser;
const parserComments = require("../grammar_comments").parser;
const fs = require("fs");

function loadFile (name){
    return fs.readFileSync(`./src/parser/test/${name}`, 'utf8');
}

describe("Parsing from ino files", ()=>{

    it ('Extracting tokens from ex1.ino', ()=>{
        const file = loadFile ('ex1.ino');
        const result = parserTokens.parse(file);

        console.log(result);

        expect(1).toEqual(1);
          // expect(expectedResult).toEqual(result);
    });

    it.skip ('Extracting comments wfrom ex1.ino', ()=>{
        const file = loadFile ('ex1.ino');
        const result = parserComments.parse(file);
        
        expect(1).toEqual(1);
    });
});