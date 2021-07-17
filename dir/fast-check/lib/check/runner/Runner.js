"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = exports.check = void 0;
const Stream_1 = require("../../stream/Stream");
const Shrinkable_1 = require("../arbitrary/definition/Shrinkable");
const GlobalParameters_1 = require("./configuration/GlobalParameters");
const QualifiedParameters_1 = require("./configuration/QualifiedParameters");
const DecorateProperty_1 = require("./DecorateProperty");
const RunnerIterator_1 = require("./RunnerIterator");
const SourceValuesIterator_1 = require("./SourceValuesIterator");
const Tosser_1 = require("./Tosser");
const PathWalker_1 = require("./utils/PathWalker");
const RunDetailsFormatter_1 = require("./utils/RunDetailsFormatter");
function runIt(property, sourceValues, verbose, interruptedAsFailure) {
    const runner = new RunnerIterator_1.RunnerIterator(sourceValues, verbose, interruptedAsFailure);
    for (const v of runner) {
        const out = property.run(v);
        runner.handleResult(out);
    }
    return runner.runExecution;
}
async function asyncRunIt(property, sourceValues, verbose, interruptedAsFailure) {
    const runner = new RunnerIterator_1.RunnerIterator(sourceValues, verbose, interruptedAsFailure);
    for (const v of runner) {
        const out = await property.run(v);
        runner.handleResult(out);
    }
    return runner.runExecution;
}
function runnerPathWalker(valueProducers, path) {
    const pathPoints = path.split(':');
    const pathStream = Stream_1.stream(valueProducers)
        .drop(pathPoints.length > 0 ? +pathPoints[0] : 0)
        .map((producer) => producer());
    const adaptedPath = ['0', ...pathPoints.slice(1)].join(':');
    return Stream_1.stream(PathWalker_1.pathWalk(adaptedPath, pathStream)).map((v) => () => v);
}
function buildInitialValues(valueProducers, qParams) {
    const rawValues = qParams.path.length === 0 ? Stream_1.stream(valueProducers) : runnerPathWalker(valueProducers, qParams.path);
    if (!qParams.endOnFailure)
        return rawValues;
    return rawValues.map((shrinkableGen) => {
        return () => {
            const s = shrinkableGen();
            return new Shrinkable_1.Shrinkable(s.value_);
        };
    });
}
function check(rawProperty, params) {
    if (rawProperty == null || rawProperty.generate == null)
        throw new Error('Invalid property encountered, please use a valid property');
    if (rawProperty.run == null)
        throw new Error('Invalid property encountered, please use a valid property not an arbitrary');
    const qParams = QualifiedParameters_1.QualifiedParameters.read(Object.assign(Object.assign({}, GlobalParameters_1.readConfigureGlobal()), params));
    if (qParams.reporter !== null && qParams.asyncReporter !== null)
        throw new Error('Invalid parameters encountered, reporter and asyncReporter cannot be specified together');
    if (qParams.asyncReporter !== null && !rawProperty.isAsync())
        throw new Error('Invalid parameters encountered, only asyncProperty can be used when asyncReporter specified');
    const property = DecorateProperty_1.decorateProperty(rawProperty, qParams);
    const generator = Tosser_1.toss(property, qParams.seed, qParams.randomType, qParams.examples);
    const maxInitialIterations = qParams.path.indexOf(':') === -1 ? qParams.numRuns : -1;
    const maxSkips = qParams.numRuns * qParams.maxSkipsPerRun;
    const initialValues = buildInitialValues(generator, qParams);
    const sourceValues = new SourceValuesIterator_1.SourceValuesIterator(initialValues, maxInitialIterations, maxSkips);
    return property.isAsync()
        ? asyncRunIt(property, sourceValues, qParams.verbose, qParams.markInterruptAsFailure).then((e) => e.toRunDetails(qParams.seed, qParams.path, maxSkips, qParams))
        : runIt(property, sourceValues, qParams.verbose, qParams.markInterruptAsFailure).toRunDetails(qParams.seed, qParams.path, maxSkips, qParams);
}
exports.check = check;
function assert(property, params) {
    const out = check(property, params);
    if (property.isAsync())
        return out.then(RunDetailsFormatter_1.reportRunDetails);
    else
        RunDetailsFormatter_1.reportRunDetails(out);
}
exports.assert = assert;