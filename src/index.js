export { default as configure } from './configure';
export { initMessageHandler as configureStoreWorker } from './storeWorker';
export { registerContainerSelector } from './services/selectors';
export { default as uniqueKey } from './utils/uniqueKey';

// reduxWebWorker.connect()
// reduxWebWorker.terminate();
// reduxWebWorker.restart();

// const unsubscribe = ReduxWebWorker.on(
// 	eventTypes.WORKER_IS_NOT_RESPONDING,
// 	terminateWorker => {},
// );

// # Event system
// ReduxWebWorker.on(eventTypes.MESSAGE_).then()
// ReduxWebWorker.on(eventTypes.MESSAGE_IN).then()
// ReduxWebWorker.on(eventTypes.MESSAGE_OUT).then()
// ReduxWebWorker.once(EVENT_NAME)
// ReduxWebWorker.off(eventTypes.MESSAGE_)
// ReduxWebWorker.off()

// await ReduxWebWorker.enableTaskDurationWatcher();
// await ReduxWebWorker.disableTaskDurationWatcher();
