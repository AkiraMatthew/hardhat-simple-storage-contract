#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parse_1 = require("./parse");
const path_1 = require("path");
const fs_1 = require("fs");
const helpers_1 = require("./helpers");
const write_markdown_constants_1 = require("./write-markdown.constants");
const string_format_1 = __importDefault(require("string-format"));
const chalk_1 = __importDefault(require("chalk"));
async function writeMarkdown() {
    const args = (0, parse_1.parse)(write_markdown_constants_1.argumentConfig, write_markdown_constants_1.parseOptions);
    const markdownPath = (0, path_1.resolve)(args.markdownPath);
    console.log(`Loading existing file from '${chalk_1.default.blue(markdownPath)}'`);
    const markdownFileContent = (0, fs_1.readFileSync)(markdownPath).toString();
    const usageGuides = (0, helpers_1.generateUsageGuides)(args);
    let modifiedFileContent = markdownFileContent;
    if (usageGuides != null) {
        modifiedFileContent = (0, helpers_1.addContent)(markdownFileContent, usageGuides, args);
        if (!args.skipFooter) {
            modifiedFileContent = (0, helpers_1.addCommandLineArgsFooter)(modifiedFileContent);
        }
    }
    modifiedFileContent = await (0, helpers_1.insertCode)({ fileContent: modifiedFileContent, filePath: markdownPath }, args);
    const action = args.verify === true ? `verify` : `write`;
    const contentMatch = markdownFileContent === modifiedFileContent ? `match` : `nonMatch`;
    const relativePath = (0, path_1.relative)(process.cwd(), markdownPath);
    switch (`${action}_${contentMatch}`) {
        case 'verify_match':
            console.log(chalk_1.default.green(`'${relativePath}' content as expected. No update required.`));
            break;
        case 'verify_nonMatch':
            console.warn(chalk_1.default.yellow((0, string_format_1.default)(args.verifyMessage || `'${relativePath}' file out of date. Rerun write-markdown to update.`, {
                fileName: relativePath,
            })));
            return process.exit(1);
        case 'write_match':
            console.log(chalk_1.default.blue(`'${relativePath}' content not modified, not writing to file.`));
            break;
        case 'write_nonMatch':
            console.log(`Writing modified file to '${chalk_1.default.blue(relativePath)}'`);
            (0, fs_1.writeFileSync)(relativePath, modifiedFileContent);
            break;
    }
}
writeMarkdown();
