"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const command_line_args_1 = __importDefault(require("command-line-args"));
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const helpers_1 = require("./helpers");
const options_helper_1 = require("./helpers/options.helper");
const string_helper_1 = require("./helpers/string.helper");
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * parses command line arguments and returns an object with all the arguments in IF all required options passed
 * @param config the argument config. Required, used to determine what arguments are expected
 * @param options
 * @param exitProcess defaults to true. The process will exit if any required arguments are omitted
 * @param addCommandLineResults defaults to false. If passed an additional _commandLineResults object will be returned in the result
 * @returns
 */
function parse(config, options = {}, exitProcess = true, addCommandLineResults) {
    options = options || {};
    const argsWithBooleanValues = options.argv || process.argv.slice(2);
    const logger = options.logger || console;
    const normalisedConfig = (0, helpers_1.normaliseConfig)(config);
    options.argv = (0, helpers_1.removeBooleanValues)(argsWithBooleanValues, normalisedConfig);
    const optionList = (0, helpers_1.createCommandLineConfig)(normalisedConfig);
    let parsedArgs = (0, command_line_args_1.default)(optionList, options);
    if (parsedArgs['_all'] != null) {
        const unknown = parsedArgs['_unknown'];
        parsedArgs = parsedArgs['_all'];
        if (unknown) {
            parsedArgs['_unknown'] = unknown;
        }
    }
    const booleanValues = (0, helpers_1.getBooleanValues)(argsWithBooleanValues, normalisedConfig);
    parsedArgs = { ...parsedArgs, ...booleanValues };
    if (options.loadFromFileArg != null && parsedArgs[options.loadFromFileArg] != null) {
        const configFromFile = JSON.parse((0, fs_1.readFileSync)((0, path_1.resolve)(parsedArgs[options.loadFromFileArg])).toString());
        const parsedArgsWithoutDefaults = (0, command_line_args_1.default)(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        optionList.map(({ defaultValue, ...option }) => ({ ...option })), options);
        parsedArgs = (0, helpers_1.mergeConfig)(parsedArgs, { ...parsedArgsWithoutDefaults, ...booleanValues }, configFromFile, normalisedConfig, options.loadFromFileJsonPathArg);
    }
    const missingArgs = listMissingArgs(optionList, parsedArgs);
    if (options.helpArg != null && parsedArgs[options.helpArg]) {
        printHelpGuide(options, optionList, logger);
        if (exitProcess) {
            return process.exit(resolveExitCode(options, 'usageGuide', parsedArgs, missingArgs));
        }
    }
    else if (missingArgs.length > 0) {
        if (options.showHelpWhenArgsMissing) {
            const missingArgsHeader = typeof options.helpWhenArgMissingHeader === 'function'
                ? options.helpWhenArgMissingHeader(missingArgs)
                : options.helpWhenArgMissingHeader;
            const additionalHeaderSections = missingArgsHeader != null ? [missingArgsHeader] : [];
            printHelpGuide(options, optionList, logger, additionalHeaderSections);
        }
        else if (options.hideMissingArgMessages !== true) {
            printMissingArgErrors(missingArgs, logger, options.baseCommand);
            printUsageGuideMessage({ ...options, logger }, options.helpArg != null ? optionList.filter((option) => option.name === options.helpArg)[0] : undefined);
        }
    }
    const _commandLineResults = {
        missingArgs: missingArgs,
        printHelp: () => printHelpGuide(options, optionList, logger),
    };
    if (missingArgs.length > 0 && exitProcess) {
        process.exit(resolveExitCode(options, 'missingArgs', parsedArgs, missingArgs));
    }
    else {
        if (addCommandLineResults) {
            parsedArgs = { ...parsedArgs, _commandLineResults };
        }
        return parsedArgs;
    }
}
exports.parse = parse;
function resolveExitCode(options, reason, passedArgs, missingArgs) {
    switch (typeof options.processExitCode) {
        case 'number':
            return options.processExitCode;
        case 'function':
            return options.processExitCode(reason, passedArgs, missingArgs);
        default:
            return 0;
    }
}
function printHelpGuide(options, optionList, logger, additionalHeaderSections = []) {
    const sections = [
        ...additionalHeaderSections,
        ...(options.headerContentSections?.filter(filterCliSections) || []),
        ...(0, options_helper_1.getOptionSections)(options).map((option) => (0, options_helper_1.addOptions)(option, optionList, options)),
        ...(0, options_helper_1.getOptionFooterSection)(optionList, options),
        ...(options.footerContentSections?.filter(filterCliSections) || []),
    ];
    (0, helpers_1.visit)(sections, (value) => {
        switch (typeof value) {
            case 'string':
                return (0, string_helper_1.removeAdditionalFormatting)(value);
            default:
                return value;
        }
    });
    const usageGuide = (0, command_line_usage_1.default)(sections);
    logger.log(usageGuide);
}
function filterCliSections(section) {
    return section.includeIn == null || section.includeIn === 'both' || section.includeIn === 'cli';
}
function printMissingArgErrors(missingArgs, logger, baseCommand) {
    baseCommand = baseCommand ? `${baseCommand} ` : ``;
    missingArgs.forEach((config) => {
        const aliasMessage = config.alias != null ? ` or '${baseCommand}-${config.alias} passedValue'` : ``;
        const runCommand = baseCommand !== ''
            ? `running '${baseCommand}--${config.name}=passedValue'${aliasMessage}`
            : `passing '--${config.name}=passedValue'${aliasMessage} in command line arguments`;
        logger.error(`Required parameter '${config.name}' was not passed. Please provide a value by ${runCommand}`);
    });
}
function printUsageGuideMessage(options, helpParam) {
    if (helpParam != null) {
        const helpArg = helpParam.alias != null ? `-${helpParam.alias}` : `--${helpParam.name}`;
        const command = options.baseCommand != null ? `run '${options.baseCommand} ${helpArg}'` : `pass '${helpArg}'`;
        options.logger.log(`To view the help guide ${command}`);
    }
}
function listMissingArgs(commandLineConfig, parsedArgs) {
    return commandLineConfig
        .filter((config) => config.optional == null && parsedArgs[config.name] == null)
        .filter((config) => {
        if (config.type.name === 'Boolean') {
            parsedArgs[config.name] = false;
            return false;
        }
        return true;
    });
}
