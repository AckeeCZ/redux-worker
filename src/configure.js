import * as messagesIn from './services/messagesIn';

import mergeConfigs from './utils/mergeConfigs';
import WorkerAdapter from './utils/WorkerAdapter';

import { createConnectWorker } from './modules/bridge';
import { startTasksDurationWatcher, config as taskDurationWatcherConfig } from './modules/task-duration-watcher';

const defaultConfig = {
    taskDurationWatcher: taskDurationWatcherConfig,
};

function configure(createStoreWorker, customConfig) {
    const options = mergeConfigs(defaultConfig, customConfig);
    const storeWorker = new WorkerAdapter(createStoreWorker);
    const postOptions = () => {
        storeWorker.worker.postMessage(messagesIn.setOptionsRequest(options));
    };

    if (options.taskDurationWatcher.enabled) {
        startTasksDurationWatcher(storeWorker, {
            taskDurationTimeout: options.taskDurationWatcher.unrespondingTimeout,
            onRebootWorkerEnd: postOptions,
        });
    }

    postOptions();

    return {
        connectWorker(bridgeId, mapDispatchToProps, ownPropsSelector) {
            return createConnectWorker(storeWorker.worker, {
                bridgeId,
                mapDispatchToProps,
                ownPropsSelector,
            });
        },
        storeWorker,
    };
}

export default configure;
