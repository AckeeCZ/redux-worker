export { default as configure } from './configure';
export { configureStoreWorker } from './modules/store-worker';
export { registerContainerSelector } from './services/selectors';
export { default as uniqueId } from './utils/uniqueId';

// reduxWorker.connect()
// reduxWorker.terminate();
// reduxWorker.restart();

// const unsubscribe = reduxWorker.on(
// 	eventTypes.WORKER_IS_NOT_RESPONDING,
// 	terminateWorker => {},
// );

// # Event system
// reduxWorker.on(eventTypes.MESSAGE_).then()
// reduxWorker.on(eventTypes.MESSAGE_IN).then()
// reduxWorker.on(eventTypes.MESSAGE_OUT).then()
// reduxWorker.once(EVENT_NAME)
// reduxWorker.off(eventTypes.MESSAGE_)
// reduxWorker.off()

// await reduxWorker.enableTaskDurationWatcher();
// await reduxWorker.disableTaskDurationWatcher();
