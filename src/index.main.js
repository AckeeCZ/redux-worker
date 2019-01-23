import eventEmitter, { eventTypes } from './config/eventEmitter';
import { WorkerThread } from './modules/worker-adapter/main';

const { addMessageListener, boot, postMessage, reboot, removeMessageListener, terminate } = WorkerThread;

export const storeWorker = Object.freeze({
    addMessageListener,
    boot,
    postMessage,
    reboot,
    removeMessageListener,
    terminate,
});

export const { on, off } = eventEmitter;
export { eventTypes };

export { logLevels } from './constants';
export { default as initialize } from './initialize';
export { connectWorker } from './modules/bridge/main';
