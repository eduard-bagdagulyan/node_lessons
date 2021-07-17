"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Res = exports.Response = exports.SuccessResponse = void 0;
function SuccessResponse(name, description) {
    return function () {
        return;
    };
}
exports.SuccessResponse = SuccessResponse;
function Response(name, description, example) {
    return function () {
        return;
    };
}
exports.Response = Response;
/**
 * Inject a library-agnostic responder function that can be used to construct type-checked (usually error-) responses.
 *
 * The type of the responder function should be annotated `TsoaResponse<Status, Data, Headers>` in order to support OpenAPI documentation.
 */
function Res() {
    return function () {
        return;
    };
}
exports.Res = Res;
//# sourceMappingURL=response.js.map