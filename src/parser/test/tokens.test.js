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

        const expectedResult = [
            {
              id: 'f0217f',
              index: 0,
              function: 'digitalRead',
              args: ['9'],
              location: { line: 9, startCol: 12, endCol: 26 },
            },
            {
              id: '25656e',
              index: 1,
              function: 'digitalRead',
              args: ['10'],
              location: { line: 9, startCol: 29, endCol: 44 },
            },
            {
              id: '4a0c74',
              index: 0,
              function: 'analogRead',
              args: ['A0'],
              location: { line: 11, startCol: 12, endCol: 26 },
            },
            {
              id: 'd8f6cb',
              index: 0,
              function: 'Serialprint',
              args: ['a'],
              location: { line: 12, startCol: 4, endCol: 19 },
            },
            {
              id: '1b9fe0',
              index: 1,
              function: 'Serialprint',
              args: ['b'],
              location: { line: 12, startCol: 21, endCol: 36 },
            },
          ];

        expect(expectedResult).toEqual(result);
    });

    it ('Extracting comments wfrom ex1.ino', ()=>{
        const file = loadFile ('ex1.ino');
        const result = parserComments.parse(file);
        console.log(result);
    
        
        expect(1).toEqual(1);
    });
});