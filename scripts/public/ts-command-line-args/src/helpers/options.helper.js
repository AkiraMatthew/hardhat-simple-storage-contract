"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBoolean = exports.mapDefinitionDetails = exports.addOptions = exports.generateTableFooter = exports.getOptionFooterSection = exports.getOptionSections = void 0;
function getOptionSections(options) {
    return (options.optionSections || [
        { header: options.optionsHeaderText || 'Options', headerLevel: options.optionsHeaderLevel || 2 },
    ]);
}
exports.getOptionSections = getOptionSections;
function getOptionFooterSection(optionList, options) {
    const optionsFooter = generateTableFooter(optionList, options);
    if (optionsFooter != null) {
        console.log(`Adding footer: ${optionsFooter}`);
        return [{ content: optionsFooter }];
    }
    return [];
}
exports.getOptionFooterSection = getOptionFooterSection;
function generateTableFooter(optionList, options) {
    if (options.addOptionalDefaultExplanatoryFooter != true || options.displayOptionalAndDefault != true) {
        return undefined;
    }
    const optionalProps = optionList.some((option) => option.optional === true);
    const defaultProps = optionList.some((option) => option.defaultOption === true);
    if (optionalProps || defaultProps) {
        const footerValues = [
            optionalProps != null ? '(O) = optional' : undefined,
            defaultProps != null ? '(D) = default option' : null,
        ];
        return footerValues.filter((v) => v != null).join(', ');
    }
    return undefined;
}
exports.generateTableFooter = generateTableFooter;
function addOptions(content, optionList, options) {
    optionList = optionList.map((option) => mapDefinitionDetails(option, options));
    return { ...content, optionList };
}
exports.addOptions = addOptions;
/**
 * adds default or optional modifiers to type label or description
 * @param option
 */
function mapDefinitionDetails(definition, options) {
    definition = mapOptionTypeLabel(definition, options);
    definition = mapOptionDescription(definition, options);
    return definition;
}
exports.mapDefinitionDetails = mapDefinitionDetails;
function mapOptionDescription(definition, options) {
    if (options.prependParamOptionsToDescription !== true || isBoolean(definition)) {
        return definition;
    }
    definition.description = definition.description || '';
    if (definition.defaultOption) {
        definition.description = `Default Option. ${definition.description}`;
    }
    if (definition.optional === true) {
        definition.description = `Optional. ${definition.description}`;
    }
    if (definition.defaultValue != null) {
        definition.description = `Defaults to ${JSON.stringify(definition.defaultValue)}. ${definition.description}`;
    }
    return definition;
}
function mapOptionTypeLabel(definition, options) {
    if (options.displayOptionalAndDefault !== true || isBoolean(definition)) {
        return definition;
    }
    definition.typeLabel = definition.typeLabel || getTypeLabel(definition);
    if (definition.defaultOption) {
        definition.typeLabel = `${definition.typeLabel} (D)`;
    }
    if (definition.optional === true) {
        definition.typeLabel = `${definition.typeLabel} (O)`;
    }
    return definition;
}
function getTypeLabel(definition) {
    let typeLabel = definition.type ? definition.type.name.toLowerCase() : 'string';
    const multiple = definition.multiple || definition.lazyMultiple ? '[]' : '';
    if (typeLabel) {
        typeLabel = typeLabel === 'boolean' ? '' : `{underline ${typeLabel}${multiple}}`;
    }
    return typeLabel;
}
function isBoolean(option) {
    return option.type.name === 'Boolean';
}
exports.isBoolean = isBoolean;
