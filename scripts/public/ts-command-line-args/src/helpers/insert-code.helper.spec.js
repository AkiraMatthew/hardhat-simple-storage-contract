"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const write_markdown_constants_1 = require("../write-markdown.constants");
const insert_code_helper_1 = require("./insert-code.helper");
const originalFs = __importStar(require("fs"));
const ts_mocking_bird_1 = require("@morgan-stanley/ts-mocking-bird");
const os_1 = require("os");
const path_1 = require("path");
const beforeInsertionLine = `beforeInsertion`;
const afterInsertionLine = `afterInsertion`;
const insertLineOne = `insertLineOne`;
const insertLineTwo = `insertLineTwo`;
let insertBelowToken = `${write_markdown_constants_1.insertCodeBelowDefault} file="someFile.ts" )`;
const sampleDirName = `sample/dirname`;
// eslint-disable-next-line @typescript-eslint/no-var-requires
jest.mock('fs', () => require('@morgan-stanley/ts-mocking-bird').proxyJestModule(require.resolve('fs')));
describe(`(${insert_code_helper_1.insertCode.name}) insert-code.helper`, () => {
    let mockedFs;
    let insertCodeFromContent;
    beforeEach(() => {
        insertBelowToken = `${write_markdown_constants_1.insertCodeBelowDefault} file="someFile.ts" )`;
        insertCodeFromContent = `${insertLineOne}${os_1.EOL}${insertLineTwo}`;
        mockedFs = ts_mocking_bird_1.Mock.create().setup((0, ts_mocking_bird_1.setupFunction)('readFile', ((_path, callback) => {
            callback(null, Buffer.from(insertCodeFromContent));
        })), (0, ts_mocking_bird_1.setupFunction)('writeFile', ((_path, _data, callback) => {
            callback();
        })));
        (0, ts_mocking_bird_1.registerMock)(originalFs, mockedFs.mock);
    });
    afterEach(() => {
        (0, ts_mocking_bird_1.reset)(originalFs);
    });
    function createOptions(partialOptions) {
        return {
            insertCodeBelow: write_markdown_constants_1.insertCodeBelowDefault,
            insertCodeAbove: write_markdown_constants_1.insertCodeAboveDefault,
            copyCodeBelow: write_markdown_constants_1.copyCodeBelowDefault,
            copyCodeAbove: write_markdown_constants_1.copyCodeAboveDefault,
            removeDoubleBlankLines: false,
            ...partialOptions,
        };
    }
    it(`should return original string when no insertBelow token provided`, async () => {
        const fileContent = [beforeInsertionLine, afterInsertionLine].join('\n');
        const result = await (0, insert_code_helper_1.insertCode)({ fileContent, filePath: `${sampleDirName}/'originalFilePath.ts` }, createOptions({ insertCodeAbove: undefined, insertCodeBelow: undefined }));
        expect(result).toEqual(fileContent);
    });
    it(`should return original string when no insertBelow token found`, async () => {
        const fileContent = [beforeInsertionLine, afterInsertionLine].join('\n');
        const result = await (0, insert_code_helper_1.insertCode)({ fileContent, filePath: `${sampleDirName}/'originalFilePath.ts` }, createOptions());
        expect(result).toEqual(fileContent);
    });
    it(`should insert all file content with default tokens`, async () => {
        const fileContent = [beforeInsertionLine, insertBelowToken, write_markdown_constants_1.insertCodeAboveDefault, afterInsertionLine].join('\n');
        const result = await (0, insert_code_helper_1.insertCode)({ fileContent, filePath: `${sampleDirName}/'originalFilePath.ts` }, createOptions());
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.join)(sampleDirName, 'someFile.ts'), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        const expectedContent = [
            beforeInsertionLine,
            insertBelowToken,
            insertLineOne,
            insertLineTwo,
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        expect(result).toEqual(expectedContent);
    });
    it(`should insert all file content when passed a file path`, async () => {
        const fileContent = [beforeInsertionLine, insertBelowToken, write_markdown_constants_1.insertCodeAboveDefault, afterInsertionLine].join('\n');
        mockedFs.setupFunction('readFile', ((path, callback) => {
            if (path.indexOf(`originalFilePath.ts`) > 0) {
                callback(null, Buffer.from(fileContent));
            }
            else {
                callback(null, Buffer.from(`${insertLineOne}${os_1.EOL}${insertLineTwo}`));
            }
        }));
        const result = await (0, insert_code_helper_1.insertCode)(`${sampleDirName}/originalFilePath.ts`, createOptions());
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.resolve)(sampleDirName, 'someFile.ts'), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.resolve)(`${sampleDirName}/originalFilePath.ts`), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        expect(mockedFs
            .withFunction('writeFile')
            .withParameters((0, path_1.resolve)(`${sampleDirName}/originalFilePath.ts`), (0, ts_mocking_bird_1.any)(), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        const expectedContent = [
            beforeInsertionLine,
            insertBelowToken,
            insertLineOne,
            insertLineTwo,
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        expect(result).toEqual(expectedContent);
    });
    it(`should remove double blank lines if set to true`, async () => {
        const fileContent = [
            beforeInsertionLine,
            insertBelowToken,
            '',
            '',
            '',
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        const result = await (0, insert_code_helper_1.insertCode)({ fileContent, filePath: `${sampleDirName}/'originalFilePath.ts` }, createOptions({ removeDoubleBlankLines: true }));
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.join)(sampleDirName, 'someFile.ts'), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        const expectedContent = [
            beforeInsertionLine,
            insertBelowToken,
            insertLineOne,
            insertLineTwo,
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        expect(result).toEqual(expectedContent);
    });
    it(`should insert all file content with custom tokens`, async () => {
        const fileContent = [
            beforeInsertionLine,
            `customInsertAfterToken file="somePath"`,
            `customInsertBeforeToken`,
            afterInsertionLine,
        ].join('\n');
        const result = await (0, insert_code_helper_1.insertCode)({ fileContent, filePath: `${sampleDirName}/'originalFilePath.ts` }, createOptions({ insertCodeBelow: `customInsertAfterToken`, insertCodeAbove: `customInsertBeforeToken` }));
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.join)(sampleDirName, 'somePath'), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        const expectedContent = [
            beforeInsertionLine,
            `customInsertAfterToken file="somePath"`,
            insertLineOne,
            insertLineTwo,
            `customInsertBeforeToken`,
            afterInsertionLine,
        ].join('\n');
        expect(result).toEqual(expectedContent);
    });
    it(`should remove end of file if no insertAbove token`, async () => {
        const fileContent = [beforeInsertionLine, insertBelowToken, afterInsertionLine].join('\n');
        const result = await (0, insert_code_helper_1.insertCode)({ fileContent, filePath: `${sampleDirName}/'originalFilePath.ts` }, createOptions());
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.join)(sampleDirName, 'someFile.ts'), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        const expectedContent = [beforeInsertionLine, insertBelowToken, insertLineOne, insertLineTwo].join('\n');
        expect(result).toEqual(expectedContent);
    });
    it(`should throw error if insertBelow token provided with no file`, async () => {
        const fileContent = [
            beforeInsertionLine,
            write_markdown_constants_1.insertCodeBelowDefault,
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        let error;
        try {
            await (0, insert_code_helper_1.insertCode)({ fileContent, filePath: `${sampleDirName}/'originalFilePath.ts` }, createOptions());
        }
        catch (e) {
            error = e;
        }
        expect(error?.message).toEqual(`insert code token ([//]: # (ts-command-line-args_write-markdown_insertCodeBelow) found in file but file path not specified (file="relativePath/from/markdown/toFile.whatever")`);
    });
    it(`should should only insert file content between copyAbove and copyBelow tokens`, async () => {
        insertCodeFromContent = [
            'randomFirstLine',
            write_markdown_constants_1.copyCodeBelowDefault,
            insertLineOne,
            write_markdown_constants_1.copyCodeAboveDefault,
            insertLineTwo,
        ].join('\n');
        const fileContent = [beforeInsertionLine, insertBelowToken, write_markdown_constants_1.insertCodeAboveDefault, afterInsertionLine].join('\n');
        const result = await (0, insert_code_helper_1.insertCode)({ fileContent, filePath: `${sampleDirName}/'originalFilePath.ts` }, createOptions());
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.join)(sampleDirName, 'someFile.ts'), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        const expectedContent = [
            beforeInsertionLine,
            insertBelowToken,
            insertLineOne,
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        expect(result).toEqual(expectedContent);
    });
    it(`should insert selected snippet when snippet defined`, async () => {
        insertCodeFromContent = [
            'randomFirstLine',
            `// ts-command-line-args_write-markdown_copyCodeBelow expectedSnippet`,
            insertLineOne,
            write_markdown_constants_1.copyCodeAboveDefault,
            write_markdown_constants_1.copyCodeBelowDefault,
            insertLineTwo,
            write_markdown_constants_1.copyCodeAboveDefault,
        ].join('\n');
        insertBelowToken = `${write_markdown_constants_1.insertCodeBelowDefault} file="someFile.ts" snippetName="expectedSnippet" )`;
        const fileContent = [beforeInsertionLine, insertBelowToken, write_markdown_constants_1.insertCodeAboveDefault, afterInsertionLine].join('\n');
        const result = await (0, insert_code_helper_1.insertCode)({ fileContent, filePath: `${sampleDirName}/'originalFilePath.ts` }, createOptions());
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.join)(sampleDirName, 'someFile.ts'), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        const expectedContent = [
            beforeInsertionLine,
            insertBelowToken,
            insertLineOne,
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        expect(result).toEqual(expectedContent);
    });
    it(`should should only insert file content after copyBelow token`, async () => {
        const fileContent = [beforeInsertionLine, insertBelowToken, write_markdown_constants_1.insertCodeAboveDefault, afterInsertionLine].join('\n');
        const fileLines = [insertLineOne, write_markdown_constants_1.copyCodeBelowDefault, insertLineTwo];
        mockedFs.setupFunction('readFile', ((_path, callback) => {
            callback(null, Buffer.from(fileLines.join(os_1.EOL)));
        }));
        const result = await (0, insert_code_helper_1.insertCode)({ fileContent, filePath: `${sampleDirName}/'originalFilePath.ts` }, createOptions());
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.join)(sampleDirName, 'someFile.ts'), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        const expectedContent = [
            beforeInsertionLine,
            insertBelowToken,
            insertLineTwo,
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        expect(result).toEqual(expectedContent);
    });
    it(`should should only insert file content above copyAbove token`, async () => {
        const fileContent = [beforeInsertionLine, insertBelowToken, write_markdown_constants_1.insertCodeAboveDefault, afterInsertionLine].join('\n');
        const fileLines = [insertLineOne, write_markdown_constants_1.copyCodeAboveDefault, insertLineTwo];
        mockedFs.setupFunction('readFile', ((_path, callback) => {
            callback(null, Buffer.from(fileLines.join(os_1.EOL)));
        }));
        const result = await (0, insert_code_helper_1.insertCode)({ fileContent, filePath: `${sampleDirName}/'originalFilePath.ts` }, createOptions());
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.join)(sampleDirName, 'someFile.ts'), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        const expectedContent = [
            beforeInsertionLine,
            insertBelowToken,
            insertLineOne,
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        expect(result).toEqual(expectedContent);
    });
    it(`should insert a code comment`, async () => {
        const fileContent = [
            beforeInsertionLine,
            `${write_markdown_constants_1.insertCodeBelowDefault} file="someFile.ts" codeComment )`,
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        const result = await (0, insert_code_helper_1.insertCode)({ fileContent, filePath: `${sampleDirName}/'originalFilePath.ts` }, createOptions());
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.join)(sampleDirName, 'someFile.ts'), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        const expectedContent = [
            beforeInsertionLine,
            `${write_markdown_constants_1.insertCodeBelowDefault} file="someFile.ts" codeComment )`,
            '```',
            insertLineOne,
            insertLineTwo,
            '```',
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        expect(result).toEqual(expectedContent);
    });
    it(`should insert a name code comment`, async () => {
        const fileContent = [
            beforeInsertionLine,
            `${write_markdown_constants_1.insertCodeBelowDefault} file="someFile.ts" codeComment="ts" )`,
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        const result = await (0, insert_code_helper_1.insertCode)({ fileContent, filePath: `${sampleDirName}/'originalFilePath.ts` }, createOptions());
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.join)(sampleDirName, 'someFile.ts'), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        const expectedContent = [
            beforeInsertionLine,
            `${write_markdown_constants_1.insertCodeBelowDefault} file="someFile.ts" codeComment="ts" )`,
            '```ts',
            insertLineOne,
            insertLineTwo,
            '```',
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        expect(result).toEqual(expectedContent);
    });
    it(`should insert content from 2 different files in 2 different locations`, async () => {
        const inBetweenFilesLine = 'in  between files';
        const fileContent = [
            beforeInsertionLine,
            `${write_markdown_constants_1.insertCodeBelowDefault} file="insertFileOne.ts" )`,
            write_markdown_constants_1.insertCodeAboveDefault,
            inBetweenFilesLine,
            `${write_markdown_constants_1.insertCodeBelowDefault} file="insertFileTwo.ts" )`,
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        mockedFs.setupFunction('readFile', ((path, callback) => {
            if (path.indexOf(`originalFilePath.ts`) > 0) {
                callback(null, Buffer.from(fileContent));
            }
            else if (path.indexOf(`insertFileOne.ts`) > 0) {
                callback(null, Buffer.from(`fileOneLineOne${os_1.EOL}fileOneLineTwo`));
            }
            else if (path.indexOf(`insertFileTwo.ts`) > 0) {
                callback(null, Buffer.from(`fileTwoLineOne${os_1.EOL}fileTwoLineTwo`));
            }
            else {
                throw new Error(`unknown file path: ${path}`);
            }
        }));
        const result = await (0, insert_code_helper_1.insertCode)(`${sampleDirName}/'originalFilePath.ts`, createOptions());
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.resolve)(sampleDirName, 'insertFileOne.ts'), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.resolve)(sampleDirName, 'insertFileTwo.ts'), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        expect(mockedFs.withFunction('readFile').withParameters((0, path_1.resolve)(`${sampleDirName}/'originalFilePath.ts`), (0, ts_mocking_bird_1.any)())).wasCalledOnce();
        const expectedContent = [
            beforeInsertionLine,
            `${write_markdown_constants_1.insertCodeBelowDefault} file="insertFileOne.ts" )`,
            `fileOneLineOne`,
            `fileOneLineTwo`,
            write_markdown_constants_1.insertCodeAboveDefault,
            inBetweenFilesLine,
            `${write_markdown_constants_1.insertCodeBelowDefault} file="insertFileTwo.ts" )`,
            `fileTwoLineOne`,
            `fileTwoLineTwo`,
            write_markdown_constants_1.insertCodeAboveDefault,
            afterInsertionLine,
        ].join('\n');
        expect(result).toEqual(expectedContent);
    });
});
