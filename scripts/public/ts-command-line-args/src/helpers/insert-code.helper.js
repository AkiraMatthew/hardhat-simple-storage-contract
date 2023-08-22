"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCode = void 0;
const line_ending_helper_1 = require("./line-ending.helper");
const path_1 = require("path");
const util_1 = require("util");
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
const asyncReadFile = (0, util_1.promisify)(fs_1.readFile);
const asyncWriteFile = (0, util_1.promisify)(fs_1.writeFile);
/**
 * Loads content from other files and inserts it into the target file
 * @param input - if a string is provided the target file is loaded from that path AND saved to that path once content has been inserted. If a `FileDetails` object is provided the content is not saved when done.
 * @param partialOptions - optional. changes the default tokens
 */
async function insertCode(input, partialOptions) {
    const options = { removeDoubleBlankLines: false, ...partialOptions };
    let fileDetails;
    if (typeof input === 'string') {
        const filePath = (0, path_1.resolve)(input);
        console.log(`Loading existing file from '${chalk_1.default.blue(filePath)}'`);
        fileDetails = { filePath, fileContent: (await asyncReadFile(filePath)).toString() };
    }
    else {
        fileDetails = input;
    }
    const content = fileDetails.fileContent;
    const lineBreak = (0, line_ending_helper_1.findEscapeSequence)(content);
    let lines = (0, line_ending_helper_1.splitContent)(content);
    lines = await insertCodeImpl(fileDetails.filePath, lines, options, 0);
    if (options.removeDoubleBlankLines) {
        lines = lines.filter((line, index, lines) => (0, line_ending_helper_1.filterDoubleBlankLines)(line, index, lines));
    }
    const modifiedContent = lines.join(lineBreak);
    if (typeof input === 'string') {
        console.log(`Saving modified content to '${chalk_1.default.blue(fileDetails.filePath)}'`);
        await asyncWriteFile(fileDetails.filePath, modifiedContent);
    }
    return modifiedContent;
}
exports.insertCode = insertCode;
async function insertCodeImpl(filePath, lines, options, startLine) {
    const insertCodeBelow = options?.insertCodeBelow;
    const insertCodeAbove = options?.insertCodeAbove;
    if (insertCodeBelow == null) {
        return Promise.resolve(lines);
    }
    const insertCodeBelowResult = insertCodeBelow != null
        ? findIndex(lines, (line) => line.indexOf(insertCodeBelow) === 0, startLine)
        : undefined;
    if (insertCodeBelowResult == null) {
        return Promise.resolve(lines);
    }
    const insertCodeAboveResult = insertCodeAbove != null
        ? findIndex(lines, (line) => line.indexOf(insertCodeAbove) === 0, insertCodeBelowResult.lineIndex)
        : undefined;
    const linesFromFile = await loadLines(filePath, options, insertCodeBelowResult);
    const linesBefore = lines.slice(0, insertCodeBelowResult.lineIndex + 1);
    const linesAfter = insertCodeAboveResult != null ? lines.slice(insertCodeAboveResult.lineIndex) : [];
    lines = [...linesBefore, ...linesFromFile, ...linesAfter];
    return insertCodeAboveResult == null
        ? lines
        : insertCodeImpl(filePath, lines, options, insertCodeAboveResult.lineIndex);
}
const fileRegExp = /file="([^"]+)"/;
const codeCommentRegExp = /codeComment(="([^"]+)")?/; //https://regex101.com/r/3MVdBO/1
const snippetRegExp = /snippetName="([^"]+)"/;
async function loadLines(targetFilePath, options, result) {
    const partialPathResult = fileRegExp.exec(result.line);
    if (partialPathResult == null) {
        throw new Error(`insert code token (${options.insertCodeBelow}) found in file but file path not specified (file="relativePath/from/markdown/toFile.whatever")`);
    }
    const codeCommentResult = codeCommentRegExp.exec(result.line);
    const snippetResult = snippetRegExp.exec(result.line);
    const partialPath = partialPathResult[1];
    const filePath = (0, path_1.isAbsolute)(partialPath) ? partialPath : (0, path_1.join)((0, path_1.dirname)(targetFilePath), partialPathResult[1]);
    console.log(`Inserting code from '${chalk_1.default.blue(filePath)}' into '${chalk_1.default.blue(targetFilePath)}'`);
    const fileBuffer = await asyncReadFile(filePath);
    let contentLines = (0, line_ending_helper_1.splitContent)(fileBuffer.toString());
    const copyBelowMarker = options.copyCodeBelow;
    const copyAboveMarker = options.copyCodeAbove;
    const copyBelowIndex = copyBelowMarker != null ? contentLines.findIndex(findLine(copyBelowMarker, snippetResult?.[1])) : -1;
    const copyAboveIndex = copyAboveMarker != null
        ? contentLines.findIndex((line, index) => line.indexOf(copyAboveMarker) === 0 && index > copyBelowIndex)
        : -1;
    if (snippetResult != null && copyBelowIndex < 0) {
        throw new Error(`The copyCodeBelow marker '${options.copyCodeBelow}' was not found with the requested snippet: '${snippetResult[1]}'`);
    }
    contentLines = contentLines.slice(copyBelowIndex + 1, copyAboveIndex > 0 ? copyAboveIndex : undefined);
    if (codeCommentResult != null) {
        contentLines = ['```' + (codeCommentResult[2] ?? ''), ...contentLines, '```'];
    }
    return contentLines;
}
function findLine(copyBelowMarker, snippetName) {
    return (line) => {
        return line.indexOf(copyBelowMarker) === 0 && (snippetName == null || line.indexOf(snippetName) > 0);
    };
}
function findIndex(lines, predicate, startLine) {
    for (let lineIndex = startLine; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        if (predicate(line)) {
            return { lineIndex, line };
        }
    }
    return undefined;
}
