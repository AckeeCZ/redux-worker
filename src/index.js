import createConnectWorker from './HOC/createConnectWorker';
import * as messagesIn from './services/messagesIn';
import startTasksDurationWatcher from './utils/tasksDurationWatcher';
import * as config from './config';

export const create = (storeWorker, customOptions) => {
    const options = {
        ...customOptions,
        taskDurationWatcher: {
            ...config.taskDurationWatcher,
            ...customOptions.taskDurationWatcher,
        },
    };

    if (options.taskDurationWatcher.enabled) {
        startTasksDurationWatcher(storeWorker, {
            taskDurationTimeout: options.taskDurationWatcher.unrespondingTimeout,
        });
    }

    storeWorker.postMessage(messagesIn.setOptionsRequest(options));

    return {
        connectWorker(id, mapDispatchToProps, propsSelector) {
            return createConnectWorker({
                id,
                mapDispatchToProps,
                propsSelector,
                storeWorker,
            });
        },
    };
};

export const on = (eventName, eventHandler) => {};

export const off = listenerId => {};

export { default as combineSelectors } from './utils/combineSelectors';
export { initMessageHandler as configureStoreWorker } from './storeWorkerUtils';
