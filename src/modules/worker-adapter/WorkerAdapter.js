import { isNonEmptyString } from './dependencies';

import * as actions from './actions';
import actionTypes from './actionTypes';

/*
    handlers = new Map({
        [eventName]: {
            listeners: new Set(),
            afterListeners: new WeakMap()
        }
    })
*/
const handlers = new Map();

let workerQueue = [];
let worker = null;

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
                handlers.clear();
            }

            workerQueue = [];

            break;
        }

        default: {
            if (worker) {
                const { methodName, args } = action;
                worker[methodName](...args);
            } else {
                workerQueue.push(action);
            }
        }
    }
}

export function replaceWorker(nextWorker) {
    if (worker) {
        dispatch(
            actions.terminate({
                clearQueue: false,
            }),
        );
    }

    worker = nextWorker;

    // set all existing worker event handlers to a new worker
    for (const [eventType, namedHandlers] of handlers.entries()) {
        for (const listener of namedHandlers.listeners.values()) {
            worker.addEventListener(eventType, listener, false);

            const afterListener = namedHandlers.afterListeners.get(listener);
            if (afterListener) {
                afterListener();
            }
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

function validateEventType(eventType) {
    if (!isNonEmptyString(eventType)) {
        throw new TypeError(`'eventType' must a non-empty string. Received value: ${eventType}.`);
    }
}

export function off(eventType, listener) {
    validateEventType(eventType);

    const namedHandlers = handlers.get(eventType);

    namedHandlers.afterListeners.delete(listener);

    const success = namedHandlers.listeners.delete(listener);

    if (success) {
        dispatch(actions.removeEventListener(eventType, listener, false));

        handlers.set(eventType, namedHandlers);
    }

    return success;
}

function EventHandlerEntity() {
    return {
        listeners: new Set(),
        afterListeners: new WeakMap(),
    };
}

export function on(eventType, listener, afterListener) {
    validateEventType(eventType);

    const namedHandlers = handlers.get(eventType) || new EventHandlerEntity();

    if (!namedHandlers.listeners.has(listener)) {
        dispatch(actions.addEventListener(eventType, listener, false));

        namedHandlers.listeners.add(listener);

        if (afterListener) {
            namedHandlers.afterListeners.set(listener, afterListener);
            afterListener();
        }

        handlers.set(eventType, namedHandlers);
    }

    return () => off(eventType, listener);
}

export function postMessage(...args) {
    dispatch(actions.postMessage(args));
}

export function terminate(options) {
    dispatch(actions.terminate(options));
}
