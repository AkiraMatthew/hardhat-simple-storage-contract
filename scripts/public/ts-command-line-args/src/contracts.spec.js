"use strict";
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This file is just used for testing type checking at compile time using the // @ts-expect-error feature
 */
describe('contracts', () => {
    describe('ArgumentConfig', () => {
        describe('simple properties', () => {
            it('should allow object with sample values', () => {
                const sampleConfig = {
                    name: String,
                    age: Number,
                    member: Boolean,
                };
            });
            it('should allow an object with type option definitions', () => {
                const config = {
                    name: { type: String },
                    age: { type: Number },
                    member: { type: Boolean },
                };
            });
            it('should not allow missing properties', () => {
                // @ts-expect-error
                const config = {
                    name: String,
                    age: Number,
                };
            });
            it('sample values alone should not allow optional properties', () => {
                const config = {
                    // @ts-expect-error
                    name: String,
                    // @ts-expect-error
                    age: Number,
                    // @ts-expect-error
                    member: Boolean,
                };
            });
            it('should not allow arrays', () => {
                const config = {
                    // @ts-expect-error
                    name: String,
                    // @ts-expect-error
                    age: Number,
                    // @ts-expect-error
                    member: Boolean,
                };
            });
            it('should not allow wrong type constructor', () => {
                const configSample = {
                    // @ts-expect-error
                    name: Number,
                    age: Number,
                    member: Boolean,
                };
                const configTypeOption = {
                    // @ts-expect-error
                    name: { type: Number },
                    age: { type: Number },
                    member: { type: Boolean },
                };
            });
        });
        describe('complex properties', () => {
            it('should not allow object with sample values', () => {
                const config = {
                    // @ts-expect-error
                    optionalString: String,
                    // @ts-expect-error
                    requiredArray: String,
                    // @ts-expect-error
                    optionalArray: String,
                };
            });
            it('should allow an object with type option definitions', () => {
                const config = {
                    requiredStringOne: String,
                    requiredStringTwo: { type: String },
                    optionalString: { type: String, optional: true },
                    requiredArray: { type: String, multiple: true },
                    optionalArray: { type: String, lazyMultiple: true, optional: true },
                };
            });
            it('should not allow missing properties', () => {
                // @ts-expect-error
                const config = {
                    requiredStringOne: String,
                    requiredStringTwo: { type: String },
                    requiredArray: { type: String, multiple: true },
                    optionalArray: { type: String, multiple: true, optional: true },
                };
            });
            it('should not allow wrong type constructor', () => {
                const configTypeOption = {
                    // @ts-expect-error
                    requiredStringOne: Number,
                    // @ts-expect-error
                    requiredStringTwo: { type: Number },
                    optionalString: { type: String, optional: true },
                    requiredArray: { type: String, multiple: true },
                    optionalArray: { type: String, multiple: true, optional: true },
                };
            });
            it('should allow a complex type with an associated constructor', () => {
                const configTypeOption = {
                    complex: { type: (value) => (value ? { name: value } : undefined) },
                };
            });
        });
    });
});
