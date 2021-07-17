"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateError = exports.ValidationService = exports.ValidateParam = void 0;
var moment = require("moment");
var validator_1 = require("validator");
var assertNever_1 = require("../utils/assertNever");
var tsoa_route_1 = require("./tsoa-route");
// for backwards compatibility with custom templates
function ValidateParam(property, value, generatedModels, name, fieldErrors, parent, swaggerConfig) {
    if (name === void 0) { name = ''; }
    if (parent === void 0) { parent = ''; }
    return new ValidationService(generatedModels).ValidateParam(property, value, name, fieldErrors, parent, swaggerConfig);
}
exports.ValidateParam = ValidateParam;
var ValidationService = /** @class */ (function () {
    function ValidationService(models) {
        this.models = models;
    }
    ValidationService.prototype.ValidateParam = function (property, rawValue, name, fieldErrors, parent, minimalSwaggerConfig) {
        if (name === void 0) { name = ''; }
        if (parent === void 0) { parent = ''; }
        var value = rawValue;
        if (value === undefined) {
            if (property.default !== undefined) {
                value = property.default;
            }
            else if (property.required) {
                var message_1 = "'" + name + "' is required";
                if (property.validators) {
                    var validators_1 = property.validators;
                    Object.keys(validators_1).forEach(function (key) {
                        var errorMsg = validators_1[key].errorMsg;
                        if (key.startsWith('is') && errorMsg) {
                            message_1 = errorMsg;
                        }
                    });
                }
                fieldErrors[parent + name] = {
                    message: message_1,
                    value: value,
                };
                return;
            }
            else {
                return value;
            }
        }
        switch (property.dataType) {
            case 'string':
                return this.validateString(name, value, fieldErrors, property.validators, parent);
            case 'boolean':
                return this.validateBool(name, value, fieldErrors, property.validators, parent);
            case 'integer':
            case 'long':
                return this.validateInt(name, value, fieldErrors, property.validators, parent);
            case 'float':
            case 'double':
                return this.validateFloat(name, value, fieldErrors, property.validators, parent);
            case 'enum':
                return this.validateEnum(name, value, fieldErrors, property.enums, parent);
            case 'array':
                return this.validateArray(name, value, fieldErrors, minimalSwaggerConfig, property.array, property.validators, parent);
            case 'date':
                return this.validateDate(name, value, fieldErrors, property.validators, parent);
            case 'datetime':
                return this.validateDateTime(name, value, fieldErrors, property.validators, parent);
            case 'buffer':
                return this.validateBuffer(name, value);
            case 'union':
                return this.validateUnion(name, value, fieldErrors, minimalSwaggerConfig, property.subSchemas, parent);
            case 'intersection':
                return this.validateIntersection(name, value, fieldErrors, minimalSwaggerConfig, property.subSchemas, parent);
            case 'any':
                return value;
            case 'nestedObjectLiteral':
                return this.validateNestedObjectLiteral(name, value, fieldErrors, minimalSwaggerConfig, property.nestedProperties, property.additionalProperties, parent);
            default:
                if (property.ref) {
                    return this.validateModel({ name: name, value: value, modelDefinition: this.models[property.ref], fieldErrors: fieldErrors, parent: parent, minimalSwaggerConfig: minimalSwaggerConfig });
                }
                return value;
        }
    };
    ValidationService.prototype.validateNestedObjectLiteral = function (name, value, fieldErrors, swaggerConfig, nestedProperties, additionalProperties, parent) {
        var _this = this;
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            fieldErrors[parent + name] = {
                message: "invalid object",
                value: value,
            };
            return;
        }
        var previousErrors = Object.keys(fieldErrors).length;
        if (!nestedProperties) {
            throw new Error('internal tsoa error: ' +
                'the metadata that was generated should have had nested property schemas since it’s for a nested object,' +
                'however it did not. ' +
                'Please file an issue with tsoa at https://github.com/lukeautry/tsoa/issues');
        }
        var propHandling = swaggerConfig.noImplicitAdditionalProperties;
        if (propHandling !== 'ignore') {
            var excessProps = this.getExcessPropertiesFor({ dataType: 'refObject', properties: nestedProperties, additionalProperties: additionalProperties }, Object.keys(value), swaggerConfig);
            if (excessProps.length > 0) {
                if (propHandling === 'silently-remove-extras') {
                    excessProps.forEach(function (excessProp) {
                        delete value[excessProp];
                    });
                }
                if (propHandling === 'throw-on-extras') {
                    fieldErrors[parent + name] = {
                        message: "\"" + excessProps.join(',') + "\" is an excess property and therefore is not allowed",
                        value: excessProps.reduce(function (acc, propName) {
                            var _a;
                            return (__assign((_a = {}, _a[propName] = value[propName], _a), acc));
                        }, {}),
                    };
                }
            }
        }
        Object.keys(nestedProperties).forEach(function (key) {
            var validatedProp = _this.ValidateParam(nestedProperties[key], value[key], key, fieldErrors, parent + name + '.', swaggerConfig);
            if (validatedProp !== undefined) {
                value[key] = validatedProp;
            }
        });
        if (typeof additionalProperties === 'object' && typeof value === 'object') {
            var keys = Object.keys(value).filter(function (key) { return typeof nestedProperties[key] === 'undefined'; });
            keys.forEach(function (key) {
                var validatedProp = _this.ValidateParam(additionalProperties, value[key], key, fieldErrors, parent + name + '.', swaggerConfig);
                if (validatedProp !== undefined) {
                    value[key] = validatedProp;
                }
            });
        }
        if (Object.keys(fieldErrors).length > previousErrors) {
            return;
        }
        return value;
    };
    ValidationService.prototype.validateInt = function (name, value, fieldErrors, validators, parent) {
        if (parent === void 0) { parent = ''; }
        if (!validator_1.default.isInt(String(value))) {
            var message = "invalid integer number";
            if (validators) {
                if (validators.isInt && validators.isInt.errorMsg) {
                    message = validators.isInt.errorMsg;
                }
                if (validators.isLong && validators.isLong.errorMsg) {
                    message = validators.isLong.errorMsg;
                }
            }
            fieldErrors[parent + name] = {
                message: message,
                value: value,
            };
            return;
        }
        var numberValue = validator_1.default.toInt(String(value), 10);
        if (!validators) {
            return numberValue;
        }
        if (validators.minimum && validators.minimum.value !== undefined) {
            if (validators.minimum.value > numberValue) {
                fieldErrors[parent + name] = {
                    message: validators.minimum.errorMsg || "min " + validators.minimum.value,
                    value: value,
                };
                return;
            }
        }
        if (validators.maximum && validators.maximum.value !== undefined) {
            if (validators.maximum.value < numberValue) {
                fieldErrors[parent + name] = {
                    message: validators.maximum.errorMsg || "max " + validators.maximum.value,
                    value: value,
                };
                return;
            }
        }
        return numberValue;
    };
    ValidationService.prototype.validateFloat = function (name, value, fieldErrors, validators, parent) {
        if (parent === void 0) { parent = ''; }
        if (!validator_1.default.isFloat(String(value))) {
            var message = 'invalid float number';
            if (validators) {
                if (validators.isFloat && validators.isFloat.errorMsg) {
                    message = validators.isFloat.errorMsg;
                }
                if (validators.isDouble && validators.isDouble.errorMsg) {
                    message = validators.isDouble.errorMsg;
                }
            }
            fieldErrors[parent + name] = {
                message: message,
                value: value,
            };
            return;
        }
        var numberValue = validator_1.default.toFloat(String(value));
        if (!validators) {
            return numberValue;
        }
        if (validators.minimum && validators.minimum.value !== undefined) {
            if (validators.minimum.value > numberValue) {
                fieldErrors[parent + name] = {
                    message: validators.minimum.errorMsg || "min " + validators.minimum.value,
                    value: value,
                };
                return;
            }
        }
        if (validators.maximum && validators.maximum.value !== undefined) {
            if (validators.maximum.value < numberValue) {
                fieldErrors[parent + name] = {
                    message: validators.maximum.errorMsg || "max " + validators.maximum.value,
                    value: value,
                };
                return;
            }
        }
        return numberValue;
    };
    ValidationService.prototype.validateEnum = function (name, value, fieldErrors, members, parent) {
        if (parent === void 0) { parent = ''; }
        if (!members || members.length === 0) {
            fieldErrors[parent + name] = {
                message: 'no member',
                value: value,
            };
            return;
        }
        var enumMatchIndex = members.map(function (member) { return String(member); }).findIndex(function (member) { return validator_1.default.equals(member, String(value)); });
        if (enumMatchIndex === -1) {
            var membersInQuotes = members.map(function (member) { return (typeof member === 'string' ? "'" + member + "'" : String(member)); });
            fieldErrors[parent + name] = {
                message: "should be one of the following; [" + membersInQuotes.join(',') + "]",
                value: value,
            };
            return;
        }
        return members[enumMatchIndex];
    };
    ValidationService.prototype.validateDate = function (name, value, fieldErrors, validators, parent) {
        if (parent === void 0) { parent = ''; }
        var momentDate = moment(String(value), moment.ISO_8601, true);
        if (!momentDate.isValid()) {
            var message = validators && validators.isDate && validators.isDate.errorMsg ? validators.isDate.errorMsg : "invalid ISO 8601 date format, i.e. YYYY-MM-DD";
            fieldErrors[parent + name] = {
                message: message,
                value: value,
            };
            return;
        }
        var dateValue = new Date(String(value));
        if (!validators) {
            return dateValue;
        }
        if (validators.minDate && validators.minDate.value) {
            var minDate = new Date(validators.minDate.value);
            if (minDate.getTime() > dateValue.getTime()) {
                fieldErrors[parent + name] = {
                    message: validators.minDate.errorMsg || "minDate '" + validators.minDate.value + "'",
                    value: value,
                };
                return;
            }
        }
        if (validators.maxDate && validators.maxDate.value) {
            var maxDate = new Date(validators.maxDate.value);
            if (maxDate.getTime() < dateValue.getTime()) {
                fieldErrors[parent + name] = {
                    message: validators.maxDate.errorMsg || "maxDate '" + validators.maxDate.value + "'",
                    value: value,
                };
                return;
            }
        }
        return dateValue;
    };
    ValidationService.prototype.validateDateTime = function (name, value, fieldErrors, validators, parent) {
        if (parent === void 0) { parent = ''; }
        var momentDateTime = moment(String(value), moment.ISO_8601, true);
        if (!momentDateTime.isValid()) {
            var message = validators && validators.isDateTime && validators.isDateTime.errorMsg ? validators.isDateTime.errorMsg : "invalid ISO 8601 datetime format, i.e. YYYY-MM-DDTHH:mm:ss";
            fieldErrors[parent + name] = {
                message: message,
                value: value,
            };
            return;
        }
        var datetimeValue = new Date(String(value));
        if (!validators) {
            return datetimeValue;
        }
        if (validators.minDate && validators.minDate.value) {
            var minDate = new Date(validators.minDate.value);
            if (minDate.getTime() > datetimeValue.getTime()) {
                fieldErrors[parent + name] = {
                    message: validators.minDate.errorMsg || "minDate '" + validators.minDate.value + "'",
                    value: value,
                };
                return;
            }
        }
        if (validators.maxDate && validators.maxDate.value) {
            var maxDate = new Date(validators.maxDate.value);
            if (maxDate.getTime() < datetimeValue.getTime()) {
                fieldErrors[parent + name] = {
                    message: validators.maxDate.errorMsg || "maxDate '" + validators.maxDate.value + "'",
                    value: value,
                };
                return;
            }
        }
        return datetimeValue;
    };
    ValidationService.prototype.validateString = function (name, value, fieldErrors, validators, parent) {
        if (parent === void 0) { parent = ''; }
        if (typeof value !== 'string') {
            var message = validators && validators.isString && validators.isString.errorMsg ? validators.isString.errorMsg : "invalid string value";
            fieldErrors[parent + name] = {
                message: message,
                value: value,
            };
            return;
        }
        var stringValue = String(value);
        if (!validators) {
            return stringValue;
        }
        if (validators.minLength && validators.minLength.value !== undefined) {
            if (validators.minLength.value > stringValue.length) {
                fieldErrors[parent + name] = {
                    message: validators.minLength.errorMsg || "minLength " + validators.minLength.value,
                    value: value,
                };
                return;
            }
        }
        if (validators.maxLength && validators.maxLength.value !== undefined) {
            if (validators.maxLength.value < stringValue.length) {
                fieldErrors[parent + name] = {
                    message: validators.maxLength.errorMsg || "maxLength " + validators.maxLength.value,
                    value: value,
                };
                return;
            }
        }
        if (validators.pattern && validators.pattern.value) {
            if (!validator_1.default.matches(String(stringValue), validators.pattern.value)) {
                fieldErrors[parent + name] = {
                    message: validators.pattern.errorMsg || "Not match in '" + validators.pattern.value + "'",
                    value: value,
                };
                return;
            }
        }
        return stringValue;
    };
    ValidationService.prototype.validateBool = function (name, value, fieldErrors, validators, parent) {
        if (parent === void 0) { parent = ''; }
        if (value === undefined || value === null) {
            return false;
        }
        if (value === true || value === false) {
            return value;
        }
        if (String(value).toLowerCase() === 'true') {
            return true;
        }
        if (String(value).toLowerCase() === 'false') {
            return false;
        }
        var message = validators && validators.isArray && validators.isArray.errorMsg ? validators.isArray.errorMsg : "invalid boolean value";
        fieldErrors[parent + name] = {
            message: message,
            value: value,
        };
        return;
    };
    ValidationService.prototype.validateArray = function (name, value, fieldErrors, swaggerConfig, schema, validators, parent) {
        var _this = this;
        if (parent === void 0) { parent = ''; }
        if (!schema || value === undefined) {
            var message = validators && validators.isArray && validators.isArray.errorMsg ? validators.isArray.errorMsg : "invalid array";
            fieldErrors[parent + name] = {
                message: message,
                value: value,
            };
            return;
        }
        var arrayValue = [];
        var previousErrors = Object.keys(fieldErrors).length;
        if (Array.isArray(value)) {
            arrayValue = value.map(function (elementValue, index) {
                return _this.ValidateParam(schema, elementValue, "$" + index, fieldErrors, name + '.', swaggerConfig);
            });
        }
        else {
            arrayValue = [this.ValidateParam(schema, value, '$0', fieldErrors, name + '.', swaggerConfig)];
        }
        if (Object.keys(fieldErrors).length > previousErrors) {
            return;
        }
        if (!validators) {
            return arrayValue;
        }
        if (validators.minItems && validators.minItems.value) {
            if (validators.minItems.value > arrayValue.length) {
                fieldErrors[parent + name] = {
                    message: validators.minItems.errorMsg || "minItems " + validators.minItems.value,
                    value: value,
                };
                return;
            }
        }
        if (validators.maxItems && validators.maxItems.value) {
            if (validators.maxItems.value < arrayValue.length) {
                fieldErrors[parent + name] = {
                    message: validators.maxItems.errorMsg || "maxItems " + validators.maxItems.value,
                    value: value,
                };
                return;
            }
        }
        if (validators.uniqueItems) {
            var unique = arrayValue.some(function (elem, index, arr) {
                var indexOf = arr.indexOf(elem);
                return indexOf > -1 && indexOf !== index;
            });
            if (unique) {
                fieldErrors[parent + name] = {
                    message: validators.uniqueItems.errorMsg || "required unique array",
                    value: value,
                };
                return;
            }
        }
        return arrayValue;
    };
    ValidationService.prototype.validateBuffer = function (name, value) {
        return Buffer.from(value);
    };
    ValidationService.prototype.validateUnion = function (name, value, fieldErrors, swaggerConfig, subSchemas, parent) {
        var e_1, _a;
        if (parent === void 0) { parent = ''; }
        if (!subSchemas) {
            throw new Error('internal tsoa error: ' +
                'the metadata that was generated should have had sub schemas since it’s for a union, however it did not. ' +
                'Please file an issue with tsoa at https://github.com/lukeautry/tsoa/issues');
        }
        var subFieldErrors = [];
        try {
            for (var subSchemas_1 = __values(subSchemas), subSchemas_1_1 = subSchemas_1.next(); !subSchemas_1_1.done; subSchemas_1_1 = subSchemas_1.next()) {
                var subSchema = subSchemas_1_1.value;
                var subFieldError = {};
                var cleanValue = this.ValidateParam(subSchema, JSON.parse(JSON.stringify(value)), name, subFieldError, parent, swaggerConfig);
                subFieldErrors.push(subFieldError);
                if (Object.keys(subFieldError).length === 0) {
                    return cleanValue;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (subSchemas_1_1 && !subSchemas_1_1.done && (_a = subSchemas_1.return)) _a.call(subSchemas_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        fieldErrors[parent + name] = {
            message: "Could not match the union against any of the items. Issues: " + JSON.stringify(subFieldErrors),
            value: value,
        };
        return;
    };
    ValidationService.prototype.validateIntersection = function (name, value, fieldErrors, swaggerConfig, subSchemas, parent) {
        var _this = this;
        if (parent === void 0) { parent = ''; }
        if (!subSchemas) {
            throw new Error('internal tsoa error: ' +
                'the metadata that was generated should have had sub schemas since it’s for a intersection, however it did not. ' +
                'Please file an issue with tsoa at https://github.com/lukeautry/tsoa/issues');
        }
        var subFieldErrors = [];
        var cleanValues = {};
        subSchemas.forEach(function (subSchema) {
            var subFieldError = {};
            var cleanValue = _this.ValidateParam(subSchema, JSON.parse(JSON.stringify(value)), name, subFieldError, parent, { noImplicitAdditionalProperties: 'silently-remove-extras' });
            cleanValues = __assign(__assign({}, cleanValues), cleanValue);
            subFieldErrors.push(subFieldError);
        });
        var filtered = subFieldErrors.filter(function (subFieldError) { return Object.keys(subFieldError).length !== 0; });
        if (filtered.length > 0) {
            fieldErrors[parent + name] = {
                message: "Could not match the intersection against every type. Issues: " + JSON.stringify(filtered),
                value: value,
            };
            return;
        }
        var schemas = this.selfIntersectionExcludingCombinations(subSchemas.map(function (subSchema) { return _this.toModelLike(subSchema); }));
        var getRequiredPropError = function (schema) {
            var requiredPropError = {};
            _this.validateModel({
                name: name,
                value: JSON.parse(JSON.stringify(value)),
                modelDefinition: schema,
                fieldErrors: requiredPropError,
                minimalSwaggerConfig: {
                    noImplicitAdditionalProperties: 'ignore',
                },
            });
            return requiredPropError;
        };
        var schemasWithRequiredProps = schemas.filter(function (schema) { return Object.keys(getRequiredPropError(schema)).length === 0; });
        if (swaggerConfig.noImplicitAdditionalProperties === 'ignore') {
            return __assign(__assign({}, value), cleanValues);
        }
        if (swaggerConfig.noImplicitAdditionalProperties === 'silently-remove-extras') {
            if (schemasWithRequiredProps.length > 0) {
                return cleanValues;
            }
            else {
                fieldErrors[parent + name] = {
                    message: "Could not match intersection against any of the possible combinations: " + JSON.stringify(schemas.map(function (s) { return Object.keys(s.properties); })),
                    value: value,
                };
                return;
            }
        }
        if (schemasWithRequiredProps.length > 0 && schemasWithRequiredProps.some(function (schema) { return _this.getExcessPropertiesFor(schema, Object.keys(value), swaggerConfig).length === 0; })) {
            return cleanValues;
        }
        else {
            fieldErrors[parent + name] = {
                message: "Could not match intersection against any of the possible combinations: " + JSON.stringify(schemas.map(function (s) { return Object.keys(s.properties); })),
                value: value,
            };
            return;
        }
    };
    ValidationService.prototype.toModelLike = function (schema) {
        var _this = this;
        if (schema.ref) {
            var model = this.models[schema.ref];
            if (model.dataType === 'refObject') {
                return [model];
            }
            else if (model.dataType === 'refAlias') {
                return __spread(this.toModelLike(model.type));
            }
            else if (model.dataType === 'refEnum') {
                throw new Error("Can't transform an enum into a model like structure because it does not have properties.");
            }
            else {
                return assertNever_1.assertNever(model);
            }
        }
        else if (schema.nestedProperties) {
            return [{ dataType: 'refObject', properties: schema.nestedProperties, additionalProperties: schema.additionalProperties }];
        }
        else if (schema.subSchemas && schema.dataType === 'intersection') {
            var modelss = schema.subSchemas.map(function (subSchema) { return _this.toModelLike(subSchema); });
            return this.selfIntersectionExcludingCombinations(modelss);
        }
        else if (schema.subSchemas && schema.dataType === 'union') {
            var modelss = schema.subSchemas.map(function (subSchema) { return _this.toModelLike(subSchema); });
            return modelss.reduce(function (acc, models) { return __spread(acc, models); }, []);
        }
        else {
            // There are no properties to check for excess here.
            return [{ dataType: 'refObject', properties: {}, additionalProperties: false }];
        }
    };
    /**
     * combine all schemas once without backwards combinations ie
     * input: [[value1], [value2]] should be [[value1, value2]]
     * not [[value1, value2],[value2, value1]]
     * and
     * input: [[value1], [value2], [value3]] should be [
     *   [value1, value2, value3],
     *   [value1, value2],
     *   [value1, value3],
     *   [value2, value3]
     * ]
     * @param modelSchemass
     */
    ValidationService.prototype.selfIntersectionExcludingCombinations = function (modelSchemass) {
        var res = [];
        for (var outerIndex = 0; outerIndex < modelSchemass.length; outerIndex++) {
            var currentCollector = __assign({}, modelSchemass[outerIndex][0]);
            for (var innerIndex = outerIndex + 1; innerIndex < modelSchemass.length; innerIndex++) {
                currentCollector = __assign({}, this.intersectRefObjectModelSchemas([currentCollector], modelSchemass[innerIndex])[0]);
                if (innerIndex - outerIndex > 1) {
                    res.push(currentCollector);
                }
                var currentCombination = this.intersectRefObjectModelSchemas(modelSchemass[outerIndex], modelSchemass[innerIndex]);
                res.push.apply(res, __spread(currentCombination));
            }
        }
        return res;
    };
    ValidationService.prototype.intersectRefObjectModelSchemas = function (a, b) {
        var _this = this;
        return a.reduce(function (acc, aModel) { return __spread(acc, b.reduce(function (acc, bModel) { return __spread(acc, [_this.combineProperties(aModel, bModel)]); }, [])); }, []);
    };
    ValidationService.prototype.combineProperties = function (a, b) {
        return { dataType: 'refObject', properties: __assign(__assign({}, a.properties), b.properties), additionalProperties: a.additionalProperties || b.additionalProperties || false };
    };
    ValidationService.prototype.getExcessPropertiesFor = function (modelDefinition, properties, config) {
        var modelProperties = new Set(Object.keys(modelDefinition.properties));
        if (modelDefinition.additionalProperties) {
            return [];
        }
        else if (config.noImplicitAdditionalProperties === 'ignore') {
            return [];
        }
        else {
            return __spread(properties).filter(function (property) { return !modelProperties.has(property); });
        }
    };
    ValidationService.prototype.validateModel = function (input) {
        var _this = this;
        var name = input.name, value = input.value, modelDefinition = input.modelDefinition, fieldErrors = input.fieldErrors, _a = input.parent, parent = _a === void 0 ? '' : _a, swaggerConfig = input.minimalSwaggerConfig;
        var previousErrors = Object.keys(fieldErrors).length;
        if (modelDefinition) {
            if (modelDefinition.dataType === 'refEnum') {
                return this.validateEnum(name, value, fieldErrors, modelDefinition.enums, parent);
            }
            if (modelDefinition.dataType === 'refAlias') {
                return this.ValidateParam(modelDefinition.type, value, name, fieldErrors, parent, swaggerConfig);
            }
            var fieldPath_1 = parent + name;
            if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                fieldErrors[fieldPath_1] = {
                    message: "invalid object",
                    value: value,
                };
                return;
            }
            var properties = modelDefinition.properties || {};
            var keysOnPropertiesModelDefinition_1 = new Set(Object.keys(properties));
            var allPropertiesOnData_1 = new Set(Object.keys(value));
            Object.entries(properties).forEach(function (_a) {
                var _b = __read(_a, 2), key = _b[0], property = _b[1];
                var validatedParam = _this.ValidateParam(property, value[key], key, fieldErrors, fieldPath_1 + '.', swaggerConfig);
                if (validatedParam !== undefined) {
                    value[key] = validatedParam;
                }
            });
            var isAnExcessProperty_1 = function (objectKeyThatMightBeExcess) {
                return allPropertiesOnData_1.has(objectKeyThatMightBeExcess) && !keysOnPropertiesModelDefinition_1.has(objectKeyThatMightBeExcess);
            };
            var additionalProperties_1 = modelDefinition.additionalProperties;
            if (additionalProperties_1 === true || tsoa_route_1.isDefaultForAdditionalPropertiesAllowed(additionalProperties_1)) {
                // then don't validate any of the additional properties
            }
            else if (additionalProperties_1 === false) {
                Object.keys(value).forEach(function (key) {
                    if (isAnExcessProperty_1(key)) {
                        if (swaggerConfig.noImplicitAdditionalProperties === 'throw-on-extras') {
                            fieldErrors[fieldPath_1 + "." + key] = {
                                message: "\"" + key + "\" is an excess property and therefore is not allowed",
                                value: key,
                            };
                        }
                        else if (swaggerConfig.noImplicitAdditionalProperties === 'silently-remove-extras') {
                            delete value[key];
                        }
                        else if (swaggerConfig.noImplicitAdditionalProperties === 'ignore') {
                            // then it's okay to have additionalProperties
                        }
                        else {
                            assertNever_1.assertNever(swaggerConfig.noImplicitAdditionalProperties);
                        }
                    }
                });
            }
            else {
                Object.keys(value).forEach(function (key) {
                    if (isAnExcessProperty_1(key)) {
                        var validatedValue = _this.ValidateParam(additionalProperties_1, value[key], key, fieldErrors, fieldPath_1 + '.', swaggerConfig);
                        if (validatedValue !== undefined) {
                            value[key] = validatedValue;
                        }
                        else {
                            fieldErrors[fieldPath_1 + "." + key] = {
                                message: "No matching model found in additionalProperties to validate " + key,
                                value: key,
                            };
                        }
                    }
                });
            }
        }
        if (Object.keys(fieldErrors).length > previousErrors) {
            return;
        }
        return value;
    };
    return ValidationService;
}());
exports.ValidationService = ValidationService;
var ValidateError = /** @class */ (function (_super) {
    __extends(ValidateError, _super);
    function ValidateError(fields, message) {
        var _this = _super.call(this, message) || this;
        _this.fields = fields;
        _this.message = message;
        _this.status = 400;
        _this.name = 'ValidateError';
        Object.setPrototypeOf(_this, ValidateError.prototype);
        return _this;
    }
    return ValidateError;
}(Error));
exports.ValidateError = ValidateError;
//# sourceMappingURL=templateHelpers.js.map