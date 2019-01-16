import createConnectWorker from './HOC/createConnectWorker';
import * as messagesIn from './services/messagesIn';
import startTasksDurationWatcher from './utils/tasksDurationWatcher';
import * as config from './config';

export const create = (storeWorker, customOptions) => {
    const options = {
        ...customOptions,
        taskDurationWatcher: {
            ...config.taskDurationWatcher,
            ...(customOptions && customOptions.taskDurationWatcher),
        },
    };

    if (options.taskDurationWatcher.enabled) {
        startTasksDurationWatcher(storeWorker, {
            taskDurationTimeout: options.taskDurationWatcher.unrespondingTimeout,
        });
    }

    storeWorker.postMessage(messagesIn.setOptionsRequest(options));

    return {
        connectWorker(bridgeKey, mapDispatchToProps, propsSelector) {
            return createConnectWorker({
                bridgeKey,
                mapDispatchToProps,
                propsSelector,
                storeWorker,
            });
        },
    };
};
// export const on = (eventName, eventHandler) => {};

// export const off = listenerId => {};

export { default as combineSelectors } from './utils/combineSelectors';
export { initMessageHandler as configureStoreWorker } from './storeWorker';
export { default as uniqueKey } from './utils/uniqueKey';

export { registerContainerSelector } from './services/selectors';

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
