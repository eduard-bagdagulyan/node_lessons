"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncProperty = void 0;
const PreconditionFailure_1 = require("../precondition/PreconditionFailure");
const IRawProperty_1 = require("./IRawProperty");
const GlobalParameters_1 = require("../runner/configuration/GlobalParameters");
class AsyncProperty {
    constructor(arb, predicate) {
        this.arb = arb;
        this.predicate = predicate;
        this.isAsync = () => true;
        const { asyncBeforeEach, asyncAfterEach, beforeEach, afterEach } = GlobalParameters_1.readConfigureGlobal() || {};
        if (asyncBeforeEach !== undefined && beforeEach !== undefined) {
            throw Error('Global "asyncBeforeEach" and "beforeEach" parameters can\'t be set at the same time when running async properties');
        }
        if (asyncAfterEach !== undefined && afterEach !== undefined) {
            throw Error('Global "asyncAfterEach" and "afterEach" parameters can\'t be set at the same time when running async properties');
        }
        this.beforeEachHook = asyncBeforeEach || beforeEach || AsyncProperty.dummyHook;
        this.afterEachHook = asyncAfterEach || afterEach || AsyncProperty.dummyHook;
    }
    generate(mrng, runId) {
        return runId != null ? this.arb.withBias(IRawProperty_1.runIdToFrequency(runId)).generate(mrng) : this.arb.generate(mrng);
    }
    async run(v) {
        await this.beforeEachHook();
        try {
            const output = await this.predicate(v);
            return output == null || output === true ? null : 'Property failed by returning false';
        }
        catch (err) {
            if (PreconditionFailure_1.PreconditionFailure.isFailure(err))
                return err;
            if (err instanceof Error && err.stack)
                return `${err}\n\nStack trace: ${err.stack}`;
            return `${err}`;
        }
        finally {
            await this.afterEachHook();
        }
    }
    beforeEach(hookFunction) {
        const previousBeforeEachHook = this.beforeEachHook;
        this.beforeEachHook = () => hookFunction(previousBeforeEachHook);
        return this;
    }
    afterEach(hookFunction) {
        const previousAfterEachHook = this.afterEachHook;
        this.afterEachHook = () => hookFunction(previousAfterEachHook);
        return this;
    }
}
exports.AsyncProperty = AsyncProperty;
AsyncProperty.dummyHook = () => { };