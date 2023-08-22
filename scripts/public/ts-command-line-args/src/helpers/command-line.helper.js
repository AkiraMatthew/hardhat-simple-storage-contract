"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooleanValues = exports.removeBooleanValues = exports.mergeConfig = exports.normaliseConfig = exports.createCommandLineConfig = void 0;
const options_helper_1 = require("./options.helper");
function createCommandLineConfig(config) {
    return Object.keys(config).map((key) => {
        const argConfig = config[key];
        const definition = typeof argConfig === 'object' ? argConfig : { type: argConfig };
        return { name: key, ...definition };
    });
}
exports.createCommandLineConfig = createCommandLineConfig;
function normaliseConfig(config) {
    Object.keys(config).forEach((key) => {
        const argConfig = config[key];
        config[key] = typeof argConfig === 'object' ? argConfig : { type: argConfig };
    });
    return config;
}
exports.normaliseConfig = normaliseConfig;
function mergeConfig(parsedConfig, parsedConfigWithoutDefaults, fileContent, options, jsonPath) {
    const configPath = jsonPath ? parsedConfig[jsonPath] : undefined;
    const configFromFile = resolveConfigFromFile(fileContent, configPath);
    if (configFromFile == null) {
        throw new Error(`Could not resolve config object from specified file and path`);
    }
    return { ...parsedConfig, ...applyTypeConversion(configFromFile, options), ...parsedConfigWithoutDefaults };
}
exports.mergeConfig = mergeConfig;
function resolveConfigFromFile(configfromFile, configPath) {
    if (configPath == null || configPath == '') {
        return configfromFile;
    }
    const paths = configPath.split('.');
    const key = paths.shift();
    if (key == null) {
        return configfromFile;
    }
    const config = configfromFile[key];
    return resolveConfigFromFile(config, paths.join('.'));
}
function applyTypeConversion(configfromFile, options) {
    const transformedParams = {};
    Object.keys(configfromFile).forEach((prop) => {
        const key = prop;
        const argumentOptions = options[key];
        if (argumentOptions == null) {
            return;
        }
        const fileValue = configfromFile[key];
        if (argumentOptions.multiple || argumentOptions.lazyMultiple) {
            const fileArrayValue = Array.isArray(fileValue) ? fileValue : [fileValue];
            transformedParams[key] = fileArrayValue.map((arrayValue) => convertType(arrayValue, argumentOptions));
        }
        else {
            transformedParams[key] = convertType(fileValue, argumentOptions);
        }
    });
    return transformedParams;
}
function convertType(value, propOptions) {
    if (propOptions.type.name === 'Boolean') {
        switch (value) {
            case 'true':
                return propOptions.type(true);
            case 'false':
                return propOptions.type(false);
        }
    }
    return propOptions.type(value);
}
const argNameRegExp = /^-{1,2}(\w+)(=(\w+))?$/;
const booleanValue = ['1', '0', 'true', 'false'];
/**
 * commandLineArgs throws an error if we pass aa value for a boolean arg as follows:
 * myCommand -a=true --booleanArg=false --otherArg true
 * this function removes these booleans so as to avoid errors from commandLineArgs
 * @param args
 * @param config
 */
function removeBooleanValues(args, config) {
    function removeBooleanArgs(argsAndLastValue, arg) {
        const { argOptions, argValue } = getParamConfig(arg, config);
        const lastOption = argsAndLastValue.lastOption;
        if (lastOption != null && (0, options_helper_1.isBoolean)(lastOption) && booleanValue.some((boolValue) => boolValue === arg)) {
            const args = argsAndLastValue.args.concat();
            args.pop();
            return { args };
        }
        else if (argOptions != null && (0, options_helper_1.isBoolean)(argOptions) && argValue != null) {
            return { args: argsAndLastValue.args };
        }
        else {
            return { args: [...argsAndLastValue.args, arg], lastOption: argOptions };
        }
    }
    return args.reduce(removeBooleanArgs, { args: [] }).args;
}
exports.removeBooleanValues = removeBooleanValues;
/**
 * Gets the values of any boolean arguments that were specified on the command line with a value
 * These arguments were removed by removeBooleanValues
 * @param args
 * @param config
 */
function getBooleanValues(args, config) {
    function getBooleanValues(argsAndLastOption, arg) {
        const { argOptions, argName, argValue } = getParamConfig(arg, config);
        const lastOption = argsAndLastOption.lastOption;
        if (argOptions != null && (0, options_helper_1.isBoolean)(argOptions) && argValue != null && argName != null) {
            argsAndLastOption.partial[argName] = convertType(argValue, argOptions);
        }
        else if (argsAndLastOption.lastName != null &&
            lastOption != null &&
            (0, options_helper_1.isBoolean)(lastOption) &&
            booleanValue.some((boolValue) => boolValue === arg)) {
            argsAndLastOption.partial[argsAndLastOption.lastName] = convertType(arg, lastOption);
        }
        return { partial: argsAndLastOption.partial, lastName: argName, lastOption: argOptions };
    }
    return args.reduce(getBooleanValues, { partial: {} }).partial;
}
exports.getBooleanValues = getBooleanValues;
function getParamConfig(arg, config) {
    const regExpResult = argNameRegExp.exec(arg);
    if (regExpResult == null) {
        return {};
    }
    const nameOrAlias = regExpResult[1];
    for (const argName in config) {
        const argConfig = config[argName];
        if (argName === nameOrAlias || argConfig.alias === nameOrAlias) {
            return { argOptions: argConfig, argName, argValue: regExpResult[3] };
        }
    }
    return {};
}
