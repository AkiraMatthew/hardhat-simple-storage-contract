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
const ts_mocking_bird_1 = require("@morgan-stanley/ts-mocking-bird");
const parse_1 = require("./parse");
const fsImport = __importStar(require("fs"));
const pathImport = __importStar(require("path"));
const helpersImport = __importStar(require("./helpers"));
jest.mock('fs', () => require('@morgan-stanley/ts-mocking-bird').proxyJestModule(require.resolve('fs')));
jest.mock('path', () => require('@morgan-stanley/ts-mocking-bird').proxyJestModule(require.resolve('path')));
jest.mock('./helpers', () => require('@morgan-stanley/ts-mocking-bird').proxyJestModule(require.resolve('./helpers')));
describe('parse', () => {
    let mockConsole;
    let mockProcess;
    let mockFs;
    let mockPath;
    let mockHelper;
    function getConfig() {
        return {
            requiredString: String,
            defaultedString: { type: String, defaultValue: defaultFromOption },
            optionalString: { type: String, optional: true },
            requiredBoolean: { type: Boolean, alias: 'b' },
            optionalBoolean: { type: Boolean, optional: true },
            requiredArray: { type: String, alias: 'o', multiple: true },
            optionalArray: { type: String, lazyMultiple: true, optional: true },
        };
    }
    function getHelpConfig() {
        return {
            ...getConfig(),
            optionalHelpArg: { type: Boolean, optional: true, alias: 'h', description: 'This help guide' },
        };
    }
    function getAllOptionalHelpConfig() {
        return {
            path: { type: String, optional: true },
            optionalHelpArg: { type: Boolean, optional: true, alias: 'h', description: 'This help guide' },
        };
    }
    function getFileConfig() {
        return {
            ...getConfig(),
            optionalFileArg: { type: String, optional: true },
            optionalPathArg: { type: String, optional: true },
        };
    }
    const requiredStringValue = 'requiredStringValue';
    const requiredString = ['--requiredString', requiredStringValue];
    const defaultedStringValue = 'defaultedStringValue';
    const defaultFromOption = 'defaultFromOption';
    const defaultedString = ['--defaultedString', defaultedStringValue];
    const optionalStringValue = 'optionalStringValue';
    const optionalString = ['--optionalString', optionalStringValue];
    const requiredBoolean = ['--requiredBoolean'];
    const optionalBoolean = ['--optionalBoolean'];
    const requiredArrayValue = ['requiredArray'];
    const requiredArray = ['--requiredArray', ...requiredArrayValue];
    const optionalArrayValue = ['optionalArrayValueOne', 'optionalArrayValueTwo'];
    const optionalArray = ['--optionalArray', optionalArrayValue[0], '--optionalArray', optionalArrayValue[1]];
    const optionalHelpArg = ['--optionalHelpArg'];
    const optionalFileArg = ['--optionalFileArg=configFilePath'];
    const optionalPathArg = ['--optionalPathArg=configPath'];
    const unknownStringValue = 'unknownStringValue';
    const unknownString = ['--unknownOption', unknownStringValue];
    let jsonFromFile;
    (0, ts_mocking_bird_1.replacePropertiesBeforeEach)(() => {
        jsonFromFile = {
            requiredString: 'requiredStringFromFile',
            defaultedString: 'defaultedStringFromFile',
        };
        const configFromFile = ts_mocking_bird_1.Mock.create().setup((0, ts_mocking_bird_1.setupFunction)('toString', () => JSON.stringify(jsonFromFile))).mock;
        (0, ts_mocking_bird_1.addMatchers)();
        mockConsole = ts_mocking_bird_1.Mock.create().setup((0, ts_mocking_bird_1.setupFunction)('error'), (0, ts_mocking_bird_1.setupFunction)('log'));
        mockProcess = ts_mocking_bird_1.Mock.create().setup((0, ts_mocking_bird_1.setupFunction)('exit'));
        mockFs = ts_mocking_bird_1.Mock.create().setup((0, ts_mocking_bird_1.setupFunction)('readFileSync', () => configFromFile));
        mockPath = ts_mocking_bird_1.Mock.create().setup((0, ts_mocking_bird_1.setupFunction)('resolve', (path) => `${path}_resolved`));
        mockHelper = ts_mocking_bird_1.Mock.create().setup((0, ts_mocking_bird_1.setupFunction)('mergeConfig'));
        (0, ts_mocking_bird_1.registerMock)(fsImport, mockFs.mock);
        (0, ts_mocking_bird_1.registerMock)(pathImport, mockPath.mock);
        (0, ts_mocking_bird_1.registerMock)(helpersImport, mockHelper.mock);
        return [{ package: process, mocks: mockProcess.mock }];
    });
    afterEach(() => {
        (0, ts_mocking_bird_1.reset)(fsImport);
        (0, ts_mocking_bird_1.reset)(pathImport);
        (0, ts_mocking_bird_1.reset)(helpersImport);
    });
    describe('should create the expected argument value object', () => {
        it('when all options are populated', () => {
            const result = (0, parse_1.parse)(getConfig(), {
                logger: mockConsole.mock,
                argv: [
                    ...requiredString,
                    ...defaultedString,
                    ...optionalString,
                    ...requiredBoolean,
                    ...optionalBoolean,
                    ...requiredArray,
                    ...optionalArray,
                ],
            });
            expect(result).toEqual({
                requiredString: requiredStringValue,
                defaultedString: defaultedStringValue,
                optionalString: optionalStringValue,
                requiredArray: requiredArrayValue,
                optionalArray: optionalArrayValue,
                requiredBoolean: true,
                optionalBoolean: true,
            });
        });
        it('when optional values are ommitted', () => {
            const result = (0, parse_1.parse)(getHelpConfig(), {
                logger: mockConsole.mock,
                argv: [...requiredString, ...requiredArray],
                helpArg: 'optionalHelpArg',
            });
            expect(result).toEqual({
                requiredString: requiredStringValue,
                defaultedString: defaultFromOption,
                requiredArray: requiredArrayValue,
                requiredBoolean: false,
            });
            expect(mockConsole.withFunction('log')).wasNotCalled();
            expect(mockConsole.withFunction('error')).wasNotCalled();
        });
        it('should not load config from file when not specified', () => {
            const result = (0, parse_1.parse)(getFileConfig(), {
                logger: mockConsole.mock,
                argv: [...requiredString, ...requiredArray],
                loadFromFileArg: 'optionalFileArg',
            });
            expect(result).toEqual({
                requiredString: requiredStringValue,
                defaultedString: defaultFromOption,
                requiredArray: requiredArrayValue,
                requiredBoolean: false,
            });
            expect(mockPath.withFunction('resolve')).wasNotCalled();
            expect(mockFs.withFunction('readFileSync')).wasNotCalled();
        });
        it('should load config from file when specified', () => {
            const mergedConfig = {
                requiredString: 'requiredStringFromFile',
                defaultedString: 'defaultedStringFromFile',
                requiredArray: requiredArrayValue,
                requiredBoolean: false,
            };
            mockHelper.setupFunction('mergeConfig', () => mergedConfig);
            const argv = [...requiredString, ...requiredArray, ...optionalFileArg, ...optionalPathArg];
            const result = (0, parse_1.parse)(getFileConfig(), {
                logger: mockConsole.mock,
                argv,
                loadFromFileArg: 'optionalFileArg',
                loadFromFileJsonPathArg: 'optionalPathArg',
            });
            expect(result).toEqual(mergedConfig);
            const expectedParsedArgs = {
                defaultedString: 'defaultFromOption',
                requiredString: 'requiredStringValue',
                requiredArray: ['requiredArray'],
                optionalFileArg: 'configFilePath',
                optionalPathArg: 'configPath',
            };
            const expectedParsedArgsWithoutDefaults = {
                requiredString: 'requiredStringValue',
                requiredArray: ['requiredArray'],
                optionalFileArg: 'configFilePath',
                optionalPathArg: 'configPath',
            };
            expect(mockPath.withFunction('resolve').withParameters('configFilePath')).wasCalledOnce();
            expect(mockFs.withFunction('readFileSync').withParameters('configFilePath_resolved')).wasCalledOnce();
            expect(mockHelper
                .withFunction('mergeConfig')
                .withParametersEqualTo(expectedParsedArgs, expectedParsedArgsWithoutDefaults, jsonFromFile, (0, ts_mocking_bird_1.any)(), 'optionalPathArg')).wasCalledOnce();
        });
        const overrideBooleanTests = [
            {
                args: ['--requiredBoolean'],
                configFromFile: { requiredBoolean: false },
                expected: { requiredBoolean: true },
            },
            {
                args: ['--requiredBoolean', '--optionalPathArg=optionalPath'],
                configFromFile: { requiredBoolean: false },
                expected: { requiredBoolean: true, optionalPathArg: 'optionalPath' },
            },
            {
                args: ['--requiredBoolean=false'],
                configFromFile: { requiredBoolean: true },
                expected: { requiredBoolean: false },
            },
            {
                args: ['--requiredBoolean=true'],
                configFromFile: { requiredBoolean: false },
                expected: { requiredBoolean: true },
            },
            {
                args: ['--requiredBoolean', 'false'],
                configFromFile: { requiredBoolean: true },
                expected: { requiredBoolean: false },
            },
            {
                args: ['--requiredBoolean', 'true'],
                configFromFile: { requiredBoolean: false },
                expected: { requiredBoolean: true },
            },
            { args: ['-b'], configFromFile: { requiredBoolean: false }, expected: { requiredBoolean: true } },
            { args: ['-b=false'], configFromFile: { requiredBoolean: true }, expected: { requiredBoolean: false } },
            { args: ['-b=true'], configFromFile: { requiredBoolean: false }, expected: { requiredBoolean: true } },
            { args: ['-b', 'false'], configFromFile: { requiredBoolean: true }, expected: { requiredBoolean: false } },
            { args: ['-b', 'true'], configFromFile: { requiredBoolean: false }, expected: { requiredBoolean: true } },
        ];
        overrideBooleanTests.forEach((test) => {
            it(`should correctly override boolean value in config file when ${test.args.join()} passed on command line`, () => {
                jsonFromFile = test.configFromFile;
                const mergedConfig = {
                    requiredString: 'requiredStringFromFile',
                    defaultedString: 'defaultedStringFromFile',
                    requiredArray: requiredArrayValue,
                    ...test.expected,
                };
                mockHelper.setupFunction('mergeConfig', () => mergedConfig);
                const argv = [...optionalFileArg, ...test.args];
                (0, parse_1.parse)(getFileConfig(), {
                    logger: mockConsole.mock,
                    argv,
                    loadFromFileArg: 'optionalFileArg',
                    loadFromFileJsonPathArg: 'optionalPathArg',
                });
                const expectedParsedArgs = {
                    defaultedString: 'defaultFromOption',
                    optionalFileArg: 'configFilePath',
                    ...test.expected,
                };
                const expectedParsedArgsWithoutDefaults = {
                    optionalFileArg: 'configFilePath',
                    ...test.expected,
                };
                expect(mockHelper
                    .withFunction('mergeConfig')
                    .withParametersEqualTo(expectedParsedArgs, expectedParsedArgsWithoutDefaults, jsonFromFile, (0, ts_mocking_bird_1.any)(), 'optionalPathArg')).wasCalledOnce();
            });
        });
    });
    it(`should print errors and exit process when required arguments are missing and no baseCommand or help arg are passed`, () => {
        const result = (0, parse_1.parse)(getConfig(), {
            logger: mockConsole.mock,
            argv: [...defaultedString],
        });
        expect(mockConsole
            .withFunction('error')
            .withParameters(`Required parameter 'requiredString' was not passed. Please provide a value by passing '--requiredString=passedValue' in command line arguments`)).wasCalledOnce();
        expect(mockConsole
            .withFunction('error')
            .withParameters(`Required parameter 'requiredArray' was not passed. Please provide a value by passing '--requiredArray=passedValue' or '-o passedValue' in command line arguments`)).wasCalledOnce();
        expect(mockConsole.withFunction('log')).wasNotCalled();
        expect(mockProcess.withFunction('exit')).wasCalledOnce();
        expect(result).toBeUndefined();
    });
    it(`should print errors and exit process when required arguments are missing and baseCommand is present`, () => {
        const result = (0, parse_1.parse)(getConfig(), {
            logger: mockConsole.mock,
            argv: [...defaultedString],
            baseCommand: 'runMyScript',
        });
        expect(mockConsole
            .withFunction('error')
            .withParameters(`Required parameter 'requiredString' was not passed. Please provide a value by running 'runMyScript --requiredString=passedValue'`)).wasCalledOnce();
        expect(mockConsole
            .withFunction('error')
            .withParameters(`Required parameter 'requiredArray' was not passed. Please provide a value by running 'runMyScript --requiredArray=passedValue' or 'runMyScript -o passedValue'`)).wasCalledOnce();
        expect(mockConsole.withFunction('log')).wasNotCalled();
        expect(mockProcess.withFunction('exit')).wasCalledOnce();
        expect(result).toBeUndefined();
    });
    it(`should print errors and exit process when required arguments are missing and help arg is present`, () => {
        const mockExitFunction = ts_mocking_bird_1.Mock.create().setup((0, ts_mocking_bird_1.setupFunction)('processExitCode', () => 5));
        const result = (0, parse_1.parse)(getHelpConfig(), {
            logger: mockConsole.mock,
            argv: [...defaultedString],
            helpArg: 'optionalHelpArg',
            processExitCode: mockExitFunction.mock.processExitCode,
        });
        expect(mockConsole
            .withFunction('error')
            .withParameters(`Required parameter 'requiredString' was not passed. Please provide a value by passing '--requiredString=passedValue' in command line arguments`)).wasCalledOnce();
        expect(mockConsole
            .withFunction('error')
            .withParameters(`Required parameter 'requiredArray' was not passed. Please provide a value by passing '--requiredArray=passedValue' or '-o passedValue' in command line arguments`)).wasCalledOnce();
        expect(mockConsole.withFunction('log').withParameters(`To view the help guide pass '-h'`)).wasCalledOnce();
        expect(mockExitFunction
            .withFunction('processExitCode')
            .withParametersEqualTo('missingArgs', { defaultedString: 'defaultedStringValue', requiredBoolean: false }, [
            { name: 'requiredString', type: String },
            { name: 'requiredArray', type: String, alias: 'o', multiple: true },
        ])).wasCalledOnce();
        expect(mockProcess.withFunction('exit').withParameters(5)).wasCalledOnce();
        expect(result).toBeUndefined();
    });
    it(`should print errors and exit process when required arguments are missing and help arg and baseCommand are present`, () => {
        const result = (0, parse_1.parse)(getHelpConfig(), {
            logger: mockConsole.mock,
            argv: [...defaultedString],
            baseCommand: 'runMyScript',
            helpArg: 'optionalHelpArg',
        });
        expect(mockConsole
            .withFunction('error')
            .withParameters(`Required parameter 'requiredString' was not passed. Please provide a value by running 'runMyScript --requiredString=passedValue'`)).wasCalledOnce();
        expect(mockConsole
            .withFunction('error')
            .withParameters(`Required parameter 'requiredArray' was not passed. Please provide a value by running 'runMyScript --requiredArray=passedValue' or 'runMyScript -o passedValue'`)).wasCalledOnce();
        expect(mockConsole.withFunction('log').withParameters(`To view the help guide run 'runMyScript -h'`)).wasCalledOnce();
        expect(mockProcess.withFunction('exit').withParameters()).wasCalledOnce();
        expect(result).toBeUndefined();
    });
    it(`should print warnings, return an incomplete result when arguments are missing and exitProcess is false`, () => {
        const result = (0, parse_1.parse)(getConfig(), {
            logger: mockConsole.mock,
            argv: [...defaultedString],
        }, false);
        expect(mockConsole
            .withFunction('error')
            .withParameters(`Required parameter 'requiredString' was not passed. Please provide a value by passing '--requiredString=passedValue' in command line arguments`)).wasCalledOnce();
        expect(mockConsole
            .withFunction('error')
            .withParameters(`Required parameter 'requiredArray' was not passed. Please provide a value by passing '--requiredArray=passedValue' or '-o passedValue' in command line arguments`)).wasCalledOnce();
        expect(mockProcess.withFunction('exit')).wasNotCalled();
        expect(result).toEqual({
            defaultedString: defaultedStringValue,
            requiredBoolean: false,
        });
    });
    describe(`should print help messages`, () => {
        it(`and exit when help arg is passed`, () => {
            const mockExitFunction = ts_mocking_bird_1.Mock.create().setup((0, ts_mocking_bird_1.setupFunction)('processExitCode', () => 5));
            const result = (0, parse_1.parse)(getAllOptionalHelpConfig(), {
                logger: mockConsole.mock,
                argv: [...optionalHelpArg],
                helpArg: 'optionalHelpArg',
                headerContentSections: [
                    { header: 'Header', content: 'Header Content' },
                    { header: 'Header both', content: 'Header Content both', includeIn: 'both' },
                    { header: 'Header cli', content: 'Header Content cli', includeIn: 'cli' },
                    { header: 'Header markdown', content: 'Header markdown markdown', includeIn: 'markdown' },
                ],
                footerContentSections: [
                    { header: 'Footer', content: 'Footer Content' },
                    { header: 'Footer both', content: 'Footer Content both', includeIn: 'both' },
                    { header: 'Footer cli', content: 'Footer Content cli', includeIn: 'cli' },
                    { header: 'Footer markdown', content: 'Footer markdown markdown', includeIn: 'markdown' },
                ],
                processExitCode: mockExitFunction.mock.processExitCode,
            });
            function verifyHelpContent(content) {
                let currentIndex = 0;
                function verifyNextContent(segment) {
                    const segmentIndex = content.indexOf(segment);
                    if (segmentIndex < 0) {
                        return `Expected help content '${segment}' not found`;
                    }
                    if (segmentIndex < currentIndex) {
                        return `Help content '${segment}' not in expected place`;
                    }
                    currentIndex = segmentIndex;
                    return true;
                }
                const helpContentSegments = [
                    'Header',
                    'Header Content',
                    'Header both',
                    'Header Content both',
                    'Header cli',
                    'Header Content cli',
                    '-h',
                    '--optionalHelpArg',
                    'This help guide',
                    'Footer',
                    'Footer Content',
                    'Footer both',
                    'Footer Content both',
                    'Footer cli',
                    'Footer Content cli',
                ];
                const failures = helpContentSegments.map(verifyNextContent).filter((result) => result !== true);
                if (content.indexOf('markdown') >= 0) {
                    failures.push(`'markdown' found in usage guide`);
                }
                if (failures.length > 0) {
                    return failures[0];
                }
                return true;
            }
            expect(result).toBeUndefined();
            expect(mockExitFunction
                .withFunction('processExitCode')
                .withParametersEqualTo('usageGuide', { optionalHelpArg: true }, [])).wasCalledOnce();
            expect(mockProcess.withFunction('exit').withParameters(5)).wasCalledOnce();
            expect(mockConsole.withFunction('error')).wasNotCalled();
            expect(mockConsole.withFunction('log').withParameters(verifyHelpContent)).wasCalledOnce();
        });
    });
    it(`it should print help messages and return partial arguments when help arg passed and exitProcess is false`, () => {
        const result = (0, parse_1.parse)(getHelpConfig(), {
            logger: mockConsole.mock,
            argv: [...defaultedString, ...optionalHelpArg],
            helpArg: 'optionalHelpArg',
            headerContentSections: [{ header: 'Header', content: 'Header Content' }],
            footerContentSections: [{ header: 'Footer', content: 'Footer Content' }],
        }, false);
        expect(result).toEqual({
            defaultedString: defaultedStringValue,
            optionalHelpArg: true,
            requiredBoolean: false,
        });
        expect(mockProcess.withFunction('exit')).wasNotCalled();
        expect(mockConsole.withFunction('log')).wasCalledOnce();
    });
    it(`it should not print help messages and return unknown arguments when stopAtFirstUnknown is true`, () => {
        const result = (0, parse_1.parse)(getConfig(), {
            logger: mockConsole.mock,
            argv: [...requiredString, ...requiredArray, ...unknownString],
            stopAtFirstUnknown: true,
        });
        expect(result).toEqual({
            requiredString: requiredStringValue,
            defaultedString: defaultFromOption,
            requiredBoolean: false,
            requiredArray: requiredArrayValue,
            _unknown: [...unknownString],
        });
        expect(mockProcess.withFunction('exit')).wasNotCalled();
        expect(mockConsole.withFunction('log')).wasNotCalled();
    });
    it(`it should not print help messages and return unknown arguments when stopAtFirstUnknown is true and using option groups`, () => {
        const result = (0, parse_1.parse)({
            group1Arg: { type: String, group: 'Group1' },
            group2Arg: { type: String, group: 'Group2' },
        }, {
            logger: mockConsole.mock,
            argv: ['--group1Arg', 'group1', '--group2Arg', 'group2', ...unknownString],
            stopAtFirstUnknown: true,
        });
        expect(result).toEqual({
            group1Arg: 'group1',
            group2Arg: 'group2',
            _unknown: [...unknownString],
        });
        expect(mockProcess.withFunction('exit')).wasNotCalled();
        expect(mockConsole.withFunction('log')).wasNotCalled();
    });
});
