import eventEmitter, { eventTypes } from './config/eventEmitter';

export { default as initialize } from './initialize';

export { connectWorker } from './modules/bridge/main';

export { WorkerThread as storeWorker } from './modules/worker-adapter/main';

export const { on, off } = eventEmitter;
export { eventTypes };
