import { isFn } from '../is';

function EventHandler() {
    return {
        listeners: new Set(),
        afterListeners: new WeakMap(),
    };
}

const eventTypes = Object.freeze({
    WORKER_TERMINATE: Symbol('WORKER_TERMINATE'),
    WORKER_START: Symbol('WORKER_START'),
    TASK_DURATION_TIMEOUT: Symbol('TASK_DURATION_TIMEOUT'),
});

export const EMIT_KEY = Symbol('EMIT_KEY');

export default function WorkerAdapter(createWorker) {
    if (!isFn(createWorker)) {
        throw new TypeError(
            `WorkerAdapter.constructor: 1st argument must be function, not a '${typeof createWorker}'.`,
        );
    }

    let worker = createWorker();

    /*
        workerEventHandlers = new Map({
            [eventName]: {
                listeners: new Set(),
                afterListeners: new WeakMap()
            }
        })
    */
    const workerEventHandlers = new Map();
    const internalEventHandlers = new Map();

    const emit = ({ eventType, signature }) => {
        if (signature !== EMIT_KEY) {
            throw new Error(`Invalid 'signature'.`);
        }

        const listeners = internalEventHandlers.get(eventType) || new Set();

        for (const listener of listeners.values()) {
            listener();
        }
    };

    function terminate(clearEventHandlers = false) {
        return new Promise(resolve => {
            emit({
                eventType: eventTypes.WORKER_TERMINATE,
                signature: EMIT_KEY,
            });

            worker.terminate();

            if (clearEventHandlers) {
                workerEventHandlers.clear();
            }

            resolve();
        });
    }

    function boot(nextCreateWorker) {
        return new Promise(resolve => {
            if (typeof nextCreateWorker !== 'undefined' && !isFn()) {
                throw new TypeError(`storeWorker.boot: 1st argument must be 'undefined' or 'function'.`);
            }

            worker = nextCreateWorker ? nextCreateWorker() : createWorker();

            // set all existing worker event handlers to a new worker
            for (const [eventType, namedHandlers] of workerEventHandlers.entries()) {
                for (const listener of namedHandlers.listeners.values()) {
                    worker.addEventListener(eventType, listener, false);

                    const afterListener = namedHandlers.afterListeners.get(listener);
                    if (afterListener) {
                        afterListener();
                    }
                }
            }

            emit({
                eventType: eventTypes.WORKER_START,
                signature: EMIT_KEY,
            });

            resolve();
        });
    }

    function reboot() {
        return new Promise(async resolve => {
            await terminate();
            await boot();
            resolve();
        });
    }

    return {
        eventTypes,
        emit,
        reboot,
        boot,
        terminate,
        on(eventType, listener) {
            const listeners = internalEventHandlers.get(eventType) || new Set();

            const success = listeners.add(listener);

            internalEventHandlers.set(eventType, listeners);

            return success;
        },
        off(eventType, listener) {
            if (!listener) {
                return internalEventHandlers.delete(eventType);
            }

            const listeners = internalEventHandlers.get(eventType) || new Set();

            const success = listeners.delete(listener);

            internalEventHandlers.set(listeners);

            return success;
        },
        worker: {
            on(eventType, listener, afterListener) {
                const namedHandlers = workerEventHandlers.get(eventType) || new EventHandler();

                if (!namedHandlers.listeners.has(listener)) {
                    worker.addEventListener(eventType, listener, false);
                    namedHandlers.listeners.add(listener);
                }

                if (afterListener) {
                    namedHandlers.afterListeners.set(listener, afterListener);
                    afterListener();
                }

                workerEventHandlers.set(eventType, namedHandlers);

                return () => this.off(eventType, listener);
            },
            off(eventType, listener) {
                const namedHandlers = workerEventHandlers.get(eventType);

                worker.removeEventListener(eventType, listener, false);

                namedHandlers.afterListeners.delete(listener);

                const success = namedHandlers.listeners.delete(listener);

                workerEventHandlers.set(eventType, namedHandlers);

                return success;
            },
            postMessage(...args) {
                return worker.postMessage(...args);
            },
        },
    };
}
