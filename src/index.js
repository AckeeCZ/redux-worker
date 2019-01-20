import eventEmitter, { eventTypes } from './config/eventEmitter';

export { default as initialize } from './initialize';

export { configureStoreWorker } from './modules/store-worker';
export { connectWorker } from './modules/bridge';
export { bootWorker, rebootWorker, terminateWorker } from './modules/worker-adapter';

export { registerSelector } from './services/selectors';

export { default as uniqueId } from './utils/uniqueId';

export const { on, off } = eventEmitter;
export { eventTypes };

// await reduxWorker.enableTaskDurationWatcher();
// await reduxWorker.disableTaskDurationWatcher();
