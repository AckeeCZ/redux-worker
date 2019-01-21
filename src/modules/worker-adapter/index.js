import { eventEmitter, eventTypes, isFn } from './dependencies';
import { terminate, replaceWorker, off, on, postMessage, addMessageListener } from './WorkerAdapter';

let workerCreator = null;

export { off as removeWorkerListener, on as addWorkerListener, postMessage as postMessageToWorker, addMessageListener };

export async function bootWorker(nextWorkerCreator) {
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

export async function terminateWorker(clearEventHandlers = false) {
    eventEmitter.emit(eventTypes.WORKER_TERMINATED);

    terminate(clearEventHandlers);
}

export async function rebootWorker({ nextWorkerCreator, clearEventHandlers } = {}) {
    await terminateWorker(clearEventHandlers);
    await bootWorker(nextWorkerCreator);
}

export async function initializeWorker(createWorker) {
    if (!isFn(createWorker)) {
        throw new TypeError(`initializeWorker: 1st argument must be a function, not a '${typeof createWorker}'.`);
    }

    await bootWorker(createWorker);
}

export function isWorkerInitialized() {
    return Boolean(workerCreator);
}
