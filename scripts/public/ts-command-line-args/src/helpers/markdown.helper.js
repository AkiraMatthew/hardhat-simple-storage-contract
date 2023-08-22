"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadArgConfig = exports.generateUsageGuides = exports.getType = exports.createOptionRow = exports.createHeading = exports.createOptionsSection = exports.createOptionsSections = exports.createSectionTable = exports.createSectionContent = exports.createSection = exports.createUsageGuide = void 0;
const path_1 = require("path");
const command_line_helper_1 = require("./command-line.helper");
const options_helper_1 = require("./options.helper");
const string_helper_1 = require("./string.helper");
function createUsageGuide(config) {
    const options = config.parseOptions || {};
    const headerSections = options.headerContentSections || [];
    const footerSections = options.footerContentSections || [];
    return [
        ...headerSections.filter(filterMarkdownSections).map((section) => createSection(section, config)),
        ...createOptionsSections(config.arguments, options),
        ...footerSections.filter(filterMarkdownSections).map((section) => createSection(section, config)),
    ].join('\n');
}
exports.createUsageGuide = createUsageGuide;
function filterMarkdownSections(section) {
    return section.includeIn == null || section.includeIn === 'both' || section.includeIn === 'markdown';
}
function createSection(section, config) {
    return `
${createHeading(section, config.parseOptions?.defaultSectionHeaderLevel || 1)}
${createSectionContent(section)}
`;
}
exports.createSection = createSection;
function createSectionContent(section) {
    if (typeof section.content === 'string') {
        return (0, string_helper_1.convertChalkStringToMarkdown)(section.content);
    }
    if (Array.isArray(section.content)) {
        if (section.content.every((content) => typeof content === 'string')) {
            return section.content.map(string_helper_1.convertChalkStringToMarkdown).join('\n');
        }
        else if (section.content.every((content) => typeof content === 'object')) {
            return createSectionTable(section.content);
        }
    }
    return '';
}
exports.createSectionContent = createSectionContent;
function createSectionTable(rows) {
    if (rows.length === 0) {
        return ``;
    }
    const cellKeys = Object.keys(rows[0]);
    return `
|${cellKeys.map((key) => ` ${key} `).join('|')}|
|${cellKeys.map(() => '-').join('|')}|
${rows.map((row) => `| ${cellKeys.map((key) => (0, string_helper_1.convertChalkStringToMarkdown)(row[key])).join(' | ')} |`).join('\n')}`;
}
exports.createSectionTable = createSectionTable;
function createOptionsSections(cliArguments, options) {
    const normalisedConfig = (0, command_line_helper_1.normaliseConfig)(cliArguments);
    const optionList = (0, command_line_helper_1.createCommandLineConfig)(normalisedConfig);
    if (optionList.length === 0) {
        return [];
    }
    return (0, options_helper_1.getOptionSections)(options).map((section) => createOptionsSection(optionList, section, options));
}
exports.createOptionsSections = createOptionsSections;
function createOptionsSection(optionList, content, options) {
    optionList = optionList.filter((option) => filterOptions(option, content.group));
    const anyAlias = optionList.some((option) => option.alias != null);
    const anyDescription = optionList.some((option) => option.description != null);
    const footer = (0, options_helper_1.generateTableFooter)(optionList, options);
    return `
${createHeading(content, 2)}
| Argument |${anyAlias ? ' Alias |' : ''} Type |${anyDescription ? ' Description |' : ''}
|-|${anyAlias ? '-|' : ''}-|${anyDescription ? '-|' : ''}
${optionList
        .map((option) => (0, options_helper_1.mapDefinitionDetails)(option, options))
        .map((option) => createOptionRow(option, anyAlias, anyDescription))
        .join('\n')}
${footer != null ? footer + '\n' : ''}`;
}
exports.createOptionsSection = createOptionsSection;
function filterOptions(option, groups) {
    return (groups == null ||
        (typeof groups === 'string' && (groups === option.group || (groups === '_none' && option.group == null))) ||
        (Array.isArray(groups) &&
            (groups.some((group) => group === option.group) ||
                (groups.some((group) => group === '_none') && option.group == null))));
}
function createHeading(section, defaultLevel) {
    if (section.header == null) {
        return '';
    }
    const headingLevel = Array.from({ length: section.headerLevel || defaultLevel })
        .map(() => `#`)
        .join('');
    return `${headingLevel} ${section.header}
`;
}
exports.createHeading = createHeading;
function createOptionRow(option, includeAlias = true, includeDescription = true) {
    const alias = includeAlias ? ` ${option.alias == null ? '' : '**' + option.alias + '** '}|` : ``;
    const description = includeDescription
        ? ` ${option.description == null ? '' : (0, string_helper_1.convertChalkStringToMarkdown)(option.description) + ' '}|`
        : ``;
    return `| **${option.name}** |${alias} ${getType(option)}|${description}`;
}
exports.createOptionRow = createOptionRow;
function getType(option) {
    if (option.typeLabel) {
        return `${(0, string_helper_1.convertChalkStringToMarkdown)(option.typeLabel)} `;
    }
    //TODO: add modifiers
    const type = option.type ? option.type.name.toLowerCase() : 'string';
    const multiple = option.multiple || option.lazyMultiple ? '[]' : '';
    return `${type}${multiple} `;
}
exports.getType = getType;
function generateUsageGuides(args) {
    if (args.jsFile == null) {
        console.log(`No jsFile defined for usage guide generation. See 'write-markdown -h' for details on generating usage guides.`);
        return undefined;
    }
    function mapJsImports(imports, jsFile) {
        return [...imports, ...args.configImportName.map((importName) => ({ jsFile, importName }))];
    }
    return args.jsFile
        .reduce(mapJsImports, new Array())
        .map(({ jsFile, importName }) => loadArgConfig(jsFile, importName))
        .filter(isDefined)
        .map(createUsageGuide);
}
exports.generateUsageGuides = generateUsageGuides;
function loadArgConfig(jsFile, importName) {
    const jsPath = (0, path_1.join)(process.cwd(), jsFile);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jsExports = require(jsPath);
    const argConfig = jsExports[importName];
    if (argConfig == null) {
        console.warn(`Could not import ArgumentConfig named '${importName}' from jsFile '${jsFile}'`);
        return undefined;
    }
    return argConfig;
}
exports.loadArgConfig = loadArgConfig;
function isDefined(value) {
    return value != null;
}
