"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-useless-escape */
const string_helper_1 = require("./string.helper");
describe('string.helper', () => {
    describe('convertChalkStringToMarkdown', () => {
        it('should remove unsupported chalk formatting', () => {
            expect((0, string_helper_1.convertChalkStringToMarkdown)(`some {underline modified underlined} text`)).toEqual(`some modified underlined text`);
        });
        it('should replace bold formatting', () => {
            expect((0, string_helper_1.convertChalkStringToMarkdown)(`some {bold modified bold} text`)).toEqual(`some **modified bold** text`);
        });
        it('should replace italic formatting', () => {
            expect((0, string_helper_1.convertChalkStringToMarkdown)(`some {italic modified italic} text`)).toEqual(`some *modified italic* text`);
        });
        it('should replace bold italic formatting', () => {
            expect((0, string_helper_1.convertChalkStringToMarkdown)(`some {bold.italic modified bold italic} text`)).toEqual(`some ***modified bold italic*** text`);
        });
        it('should replace italic bold formatting', () => {
            expect((0, string_helper_1.convertChalkStringToMarkdown)(`some {italic.bold modified italic bold} text`)).toEqual(`some ***modified italic bold*** text`);
        });
        it('should replace highlight formatting', () => {
            expect((0, string_helper_1.convertChalkStringToMarkdown)(`some {highlight modified highlighted} text`)).toEqual(`some \`modified highlighted\` text`);
        });
        it('should replace code formatting', () => {
            expect((0, string_helper_1.convertChalkStringToMarkdown)(`some {code modified code} text`)).toEqual(`some   
\`\`\`  
modified code  
\`\`\`  
 text`);
        });
        it('should replace code formatting with language', () => {
            expect((0, string_helper_1.convertChalkStringToMarkdown)(`some {code.typescript modified code} text`)).toEqual(`some   
\`\`\`typescript  
modified code  
\`\`\`  
 text`);
        });
        it('should add 2 blank spaces to new lines', () => {
            expect((0, string_helper_1.convertChalkStringToMarkdown)(`some text
over 2 lines`)).toEqual(`some text  
over 2 lines`);
        });
    });
    describe('removeAdditionalFormatting', () => {
        it('should leave existing chalk formatting', () => {
            expect((0, string_helper_1.removeAdditionalFormatting)(`some {underline modified underlined} text`)).toEqual(`some {underline modified underlined} text`);
        });
        it('should replace highlight modifier', () => {
            expect((0, string_helper_1.removeAdditionalFormatting)(`some {highlight modified highlighted} and {bold bold} text`)).toEqual(`some modified highlighted and {bold bold} text`);
        });
        it('should replace code modifier with curly braces', () => {
            expect((0, string_helper_1.removeAdditionalFormatting)(`some {code function()\{doSomething();\}} text`)).toEqual(`some function()\{doSomething();\} text`);
        });
        it('should replace code modifier with curly braces and new lines', () => {
            expect((0, string_helper_1.removeAdditionalFormatting)(`some {code function logMessage(message: string) \\{console.log(message);\\}} text`)).toEqual(`some function logMessage(message: string) \\{console.log(message);\\} text`);
        });
        it('should replace code modifier with language with curly braces and new lines', () => {
            expect((0, string_helper_1.removeAdditionalFormatting)(`some {code.typescript function logMessage(message: string) \\{console.log(message);\\}} text`)).toEqual(`some function logMessage(message: string) \\{console.log(message);\\} text`);
        });
    });
});
