import mergeConfigs from './utils/mergeConfigs';
import * as messagesIn from './services/messagesIn';

import { createConnectWorker } from './modules/bridge';
import { startTasksDurationWatcher, config as taskDurationWatcherConfig } from './modules/task-duration-watcher';

const defaultConfig = {
    taskDurationWatcher: taskDurationWatcherConfig,
};

function configure(storeWorker, customConfig) {
    const options = mergeConfigs(defaultConfig, customConfig);

    if (options.taskDurationWatcher.enabled) {
        startTasksDurationWatcher(storeWorker, {
            taskDurationTimeout: options.taskDurationWatcher.unrespondingTimeout,
        });
    }

    storeWorker.postMessage(messagesIn.setOptionsRequest(options));

    return {
        connectWorker(bridgeId, mapDispatchToProps, ownPropsSelector) {
            return createConnectWorker(storeWorker, {
                bridgeId,
                mapDispatchToProps,
                ownPropsSelector,
            });
        },
    };
}

export default configure;
