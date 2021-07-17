"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = void 0;
const Stream_1 = require("../../../stream/Stream");
const Arbitrary_1 = require("../../arbitrary/definition/Arbitrary");
const Shrinkable_1 = require("../../arbitrary/definition/Shrinkable");
const IntegerArbitrary_1 = require("../../arbitrary/IntegerArbitrary");
const OneOfArbitrary_1 = require("../../arbitrary/OneOfArbitrary");
const ReplayPath_1 = require("../ReplayPath");
const CommandsIterable_1 = require("./CommandsIterable");
const CommandWrapper_1 = require("./CommandWrapper");
const LazyIterableIterator_1 = require("../../../stream/LazyIterableIterator");
class CommandsArbitrary extends Arbitrary_1.Arbitrary {
    constructor(commandArbs, maxCommands, sourceReplayPath, disableReplayLog) {
        super();
        this.sourceReplayPath = sourceReplayPath;
        this.disableReplayLog = disableReplayLog;
        this.oneCommandArb = OneOfArbitrary_1.oneof(...commandArbs).map((c) => new CommandWrapper_1.CommandWrapper(c));
        this.lengthArb = IntegerArbitrary_1.nat(maxCommands);
        this.replayPath = [];
        this.replayPathPosition = 0;
    }
    metadataForReplay() {
        return this.disableReplayLog ? '' : `replayPath=${JSON.stringify(ReplayPath_1.ReplayPath.stringify(this.replayPath))}`;
    }
    wrapper(items, shrunkOnce) {
        return new Shrinkable_1.Shrinkable(new CommandsIterable_1.CommandsIterable(items.map((s) => s.value_), () => this.metadataForReplay()), () => this.shrinkImpl(items, shrunkOnce).map((v) => this.wrapper(v, true)));
    }
    generate(mrng) {
        const size = this.lengthArb.generate(mrng);
        const items = Array(size.value_);
        for (let idx = 0; idx !== size.value_; ++idx) {
            const item = this.oneCommandArb.generate(mrng);
            items[idx] = item;
        }
        this.replayPathPosition = 0;
        return this.wrapper(items, false);
    }
    filterOnExecution(itemsRaw) {
        const items = [];
        for (const c of itemsRaw) {
            if (c.value_.hasRan) {
                this.replayPath.push(true);
                items.push(c);
            }
            else
                this.replayPath.push(false);
        }
        return items;
    }
    filterOnReplay(itemsRaw) {
        return itemsRaw.filter((c, idx) => {
            const state = this.replayPath[this.replayPathPosition + idx];
            if (state === undefined)
                throw new Error(`Too short replayPath`);
            if (!state && c.value_.hasRan)
                throw new Error(`Mismatch between replayPath and real execution`);
            return state;
        });
    }
    filterForShrinkImpl(itemsRaw) {
        if (this.replayPathPosition === 0) {
            this.replayPath = this.sourceReplayPath !== null ? ReplayPath_1.ReplayPath.parse(this.sourceReplayPath) : [];
        }
        const items = this.replayPathPosition < this.replayPath.length
            ? this.filterOnReplay(itemsRaw)
            : this.filterOnExecution(itemsRaw);
        this.replayPathPosition += itemsRaw.length;
        return items;
    }
    shrinkImpl(itemsRaw, shrunkOnce) {
        const items = this.filterForShrinkImpl(itemsRaw);
        if (items.length === 0) {
            return Stream_1.Stream.nil();
        }
        const rootShrink = shrunkOnce
            ? Stream_1.Stream.nil()
            : new Stream_1.Stream([[]][Symbol.iterator]());
        const nextShrinks = [];
        for (let numToKeep = 0; numToKeep !== items.length; ++numToKeep) {
            nextShrinks.push(LazyIterableIterator_1.makeLazy(() => {
                const size = this.lengthArb.contextualShrinkableFor(items.length - 1 - numToKeep);
                const fixedStart = items.slice(0, numToKeep);
                return size.shrink().map((l) => fixedStart.concat(items.slice(items.length - (l.value + 1))));
            }));
        }
        for (let itemAt = 0; itemAt !== items.length; ++itemAt) {
            nextShrinks.push(LazyIterableIterator_1.makeLazy(() => items[itemAt].shrink().map((v) => items.slice(0, itemAt).concat([v], items.slice(itemAt + 1)))));
        }
        return rootShrink.join(...nextShrinks).map((shrinkables) => {
            return shrinkables.map((c) => {
                return new Shrinkable_1.Shrinkable(c.value_.clone(), c.shrink);
            });
        });
    }
}
function commands(commandArbs, constraints) {
    const config = constraints == null ? {} : typeof constraints === 'number' ? { maxCommands: constraints } : constraints;
    return new CommandsArbitrary(commandArbs, config.maxCommands != null ? config.maxCommands : 10, config.replayPath != null ? config.replayPath : null, !!config.disableReplayLog);
}
exports.commands = commands;
