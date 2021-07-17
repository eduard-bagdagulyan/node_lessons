"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _isInnerMethodDefinition, _jsxPragma, _jsxFragmentName, _hasReferencedJsxFactory, _hasReferencedJsxFragmentFactory, _lib;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Referencer = void 0;
const types_1 = require("@typescript-eslint/types");
const ExportVisitor_1 = require("./ExportVisitor");
const ImportVisitor_1 = require("./ImportVisitor");
const PatternVisitor_1 = require("./PatternVisitor");
const Reference_1 = require("./Reference");
const TypeVisitor_1 = require("./TypeVisitor");
const Visitor_1 = require("./Visitor");
const assert_1 = require("../assert");
const definition_1 = require("../definition");
const lib_1 = require("../lib");
// Referencing variables and creating bindings.
class Referencer extends Visitor_1.Visitor {
    constructor(options, scopeManager) {
        super(options);
        _isInnerMethodDefinition.set(this, void 0);
        _jsxPragma.set(this, void 0);
        _jsxFragmentName.set(this, void 0);
        _hasReferencedJsxFactory.set(this, false);
        _hasReferencedJsxFragmentFactory.set(this, false);
        _lib.set(this, void 0);
        this.scopeManager = scopeManager;
        __classPrivateFieldSet(this, _jsxPragma, options.jsxPragma);
        __classPrivateFieldSet(this, _jsxFragmentName, options.jsxFragmentName);
        __classPrivateFieldSet(this, _lib, options.lib);
        __classPrivateFieldSet(this, _isInnerMethodDefinition, false);
    }
    currentScope(dontThrowOnNull) {
        if (!dontThrowOnNull) {
            assert_1.assert(this.scopeManager.currentScope, 'aaa');
        }
        return this.scopeManager.currentScope;
    }
    close(node) {
        while (this.currentScope(true) && node === this.currentScope().block) {
            this.scopeManager.currentScope = this.currentScope().close(this.scopeManager);
        }
    }
    pushInnerMethodDefinition(isInnerMethodDefinition) {
        const previous = __classPrivateFieldGet(this, _isInnerMethodDefinition);
        __classPrivateFieldSet(this, _isInnerMethodDefinition, isInnerMethodDefinition);
        return previous;
    }
    popInnerMethodDefinition(isInnerMethodDefinition) {
        __classPrivateFieldSet(this, _isInnerMethodDefinition, !!isInnerMethodDefinition);
    }
    referencingDefaultValue(pattern, assignments, maybeImplicitGlobal, init) {
        assignments.forEach(assignment => {
            this.currentScope().referenceValue(pattern, Reference_1.ReferenceFlag.Write, assignment.right, maybeImplicitGlobal, init);
        });
    }
    populateGlobalsFromLib(globalScope) {
        for (const lib of __classPrivateFieldGet(this, _lib)) {
            const variables = lib_1.lib[lib];
            /* istanbul ignore if */ if (!variables) {
                throw new Error(`Invalid value for lib provided: ${lib}`);
            }
            for (const variable of Object.values(variables)) {
                globalScope.defineImplicitVariable(variable);
            }
        }
        // for const assertions (`{} as const` / `<const>{}`)
        globalScope.defineImplicitVariable({
            name: 'const',
            eslintImplicitGlobalSetting: 'readonly',
            isTypeVariable: true,
            isValueVariable: false,
        });
    }
    /**
     * Searches for a variable named "name" in the upper scopes and adds a pseudo-reference from itself to itself
     */
    referenceInSomeUpperScope(name) {
        let scope = this.scopeManager.currentScope;
        while (scope) {
            const variable = scope.set.get(name);
            if (!variable) {
                scope = scope.upper;
                continue;
            }
            scope.referenceValue(variable.identifiers[0]);
            return true;
        }
        return false;
    }
    referenceJsxPragma() {
        if (__classPrivateFieldGet(this, _hasReferencedJsxFactory)) {
            return;
        }
        __classPrivateFieldSet(this, _hasReferencedJsxFactory, this.referenceInSomeUpperScope(__classPrivateFieldGet(this, _jsxPragma)));
    }
    referenceJsxFragment() {
        if (__classPrivateFieldGet(this, _jsxFragmentName) === null || __classPrivateFieldGet(this, _hasReferencedJsxFragmentFactory)) {
            return;
        }
        __classPrivateFieldSet(this, _hasReferencedJsxFragmentFactory, this.referenceInSomeUpperScope(__classPrivateFieldGet(this, _jsxFragmentName)));
    }
    ///////////////////
    // Visit helpers //
    ///////////////////
    visitClass(node) {
        var _a, _b;
        if (node.type === types_1.AST_NODE_TYPES.ClassDeclaration && node.id) {
            this.currentScope().defineIdentifier(node.id, new definition_1.ClassNameDefinition(node.id, node));
        }
        (_a = node.decorators) === null || _a === void 0 ? void 0 : _a.forEach(d => this.visit(d));
        this.scopeManager.nestClassScope(node);
        if (node.id) {
            // define the class name again inside the new scope
            // references to the class should not resolve directly to the parent class
            this.currentScope().defineIdentifier(node.id, new definition_1.ClassNameDefinition(node.id, node));
        }
        this.visit(node.superClass);
        // visit the type param declarations
        this.visitType(node.typeParameters);
        // then the usages
        this.visitType(node.superTypeParameters);
        (_b = node.implements) === null || _b === void 0 ? void 0 : _b.forEach(imp => this.visitType(imp));
        this.visit(node.body);
        this.close(node);
    }
    visitClassProperty(node) {
        this.visitProperty(node);
        this.visitType(node.typeAnnotation);
    }
    visitForIn(node) {
        if (node.left.type === types_1.AST_NODE_TYPES.VariableDeclaration &&
            node.left.kind !== 'var') {
            this.scopeManager.nestForScope(node);
        }
        if (node.left.type === types_1.AST_NODE_TYPES.VariableDeclaration) {
            this.visit(node.left);
            this.visitPattern(node.left.declarations[0].id, pattern => {
                this.currentScope().referenceValue(pattern, Reference_1.ReferenceFlag.Write, node.right, null, true);
            });
        }
        else {
            this.visitPattern(node.left, (pattern, info) => {
                const maybeImplicitGlobal = !this.currentScope().isStrict
                    ? {
                        pattern,
                        node,
                    }
                    : null;
                this.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
                this.currentScope().referenceValue(pattern, Reference_1.ReferenceFlag.Write, node.right, maybeImplicitGlobal, false);
            }, { processRightHandNodes: true });
        }
        this.visit(node.right);
        this.visit(node.body);
        this.close(node);
    }
    visitFunctionParameterTypeAnnotation(node) {
        if ('typeAnnotation' in node) {
            this.visitType(node.typeAnnotation);
        }
        else if (node.type === types_1.AST_NODE_TYPES.AssignmentPattern) {
            this.visitType(node.left.typeAnnotation);
        }
        else if (node.type === types_1.AST_NODE_TYPES.TSParameterProperty) {
            this.visitFunctionParameterTypeAnnotation(node.parameter);
        }
    }
    visitFunction(node) {
        // FunctionDeclaration name is defined in upper scope
        // NOTE: Not referring variableScope. It is intended.
        // Since
        //  in ES5, FunctionDeclaration should be in FunctionBody.
        //  in ES6, FunctionDeclaration should be block scoped.
        var _a;
        if (node.type === types_1.AST_NODE_TYPES.FunctionExpression) {
            if (node.id) {
                // FunctionExpression with name creates its special scope;
                // FunctionExpressionNameScope.
                this.scopeManager.nestFunctionExpressionNameScope(node);
            }
        }
        else if (node.id) {
            // id is defined in upper scope
            this.currentScope().defineIdentifier(node.id, new definition_1.FunctionNameDefinition(node.id, node));
        }
        // Consider this function is in the MethodDefinition.
        this.scopeManager.nestFunctionScope(node, __classPrivateFieldGet(this, _isInnerMethodDefinition));
        // Process parameter declarations.
        for (const param of node.params) {
            this.visitPattern(param, (pattern, info) => {
                this.currentScope().defineIdentifier(pattern, new definition_1.ParameterDefinition(pattern, node, info.rest));
                this.referencingDefaultValue(pattern, info.assignments, null, true);
            }, { processRightHandNodes: true });
            this.visitFunctionParameterTypeAnnotation(param);
            (_a = param.decorators) === null || _a === void 0 ? void 0 : _a.forEach(d => this.visit(d));
        }
        this.visitType(node.returnType);
        this.visitType(node.typeParameters);
        // In TypeScript there are a number of function-like constructs which have no body,
        // so check it exists before traversing
        if (node.body) {
            // Skip BlockStatement to prevent creating BlockStatement scope.
            if (node.body.type === types_1.AST_NODE_TYPES.BlockStatement) {
                this.visitChildren(node.body);
            }
            else {
                this.visit(node.body);
            }
        }
        this.close(node);
    }
    visitProperty(node) {
        var _a;
        let previous;
        if (node.computed) {
            this.visit(node.key);
        }
        const isMethodDefinition = node.type === types_1.AST_NODE_TYPES.MethodDefinition;
        if (isMethodDefinition) {
            previous = this.pushInnerMethodDefinition(true);
        }
        this.visit(node.value);
        if (isMethodDefinition) {
            this.popInnerMethodDefinition(previous);
        }
        if ('decorators' in node) {
            (_a = node.decorators) === null || _a === void 0 ? void 0 : _a.forEach(d => this.visit(d));
        }
    }
    visitType(node) {
        if (!node) {
            return;
        }
        TypeVisitor_1.TypeVisitor.visit(this, node);
    }
    visitTypeAssertion(node) {
        this.visit(node.expression);
        this.visitType(node.typeAnnotation);
    }
    /////////////////////
    // Visit selectors //
    /////////////////////
    ArrowFunctionExpression(node) {
        this.visitFunction(node);
    }
    AssignmentExpression(node) {
        let left = node.left;
        switch (left.type) {
            case types_1.AST_NODE_TYPES.TSAsExpression:
            case types_1.AST_NODE_TYPES.TSTypeAssertion:
                // explicitly visit the type annotation
                this.visit(left.typeAnnotation);
            // intentional fallthrough
            case types_1.AST_NODE_TYPES.TSNonNullExpression:
                // unwrap the expression
                left = left.expression;
        }
        if (PatternVisitor_1.PatternVisitor.isPattern(left)) {
            if (node.operator === '=') {
                this.visitPattern(left, (pattern, info) => {
                    const maybeImplicitGlobal = !this.currentScope().isStrict
                        ? {
                            pattern,
                            node,
                        }
                        : null;
                    this.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
                    this.currentScope().referenceValue(pattern, Reference_1.ReferenceFlag.Write, node.right, maybeImplicitGlobal, false);
                }, { processRightHandNodes: true });
            }
            else if (left.type === types_1.AST_NODE_TYPES.Identifier) {
                this.currentScope().referenceValue(left, Reference_1.ReferenceFlag.ReadWrite, node.right);
            }
        }
        else {
            this.visit(left);
        }
        this.visit(node.right);
    }
    BlockStatement(node) {
        if (this.scopeManager.isES6()) {
            this.scopeManager.nestBlockScope(node);
        }
        this.visitChildren(node);
        this.close(node);
    }
    BreakStatement() {
        // don't reference the break statement's label
    }
    CallExpression(node) {
        this.visitChildren(node, ['typeParameters']);
        this.visitType(node.typeParameters);
    }
    CatchClause(node) {
        this.scopeManager.nestCatchScope(node);
        if (node.param) {
            const param = node.param;
            this.visitPattern(param, (pattern, info) => {
                this.currentScope().defineIdentifier(pattern, new definition_1.CatchClauseDefinition(param, node));
                this.referencingDefaultValue(pattern, info.assignments, null, true);
            }, { processRightHandNodes: true });
        }
        this.visit(node.body);
        this.close(node);
    }
    ClassExpression(node) {
        this.visitClass(node);
    }
    ClassDeclaration(node) {
        this.visitClass(node);
    }
    ClassProperty(node) {
        this.visitClassProperty(node);
    }
    ContinueStatement() {
        // don't reference the continue statement's label
    }
    ExportAllDeclaration() {
        // this defines no local variables
    }
    ExportDefaultDeclaration(node) {
        if (node.declaration.type === types_1.AST_NODE_TYPES.Identifier) {
            ExportVisitor_1.ExportVisitor.visit(this, node);
        }
        else {
            this.visit(node.declaration);
        }
    }
    ExportNamedDeclaration(node) {
        if (node.declaration) {
            this.visit(node.declaration);
        }
        else {
            ExportVisitor_1.ExportVisitor.visit(this, node);
        }
    }
    ForInStatement(node) {
        this.visitForIn(node);
    }
    ForOfStatement(node) {
        this.visitForIn(node);
    }
    ForStatement(node) {
        // Create ForStatement declaration.
        // NOTE: In ES6, ForStatement dynamically generates per iteration environment. However, this is
        // a static analyzer, we only generate one scope for ForStatement.
        if (node.init &&
            node.init.type === types_1.AST_NODE_TYPES.VariableDeclaration &&
            node.init.kind !== 'var') {
            this.scopeManager.nestForScope(node);
        }
        this.visitChildren(node);
        this.close(node);
    }
    FunctionDeclaration(node) {
        this.visitFunction(node);
    }
    FunctionExpression(node) {
        this.visitFunction(node);
    }
    Identifier(node) {
        this.currentScope().referenceValue(node);
        this.visitType(node.typeAnnotation);
    }
    ImportDeclaration(node) {
        assert_1.assert(this.scopeManager.isES6() && this.scopeManager.isModule(), 'ImportDeclaration should appear when the mode is ES6 and in the module context.');
        ImportVisitor_1.ImportVisitor.visit(this, node);
    }
    JSXAttribute(node) {
        this.visit(node.value);
    }
    JSXClosingElement() {
        // should not be counted as a reference
    }
    JSXFragment(node) {
        this.referenceJsxPragma();
        this.referenceJsxFragment();
        this.visitChildren(node);
    }
    JSXIdentifier(node) {
        this.currentScope().referenceValue(node);
    }
    JSXMemberExpression(node) {
        this.visit(node.object);
        // we don't ever reference the property as it's always going to be a property on the thing
    }
    JSXOpeningElement(node) {
        this.referenceJsxPragma();
        if (node.name.type === types_1.AST_NODE_TYPES.JSXIdentifier) {
            if (node.name.name[0].toUpperCase() === node.name.name[0]) {
                // lower cased component names are always treated as "intrinsic" names, and are converted to a string,
                // not a variable by JSX transforms:
                // <div /> => React.createElement("div", null)
                this.visit(node.name);
            }
        }
        else {
            this.visit(node.name);
        }
        this.visitType(node.typeParameters);
        for (const attr of node.attributes) {
            this.visit(attr);
        }
    }
    LabeledStatement(node) {
        this.visit(node.body);
    }
    MemberExpression(node) {
        this.visit(node.object);
        if (node.computed) {
            this.visit(node.property);
        }
    }
    MetaProperty() {
        // meta properties all builtin globals
    }
    MethodDefinition(node) {
        this.visitProperty(node);
    }
    NewExpression(node) {
        this.visitChildren(node, ['typeParameters']);
        this.visitType(node.typeParameters);
    }
    Program(node) {
        const globalScope = this.scopeManager.nestGlobalScope(node);
        this.populateGlobalsFromLib(globalScope);
        if (this.scopeManager.isGlobalReturn()) {
            // Force strictness of GlobalScope to false when using node.js scope.
            this.currentScope().isStrict = false;
            this.scopeManager.nestFunctionScope(node, false);
        }
        if (this.scopeManager.isES6() && this.scopeManager.isModule()) {
            this.scopeManager.nestModuleScope(node);
        }
        if (this.scopeManager.isStrictModeSupported() &&
            this.scopeManager.isImpliedStrict()) {
            this.currentScope().isStrict = true;
        }
        this.visitChildren(node);
        this.close(node);
    }
    Property(node) {
        this.visitProperty(node);
    }
    SwitchStatement(node) {
        this.visit(node.discriminant);
        if (this.scopeManager.isES6()) {
            this.scopeManager.nestSwitchScope(node);
        }
        for (const switchCase of node.cases) {
            this.visit(switchCase);
        }
        this.close(node);
    }
    TaggedTemplateExpression(node) {
        this.visit(node.tag);
        this.visit(node.quasi);
        this.visitType(node.typeParameters);
    }
    TSAbstractClassProperty(node) {
        this.visitClassProperty(node);
    }
    TSAbstractMethodDefinition(node) {
        this.visitProperty(node);
    }
    TSAsExpression(node) {
        this.visitTypeAssertion(node);
    }
    TSDeclareFunction(node) {
        this.visitFunction(node);
    }
    TSImportEqualsDeclaration(node) {
        this.currentScope().defineIdentifier(node.id, new definition_1.ImportBindingDefinition(node.id, node, node));
        if (node.moduleReference.type === types_1.AST_NODE_TYPES.TSQualifiedName) {
            this.visit(node.moduleReference.left);
        }
        else {
            this.visit(node.moduleReference);
        }
    }
    TSEmptyBodyFunctionExpression(node) {
        this.visitFunction(node);
    }
    TSEnumDeclaration(node) {
        this.currentScope().defineIdentifier(node.id, new definition_1.TSEnumNameDefinition(node.id, node));
        // enum members can be referenced within the enum body
        this.scopeManager.nestTSEnumScope(node);
        // define the enum name again inside the new enum scope
        // references to the enum should not resolve directly to the enum
        this.currentScope().defineIdentifier(node.id, new definition_1.TSEnumNameDefinition(node.id, node));
        for (const member of node.members) {
            // TS resolves literal named members to be actual names
            // enum Foo {
            //   'a' = 1,
            //   b = a, // this references the 'a' member
            // }
            if (member.id.type === types_1.AST_NODE_TYPES.Literal &&
                typeof member.id.value === 'string') {
                const name = member.id;
                this.currentScope().defineLiteralIdentifier(name, new definition_1.TSEnumMemberDefinition(name, member));
            }
            else if (!member.computed &&
                member.id.type === types_1.AST_NODE_TYPES.Identifier) {
                this.currentScope().defineIdentifier(member.id, new definition_1.TSEnumMemberDefinition(member.id, member));
            }
            this.visit(member.initializer);
        }
        this.close(node);
    }
    TSInterfaceDeclaration(node) {
        this.visitType(node);
    }
    TSModuleDeclaration(node) {
        if (node.id.type === types_1.AST_NODE_TYPES.Identifier && !node.global) {
            this.currentScope().defineIdentifier(node.id, new definition_1.TSModuleNameDefinition(node.id, node));
        }
        this.scopeManager.nestTSModuleScope(node);
        this.visit(node.body);
        this.close(node);
    }
    TSTypeAliasDeclaration(node) {
        this.visitType(node);
    }
    TSTypeAssertion(node) {
        this.visitTypeAssertion(node);
    }
    UpdateExpression(node) {
        if (PatternVisitor_1.PatternVisitor.isPattern(node.argument)) {
            this.visitPattern(node.argument, pattern => {
                this.currentScope().referenceValue(pattern, Reference_1.ReferenceFlag.ReadWrite, null);
            });
        }
        else {
            this.visitChildren(node);
        }
    }
    VariableDeclaration(node) {
        const variableTargetScope = node.kind === 'var'
            ? this.currentScope().variableScope
            : this.currentScope();
        for (const decl of node.declarations) {
            const init = decl.init;
            this.visitPattern(decl.id, (pattern, info) => {
                variableTargetScope.defineIdentifier(pattern, new definition_1.VariableDefinition(pattern, decl, node));
                this.referencingDefaultValue(pattern, info.assignments, null, true);
                if (init) {
                    this.currentScope().referenceValue(pattern, Reference_1.ReferenceFlag.Write, init, null, true);
                }
            }, { processRightHandNodes: true });
            if (decl.init) {
                this.visit(decl.init);
            }
            if ('typeAnnotation' in decl.id) {
                this.visitType(decl.id.typeAnnotation);
            }
        }
    }
    WithStatement(node) {
        this.visit(node.object);
        // Then nest scope for WithStatement.
        this.scopeManager.nestWithScope(node);
        this.visit(node.body);
        this.close(node);
    }
}
exports.Referencer = Referencer;
_isInnerMethodDefinition = new WeakMap(), _jsxPragma = new WeakMap(), _jsxFragmentName = new WeakMap(), _hasReferencedJsxFactory = new WeakMap(), _hasReferencedJsxFragmentFactory = new WeakMap(), _lib = new WeakMap();
//# sourceMappingURL=Referencer.js.map