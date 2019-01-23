import { eventEmitter, eventTypes, isFn } from '../worker/dependencies';

import * as actions from '../services/actions';
import actionTypes from '../services/actionTypes';
import { createMessageTypeMatcher } from '../services/utilities';

/*
    Map = <Function><{
        handler: Function,
        afterListenre: [Function] 
    }>
*/
const listeners = new Map();

let workerQueue = [];
let worker = null;
let workerCreator = null;

function noop() {}

function dispatch(action) {
    // if !this.worker --> worker isn't ready yet,
    // queue all incomming actions.

    // An only exception is the TERMINATE action.
    // This action will empty the queue and re

    switch (action.type) {
        case actionTypes.TERMINATE: {
            if (worker) {
                worker.terminate();
            }

            worker = null;

            if (action.clearHandlers) {
                listeners.clear();
            }

            workerQueue = [];

            break;
        }

        default: {
            if (worker) {
                const { methodName, args } = action;
                worker[methodName].call(worker, ...args);
            } else {
                workerQueue.push(action);
            }
        }
    }
}

function replaceWorker(nextWorker) {
    if (worker) {
        dispatch(
            actions.terminate({
                clearQueue: false,
            }),
        );
    }

    worker = nextWorker;

    // set all existing worker event handlers to a new worker
    for (const entry of listeners.entries()) {
        const { handler, afterListener } = entry[1];

        worker.addEventListener('message', handler, false);

        if (afterListener) {
            afterListener();
        }
    }

    // TODO: this.workerQueue.push(...) could be optimized as follows:
    // When 'removeEventListener' action should be pushed to the queue,
    // check for any 'addEventListener's in the queue.
    for (const { methodName, args } of workerQueue) {
        worker[methodName](...args);
    }

    workerQueue = [];
}

export function removeMessageListener(listener) {
    const { handler } = listeners.get(listener) || {};

    if (handler) {
        dispatch(actions.removeEventListener('message', handler));
    }

    return listeners.delete(listener);
}

/**
 *
 * @param {String|Symbol|Array<String|Symbol>|Function} messageType
 * @param {Function} listener
 * @param {Function} [afterListener]
 * @returns {Function} unsubscribe method
 */
export function addMessageListener(messageType, listener, afterListener) {
    if (listeners.has(listener)) {
        return noop;
    }

    const messageTypeMatcher = createMessageTypeMatcher(messageType);

    function handler(event) {
        const message = event.data;

        if (messageTypeMatcher(message)) {
            listener(message);
        }
    }

    dispatch(actions.addEventListener('message', handler));

    listeners.set(listener, {
        handler,
        afterListener,
    });

    if (isFn(afterListener)) {
        afterListener();
    }

    return () => removeMessageListener(listener);
}

export function postMessage(...args) {
    dispatch(actions.postMessage(args));
}

export async function boot(nextWorkerCreator) {
    if (!workerCreator && !isFn(nextWorkerCreator)) {
        throw new TypeError(`bootWorker method requires 1st argument to be a function on its first call.`);
    }

    if (typeof nextWorkerCreator !== 'undefined' && !isFn(nextWorkerCreator)) {
        throw new TypeError(
            `bootWorker: 1st argument must be 'undefined' or 'function', not a '${typeof nextWorkerCreator}'.`,
        );
    }

    if (nextWorkerCreator) {
        workerCreator = nextWorkerCreator;
    }

    const nextWorker = workerCreator();

    replaceWorker(nextWorker);

    eventEmitter.emit(eventTypes.WORKER_BOOTED);
}

export async function terminate(clearEventHandlers = false) {
    dispatch(
        actions.terminate({
            clearEventHandlers,
        }),
    );

    eventEmitter.emit(eventTypes.WORKER_TERMINATED);
}

export async function reboot({ nextWorkerCreator, clearEventHandlers } = {}) {
    await terminate(clearEventHandlers);
    await boot(nextWorkerCreator);
}

export async function initialize(createWorker) {
    if (!isFn(createWorker)) {
        throw new TypeError(`initializeWorker: 1st argument must be a function, not a '${typeof createWorker}'.`);
    }

    await boot(createWorker);
}

export function isInitialized() {
    return Boolean(workerCreator);
}
