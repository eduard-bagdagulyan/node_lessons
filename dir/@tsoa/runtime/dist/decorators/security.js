"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Security = exports.NoSecurity = void 0;
/**
 * Can be used to indicate that a method requires no security.
 */
function NoSecurity() {
    return function () {
        return;
    };
}
exports.NoSecurity = NoSecurity;
/**
 * @param {name} security name from securityDefinitions
 */
function Security(name, scopes) {
    return function () {
        return;
    };
}
exports.Security = Security;
//# sourceMappingURL=security.js.map