import { stream } from '../../stream/Stream.js';
import { Shrinkable } from '../arbitrary/definition/Shrinkable.js';
import { readConfigureGlobal } from './configuration/GlobalParameters.js';
import { QualifiedParameters } from './configuration/QualifiedParameters.js';
import { decorateProperty } from './DecorateProperty.js';
import { RunnerIterator } from './RunnerIterator.js';
import { SourceValuesIterator } from './SourceValuesIterator.js';
import { toss } from './Tosser.js';
import { pathWalk } from './utils/PathWalker.js';
import { reportRunDetails } from './utils/RunDetailsFormatter.js';
function runIt(property, sourceValues, verbose, interruptedAsFailure) {
    const runner = new RunnerIterator(sourceValues, verbose, interruptedAsFailure);
    for (const v of runner) {
        const out = property.run(v);
        runner.handleResult(out);
    }
    return runner.runExecution;
}
async function asyncRunIt(property, sourceValues, verbose, interruptedAsFailure) {
    const runner = new RunnerIterator(sourceValues, verbose, interruptedAsFailure);
    for (const v of runner) {
        const out = await property.run(v);
        runner.handleResult(out);
    }
    return runner.runExecution;
}
function runnerPathWalker(valueProducers, path) {
    const pathPoints = path.split(':');
    const pathStream = stream(valueProducers)
        .drop(pathPoints.length > 0 ? +pathPoints[0] : 0)
        .map((producer) => producer());
    const adaptedPath = ['0', ...pathPoints.slice(1)].join(':');
    return stream(pathWalk(adaptedPath, pathStream)).map((v) => () => v);
}
function buildInitialValues(valueProducers, qParams) {
    const rawValues = qParams.path.length === 0 ? stream(valueProducers) : runnerPathWalker(valueProducers, qParams.path);
    if (!qParams.endOnFailure)
        return rawValues;
    return rawValues.map((shrinkableGen) => {
        return () => {
            const s = shrinkableGen();
            return new Shrinkable(s.value_);
        };
    });
}
function check(rawProperty, params) {
    if (rawProperty == null || rawProperty.generate == null)
        throw new Error('Invalid property encountered, please use a valid property');
    if (rawProperty.run == null)
        throw new Error('Invalid property encountered, please use a valid property not an arbitrary');
    const qParams = QualifiedParameters.read(Object.assign(Object.assign({}, readConfigureGlobal()), params));
    if (qParams.reporter !== null && qParams.asyncReporter !== null)
        throw new Error('Invalid parameters encountered, reporter and asyncReporter cannot be specified together');
    if (qParams.asyncReporter !== null && !rawProperty.isAsync())
        throw new Error('Invalid parameters encountered, only asyncProperty can be used when asyncReporter specified');
    const property = decorateProperty(rawProperty, qParams);
    const generator = toss(property, qParams.seed, qParams.randomType, qParams.examples);
    const maxInitialIterations = qParams.path.indexOf(':') === -1 ? qParams.numRuns : -1;
    const maxSkips = qParams.numRuns * qParams.maxSkipsPerRun;
    const initialValues = buildInitialValues(generator, qParams);
    const sourceValues = new SourceValuesIterator(initialValues, maxInitialIterations, maxSkips);
    return property.isAsync()
        ? asyncRunIt(property, sourceValues, qParams.verbose, qParams.markInterruptAsFailure).then((e) => e.toRunDetails(qParams.seed, qParams.path, maxSkips, qParams))
        : runIt(property, sourceValues, qParams.verbose, qParams.markInterruptAsFailure).toRunDetails(qParams.seed, qParams.path, maxSkips, qParams);
}
function assert(property, params) {
    const out = check(property, params);
    if (property.isAsync())
        return out.then(reportRunDetails);
    else
        reportRunDetails(out);
}
export { check, assert };